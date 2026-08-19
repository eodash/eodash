import axios from "axios";
import log from "loglevel";
import { renderConfigTemplate } from "./layer-config.js";

/**
 * Extracts a single non-link style JSON from a STAC Item optionally for a selected key mapping
 * @param { import("../types").EodashItem | import("../types").EodashCollection | null | undefined} stacObject
 * @param {string | undefined} linkKey
 * @param {string | undefined} assetKey
 * @returns
 **/
export const fetchStyle = async (
  stacObject,
  linkKey = undefined,
  assetKey = undefined,
) => {
  if (!stacObject) return undefined;
  let styleLink = null;
  if (linkKey) {
    styleLink = stacObject.links.find(
      (link) =>
        link.rel.includes("style") &&
        link["links:keys"] &&
        /** @type {Array<string>} */ (link["links:keys"]).includes(linkKey),
    );
  } else if (assetKey) {
    styleLink = stacObject.links.find(
      (link) =>
        link.rel.includes("style") &&
        link["asset:keys"] &&
        /** @type {Array<string>} */ (link["asset:keys"]).includes(assetKey),
    );
  } else {
    log.debug(
      "Neither link key, nor asset key input, can not match any style to layer.",
      stacObject.id,
    );
    return {};
  }
  if (styleLink) {
    /** @type {import("../types").EodashStyleJson} */
    const styleJson = await axios.get(styleLink.href).then((resp) => resp.data);

    log.debug("fetched styles JSON", JSON.parse(JSON.stringify(styleJson)));
    return { ...styleJson };
  }
};

/**
 * Resolves a style by preferring the item's own `style` link and falling back
 * to the collection's. Takes the same key arguments as `fetchStyle`. `${...}`
 * placeholders are rendered against `item` (see {@link renderConfigTemplate}).
 *
 * @param {import("../types").EodashItem | import("../types").EodashCollection} item
 * @param {import("../types").EodashCollection | null | undefined} collection
 * @param {string} [linkKey]
 * @param {string} [assetKey]
 * @returns {Promise<import("../types").EodashStyleJson | undefined>}
 */
export const resolveStyle = async (item, collection, linkKey, assetKey) => {
  const style =
    (await fetchStyle(item, linkKey, assetKey)) ??
    (await fetchStyle(collection, linkKey, assetKey));
  if (!style || !item) {
    return style;
  }
  return renderConfigTemplate(style, item);
};

/**
 * Fetches all style JSONs from a STAC Item and returns an array with style objects
 * @param {import("../types").EodashItem | import("../types").EodashCollection} stacObject
 * @returns { Promise <Array<import("../types").EodashStyleJson>>}
 **/
export const fetchAllStyles = async (stacObject) => {
  const styleLinks = stacObject.links.filter((link) =>
    link.rel.includes("style"),
  );
  const fetchPromises = styleLinks.map(async (link) => {
    /** @type {import("../types").EodashStyleJson} */
    const styleJson = await axios.get(link.href).then((resp) => resp.data);
    log.debug("fetched styles JSON", JSON.parse(JSON.stringify(styleJson)));
    return styleJson;
  });
  const results = await Promise.all(fetchPromises);
  return results;
};

/**
 * @param {import("../types").EodashCollection | undefined | null} collection
 * @returns {object}
 */
export function extractLayerLegend(collection) {
  let extraProperties = {};
  if (collection?.assets?.legend?.href) {
    extraProperties = {
      description: `<div style="width: 100%">
          <img src="${collection.assets.legend.href}" style="max-height:70px; margin-top:-15px; margin-bottom:-20px;" />
        </div>`,
    };
  }
  // Check if collection has eox:colorlegend definition, if yes overwrite legend description
  if (collection && collection["eox:colorlegend"]) {
    extraProperties = {
      layerLegend: collection["eox:colorlegend"],
    };
  }
  return extraProperties;
}

/**
 * @param { import("../types").EodashLink } link
 * @returns {object}
 */
export function extractEoxLegendLink(link) {
  let extraProperties = {};
  if (link["eox:colorlegend"]) {
    extraProperties = {
      layerLegend: link["eox:colorlegend"],
    };
  }
  return extraProperties;
}

/**
 * adds tooltip to the layer if the style has tooltip property
 * @param {Record<string,any>} layer
 * @param {import("../types").EodashStyleJson} [style]
 */
export const addTooltipInteraction = (layer, style) => {
  if (style?.tooltip) {
    layer.interactions = [
      {
        type: "select",
        options: {
          id: (Math.random() * 10000).toFixed() + "_selectInteraction",
          condition: "pointermove",
          style: {
            "stroke-color": "#335267",
            "stroke-width": 4,
          },
        },
      },
    ];
  }
};
