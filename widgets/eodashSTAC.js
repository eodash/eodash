import { STAC, Collection, Item } from 'stac-js';
import { toAbsolute } from 'stac-js/src/http.js';

export class EodashCollection {
  #collectionUrl = undefined;
  #collectionStac = undefined;
  selectedItem = null;

  constructor(collectionUrl) {
    this.#collectionUrl = collectionUrl;
  }

  createLayersJson(item) {
    return new Promise(async (resolve, reject) => {
      let stacItem;
      if (item instanceof Date) {
        stacItem = this.getItems().sort((a, b) => {
          const distanceA = Math.abs(new Date(a.datetime) - item);
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
        resolve(layersJson);
      } else {
        // specific item was requested
        const item = new Item(stac);
        this.selectedItem = item;
        layersJson.unshift(this.buildJson(item));
        resolve(layersJson);
      }
    });
  }

  buildJson(item) {
    let json;

    // TODO implement other types, such as COG
    if (item.links.find((l) => l.rel === 'wms' || l.rel === 'wmts')) {
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
      this.#collectionStac.links
        .filter((i) => i.rel === 'item')
        // sort by `datetime`, where oldest is first in array
        .sort((a, b) => (a.datetime < b.datetime ? -1 : 1))
    );
  }

  getDates() {
    return (
      this.#collectionStac.links
        .filter((i) => i.rel === 'item')
        // sort by `datetime`, where oldest is first in array
        .sort((a, b) => (a.datetime < b.datetime ? -1 : 1))
        .map((i) => new Date(i.datetime))
    );
  }
}
