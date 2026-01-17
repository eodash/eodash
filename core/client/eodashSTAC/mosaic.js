import axios from "@/plugins/axios";
import { Item } from "stac-js";
import { mosaicState } from "@/utils/states";
import { indicator, mapEl } from "@/store/states";
import { getLayers } from "@/store/actions";
import { onMounted, onUnmounted } from "vue";
import { useOnLayersUpdate } from "@/composables";
// import { extractLayerConfig } from "./helpers";

/**
 * Fetches the STAC definition for the mosaic. TODO: reuse registered queries
 * @param {string} mosaicEndpoint - The URL of the mosaic endpoint.
 * @param {string | object | null} [cqlQuery] - Optional CQL query to filter the mosaic.
 * @returns {Promise<import("stac-ts").StacItem | null>}
 */
export async function registerMosaic(mosaicEndpoint, cqlQuery) {
  // tmp hack
  if (indicator.value === "sentinel-2-l2a") {
    //@ts-expect-error todo
    return {
      links: [
        {
          rel: "XYZ",
          href: "https://api.explorer.eopf.copernicus.eu/openeo/services/xyz/456c1e23-47f2-4567-98cf-dcde378a05f7/tiles/{z}/{x}/{y}",
        },
      ],
    };
  } else {
    return null;
  }
  /* eslint-disable */
  if (!mosaicEndpoint) {
    return null;
  }

  const url = mosaicEndpoint;
  const body = cqlQuery
    ? {
        "filter-lang": "cql2-json",
        filter: cqlQuery,
        sortby: [{ field: "datetime", direction: "desc" }],
      }
    : null;
  if (!body) {
    console.trace("[eodash] No query provided for mosaic registration");
    return null;
  }

  console.log("[eodash] Registering mosaic with query:", body);
  return await axios
    .post(url, body)
    .then((response) => response.data)
    .catch((error) => {
      console.error("[eodash] Failed to register mosaic:", error);
      return null;
    });
}
/* eslint-enable */

/**
 * Creates a layer configuration for the mosaic.
 * @param {string} mosaicEndpoint - The URL of the mosaic endpoint.
 * @param {string | object | null} [cqlQuery] - Optional CQL query.
 * @param {[string, string]} [timeRange] - Optional time range.
 * @param {string} [rasterForm] - Optional rasterform to use for the mosaic.
 * @returns {Promise<Record<string, any>[]>}
 */
export async function createMosaicLayer(
  mosaicEndpoint,
  cqlQuery,
  timeRange,
  /* eslint-disable-next-line @typescript-eslint/no-unused-vars */
  rasterForm,
) {
  const mosaicStac = await registerMosaic(mosaicEndpoint, cqlQuery);
  if (!mosaicStac || indicator.value !== "sentinel-2-l2a") {
    return [];
  }

  // treat the mosaic STAC as an item
  const item = new Item(mosaicStac);
  // tmp hack
  // const tileJSONLink = item.links.find((l) => l.rel === "tilejson");
  const XYZLink = item.links.find((l) => l.rel === "XYZ");
  if (!XYZLink) {
    return [];
  }
  let url = XYZLink.href;
  // if (!tileJSONLink) {
  //   return [];
  // }
  // // todo: fetch the assets properly
  // const url =
  //   tileJSONLink.href +
  //   "?" +
  //   "tile_scale=2&assets=B04&assets=B03&assets=B02&color_formula=Gamma%20RGB%203.2%20Saturation%200.8%20Sigmoidal%20RGB%2025%200.35&nodata=0&minzoom=9&collection=sentinel-2-l2a&format=png";
  // // todo: use createLayersFromLinks
  // mosaicState.latestLayer = {
  //   type: "Tile",
  //   properties: {
  //     id: "Mosaic" + Date.now(),
  //     title: "Mosaic Layer",
  //   },
  //   source: {
  //     type: "TileJSON",
  //     url,
  //   },
  // };

  // let rasterFormObj = null
  // let layerConfig = null
  // if(rasterForm){
  //   rasterFormObj = await axios.get(rasterForm).then((response) => response.data)
  //   layerConfig = extractLayerConfig(indicator.value,undefined,rasterFormObj).layerConfig
  // }
  if (timeRange) {
    const params = new URLSearchParams();
    params.set(
      "time",
      '["' +
        timeRange[0].split("T")[0] +
        '","' +
        timeRange[1].split("T")[0] +
        '"]',
    );
    if (url.includes("?")) {
      url = url + "&" + params.toString();
    } else {
      url = url + "?" + params.toString();
    }
    console.log("[eodash] Mosaic layer URL:", url);
  }
  mosaicState.latestLayer = {
    type: "Tile",
    properties: {
      id: "Mosaic" + Date.now(),
      title: "Sentinel-2 L2A Mosaic",
      // ...(layerConfig && {layerConfig}),
    },
    source: {
      type: "XYZ",
      url,
    },
  };
  return [mosaicState.latestLayer];
}

/**
 * Ensure the AnalysisGroup exists in the layers collection.
 * @param {Record<string, any>[]} layersCollection
 * @returns {{ layers: Record<string, any>[], analysisGroup: Record<string, any> }}
 */
