import { findClosestIndex, getDatetimeProperty } from "../helpers/datetime.js";
import { toAbsolute } from "../helpers/url.js";
import { createCollectionBase } from "./base.js";

/**
 * Creates a static STAC collection reader discovering items through STAC links.
 *
 * @param {object} context
 * @param {string} context.url - Collection URL
 * @param {import("../types").STACCollection} context.stac - Collection metadata
 * @param {import("../http.js").HttpClient} context.http - HTTP client instance
 * @param {string} [context.color] - Collection layer tint color
 * @param {string} [context.viewProjection] - Map view projection
 * @param {import("../types").BuildContext} [context.rasterOptions] - Raster rendering options
 */
export const createStaticCollection = ({
  url,
  stac,
  http,
  color,
  viewProjection,
  rasterOptions,
}) => {
  /**
   * Retrieves item links sorted chronologically.
   *
   * @returns {Promise<import("../types").ItemLink[]>}
   */
  const getItems = async () => {
    const items = stac.links.filter(isItemLink);
    const datetimeProperty = getDatetimeProperty(stac.links);
    if (!datetimeProperty) {
      return items;
    }
    // RFC 3339 datetimes sort lexicographically
    return items.sort((a, b) =>
      (a[datetimeProperty] ?? "") < (b[datetimeProperty] ?? "") ? -1 : 1,
    );
  };

  /**
   * Every datetime the collection has an item for, oldest first
   *
   * @returns {Promise<Date[]>}
   */
  const getDates = async () => {
    const items = await getItems();
    const datetimeProperty = getDatetimeProperty(items);
    if (!datetimeProperty) {
      return [];
    }
    return items
      .map((item) => new Date(item[datetimeProperty] ?? ""))
      .filter((date) => !isNaN(date.getTime()));
  };

  /**
   * The item closest to `datetime`, or the most recent one when omitted.
   * Equidistant items resolve to the earlier.
   *
   * @param {import("../types").Datetime} [datetime]
   * @returns {Promise<import("../types").STACItem | undefined>}
   */
  const getItem = async (datetime) => {
    const items = await getItems();
    const closest = findItem(items, datetime) ?? items.at(-1);
    if (!closest) {
      return undefined;
    }
    return http.get(toAbsolute(closest.href, url));
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
      /** @type {"static"} */
      kind: "static",
      getItems,
      getDates,
      getItem,
    },
  );
};

/**
 * @param {import("../types").STACLink} link
 * @returns {link is import("../types").ItemLink}
 */
function isItemLink(link) {
  return link.rel === "item";
}

/**
 * @param {import("../types").ItemLink[]} items oldest first
 * @param {import("../types").Datetime} [datetime]
 */
function findItem(items, datetime) {
  const property = getDatetimeProperty(items);
  if (!property) {
    return undefined;
  }
  const times = items.map((item) => new Date(item[property] ?? "").getTime());
  return items[findClosestIndex(times, datetime)];
}
