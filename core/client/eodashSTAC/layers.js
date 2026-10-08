import {
  getIndicatorLayers,
  buildIndicatorDataLayers,
  normalizeBaseLayers,
} from "@eodash/stac";
import { getProjectionCode, sanitizeBbox } from "@eodash/stac/helpers";
import { assignLayers } from "@/store/actions";
import {
  dataThemesBrands,
  defaultBaseLayers,
  hasRestoredView,
  shouldZoomToExtent,
} from "@/utils/states";
import { useSTAcStore } from "@/store/stac";
import {
  registerProjections,
  setMapProjFromCol,
} from "@/eodashSTAC/projection";
import { transformExtent } from "@eox/map";
import axios from "@/plugins/axios";

export const BASE_LAYERS_GROUP = "BaseLayersGroup";
export const CATALOG_GROUP = "CatalogGroup";
export const ANALYSIS_GROUP = "AnalysisGroup";
export const PROCESS_GROUP = "ProcessGroup";
export const OVERLAY_GROUP = "OverlayGroup";

/**
 * @typedef {object} LayerGroupDefinition
 * @property {number} order - Stacking order for the layer group
 * @property {Record<string, any>} properties - Layer group properties excluding id
 */

/**
 * Predefined map layer group definitions.
 *
 * @type {Record<string, LayerGroupDefinition>}
 */
const GROUPS = {
  [BASE_LAYERS_GROUP]: { order: 0, properties: { title: "Base Layers" } },
  [CATALOG_GROUP]: { order: 1, properties: { title: "Item Footprints" } },
  [ANALYSIS_GROUP]: {
    order: 2,
    properties: { title: "Data Layers", layerControlExpand: true },
  },
  [PROCESS_GROUP]: {
    order: 3,
    properties: { title: "Process Layers", layerControlExpand: true },
  },
  [OVERLAY_GROUP]: { order: 4, properties: { title: "Overlay Layers" } },
};

/**
 * Updates a specific layer group on the map while preserving other groups.
 *
 * @param {import("@eox/map").EOxMap | null} map - Map instance
 * @param {string} id - Layer group identifier
 * @param {import("@eox/map").EoxLayer[]} layers - New layers for the group
 * @param {import("@/types").LayersEventBusKeys} [event] - Event name to emit after assignment
 */
export const assignGroupLayers = (map, id, layers, event) =>
  assignLayers(map, patchGroupLayers(map?.layers ?? [], id, layers), event);

/**
 * Builds and assigns all base, data, and overlay layers for a selected indicator.
 *
 * @param {import("@eox/map").EOxMap | null} map - Map instance
 * @param {object} options
 * @param {import("@eodash/stac").Reader[]} options.readers - STAC readers for the indicator
 * @param {import("@eodash/stac").STACCollection | null} options.stac - Selected STAC collection
 * @param {string | import("@eodash/stac").STACItem} [options.timeOrItem] - Datetime string or STAC item
 * @param {import("@/types").LayersEventBusKeys} [options.event] - Event name to emit after assignment
 * @returns {Promise<import("@eodash/stac").STACItem[]>} Rendered STAC items
 */
export const updateIndicatorLayers = async (
  map,
  { readers, stac, timeOrItem, event },
) => {
  if (!stac) {
    return [];
  }

  if (map?.id === "main") {
    await setMapProjFromCol(stac);
  }

  const { layers, items } = await buildIndicatorLayers(map, {
    readers,
    stac,
    timeOrItem,
  });
  await assignLayers(map, layers, event);
  zoomToCollection(map, stac);

  return items;
};

/**
 * Moves the main map to a collection's extent.
 *
 * A link that carried its own position keeps it, but only for the collection it
 * named, and a selected item keeps the fit the catalog made for it.
 *
 * @param {import("@eox/map").EOxMap | null} map - Map instance
 * @param {import("@eodash/stac").STACCollection | null} [collection] - Rendered STAC collection
 */
export const zoomToCollection = (map, collection) => {
  if (map?.id !== "main" || !shouldZoomToExtent.value) {
    return;
  }
  if (hasRestoredView.value) {
    hasRestoredView.value = false;
    return;
  }

  // the catalog has already fitted the map to the item it selected
  if (useSTAcStore().selectedItem) {
    return;
  }

  const bbox = collection?.extent?.spatial?.bbox?.[0];
  if (!bbox) {
    return;
  }

  map.zoomExtent = transformExtent(
    sanitizeBbox([...bbox]),
    "EPSG:4326",
    map.OLprojection,
  );
};

/**
 * Builds base, data, and overlay layer groups for a STAC collection and registers required projections.
 *
 * @param {import("@eox/map").EOxMap | null} map - Map instance used for projection resolution
 * @param {object} options
 * @param {import("@eodash/stac").Reader[]} options.readers - STAC readers for layer generation
 * @param {import("@eodash/stac").STACCollection} options.stac - STAC collection definition
 * @param {string | import("@eodash/stac").STACItem} [options.timeOrItem] - Datetime string or STAC item
 * @param {import("@eodash/stac").BuildContext} [options.context] - Context options for building layers
 * @param {import("@eox/map").EoxLayer[]} [options.defaultBaseLayers] - Fallback base layers if none are defined
 */
