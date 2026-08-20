import {
  asyncBufferFromUrl,
  parquetMetadataAsync,
  parquetRead as hyParquetRead,
} from "hyparquet";
import { findParquetMirror } from "../helpers/assets.js";
import { findClosestIndex } from "../helpers/datetime.js";
import { adjustParquetItems } from "../helpers/parquet.js";
import { toAbsolute } from "../helpers/url.js";
import { createCollectionBase } from "./base.js";

/**
 * How much of the file's tail to fetch to reach the footer. hyparquet defaults
 * to 512kB, which swallows a small mirror whole.
 */
const FOOTER_BYTES = 1 << 15;

/**
 * A datetime and the row it was read from.
 *
 * @typedef {{ row: number; time: number }} DatetimeEntry
 */

/**
 * A collection whose items live in a parquet asset rather than in `item` links.
 * Columns are read on demand, so asking about time never transfers the assets.
 *
 * @param {object} context
 * @param {string} context.url
 * @param {import("../types").EodashCollection} context.stac
 * @param {import("../http.js").HttpClient} context.http what a build reads through; the mirror itself is read by range
 */
export const createParquetCollection = ({ url, stac, http }) => {
  const mirror = findParquetMirror(stac);
  const href = mirror ? toAbsolute(mirror.href, url) : undefined;

  /** The mirror's footer, or nothing when the collection has none. */
  const openMirror = cachedRead(async () => {
    if (!href) {
      return undefined;
    }
    const file = await asyncBufferFromUrl({
      url: href,
      byteLength: await fetchByteLength(href),
    });
    const metadata = await parquetMetadataAsync(file, {
      initialFetchSize: FOOTER_BYTES,
    });
    return { file, metadata };
  });

  /**
   * @param {object} [selection]
   * @param {string[]} [selection.columns] every column when omitted
   * @returns {Promise<Record<string, any>[]>}
   */
  const readParquet = async ({ columns } = {}) => {
    const source = await openMirror();
    if (!source) {
      return [];
    }
    /** @type {Record<string, any>[]} */
    const rows = [];
    await hyParquetRead({
      ...source,
      columns,
      rowFormat: "object",
      // utf8 off so the wkb geometry is not decoded into a string
      utf8: false,
      /** @param {Record<string, any>[]} data */
      onComplete: (data) => rows.push(...data),
    });
    return rows;
  };

  /**
   * The datetime column carrying values, settled from the footer so that
   * finding out costs nothing. An item describing a range leaves `datetime`
   * null, which shows up here as a column with no values.
   *
   * @returns {Promise<string | undefined>}
   */
  const datetimeColumn = async () => {
    const source = await openMirror();
    const columns = (source?.metadata.row_groups ?? []).flatMap(
      (group) => group.columns,
    );
    return ["datetime", "start_datetime", "end_datetime"].find((name) =>
      columns.some(
        ({ meta_data: column }) =>
          column?.path_in_schema.join(".") === name &&
          Number(column.statistics?.null_count ?? 0) <
            Number(column.num_values),
      ),
    );
  };

  /**
   * Every item's datetime with the row it sits on, oldest first. That one
   * column is the only thing transferred.
   *
   * @returns {Promise<DatetimeEntry[]>}
   */
  const readDatetimes = cachedRead(async () => {
    const column = await datetimeColumn();
    if (!column) {
      return [];
    }
    return (await readParquet({ columns: [column] })).map((entry, row) => ({
        row,
        time: new Date(entry[column] ?? NaN).getTime(),
      }))
      .filter(({ time }) => !isNaN(time))
      .sort((a, b) => a.time - b.time);
  });

  /**
   * Every item, in row order. A mirror is written as one row group, so a column
   * chunk spans every row and one item costs as much as all of them.
   *
   * @returns {Promise<import("../types").EodashItem[]>}
   */
  const readItems = cachedRead(async () =>
    adjustParquetItems(await readParquet()),
  );

  /**
   * The items the mirror holds, oldest first. This transfers every column, so
   * reach for `getDates` where it answers.
   *
   * @returns {Promise<import("../types").EodashItem[]>}
   */
  const getItems = async () => {
    const items = await readItems();
    const dates = await readDatetimes();
    const rows = new Set(dates.map(({ row }) => row));
    return [
      ...dates.map(({ row }) => items[row]),
      ...items.filter((_, row) => !rows.has(row)),
    ];
  };

  /**
   * Every datetime the collection has an item for, oldest first.
   *
   * @returns {Promise<Date[]>}
   */
  const getDates = async () =>
    (await readDatetimes()).map(({ time }) => new Date(time));

  /**
   * The item closest to `datetime`, or the most recent one when omitted.
   * Equidistant items resolve to the earlier.
   *
   * @param {import("../types").Datetime} [datetime]
   * @returns {Promise<import("../types").EodashItem | undefined>}
   */
  const getItem = async (datetime) => {
    const entries = await readDatetimes();
    const index = findClosestIndex(
      entries.map(({ time }) => time),
      datetime,
    );
    const closest = entries[index] ?? entries.at(-1);
    if (!closest) {
      return undefined;
    }
    return (await readItems())[closest.row];
  };

  return {
    ...createCollectionBase({ stac, http, getDates, getItem }),
    getItems,
    getDates,
    getItem,
  };
};

/**
 * The mirror's size, asked for as a range so the answer describes the file the
 * byte offsets belong to. A HEAD will not do: a host that gzips reports the
 * compressed length there — GitHub Pages serves a 313kB mirror as 139kB — and
 * the footer would then be read from the middle of the file.
 *
 * Uses `fetch` because that is what hyparquet reads the mirror with.
 *
 * @param {string} href
 * @returns {Promise<number | undefined>} nothing when the host ignores ranges
 */
async function fetchByteLength(href) {
  const response = await fetch(href, { headers: { Range: "bytes=0-0" } });
  const total = Number(
    response.headers.get("content-range")?.split("/").at(-1),
  );
  return total ? total : undefined;
}

/**
 * Remembers what a read resolved to, so it happens once however many callers
 * ask. A failure is not remembered, since one transient error would otherwise
 * leave the reader unable to read anything ever again.
 *
 * @template T
 * @param {() => Promise<T>} read
 * @returns {() => Promise<T>}
 */
function cachedRead(read) {
  /** @type {Promise<T> | undefined} */
  let pending;
  return () =>
    (pending ??= read().catch((error) => {
      pending = undefined;
      throw error;
    }));
}
