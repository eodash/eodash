import { Collection, Item } from "stac-js";
import { toAbsolute } from "stac-js/src/http.js";
import {
  extractLayerConfig,
  extractRoles,
  fetchApiItems,
  fetchStyle,
  fetchAllStyles,
  findLayer,
  generateFeatures,
  getDatetimeProperty,
  isSTACItem,
  findLayersByLayerPrefix,
  replaceLayersInStructure,
  extractLayerLegend,
  extractLayerTimeValues,
} from "./helpers";
import {
  getLayers,
  getCompareLayers,
  registerProjection,
} from "@/store/actions";
import {
  createLayerFromRender,
  createLayersFromAssets,
  createLayersFromLinks,
} from "./createLayers";
import axios from "@/plugins/axios";
import log from "loglevel";
import { dataThemesBrands } from "@/utils/states";
import { useEventBus } from "@vueuse/core";
import { eoxLayersKey } from "@/utils/keys";
import { activeTemplate } from "@/store/states";
import { useEodash } from "@/composables";

export class EodashCollection {
  #collectionUrl = "";

  isAPI = true;
  /** @type {string | null} */
  rasterEndpoint = null;

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

  /**
   * @param {string} collectionUrl
   * @param {boolean} isAPI
   * @param {string | null} rasterEndpoint
   */
  constructor(collectionUrl, isAPI = true, rasterEndpoint = null) {
    this.#collectionUrl = collectionUrl;
    this.isAPI = isAPI;
    this.rasterEndpoint = rasterEndpoint;
  }

