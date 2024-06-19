import { Collection, Item } from 'stac-js';
import { toAbsolute } from 'stac-js/src/http.js';
import { generateFeatures } from './helpers'
import axios from 'axios';

export class EodashCollection {
  /** @type {string} */
  #collectionUrl = '';
  /** @type {import("stac-ts").StacCollection | undefined} */
  #collectionStac;
  /** @type {import("stac-ts").StacLink | import("stac-ts").StacItem | undefined } */
  selectedItem;

  /**
   * @param {string} collectionUrl
   */
  constructor(collectionUrl) {
    this.#collectionUrl = collectionUrl;
  }
  /**
   * @param {*} item
   * @returns
   * @async
   */
  createLayersJson = async (item = null) => {
    /** @type {import("stac-ts").StacLink | undefined} */
    let stacItem,
      /** @type {import("stac-ts").StacCollection | undefined} */
      stac;
    // TODO get auxiliary layers from collection
    /** @type {object[]} */
    let layersJson = [
      {
        type: 'Tile',
        properties: {
          id: 'OSM',
        },
        source: {
          type: 'OSM',
        },
      },
    ];
    // Load collectionstac if not yet initialized
    if (!this.#collectionStac) {
      const response = await axios.get(this.#collectionUrl);
      stac = await response.data
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
        }
      });
      return layersJson;
    } else {
      if (item instanceof Date) {
        // if collectionStac not yet initialized we do it here
        stacItem = this.getItems()?.sort((a, b) => {
          const distanceA = Math.abs((new Date(/** @type {number} */(a.datetime))).getTime() - item.getTime());
          const distanceB = Math.abs(new Date(/** @type {number} */(b.datetime)).getTime() - item.getTime());
          return distanceA - distanceB;
        })[0];
        this.selectedItem = stacItem;
      } else {
        stacItem = item;
      }
      const response = await fetch(
        stacItem
          ? toAbsolute(stacItem.href, this.#collectionUrl)
          : this.#collectionUrl
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
            console.warn('[eodash] the selected collection does not include any items')
          }
        }
        return layersJson;
      } else {
        // specific item was requested
        const item = new Item(stac);
        this.selectedItem = item;
        layersJson.unshift(this.buildJson(item));
        return layersJson;
      }
    }
  }

  /**
   * @param {import('stac-ts').StacItem} item
   */
  buildJson(item) {
    let json;
    // TODO implement other types, such as COG
    if (item.links
      .find((l) => l.rel === 'wms' || l.rel === 'wmts' || l.rel === 'xyz')) {
      json = {
        type: 'STAC',
        displayWebMapLink: true,
        displayFootprint: false,
        data: item,
        properties: {
          id: item.id,
        },
      };
    } else {
      // fall back to rendering the feature
      json = {
        type: 'Vector',
        source: {
          type: 'Vector',
          url: 'data:,' + encodeURIComponent(JSON.stringify(item.geometry)),
          format: 'GeoJSON',
        },
        properties: {
          id: item.id,
        },
      };
    }

    return json;
  }

  getItems() {
    return (
      this.#collectionStac?.links
        .filter((i) => i.rel === 'item')
        // sort by `datetime`, where oldest is first in array
        .sort((a, b) => ( /** @type {number} */(a.datetime) <  /** @type {number} */(b.datetime) ? -1 : 1))
    );
  }

  getDates() {
    return (
      this.#collectionStac?.links
        .filter((i) => i.rel === 'item')
        // sort by `datetime`, where oldest is first in array
        .sort((a, b) => ( /** @type {number} */(a.datetime) < /** @type {number} */(b.datetime) ? -1 : 1))
        .map((i) => new Date( /** @type {number} */(i.datetime)))
    );
  }
}