export const buildIndicatorLayers = async (
  map,
  { readers, stac, timeOrItem, context, defaultBaseLayers: baseLayersFallback },
) => {
  const { supportedUpscalingEndpoints, tileMatrixSetRegistry } = useSTAcStore();
  const { layers: indicatorLayers, projections } = await getIndicatorLayers(
    stac,
    {
      client: axios,
      // @ts-expect-error eox-map types this as ProjectionLike, it is a code here
      viewProjection: getProjectionCode(map?.projection) || "EPSG:3857",
      tileMatrixSets: tileMatrixSetRegistry,
      upscalingEndpoints: supportedUpscalingEndpoints,
    },
  );

  const baseLayers = normalizeBaseLayers(
    indicatorLayers.filter((l) => l.properties?.group === "baselayer"),
    baseLayersFallback ?? defaultBaseLayers.value,
  );
  const overLayers = indicatorLayers.filter(
    (l) => l.properties?.group === "overlay",
  );

  const {
    layers: dataLayers,
    projections: dataProjections,
    items,
  } = await buildDataLayers(map, { readers, stac, timeOrItem, context });

  await registerProjections([...projections, ...dataProjections]);

  const footprints = map?.layers?.find(
    (layer) => layer.type === "Group" && layer.properties?.id === CATALOG_GROUP,
  );

  return {
    layers: [
      layerGroup(BASE_LAYERS_GROUP, baseLayers),
      ...(footprints ? [footprints] : []),
      layerGroup(ANALYSIS_GROUP, dataLayers),
      ...(overLayers.length ? [layerGroup(OVERLAY_GROUP, overLayers)] : []),
    ],
    items,
  };
};

/**
 * Rebuilds and assigns data layers for the given datetime or STAC item.
 *
 * @param {import("@eox/map").EOxMap | null} map - Map instance
 * @param {object} options
 * @param {import("@eodash/stac").Reader[]} options.readers - STAC readers for the indicator
 * @param {import("@eodash/stac").STACCollection | null} [options.stac] - STAC collection definition
 * @param {string | import("@eodash/stac").STACItem} [options.timeOrItem] - Datetime string or STAC item
 * @param {import("@/types").LayersEventBusKeys} [options.event] - Event name to emit after assignment
 * @returns {Promise<import("@eodash/stac").STACItem[]>} Rendered STAC items
 */
export const assignDataLayers = async (
  map,
  { readers, stac, timeOrItem, event },
) => {
  const { layers, projections, items } = await buildDataLayers(map, {
    readers,
    stac,
    timeOrItem,
  });

  await registerProjections(projections);
  await assignGroupLayers(map, ANALYSIS_GROUP, layers, event);
  return items;
};

/**
 * Builds data layers, projections, and STAC items from readers for a given datetime or item without assigning them.
 *
 * @param {import("@eox/map").EOxMap | null} map - Map instance
 * @param {object} options
 * @param {import("@eodash/stac").Reader[]} options.readers - STAC readers for layer generation
 * @param {import("@eodash/stac").STACCollection | null} [options.stac] - STAC collection definition
 * @param {string | import("@eodash/stac").STACItem} [options.timeOrItem] - Datetime string or STAC item
 * @param {import("@eodash/stac").BuildContext} [options.context] - Build context configuration
 */
async function buildDataLayers(map, { readers, stac, timeOrItem, context }) {
  return buildIndicatorDataLayers({
    readers,
    stac: stac ?? undefined,
    timeOrItem,
    context,
    themes: dataThemesBrands,
    currentLayers: map?.layers ?? [],
  });
}

/**
 * Updates a layer group within a layer array and maintains group ordering.
 *
 * @param {import("@eox/map").EoxLayer[]} currentLayers - Current map layers
 * @param {string} id - Target group identifier
 * @param {import("@eox/map").EoxLayer[]} newLayers - New layers for the group
 * @returns {import("@eox/map").EoxLayer[]} Updated layers sorted by group order
 */
function patchGroupLayers(currentLayers, id, newLayers) {
  const patched = [...currentLayers];
  const index = patched.findIndex(
    (layer) => layer.type === "Group" && layer.properties?.id === id,
  );

  if (index === -1 && !newLayers.length) {
    return patched;
  }

  patched[index === -1 ? patched.length : index] = layerGroup(id, newLayers);
  return patched.sort(
    (a, b) => groupOrder(a.properties?.id) - groupOrder(b.properties?.id),
  );
}

/**
 * @param {string} id
 * @param {import("@eox/map").EoxLayer[]} layers
 * @returns {import("@eox/map/src/layers").EOxLayerTypeGroup}
 */
function layerGroup(id, layers) {
  return {
    type: "Group",
    properties: { id, ...GROUPS[id]?.properties },
    layers,
  };
}

/**
 * Resolves the sort order for a layer group.
 * @param {string} [id] - Layer group identifier
 * @returns {number}
 */
function groupOrder(id) {
  return GROUPS[id ?? ""]?.order ?? -1;
}
