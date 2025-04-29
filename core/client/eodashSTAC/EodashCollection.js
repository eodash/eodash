import { Collection, Item } from "stac-js";
import { toAbsolute } from "stac-js/src/http.js";
import {
  extractLayerConfig,
  extractLayerDatetime,
  extractRoles,
  fetchStyle,
  findLayer,
  generateFeatures,
  replaceLayer,
} from "./helpers";
import {
  getLayers,
  getCompareLayers,
  registerProjection,
} from "@/store/actions";
import { createLayersFromAssets, createLayersFromLinks } from "./createLayers";
import axios from "@/plugins/axios";
import log from "loglevel";
import { dataThemesBrands } from "@/utils/states";

export class EodashCollection {
  #collectionUrl = "";

  /** @type {import("stac-ts").StacCollection | undefined} */
  #collectionStac;

  /**
   * @type {import("stac-ts").StacLink
   *   | import("stac-ts").StacItem
   *   | undefined}
   */
  selectedItem;

  /** @type {Exclude<import("@/types").EodashStyleJson["tooltip"],undefined>} */
  #tooltipProperties = [];

  /** @type {string | undefined} */
  color;

  //  read only
  get collectionStac() {
    return this.#collectionStac;
  }

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
    let itemLink;

    /**
     * @type {import("stac-ts").StacCollection | import("stac-ts").StacItem | undefined}
     **/
    let stac;
    // TODO get auxiliary layers from collection
    /** @type {Record<string,any>[]} */
    let layersJson = [];

    const isGeoDB = stac?.endpointtype === "GeoDB";

    if (linkOrDate instanceof Date) {
      // if collectionStac not yet initialized we do it here
      itemLink = this.getItem(linkOrDate);
    } else {
      itemLink = linkOrDate;
    }
    let stacItemUrl = "";

