import { findClosestIndex, getDatetimeProperty } from "../helpers/datetime.js";
import { toAbsolute } from "../helpers/url.js";
import { createCollectionBase } from "./base.js";

/**
 * Instantiates a static STAC collection, discovering items through native STAC links.
 *
 * @param {object} context
 * @param {string} context.url
 * @param {import("../types").STACCollection} context.stac
 * @param {import("../http.js").HttpClient} context.http
 */
export const createStaticCollection = ({ url, stac, http }) => {
  /**
   * The `item` links the document carries, oldest first.
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

  return {
    ...createCollectionBase({ stac, http, getDates, getItem }),
    getItems,
    getDates,
    getItem,
  };
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
