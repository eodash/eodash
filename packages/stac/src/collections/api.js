import { findClosestIndex, getDatetimeProperty } from "../helpers/datetime.js";
import { toAbsolute } from "../helpers/url.js";
import { createCollectionBase } from "./base.js";

/**
 * All a date list needs. The range fields are asked for too, because a
 * collection whose items only state a range would otherwise come back empty.
 */
const DATE_FIELDS =
  "properties.datetime,properties.start_datetime,properties.end_datetime,-assets,-geometry,-links,-bbox";

/**
 * A collection served by a STAC API, whose items are found by searching rather
 * than by following links.
 *
 * @param {object} context
 * @param {string} context.url
 * @param {import("../types").EodashCollection} context.stac
 * @param {import("../http.js").HttpClient} context.http
 * @param {number} [context.maxItems] most items one search returns
 */
export const createAPICollection = ({ url, stac, http, maxItems = 1000 }) => {
  const searchUrl = url.split("/").slice(0, -2).join("/") + "/search";

  /**
   * @param {import("../types").SearchParams} params
   * @returns {Promise<import("../types").ItemCollection>}
   */
  const search = async (params) =>
    http.get(searchUrl, { collections: stac.id, ...params });

  /**
   * The items covering `bbox`, oldest first. `bbox` is comma separated because
   * the repeated form a GET would otherwise send is ignored, leaving the search
   * unfiltered.
   *
   * @param {import("../types").BBox} [bbox]
   * @returns {Promise<import("../types").EodashItem[]>}
   */
  const getItems = async (bbox) => {
    const { features, numberMatched } = await search({
      ...(bbox && { bbox: bbox.join(",") }),
      limit: maxItems,
      sortby: "datetime",
    });
    if ((numberMatched ?? 0) > maxItems) {
      console.warn(
        `[eodash] ${numberMatched} items exist, reading the first ${maxItems}. Narrow the search with a bbox.`,
      );
    }
    return features;
  };

  /**
   * Every datetime the collection has an item for, oldest first. A daily
   * `pre-aggregation` link answers for the whole archive in one request; scoped
   * to a bbox that answer no longer holds, so the items are enumerated instead.
   *
   * More items than one search returns leaves `datetime` deciding which of them
   * are worth having: the oldest `maxItems` would put the whole window decades
   * away from the date being shown.
   *
   * @param {import("../types").Datetime} [datetime] the date the window centres on
   * @param {import("../types").BBox} [bbox]
   * @returns {Promise<Date[]>}
   */
  const getDates = async (datetime, bbox) => {
    const aggregated = bbox
      ? undefined
      : await fetchDailyAggregation(stac, url, http);
    if (aggregated?.buckets) {
      return sortDates(aggregated.buckets.map((bucket) => bucket.key));
    }

    const scope = {
      ...(bbox && { bbox: bbox.join(",") }),
      fields: DATE_FIELDS,
    };
    const { features, numberMatched } = await search({
      ...scope,
      limit: maxItems,
      sortby: "datetime",
    });
    if ((numberMatched ?? 0) <= maxItems) {
      return getItemDates(features);
    }

    const target = datetime ? new Date(datetime) : undefined;
    if (!target || isNaN(target.getTime())) {
      console.warn(
        `[eodash] ${numberMatched} dates exist, reading the oldest ${maxItems}. Narrow the search with a bbox.`,
      );
      return getItemDates(features);
    }

    // the same two-sided search `getItem` makes, widened to fill the window
    const instant = target.toISOString();
    const half = Math.ceil(maxItems / 2);
    const [earlier, later] = await Promise.all([
      search({
        ...scope,
        datetime: `../${instant}`,
        limit: half,
        sortby: "-datetime",
      }),
      search({
        ...scope,
        datetime: `${instant}/..`,
        limit: half,
        sortby: "datetime",
      }),
    ]);
    // an item exactly at the instant answers both sides
    const seen = new Set();
    const around = [...earlier.features, ...later.features].filter(
      (item) => !seen.has(item.id) && seen.add(item.id),
    );
    return getItemDates(around);
  };

  /**
   * The item closest to `datetime` within `bbox`, or the most recent one when
   * omitted. Equidistant items resolve to the earlier.
   *
   * @param {import("../types").Datetime} [datetime]
   * @param {import("../types").BBox} [bbox]
   * @returns {Promise<import("../types").EodashItem | undefined>}
   */
  const getItem = async (datetime, bbox) => {
    const scope = bbox ? { bbox: bbox.join(",") } : {};
    const target = datetime ? new Date(datetime) : undefined;
    if (!target || isNaN(target.getTime())) {
      const { features } = await search({
        ...scope,
        limit: 1,
        sortby: "-datetime",
      });
      return features[0];
    }
    const instant = target.toISOString();
    const [earlier, later] = await Promise.all([
      search({
        ...scope,
        datetime: `../${instant}`,
        limit: 1,
        sortby: "-datetime",
      }),
      search({
        ...scope,
        datetime: `${instant}/..`,
        limit: 1,
        sortby: "datetime",
      }),
    ]);
    const items = [...earlier.features, ...later.features];
    const property = getDatetimeProperty(items);
    const times = property
      ? items.map((item) => new Date(item.properties[property] ?? "").getTime())
      : [];
    return items[findClosestIndex(times, target)] ?? items[0];
  };

  return {
    ...createCollectionBase({ stac, http, getDates, getItem }),
    getItems,
    getDates,
    getItem,
  };
};

/**
 * The datetimes of `items`, oldest first, dropping any that will not parse. The
 * two-sided search answers newest-first on one side, so the order is restored
 * here rather than assumed from the server.
 *
 * @param {import("../types").EodashItem[]} items
 * @returns {Date[]}
 */
function getItemDates(items) {
  const property = getDatetimeProperty(items);
  if (!property) {
    return [];
  }
  return sortDates(items.map((item) => item.properties[property]));
}

/**
 * @param {(string | null | undefined)[]} values
 * @returns {Date[]} oldest first, without the unparseable ones
 */
function sortDates(values) {
  return values
    .map((value) => new Date(value ?? ""))
    .filter((date) => !isNaN(date.getTime()))
    .sort((a, b) => a.getTime() - b.getTime());
}

/**
 * The collection's precomputed daily item counts, or nothing when it has none
 * or the document cannot be read.
 *
 * @param {import("../types").EodashCollection} stac
 * @param {string} url base for resolving the link when the collection carries no `self`
 * @param {import("../http.js").HttpClient} http
 * @returns {Promise<import("../types").Aggregation | undefined>}
 */
async function fetchDailyAggregation(stac, url, http) {
  const link = stac.links.find(isDailyPreAggregation);
  if (!link) {
    return undefined;
  }
  const self = stac.links.find((l) => l.rel === "self")?.href;
  try {
    /** @type {import("../types").AggregationCollection} */
    const aggregations = await http.get(toAbsolute(link.href, self || url));
    return aggregations.aggregations.find(
      (aggregation) =>
        aggregation.key?.startsWith("datetime_") || aggregation.interval,
    );
  } catch (error) {
    console.warn("[eodash] Failed to fetch pre-aggregation", error);
    return undefined;
  }
}

/**
 * @param {import("../types").EodashLink} link
 * @returns {link is import("../types").PreAggregationLink}
 */
function isDailyPreAggregation(link) {
  return (
    link.rel === "pre-aggregation" && link["aggregation:interval"] === "daily"
  );
}
