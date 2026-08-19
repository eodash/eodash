import {
  asyncBufferFromUrl,
  parquetMetadataAsync,
  parquetRead as hyParquetRead,
} from "hyparquet";
import { findParquetMirror } from "../helpers/assets.js";
import { findClosestIndex, getDatetimeProperty } from "../helpers/datetime.js";
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
 */
export const createParquetCollection = ({ url, stac }) => {
  const mirror = findParquetMirror(stac);
  const href = mirror ? toAbsolute(mirror.href, url) : undefined;

  /** @type {Promise<{ file: import("hyparquet").AsyncBuffer; metadata: import("hyparquet").FileMetaData }> | undefined} */
  let opened;

  /** The mirror's footer, read once, or nothing when the collection has none. */
  const openMirror = () => {
    if (!href) {
      return undefined;
    }
    return (opened ??= (async () => {
      const file = await asyncBufferFromUrl({ url: href });
      const metadata = await parquetMetadataAsync(file, {
        initialFetchSize: FOOTER_BYTES,
      });
      return { file, metadata };
    })());
  };

  /**
   * @param {object} [selection]
   * @param {string[]} [selection.columns] every column when omitted
   * @param {number} [selection.rowStart] inclusive
   * @param {number} [selection.rowEnd] exclusive
   * @returns {Promise<Record<string, any>[]>}
   */
  const readParquet = async ({ columns, rowStart, rowEnd } = {}) => {
    const source = await openMirror();
    if (!source) {
      return [];
    }
    /** @type {Record<string, any>[]} */
    const rows = [];
    await hyParquetRead({
      ...source,
      columns,
      rowStart,
      rowEnd,
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

  /** @type {Promise<DatetimeEntry[]> | undefined} */
  let datetimes;

  /**
   * Every item's datetime with the row it sits on, oldest first. That one
   * column is the only thing transferred, and only once.
   *
   * @returns {Promise<DatetimeEntry[]>}
   */
  const readDatetimes = () =>
    (datetimes ??= (async () => {
      const column = await datetimeColumn();
      if (!column) {
        return [];
      }
      return (await readParquet({ columns: [column] }))
        .map((entry, row) => ({ row, time: new Date(entry[column]).getTime() }))
        .filter(({ time }) => !isNaN(time))
        .sort((a, b) => a.time - b.time);
    })());

  /**
   * The items the mirror holds, oldest first. Every column of every row is
   * transferred, so reach for `getDates` or `getItem` where they answer.
   *
   * @returns {Promise<import("../types").EodashItem[]>}
   */
  const getItems = async () => {
    const items = adjustParquetItems(await readParquet());
    const datetimeProperty = getDatetimeProperty(items);
    if (!datetimeProperty) {
      return items;
    }
    // RFC 3339 datetimes sort lexicographically
    return items.sort((a, b) =>
      (a.properties[datetimeProperty] ?? "") <
      (b.properties[datetimeProperty] ?? "")
        ? -1
        : 1,
    );
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
   * Equidistant items resolve to the earlier. Its row is the only one read.
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
    const rows = await readParquet({
      rowStart: closest.row,
      rowEnd: closest.row + 1,
    });
    return adjustParquetItems(rows).at(0);
  };

  return {
    ...createCollectionBase({ stac, getDates, getItem }),
    getItems,
    getDates,
    getItem,
  };
};
