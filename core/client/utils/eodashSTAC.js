import { Collection, Item } from "stac-js";
import { toAbsolute } from "stac-js/src/http.js";
import {
  createLayerID,
  extractLayerConfig,
  extractLayerDatetime,
  extractRoles,
  fetchStyle,
  findLayer,
  generateFeatures,
  replaceLayer,
} from "./helpers";
import { getLayers, registerProjection } from "@/store/Actions";
import { createLayersFromAssets, createLayersFromLinks } from "./createLayers";
import axios from "axios";

export class EodashCollection {
  #collectionUrl = "";

  /** @type {import("stac-ts").StacCollection | undefined} */
  #collectionStac;

  //  read only
  get collectionStac() {
    return this.#collectionStac;
  }

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
   * @param {import('stac-ts').StacLink | Date} [linkOrDate]
   * @returns
   */
  createLayersJson = async (linkOrDate) => {
    /**
     * @type {import("stac-ts").StacLink | undefined}
     **/
    let stacItem;

    /**
     * @type {import("stac-ts").StacCollection | undefined}
     **/
    let stac;
    // TODO get auxiliary layers from collection
    /** @type {Record<string,any>[]} */
    let layersJson = [];

    // Load collectionstac if not yet initialized
    stac = await this.fetchCollection();

    const isGeoDB = stac?.endpointtype === "GeoDB";

    if (linkOrDate instanceof Date) {
      // if collectionStac not yet initialized we do it here
      stacItem = this.getItem(linkOrDate);
    } else {
      stacItem = linkOrDate;
    }

    const stacItemUrl = stacItem
      ? toAbsolute(stacItem.href, this.#collectionUrl)
      : this.#collectionUrl;

    stac = await axios.get(stacItemUrl).then((resp) => resp.data);

    if (!stacItem) {
      // no specific item was requested; render last item
      this.#collectionStac = new Collection(stac);
      this.selectedItem = this.getItem();

      if (this.selectedItem) {
        layersJson = /** @type {Record<string,any>[]} */ (
          await this.createLayersJson(this.selectedItem)
        );
      } else {
        console.warn(
          "[eodash] the selected collection does not include any items",
        );
      }
      return [];
    } else {
      // specific item was requested
      const item = new Item(stac);
      this.selectedItem = item;
      const title =
        this.#collectionStac?.title || this.#collectionStac?.id || "";
      layersJson.unshift(
        ...(await this.buildJsonArray(item, stacItemUrl, title, isGeoDB)),
      );
      return layersJson;
    }
  };

  /**
   * @param {import("stac-ts").StacItem} item
   * @param {string} itemUrl
   * @param {string} title
   * @param {boolean} isGeoDB
   * @param {string} [itemDatetime]
   * @returns {Promise<Record<string,any>[]>} arrays
   * */
  async buildJsonArray(item, itemUrl, title, isGeoDB, itemDatetime) {
    await this.fetchCollection();
    // registering top level indicator projection
    const indicatorProjection =
      item?.["proj:epsg"] || item?.["eodash:proj4_def"];
    await registerProjection(
      /** @type {number | string | {name: string, def: string; extent: number[] | undefined;} } */ (
        indicatorProjection
      ),
    );

    const jsonArray = [];

    if (isGeoDB) {
      const allFeatures = generateFeatures(this.#collectionStac?.links);

      return [
        {
          type: "Vector",
          properties: {
            id: createLayerID(this.#collectionStac?.id ?? "", item.id, false),
            title: this.#collectionStac?.title || item.id,
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
        },
      ];
    }

    // I propose following approach, we "manually" create configurations
    // for the rendering options we know and expect.
    // If we don't find any we fallback to using the STAC ol item that
    // will try to extract anything it supports but for which we have
    // less control.

    const { layerConfig, style } = extractLayerConfig(
      await fetchStyle(item, itemUrl),
    );

    const layerDatetime = extractLayerDatetime(
      this.getItems(),
      item.properties?.datetime ?? itemDatetime,
    );

    const dataAssets = Object.keys(item?.assets ?? {}).reduce((data, ast) => {
      if (item.assets[ast].roles?.includes("data")) {
        data[ast] = item.assets[ast];
      }
      return data;
    }, /** @type {Record<string,import('stac-ts').StacAsset>} */ ({}));
    const isSupported =
      item.links.some((link) => ["wms", "xyz", "wmts"].includes(link.rel)) ||
      Object.keys(dataAssets).length;

    if (isSupported) {
      const links = await createLayersFromLinks(
        createLayerID(this.#collectionStac?.id ?? "", item.id, false),
        title,
        item,
        layerDatetime,
      );
      jsonArray.push(
        ...links,
        ...(await createLayersFromAssets(
          createLayerID(this.#collectionStac?.id ?? "", item.id, true),
          title || this.#collectionStac?.title || item.id,
          dataAssets,
          style,
          layerConfig,
          layerDatetime,
        )),
      );
    } else {
      // fallback to STAC
      const json = {
        type: "STAC",
        displayWebMapLink: true,
        displayFootprint: false,
        data: item,
        properties: {
          id: createLayerID(this.#collectionStac?.id ?? "", item.id, false),
          title: title || item.id,
          layerConfig,
        },
        style,
      };
      extractRoles(
        json.properties,
        /** @type {string[]} */ (item?.roles),
        item.id || /** @type {string} */ (item.title) || "" + " STAC",
      );
      jsonArray.push(json);
    }

    return jsonArray;
  }

  async fetchCollection() {
    if (!this.#collectionStac) {
      const col = await axios
        .get(this.#collectionUrl)
        .then((resp) => resp.data);
      this.#collectionStac = new Collection(col);
    }
    return this.#collectionStac;
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

  async getExtent() {
    await this.fetchCollection();
    return this.#collectionStac?.extent;
  }

  /**
   * Get closest Item Link from a certain date,
   * get the latest if no date provided
   *  @param {Date} [date]
   **/
  getItem(date) {
    return date
      ? this.getItems()?.sort((a, b) => {
          const distanceA = Math.abs(
            new Date(/** @type {number} */ (a.datetime)).getTime() -
              date.getTime(),
          );
          const distanceB = Math.abs(
            new Date(/** @type {number} */ (b.datetime)).getTime() -
              date.getTime(),
          );
          return distanceA - distanceB;
        })[0]
      : this.getItems()?.at(-1);
  }

  /**
   *
   * @param {string} datetime
   * @param {string} layer
   */
  async updateLayerJson(datetime, layer) {
    await this.fetchCollection();

    // get the link of the specified date
    const specifiedLink = this.getItems()?.find(
      (item) =>
        typeof item.datetime === "string" &&
        new Date(item.datetime).toISOString() === datetime,
    );

    if (!specifiedLink) {
      console.warn(
        "[eodash] no Item found for the provided datetime",
        datetime,
      );
      return;
    }

    // create json layers from the item
    const newLayers = await this.createLayersJson(specifiedLink);

    const curentLayers = getLayers();

    const oldLayer = findLayer(curentLayers, layer);

    const updatedLayers = replaceLayer(
      curentLayers,
      /** @type {Record<string,any> & { properties:{ id:string; title:string } } } */
      (oldLayer),
      newLayers,
    );

    return updatedLayers;
  }

  /**
   * Returns base layers and overlay layers of a STAC Collection
   *
   * @param {import("stac-ts").StacCollection} indicator */
  static async getIndicatorLayers(indicator) {
    const indicatorAssets = Object.keys(indicator?.assets ?? {}).reduce(
      (assets, ast) => {
        if (
          indicator.assets?.[ast].roles?.includes("baselayer") ||
          indicator.assets?.[ast].roles?.includes("overlay")
        ) {
          assets[ast] = indicator.assets[ast];
        }
        return assets;
      },
      /** @type {Record<string,import('stac-ts').StacAsset>} */ ({}),
    );
    return [
      ...(await createLayersFromLinks(
        createLayerID(indicator.id ?? "", indicator.id, false),
        indicator.id,
        //@ts-expect-error indicator instead of item
        indicator,
        // layerDatetime,
      )),
      ...(await createLayersFromAssets(
        createLayerID(indicator?.id ?? "", indicator.id, true),
        indicator?.title || indicator.id,
        indicatorAssets,
        // style,
        // layerConfig,
        // layerDatetime,
      )),
    ];
  }
}
