import { Collection, Item } from "stac-js";
import { toAbsolute } from "stac-js/src/http.js";
import { generateFeatures } from "./helpers";
import axios from "axios";

/**
 * Function to extract collection urls from an indicator
 * @param {import("stac-ts").StacCatalog
 *   | import("stac-ts").StacCollection
 *   | import("stac-ts").StacItem
 *   | null
 * } stacObject
 * @param {string} basepath
 * @returns {string[]}
 */
export function extractCollectionUrls(stacObject, basepath) {
  const collectionUrls = [];
  // Support for two structure types, flat and indicator, simplified here:
  // Flat assumes Catalog-Collection-Item
  // Indicator assumes Catalog-Collection-Collection-Item
  // TODO: this is not the most stable test approach,
  // we should discuss potential other approaches
  //
  if (stacObject?.links && stacObject?.links[1].rel === "item") {
    collectionUrls.push(basepath);
  } else if (stacObject?.links[1].rel === "child") {
    // TODO: Iterate through all children to create collections
    stacObject.links.forEach((link) => {
      if (link.rel === "child") {
        collectionUrls.push(toAbsolute(link.href, basepath));
      }
    });
  }
  return collectionUrls;
}
export class EodashCollection {
  /** @type {string} */
  #collectionUrl = "";
  /** @type {import("stac-ts").StacCollection | undefined} */
  #collectionStac;
  /**
   * @type {import("stac-ts").StacLink
   *   | import("stac-ts").StacItem
   *   | undefined}
   */
  selectedItem;

  /** @param {string} collectionUrl */
  constructor(collectionUrl) {
    this.#collectionUrl = collectionUrl;
  }
  /**
   * @async
   * @param {any} item
   * @returns
   */
  createLayersJson = async (item = null) => {
    /** @type {import("stac-ts").StacLink | undefined} */
    let stacItem,
      /** @type {import("stac-ts").StacCollection | undefined} */
      stac;
    // TODO get auxiliary layers from collection
    /** @type {object[]} */
    let layersJson = [
      /*{
        type: "Tile",
        properties: {
          id: "OSM",
        },
        source: {
          type: "OSM",
        },
      },*/
    ];
    // Load collectionstac if not yet initialized
    if (!this.#collectionStac) {
      const response = await axios.get(this.#collectionUrl);
      stac = await response.data;
      this.#collectionStac = new Collection(stac);
    }

    if (stac && stac.endpointtype === "GeoDB") {
      // Special handling of point based data
      const allFeatures = generateFeatures(stac.links);
      layersJson.unshift({
        type: "Vector",
        properties: {
          id: stac.id,
        },
        source: {
          type: "Vector",
          url: "data:," + encodeURIComponent(JSON.stringify(allFeatures)),
          format: "GeoJSON",
        },
        style: {
          "circle-radius": 5,
          "circle-fill-color": "#00417077",
          "circle-stroke-color": "#004170",
          "fill-color": "#00417077",
          "stroke-color": "#004170",
        },
      });
      return layersJson;
    } else {
      if (item instanceof Date) {
        // if collectionStac not yet initialized we do it here
        stacItem = this.getItems()?.sort((a, b) => {
          const distanceA = Math.abs(
            new Date(/** @type {number} */ (a.datetime)).getTime() -
              item.getTime(),
          );
          const distanceB = Math.abs(
            new Date(/** @type {number} */ (b.datetime)).getTime() -
              item.getTime(),
          );
          return distanceA - distanceB;
        })[0];
        this.selectedItem = stacItem;
      } else {
        stacItem = item;
      }
      const response = await fetch(
        stacItem
          ? toAbsolute(stacItem.href, this.#collectionUrl)
          : this.#collectionUrl,
      );
      stac = await response.json();

      if (!stacItem) {
        // no specific item was requested; render last item
        this.#collectionStac = new Collection(stac);
        const items = this.getItems();
        this.selectedItem = items?.[items.length - 1];
        if (this.selectedItem) {
          layersJson = await this.createLayersJson(this.selectedItem);
        } else {
          if (import.meta.env.DEV) {
            console.warn(
              "[eodash] the selected collection does not include any items",
            );
          }
        }
        return [];
      } else {
        // specific item was requested
        const item = new Item(stac);
        this.selectedItem = item;
        layersJson.unshift(...this.buildJsonArray(item));
        return layersJson;
      }
    }
  };

  /** @param {import("stac-ts").StacItem} item */
  buildJsonArray(item) {
    const jsonArray = [];
    // TODO: this currently assumes only one layer will be extracted
    //       from an item, although it think this is currently true
    //       potentially this could return multiple layers
    // TODO: implement other types, such as COG

    // I propose following approach, we "manually" create configurations
    // for the rendering options we know and expect.
    // If we don't find any we fallback to using the STAC ol item that
    // will try to extract anything it supports but for which we have
    // less control.
    const wms = item.links.find((l) => l.rel === "wms");
    // const projDef = false; // TODO: add capability to find projection in item
    if (wms) {
      let json = {
        type: "Tile",
        properties: {
          id: item.id,
        },
        source: {
          // if no projection information is provided we should
          // assume one, else for WMS requests it will try to get
          // the map projection that might not be supported
          // projection: projDef ? projDef : "EPSG:4326",
          type: "TileWMS",
          url: wms.href,
          params: {
            LAYERS: wms["wms:layers"],
            TILED: true,
          },
        },
      };
      if ("wms:dimensions" in wms) {
        // @ts-expect-error: waiting for eox-map to provide type definition
        json.source.params.time = wms["wms:dimensions"];
      }
      jsonArray.push(json);
    } else if (item.links.find((l) => l.rel === "wmts" || l.rel === "xyz")) {
      jsonArray.push({
        type: "STAC",
        displayWebMapLink: true,
        displayFootprint: false,
        data: item,
        properties: {
          id: item.id,
        },
      });
    } else {
      // fall back to rendering the feature
      jsonArray.push({
        type: "Vector",
        source: {
          type: "Vector",
          url: "data:," + encodeURIComponent(JSON.stringify(item.geometry)),
          format: "GeoJSON",
        },
        properties: {
          id: item.id,
        },
      });
    }

    return jsonArray;
  }

  getItems() {
    return (
      this.#collectionStac?.links
        .filter((i) => i.rel === "item")
        // sort by `datetime`, where oldest is first in array
        .sort((a, b) =>
          /** @type {number} */ (a.datetime) <
          /** @type {number} */ (b.datetime)
            ? -1
            : 1,
        )
    );
  }

  getDates() {
    return (
      this.#collectionStac?.links
        .filter((i) => i.rel === "item")
        // sort by `datetime`, where oldest is first in array
        .sort((a, b) =>
          /** @type {number} */ (a.datetime) <
          /** @type {number} */ (b.datetime)
            ? -1
            : 1,
        )
        .map((i) => new Date(/** @type {number} */ (i.datetime)))
    );
  }
}
