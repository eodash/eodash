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

/** Initial byte length fetched from file tail to parse the parquet footer. */
const FOOTER_BYTES = 1 << 15;

/**
 * @typedef {{ row: number; time: number }} DatetimeEntry
 */

/**
 * Creates a STAC collection reader backed by a GeoParquet mirror asset.
 *
 * @param {object} context
 * @param {string} context.url - Collection URL
 * @param {import("../types").STACCollection} context.stac - Collection metadata
 * @param {import("../http.js").HttpClient} context.http - HTTP client instance
 * @param {string} [context.color] - Collection layer tint color
 * @param {string} [context.viewProjection] - Map view projection
 * @param {import("../types").BuildContext} [context.rasterOptions] - Raster rendering options
 */
export const createParquetCollection = ({
  url,
  stac,
  http,
  color,
  viewProjection,
  rasterOptions,
}) => {
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
    return (await readParquet({ columns: [column] }))
      .map((entry, row) => ({
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
   * @returns {Promise<import("../types").STACItem[]>}
   */
  const readItems = cachedRead(async () =>
    adjustParquetItems(await readParquet()),
  );

  /**
   * The items the mirror holds, oldest first. This transfers every column, so
   * reach for `getDates` where it answers.
   *
   * @returns {Promise<import("../types").STACItem[]>}
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
   * @returns {Promise<import("../types").STACItem | undefined>}
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

  return Object.assign(
    createCollectionBase({
      stac,
      http,
      getDates,
      getItem,
      color,
      viewProjection,
      rasterOptions,
    }),
    {
      /** @type {"parquet"} */
      kind: "parquet",
      getItems,
      getDates,
      getItem,
    },
  );
};

/**
 * The mirror's size, counted the way its own byte offsets are. A plain HEAD
 * answers with the *encoded* length wherever the host compresses — GitHub Pages
 * calls a 57917 byte mirror 30416 — landing the footer mid-file. Three ways to
 * ask, cheapest first.
 *
 * @param {string} href
 * @returns {Promise<number | undefined>} nothing when the length is unreadable
 */
async function fetchByteLength(href) {
  // A Range has browsers negotiate `identity`, and servers ignore it on a HEAD:
  // the length wanted, no body at all. Worth trusting only while
  // `Content-Encoding` reads back empty — hidden means a browser stripped it,
  // having already negotiated; set means nothing did, and the length counts
  // encoded bytes.
  const head = await fetch(href, {
    method: "HEAD",
    headers: { Range: "bytes=0-0" },
  });
  const negotiated =
    head.status === 200 && !head.headers.get("content-encoding");
  const headLength = Number(head.headers.get("content-length"));
  if (negotiated && headLength) {
    return headLength;
  }

  // states the whole size, at the cost of a byte, but is not CORS-safelisted
  const probe = await fetch(href, { headers: { Range: "bytes=0-0" } });
  const declared = Number(
    probe.headers.get("content-range")?.split("/").at(-1),
  );
  await probe.body?.cancel();
  if (declared) {
    return declared;
  }

  // last resort: ask for it whole just to read `Content-Length`, then drop it
  const response = await fetch(href, { headers: { Range: "bytes=0-" } });
  if (response.status !== 206) {
    // ranges went unhonoured, so there are no offsets to agree with and the
    // decoded body is the only length that is not a guess
    return (await response.arrayBuffer()).byteLength || undefined;
  }
  const total = Number(response.headers.get("content-length"));
  await response.body?.cancel();
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