    if (itemLink?.["item"]) {
      stac = /** @type {import("stac-ts").StacItem} */ (itemLink["item"]);
    } else {
      stacItemUrl = itemLink
        ? toAbsolute(itemLink.href, this.#collectionUrl)
        : this.#collectionUrl;

      stac = await axios.get(stacItemUrl).then((resp) => resp.data);
    }

    if (!itemLink) {
      // no specific item was requested; render last item
      this.#collectionStac = new Collection(stac);
      this.selectedItem = this.getItem();

      if (this.selectedItem) {
        layersJson = await this.createLayersJson(this.selectedItem);
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
   * @returns {Promise<Record<string,any>[]>} layers
   * */
  async buildJsonArray(item, itemUrl, title, isGeoDB, itemDatetime) {
    log.debug(
      "Building JSON array",
      item,
      itemUrl,
      title,
      isGeoDB,
      itemDatetime,
    );
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
      // handled by getGeoDBLayer
      return [];
    }

    // I propose following approach, we "manually" create configurations
    // for the rendering options we know and expect.
    // If we don't find any we fallback to using the STAC ol item that
    // will try to extract anything it supports but for which we have
    // less control.

    let { layerConfig, style } = extractLayerConfig(
      this.#collectionStac?.id ?? "",
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
      // Checking for potential legend asset
      let extraProperties = null;
      if (this.#collectionStac?.assets?.legend?.href) {
        extraProperties = {
          description: `<div style="width: 100%">
            <img src="${this.#collectionStac.assets.legend.href}" style="max-height:70px; margin-top:-15px; margin-bottom:-20px;" />
          </div>`,
        };
      }
      // Check if collection has eox:colorlegend definition, if yes overwrite legend description
      if (this.#collectionStac && this.#collectionStac["eox:colorlegend"]) {
        extraProperties = {
          layerLegend: this.#collectionStac["eox:colorlegend"],
        };
      }
      extraProperties = {
        ...extraProperties,
        ...(this.color && { color: this.color }),
      };
      const links = await createLayersFromLinks(
        this.#collectionStac?.id ?? "",
        title,
        item,
        layerDatetime,
        extraProperties,
      );
      jsonArray.push(
        ...links,
        ...(await createLayersFromAssets(
          this.#collectionStac?.id ?? "",
          title || this.#collectionStac?.title || item.id,
          dataAssets,
          item,
          style,
          layerConfig,
          layerDatetime,
          extraProperties,
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
          id: this.#collectionStac?.id ?? "",
          title: title || item.id,
          layerConfig,
        },
        style,
      };
      extractRoles(
        json.properties,
        //@ts-expect-error using the item incase no self link is found
        item.links.find((link) => link.rel === "self") ?? item,
      );
      jsonArray.push(json);
    }

    return jsonArray;
  }

  async fetchCollection() {
    if (!this.#collectionStac) {
      log.debug("Fetching collection file", this.#collectionUrl);
      const col = await axios
        .get(this.#collectionUrl)
        .then((resp) => resp.data);
      this.#collectionStac = new Collection(col);
    }
    return this.#collectionStac;
  }

  /**
   * Returns all item links sorted by datetime ascendingly
   */
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
    return this.getItems()?.map(
      (i) => new Date(/** @type {number} */ (i.datetime)),
    );
  }

  async getExtent() {
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

  async getToolTipProperties() {
    if (!(this.selectedItem instanceof Item)) {
      return [];
    }
    let styles = await fetchStyle(
      this.selectedItem,
      `${this.#collectionUrl}/${this.selectedItem.id}`,
    );
    const { tooltip } = styles || { tooltip: [] };
    this.#tooltipProperties = tooltip ?? [];
    return this.#tooltipProperties;
  }

  /**
   *
   * @param {string} datetime
   * @param {string} layer
   * @param {string} map
   */
  async updateLayerJson(datetime, layer, map) {
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

    let currentLayers = getLayers();
    if (map === "second") {
      currentLayers = getCompareLayers();
    }

    /** @type {string | undefined} */
    const oldLayerID = findLayer(currentLayers, layer)?.properties.id;

    if (!oldLayerID) {
      return;
    }

    const updatedLayers = replaceLayer(currentLayers, oldLayerID, newLayers);

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
        indicator?.id ?? "",
        indicator?.title || indicator.id,
        //@ts-expect-error indicator instead of item
        indicator,
      )),
      ...(await createLayersFromAssets(
        indicator?.id ?? "",
        indicator?.title || indicator.id,
        indicatorAssets,
        //@ts-expect-error indicator instead of item
        indicator,
      )),
    ];
  }

  /**
   * Returns GeoDB layer from a list of EodashCollections
   *
   * @param {EodashCollection[]} eodashCollections
   *
   **/
  static getGeoDBLayer(eodashCollections) {
    const allFeatures = [];
    for (const collection of eodashCollections) {
      const isGeoDB = collection.#collectionStac?.endpointtype === "GeoDB";
      if (!isGeoDB) {
        continue;
      }
      const collectionFeatures = generateFeatures(
        JSON.parse(JSON.stringify(collection.#collectionStac?.links)),
        {
          collection_id: collection.#collectionStac?.id,
          geoDBID: collection.#collectionStac?.geoDBID,
          themes: collection.#collectionStac?.themes ?? [],
        },
      ).features;

      if (collectionFeatures.length) {
        allFeatures.push(collectionFeatures);
      }
    }
    if (!allFeatures.length) {
      return null;
    }

    const featureCollection = {
      type: "FeatureCollection",
      crs: {
        type: "name",
        properties: {
          name: "EPSG:4326",
        },
      },
      features: allFeatures.flat(),
    };
    return {
      type: "Vector",
      properties: {
        id: "geodb-collection",
        title: "Observation Points",
      },
      source: {
        type: "Vector",
        url: "data:," + encodeURIComponent(JSON.stringify(featureCollection)),
        format: "GeoJSON",
      },
      style: (() => {
        // generate flat style rules for each theme
        /** @param {*} theme */
        const generateIconSrc = (theme) => {
          const svgString = `
            <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 70 70">
              <circle cx="35" cy="35" r="30" stroke="white" fill="${theme.color}" stroke-width="4"/>
              <path d="${theme.icon}" fill="#fff" transform="translate(19.5, 20) scale(1.3) "/>
            </svg>
            `;
          return `data:image/svg+xml,${encodeURIComponent(svgString)}`;
        };

        return [
          ...Object.keys(dataThemesBrands).map((theme, idx) => {
            return {
              ...(idx !== 0 && { else: true }),
              filter: ["==", ["get", "themes", 0], theme],
              style: {
                //@ts-expect-error string index
                "icon-src": generateIconSrc(dataThemesBrands[theme]),
              },
            };
          }),
          {
            else: true,
            style: {
              "circle-radius": 10,
              "circle-fill-color": "#00417077",
              "circle-stroke-color": "#004170",
              "fill-color": "#0417077",
              "stroke-color": "#004170",
            },
          },
        ];
      })(),
      interactions: [],
    };
  }
}
