import axios from "axios";
import { findClosestIndex, getDatetimeProperty } from "../helpers/datetime.js";
import { toAbsolute } from "../helpers/url.js";
import { createCollectionBase } from "./base.js";

/**
 * A collection served by a STAC API, whose items are found by searching rather
 * than by following links.
 *
 * @param {object} context
 * @param {string} context.url
 * @param {import("../types").EodashCollection} context.stac
 * @param {number} [context.maxItems] most items one search returns
 */
export const createAPICollection = ({ url, stac, maxItems = 1000 }) => {
  const searchUrl = url.split("/").slice(0, -2).join("/") + "/search";

  /**
   * @param {import("../types").SearchParams} params
   * @returns {Promise<import("../types").ItemCollection>}
   */
  const search = async (params) =>
    axios
      .get(searchUrl, { params: { collections: stac.id, ...params } })
      .then((response) => response.data);

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
   * @param {import("../types").BBox} [bbox]
   * @returns {Promise<Date[]>}
   */
  const getDates = async (bbox) => {
    const aggregated = bbox
      ? undefined
      : await fetchDailyAggregation(stac, url);
    if (aggregated) {
      return aggregated.buckets
        .map((bucket) => new Date(bucket.key))
        .filter((date) => !isNaN(date.getTime()));
    }
    const { features } = await search({
      ...(bbox && { bbox: bbox.join(",") }),
      limit: maxItems,
      sortby: "datetime",
      fields:
        "properties.datetime,properties.start_datetime,properties.end_datetime,-assets,-geometry,-links,-bbox",
    });
    const datetimeProperty = getDatetimeProperty(features);
    if (!datetimeProperty) {
      return [];
    }
    return features
      .map((item) => new Date(item.properties[datetimeProperty] ?? ""))
      .filter((date) => !isNaN(date.getTime()));
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
    ...createCollectionBase({ stac, getDates, getItem }),
    getItems,
    getDates,
    getItem,
  };
};

/**
 * The collection's precomputed daily item counts, or nothing when it has none
 * or the document cannot be read.
 *
 * @param {import("../types").EodashCollection} stac
 * @param {string} url base for resolving the link when the collection carries no `self`
 * @returns {Promise<import("../types").Aggregation | undefined>}
 */
async function fetchDailyAggregation(stac, url) {
  const link = stac.links.find(isDailyPreAggregation);
  if (!link) {
    return undefined;
  }
  const self = stac.links.find((l) => l.rel === "self")?.href;
  try {
    /** @type {import("../types").AggregationCollection} */
    const aggregations = await axios
      .get(toAbsolute(link.href, self || url))
      .then((response) => response.data);
    return aggregations.aggregations.find(
      (aggregation) =>
        aggregation.key.startsWith("datetime_") || aggregation.interval,
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
