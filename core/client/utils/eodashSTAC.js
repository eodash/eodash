import { Collection, Item } from "stac-js";
import { toAbsolute } from "stac-js/src/http.js";
import {
  createLayersFromDataAssets,
  extractLayerConfig,
  generateFeatures,
  setMapProjFromCol,
} from "./helpers";
import axios from "axios";
import { registerProjection } from "@/store/Actions";

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
   * @param {import('stac-ts').StacLink | Date} [itemLinkOrDate]
   * @returns
   */
  createLayersJson = async (itemLinkOrDate) => {
    /** @type {import("stac-ts").StacLink | undefined} */
    let stacItem,
      /** @type {import("stac-ts").StacCollection | undefined} */
      stac;
    // TODO get auxiliary layers from collection
    /** @type {object[]} */
    let layersJson = [];

    // Load collectionstac if not yet initialized
    if (!this.#collectionStac) {
      const response = await axios.get(this.#collectionUrl);
      stac = await response.data;
      this.#collectionStac = new Collection(stac);
    }

    // set availabe map projection
    setMapProjFromCol(this.#collectionStac);

    if (stac && stac.endpointtype === "GeoDB") {
      // Special handling of point based data
      const allFeatures = generateFeatures(stac.links);
      layersJson.unshift({
        type: "Vector",
        properties: {
          id: stac.id,
          title: stac.title || stac.id,
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
      if (itemLinkOrDate instanceof Date) {
        // if collectionStac not yet initialized we do it here
        stacItem = this.getItems()?.sort((a, b) => {
          const distanceA = Math.abs(
            new Date(/** @type {number} */ (a.datetime)).getTime() -
              itemLinkOrDate.getTime(),
          );
          const distanceB = Math.abs(
            new Date(/** @type {number} */ (b.datetime)).getTime() -
              itemLinkOrDate.getTime(),
          );
          return distanceA - distanceB;
        })[0];
        this.selectedItem = stacItem;
      } else {
        stacItem = itemLinkOrDate;
      }

      const stacItemUrl = stacItem
        ? toAbsolute(stacItem.href, this.#collectionUrl)
        : this.#collectionUrl;
      stac = await axios.get(stacItemUrl).then((resp) => resp.data);

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
        const title = this.#collectionStac.title || this.#collectionStac.id;
        layersJson.unshift(
          ...(await this.buildJsonArray(item, stacItemUrl, title)),
        );
        return layersJson;
      }
    }
  };

  async getExtent() {
    if (!this.#collectionStac) {
      const response = await axios.get(this.#collectionUrl);
      const stac = await response.data;
      this.#collectionStac = new Collection(stac);
    }
    return this.#collectionStac?.extent;
  }
  /**
   * @param {object} properties
   * @param {[string]} roles
   * */
  extractRoles(properties, roles) {
    roles?.forEach((role) => {
      if (role === "visible") {
        // @ts-expect-error visible does not need to exist in properties
        properties.visible = true;
      }
      if (role === "overlay" || role === "baselayer") {
        // @ts-expect-error group not expected to exist in properties
        properties.group = role;
      }
    });
  }
  /**
   * @param {import("stac-ts").StacItem} item
   * @param {string} itemUrl
   * @param {string} title
   * */
  async buildJsonArray(item, itemUrl, title) {
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
    let dataAssets =
      /** @type {Record<string,import('stac-ts').StacAsset>} */ ({});
    if (item.assets) {
      dataAssets = Object.keys(item.assets).reduce((data, ast) => {
        if (item.assets[ast].roles?.includes("data")) {
          data[ast] = item.assets[ast];
        }
        return data;
      }, /** @type {Record<string,import('stac-ts').StacAsset>} */ ({}));
    }

    const { layerConfig, style } = extractLayerConfig(
      await this.fetchStyle(item, itemUrl),
    );
    const wmsArray = item.links.filter((l) => l.rel === "wms");
    const xyzArray = item.links.filter((l) => l.rel === "xyz");
    const fallbackToStac = item.links.find((l) => l.rel === "wmts");

    // TODO: add capability to find projection in item
    await registerProjection(
      /** @type {number | undefined} */ (item?.["proj:epsg"]),
    );

    if (wmsArray.length > 0) {
      wmsArray.forEach((link) => {
        let json = {
          type: "Tile",
          properties: {
            id: link.id || item.id,
            title: title || link.title || item.id,
          },
          source: {
            // TODO: if no projection information is provided we should
            // assume one, else for WMS requests it will try to get
            // the map projection that might not be supported
            // projection: projDef ? projDef : "EPSG:4326",
            type: "TileWMS",
            url: link.href,
            params: {
              LAYERS: link["wms:layers"],
              TILED: true,
            },
          },
        };
        this.extractRoles(
          json.properties,
          /** @type {[string]} */ (link.roles),
        );
        if ("wms:dimensions" in link) {
          // Expand all dimensions into the params attribute
          json.source.params = Object.assign(
            json.source.params,
            link["wms:dimensions"],
          );
        }
        jsonArray.push(json);
      });
    } else if (xyzArray.length > 0) {
      xyzArray.forEach((link) => {
        let json = {
          type: "Tile",
          properties: {
            id: link.id || item.id,
            title: title || link.title || item.id,
            roles: link.roles,
          },
          source: {
            type: "XYZ",
            url: link.href,
          },
        };
        this.extractRoles(
          json.properties,
          /** @type {[string]} */ (link.roles),
        );
        jsonArray.push(json);
      });
    } else if (fallbackToStac) {
      jsonArray.push({
        type: "STAC",
        displayWebMapLink: true,
        displayFootprint: false,
        data: item,
        properties: {
          id: item.id,
          title: title || item.id,
        },
      });
    } else if (Object.keys(dataAssets).length) {
      jsonArray.push(
        ...(await createLayersFromDataAssets(
          this.#collectionStac?.title || item.id,
          this.#collectionStac?.title || item.id,
          dataAssets,
          style,
          layerConfig,
        )),
      );
    } else if (item.geometry) {
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
          title: this.#collectionStac?.title || item.id,
          layerConfig: {
            ...layerConfig,
            style,
          },
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

  /**
   * @param {import("stac-ts").StacItem} item
   * @param {string} itemUrl
   **/
  async fetchStyle(item, itemUrl) {
    const styleLink = item.links.find((link) => link.rel.includes("style"));
    if (styleLink) {
      let url = "";
      if (styleLink.href.startsWith("http")) {
        url = styleLink.href;
      } else {
        url = toAbsolute(styleLink.href, itemUrl);
      }

      /** @type {import("ol/layer/WebGLTile").Style & {jsonform?:object}} */
      const styleJson = await axios.get(url).then((resp) => resp.data);
      return styleJson;
    }
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
