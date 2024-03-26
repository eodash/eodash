import { Collection, Item } from 'stac-js';
import { toAbsolute } from 'stac-js/src/http.js';

export class EodashCollection {
  /** @type {string | undefined} */
  #collectionUrl = undefined;
  #collectionStac = undefined;
  /** @type {*} */
  selectedItem = null;

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
    let stacItem;
    if (item instanceof Date) {
      // if collectionStac not yet initialized we do it here
      if (!this.#collectionStac) {
        //@ts-expect-error
        const response = await fetch(this.#collectionUrl);
        const stac = await response.json();
        this.#collectionStac = new Collection(stac);
      }
      stacItem = this.getItems().sort((a, b) => {
        //@ts-expect-error
        const distanceA = Math.abs(new Date(a.datetime) - item);
        //@ts-expect-error
        const distanceB = Math.abs(new Date(b.datetime) - item);
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
    const stac = await response.json();

    // TODO get auxiliary layers from collection
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

    if (!stacItem) {
      // no specific item was requested; render last item
      this.#collectionStac = new Collection(stac);
      const items = this.getItems();
      this.selectedItem = items[items.length - 1];
      layersJson = await this.createLayersJson(this.selectedItem);
      return layersJson;
    } else {
      // specific item was requested
      const item = new Item(stac);
      this.selectedItem = item;
      //@ts-expect-error
      layersJson.unshift(this.buildJson(item));
      return layersJson;
    }
  }

  /**
   * @param {*} item
   */
  buildJson(item) {
    let json;
    // TODO implement other types, such as COG
    if (/** @type {import('stac-ts').StacLink[]} */(item.links).find((l) => l.rel === 'wms' || l.rel === 'wmts')) {
      json = {
        type: 'STAC',
        displayWebMapLink: true,
        displayFootprint: false,
        data: item,
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
      };
    }

    return json;
  }

  getItems() {
    return (
      //@ts-expect-error
       // eslint-disable-next-line
     /** @type {import('stac-ts').StacLink[]}*/(this.#collectionStac?.links)
        .filter((i) => i.rel === 'item')
        // sort by `datetime`, where oldest is first in array
        .sort((a, b) => ( /** @type {number} */(a.datetime) <  /** @type {number} */(b.datetime) ? -1 : 1))
    );
  }

  getDates() {
    return (
     //@ts-expect-error
      // eslint-disable-next-line
      /** @type {import('stac-ts').StacLink[]}*/ (this.#collectionStac?.links)
        .filter((i) => i.rel === 'item')
        // sort by `datetime`, where oldest is first in array
        .sort((a, b) => ( /** @type {number} */(a.datetime) < /** @type {number} */(b.datetime) ? -1 : 1))
        .map((i) => new Date( /** @type {number} */(i.datetime)))
    );
  }
}