function ensureAnalysisGroup(layersCollection) {
  let analysisGroup = layersCollection.find(
    (l) => l?.properties?.id === "AnalysisGroup",
  );

  if (!analysisGroup) {
    analysisGroup = {
      type: "Group",
      properties: {
        id: "AnalysisGroup",
        title: "Data Layers",
      },
      layers: [],
    };
    layersCollection.push(analysisGroup);
  }

  return { layers: layersCollection, analysisGroup };
}

/**
 * Modifies the layers collection to display the mosaic layer.
 * Removes existing layers in the AnalysisGroup and adds the mosaic layer.
 * @param {string} mosaicEndpoint - The URL of the mosaic endpoint.
 * @param {string | object | null} [cqlQuery] - Optional CQL query.
 * @param {[string, string]} [timeRange] - Optional time range.
 * @param {string} [rasterForm] - Optional rasterform to use for the mosaic.
 */
export async function renderMosaic(
  mosaicEndpoint,
  cqlQuery,
  timeRange,
  rasterForm,
) {
  const mapLayers = getLayers();
  const { analysisGroup, layers } = ensureAnalysisGroup(mapLayers);
  const mosaicLayers = await createMosaicLayer(
    mosaicEndpoint,
    cqlQuery,
    timeRange,
    rasterForm,
  );

  if (!mosaicLayers.length) {
    return;
  }

  analysisGroup.layers = mosaicLayers;
  mosaicState.showButton = false;

  if (mapEl.value) {
    // Reassign to trigger map re-render after in-place layer mutation
    mapEl.value.layers = /** @type {import("@eox/map").EoxLayer[]} */ ([
      ...layers,
    ]);
  }

  console.log("[eodash] Mosaic layer rendered.");
}

/**
 * Updates the mosaic layer based on the current filters in mosaicState.
 * @param {string} mosaicEndpoint - The URL of the mosaic endpoint.
 * @param {{ timeRange?: [string, string]; collection?: string }} queries - Optional CQL queries.
 * @param {string} [rasterForm] - Optional rasterform to use for the mosaic.
 */
export async function updateMosaicLayer(
  mosaicEndpoint,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  { timeRange, collection } = {},
  rasterForm,
) {
  /** @type {(string|object)[]} */
  // const filters = [];
  // if (timeRange && Array.isArray(timeRange) && timeRange.length === 2) {
  //   const timeFilter = {
  //     op: "between",
  //     args: [
  //       { property: "datetime" },
  //       { timestamp: timeRange[0] },
  //       { timestamp: timeRange[1] },
  //     ],
  //   };
  //   filters.push(timeFilter);
  //   mosaicState.filters.time = timeFilter;
  // }

  // if (collection) {
  //   mosaicState.filters.collection = collection;
  //   filters.push({
  //     op: "=",
  //     args: [{ property: "collection" }, collection],
  //   });
  // }

  // let cqlQuery = null;
  // if (filters.length === 1) {
  //   cqlQuery = filters[0];
  // } else if (filters.length > 1) {
  //   cqlQuery = {
  //     op: "and",
  //     args: filters,
  //   };
  // }

  // mosaicState.query = cqlQuery;
  await renderMosaic(mosaicEndpoint, undefined, timeRange, rasterForm);
}
/**
 * Renders the latest mosaic layer stored in mosaicState.
 */
export function renderLatestMosaic() {
  if (!mosaicState.latestLayer) {
    return;
  }
  const mapLayers = getLayers();
  const { analysisGroup, layers } = ensureAnalysisGroup(mapLayers);

  analysisGroup.layers = [mosaicState.latestLayer];

  if (mapEl.value) {
    // Reassign to trigger map re-render after in-place layer mutation
    mapEl.value.layers = /** @type {import("@eox/map").EoxLayer[]} */ ([
      ...layers,
    ]);
  }
}
/**
 *
 * @param {string} mosaicEndpoint
 * @param {{collection?:string, timeRange?:[string, string]}} filters
 * @param {ReturnType<typeof import("@/store/stac").useSTAcStore>} store
 */
export async function initMosaic(
  mosaicEndpoint,
  { timeRange, collection } = {},
  store,
) {
  const rasterForm = store.selectedStac?.["eodash:rasterform"];
  await updateMosaicLayer(
    mosaicEndpoint,
    {
      ...(collection && { collection }),
      ...(timeRange && { timeRange }),
    },
    //@ts-expect-error todo
    rasterForm,
  );
  mosaicState.showButton = false;
}

/**
 *
 * @param {string} mosaicEndpoint
 * @param {{collection?:string, timeRange?:[string, string]}} filters
 * @param {ReturnType<typeof import("@/store/stac").useSTAcStore>} store
 */
export function useInitMosaic(mosaicEndpoint, { timeRange } = {}, store) {
  // todo: move to composable
  onMounted(async () => {
    initMosaic(
      mosaicEndpoint,
      { collection: store.selectedStac?.id, timeRange },
      store,
    );
  });
  useOnLayersUpdate(() => {
    initMosaic(
      mosaicEndpoint,
      { collection: store.selectedStac?.id, timeRange },
      store,
    );
  });
  onUnmounted(() => {
    mosaicState.showButton = false;
  });
}