  /**
   * @async
   * @param {import("stac-ts").StacItem | import('stac-ts').StacLink | Date } [itemOrDate]
   * @returns {Promise<Record<string,any>[]>} layers
   */
  createLayersJson = async (itemOrDate) => {
    /**
     * @type {import("stac-ts").StacLink | import("stac-ts").StacItem | undefined}
     **/
    let itemOrItemLink;

    // TODO get auxiliary layers from collection
    /** @type {Record<string,any>[]} */
    let layersJson = [];

    // Load collectionstac if not yet initialized // TODO
    await this.fetchCollection();

    const isObservationPoint = this.#collectionStac?.endpointtype === "GeoDB";

    if (itemOrDate instanceof Date) {
      // if collectionStac not yet initialized we do it here
      itemOrItemLink = await this.getItem(itemOrDate);
    } else {
      itemOrItemLink = itemOrDate;
    }

    let stacItemUrl = "";
    if (isSTACItem(itemOrItemLink)) {
      this.selectedItem = itemOrItemLink;
      stacItemUrl = this.#collectionUrl + `/items/${this.selectedItem.id}`;
    } else if (itemOrItemLink) {
      if (itemOrItemLink?.href?.startsWith("blob:")) {
        stacItemUrl = itemOrItemLink.href;
        // Use native fetch for blob URLs to avoid axios/cache interceptor issues
        this.selectedItem = await fetch(stacItemUrl).then(
          async (resp) => await resp.json(),
        );
      } else {
        stacItemUrl = toAbsolute(itemOrItemLink.href, this.#collectionUrl);
        this.selectedItem = await axios
          .get(stacItemUrl)
          .then((resp) => resp.data);
      }
    } else if (!this.selectedItem) {
      this.selectedItem = await this.getItem();
      if (!this.selectedItem) {
        console.warn(
          "[eodash] the selected collection does not include any items",
        );
        return [];
      } else if (this.selectedItem) {
        // if no specific item was requested, we create layers from the latest item
        return this.createLayersJson(this.selectedItem);
      }
    }

    // specific item was requested
    const item = new Item(this.selectedItem);
    this.selectedItem = item;
    const title = this.#collectionStac?.title || this.#collectionStac?.id || "";
    layersJson.push(
      ...(await this.buildJsonArray(item, title, isObservationPoint)),
    );
    return layersJson;
  };

  /**
   * @param {import("stac-ts").StacItem} item
   * @param {string} title
   * @param {boolean} isObservationPoint
   * @param {string} [itemDatetime]
   * @returns {Promise<Record<string,any>[]>} layers
   * */
  async buildJsonArray(item, title, isObservationPoint, itemDatetime) {
    if (!item) {
      console.warn("[eodash] no item provided to buildJsonArray");
      return [];
    }

    log.debug(
      "Building JSON array",
      item,
      title,
      isObservationPoint,
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

    if (isObservationPoint) {
      // handled by getObservationPointsLayer
      return [];
    }

    // I propose following approach, we "manually" create configurations
    // for the rendering options we know and expect.
    // If we don't find any we fallback to using the STAC ol item that
    // will try to extract anything it supports but for which we have
    // less control.

    const { layerDatetime, timeControlValues } = extractLayerTimeValues(
      await this.getItems(
        true,
        false,
        item.properties?.datetime ??
          item.properties.start_datetime ??
          itemDatetime,
      ),
      item.properties?.datetime ??
        item.properties.start_datetime ??
        itemDatetime,
    );

    const dataAssets = Object.keys(item?.assets ?? {}).reduce((data, ast) => {
      if (item.assets[ast].roles?.includes("data")) {
        data[ast] = item.assets[ast];
      }
      return data;
    }, /** @type {Record<string,import('stac-ts').StacAsset>} */ ({}));

    const isSupported =
      item.links.some((link) =>
        ["wms", "xyz", "wmts", "vector-tile"].includes(link.rel),
      ) || Object.keys(dataAssets).length;

    if (isSupported) {
      // Checking for potential legend asset
      let extraProperties = extractLayerLegend(this.#collectionStac);
      extraProperties = {
        ...extraProperties,
        ...(this.color && { color: this.color }),
        ...(timeControlValues && {
          timeControlValues,
          timeControlProperty: "TIME",
        }),
      };

      // tmp hack
      const eodash = useEodash();
      //@ts-expect-error todo
      const currentTemplate = eodash?.templates?.[activeTemplate.value];
      const layerControlTools = currentTemplate?.widgets?.find(
        //@ts-expect-error todo
        (w) => w.widget?.name === "EodashLayerControl",
      )?.widget?.properties?.tools;
      const hasDatetime = layerControlTools
        ? layerControlTools.includes("datetime")
        : true;

      const links = await createLayersFromLinks(
        this.#collectionStac?.id ?? "",
        title,
        item,
        hasDatetime ? layerDatetime : undefined,
        extraProperties,
        this.#collectionStac,
      );

      jsonArray.push(
        ...links,
        ...(await createLayersFromAssets(
          this.#collectionStac?.id ?? "",
          title || this.#collectionStac?.title || item.id,
          dataAssets,
          item,
          layerDatetime,
          extraProperties,
        )),
        ...((this.rasterEndpoint &&
          (await createLayerFromRender(
            this.rasterEndpoint,
            this.#collectionStac,
            item,
            {
              ...extraProperties,
              ...(layerDatetime && hasDatetime && { layerDatetime }),
            },
          ))) ||
          []),
      );
    } else {
      // get the correct style which is not attached to a link
      const id = this.#collectionStac?.id ?? "";
      const styles = await fetchStyle(item);
      let { layerConfig, style } = extractLayerConfig(id, styles);
      // fallback to STAC
      const json = {
        type: "STAC",
        displayWebMapLink: true,
        displayFootprint: false,
        data: item,
        properties: {
          id,
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
      const col = await axios
        .get(this.#collectionUrl)
        .then((resp) => resp.data);
      this.#collectionStac = new Collection(col);
      log.debug("Fetching collection file", this.#collectionUrl);
    }
    return this.#collectionStac;
  }

  /**
   * Returns all item links sorted by datetime ascendingly
   * @param {boolean} [fields=false] if true, fetch items from API with only properties
   * @param {boolean} [first] - if true, returns the first page of items only (for API collections)
   * @param {string | Date} [centerDatetime] - Date to center the search around if items exceed maxNumber
   * @returns {Promise<import("stac-ts").StacLink[] | import("stac-ts").StacItem[] | undefined>}
   */
  async getItems(fields = false, first = false, centerDatetime = undefined) {
    const items = this.#collectionStac?.links.filter((i) => i.rel === "item");
    if (this.isAPI && !items?.length && !first) {
      const itemUrl = this.#collectionUrl + "/items";
      if (fields) {
        return await fetchApiItems(
          itemUrl,
          `fields=properties.datetime,-assets,-geometry,-links,-bbox`,
          100,
          first,
          4000,
          centerDatetime,
        );
      }
      return await fetchApiItems(
        itemUrl,
        undefined,
        100,
        first,
        4000,
        centerDatetime,
      );
    }

    const datetimeProperty = getDatetimeProperty(this.#collectionStac?.links);
    if (!datetimeProperty) {
      return items;
    }
    return (
      items
        // sort by `datetime`, where oldest is first in array
        ?.sort((a, b) =>
          /** @type {number} */ (a[datetimeProperty]) <
          /** @type {number} */ (b[datetimeProperty])
            ? -1
            : 1,
        )
    );
  }

  async getDates() {
    const items = await this.getItems(true, false);

    const datetimeProperty = getDatetimeProperty(items);
    if (!datetimeProperty || !items?.length) {
      return [];
    }

    const mapToDates = this.isAPI
      ? //@ts-expect-error todo
        (i) =>
          new Date(/** @type {string} */ (i.properties?.[datetimeProperty]))
      : //@ts-expect-error todo
        (i) => new Date(/** @type {string} */ (i[datetimeProperty]));
    return items?.map(mapToDates) || [];
  }

  async getExtent() {
    return this.#collectionStac?.extent;
  }

  /**
   * Get closest Item Link from a certain date,
   * get the latest if no date provided
   *  @param {Date} [date]
   *  @return {Promise<import("stac-ts").StacItem | import("stac-ts").StacLink | undefined>} item
   **/
  async getItem(date) {
    let items = await this.getItems(false, true);
    if (!date) {
      // in case no date was provided, return the last item
      return items && items.at(-1);
    }

    if (this.isAPI) {
      const urlArr = this.#collectionUrl.split("/").slice(0, -2);
      const searchURL = urlArr.join("/") + "/search";
      const targetItem = await axios
        .get(searchURL, {
          params: {
            collections: this.#collectionStac?.id,
            datetime: `../${date.toISOString()}`,
            limit: 1,
            sortby: "-datetime",
          },
        })
        .then((resp) => resp.data?.features?.[0]);
      return targetItem;
    }
    const datetimeProperty = getDatetimeProperty(items);
    if (!datetimeProperty) {
      // in case no datetime property is found, return the last item
      return items && items.at(-1);
    }
    return items?.sort((a, b) => {
      const distanceA = Math.abs(
        new Date(
          /** @type {number} */ (
            //@ts-expect-error TODO
            this.isAPI ? a.properties[datetimeProperty] : a[datetimeProperty]
          ),
        ).getTime() - date.getTime(),
      );
      const distanceB = Math.abs(
        new Date(
          /** @type {number} */ (
            //@ts-expect-error TODO
            this.isAPI ? b.properties[datetimeProperty] : b[datetimeProperty]
          ),
        ).getTime() - date.getTime(),
      );
      return distanceA - distanceB;
    })[0];
  }

  async getToolTipProperties() {
    if (!(this.selectedItem instanceof Item)) {
      return [];
    }
    // get all style links, which could contribute by tooltip config and aggregate them
    const styles = await fetchAllStyles(this.selectedItem);
    // get only unique ids to avoid duplicates
    const aggregatedTooltips = [
      ...new Map(
        styles
          .flatMap((style) => style.tooltip || [])
          .map((entry) => [entry.id, entry]),
      ).values(),
    ];
    this.#tooltipProperties = aggregatedTooltips ?? [];
    return this.#tooltipProperties;
  }

  /**
   *
   * @param {string} datetime
   * @param {string} layer
   * @param {string} map
   */
  async updateLayerJson(datetime, layer, map) {
    await this.fetchCollection();
    const datetimeProperty = getDatetimeProperty(
      await this.getItems(false, true),
    );
    if (!datetimeProperty) {
      console.warn("[eodash] no datetime property found in collection");
      return;
    }
    // get the link of the specified date
    const specifiedLink = await this.getItem(new Date(datetime));

    if (!specifiedLink) {
      console.warn(
        "[eodash] no Item found for the provided datetime",
        datetime,
      );
      return;
    }
    /** @type {Record<string, any>[]} */
    let newLayers = [];
    if (isSTACItem(specifiedLink)) {
      // if specifiedLink is an item, we create layers from it
      newLayers = await this.buildJsonArray(
        specifiedLink,
        this.#collectionStac?.title || this.#collectionStac?.id || "",
        this.#collectionStac?.endpointtype === "GeoDB" ||
          !!this.#collectionStac?.locations,
        datetime,
      );
    } else {
      // create json layers from the item
      newLayers = await this.createLayersJson(specifiedLink);
    }

    let currentLayers = getLayers();
    if (map === "second") {
      currentLayers = getCompareLayers();
    }

    const oldLayer = findLayer(currentLayers, layer);

    const toBeReplacedLayers = findLayersByLayerPrefix(currentLayers, oldLayer);

    if (!toBeReplacedLayers) {
      return;
    }
    const updatedLayers = replaceLayersInStructure(
      currentLayers,
      toBeReplacedLayers,
      newLayers,
    );

    // Emit event to update potential widget dependencies such as process layer ids
    const layersEvents = useEventBus(eoxLayersKey);
    layersEvents.emit("layertime:updated", newLayers);

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
        indicator,
      )),
    ];
  }

  /**
   * Returns Observation points layer from a list of EodashCollections
   *
   * @param {EodashCollection[]} eodashCollections
   *
   **/
  static getObservationPointsLayer(eodashCollections) {
    const allFeatures = [];
    for (const collection of eodashCollections) {
      const isObservationPoint =
        collection.#collectionStac?.endpointtype === "GeoDB" ||
        /**@type {boolean} */ (collection.#collectionStac?.locations);
      if (!isObservationPoint) {
        continue;
      }
      const collectionFeatures = generateFeatures(
        JSON.parse(JSON.stringify(collection.#collectionStac?.links)),
        {
          collection_id: collection.#collectionStac?.id,
          geoDBID: collection.#collectionStac?.geoDBID,
          themes: collection.#collectionStac?.themes ?? [],
        },
        collection.#collectionStac?.locations ? "child" : "item",
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
              "fill-color": "#00417077",
              "stroke-color": "#004170",
            },
          },
        ];
      })(),
      interactions: (() => {
        const oldLayer = findLayer([...getLayers()], "geodb-collection");
        if (!oldLayer || !oldLayer.interactions?.length) {
          return [];
        }
        return [...oldLayer.interactions];
      })(),
    };
  }
}
