import { EodashCollection } from "@/eodashSTAC/EodashCollection";
import log from "loglevel";

/**
 * Creates full layer configuration from indicator and time information
 * @param {import("stac-ts").StacCatalog
 *   | import("stac-ts").StacCollection
 *   | import("stac-ts").StacItem
 *   | null
 * } selectedIndicator
 * @param {EodashCollection[]} eodashCols
 * @param {import("vue").Ref<Record<string,any>[]>} mapLayers
 * @param {string} [updatedTime]
 */

export const createLayersConfig = async (
  selectedIndicator,
  eodashCols,
  mapLayers,
  updatedTime,
) => {
  log.debug(
    "Creating layers config",
    selectedIndicator,
    eodashCols,
    updatedTime,
  );
  const layersCollection = [];
  const dataLayers = {
    type: "Group",
    properties: {
      id: "Analysis Group",
      title: "Data Layers",
      layerControlExpand: true,
    },
    layers: /** @type {Record<string,any>[]}*/ ([]),
  };

  for (const ec of eodashCols) {
    let layers;
    if (updatedTime) {
      layers = await ec.createLayersJson(new Date(updatedTime));
    } else {
      layers = await ec.createLayersJson();
    }
    // Add expand to all analysis layers
    layers.forEach((dl) => {
      dl.properties.layerControlExpand = true;
      dl.properties.layerControlToolsExpand = true;
    });
    dataLayers.layers.push(...layers);
  }

  // if poi collection we add data as new group and keep the previous
  // layers untouched, allowing us to keep the initial indicator layers
  if (selectedIndicator?.isPoi) {
    if (dataLayers.layers.length) {
      dataLayers.properties.id = `Location Layers - ${selectedIndicator.id}`;
      dataLayers.properties.title = `Location Layers - ${selectedIndicator.id}`;
      layersCollection.push(dataLayers);
      layersCollection.push(...mapLayers.value);
      return layersCollection;
    }
  }

  layersCollection.push(dataLayers);
  const indicatorLayers =
    //@ts-expect-error indicator is collection
    await EodashCollection.getIndicatorLayers(selectedIndicator);
  const observationPointsLayer =
    EodashCollection.getObservationPointsLayer(eodashCols);
  if (observationPointsLayer) {
    dataLayers.layers.unshift(observationPointsLayer);
  }
  const baseLayers = {
    type: "Group",
    properties: {
      id: "BaseLayersGroup",
      title: "Base Layers",
    },
    layers: /** @type {Record<string,any>[]}*/ ([]),
  };

  const indicatorBaseLayers = indicatorLayers.filter(
    (l) => l.properties.group === "baselayer",
  );

  if (indicatorBaseLayers.length) {
    // Only one baselayer can be set to visible, let's first set all to
    // false that have not a dedicated property visible, then check
    // if there are more then one visible and only allow one
    let counter = 0;
    let lastPos = 0;
    for (let indx = 0; indx < indicatorBaseLayers.length; indx++) {
      const bl = indicatorBaseLayers[indx];
      if (!("visible" in bl.properties)) {
        bl.properties.visible = false;
      }

      if (bl.properties.visible) {
        counter++;
        lastPos = indx;
      }
    }

    // if none visible set the last one as visible
    if (counter === 0) {
      indicatorBaseLayers[0].properties.visible = true;
    }

    // disable all apart from last
    if (counter > 0) {
      indicatorBaseLayers.forEach((bl, indx) => {
        if (indx !== lastPos) {
          bl.properties.visible = false;
        } else {
          bl.properties.visible = true;
        }
      });
    }

    baseLayers.layers.push(...indicatorBaseLayers);

    // Add exclusive to baselayers and make sure only one is selected
    baseLayers.layers.forEach((bl) => {
      bl.properties.layerControlExclusive = true;
    });
  } else {
    // Default to some baselayer
    baseLayers.layers.push({
      type: "Tile",
      properties: {
        id: "osm",
        title: "Background",
        layerControlExclusive: true,
      },
      source: {
        type: "OSM",
      },
    });
  }

  if (baseLayers.layers.length) {
    layersCollection.push(baseLayers);
  }

  const overlayLayers = {
    type: "Group",
    properties: {
      id: "OverlayGroup",
      title: "Overlay Layers",
    },
    layers: /** @type {Record<string,any>[]}*/ ([]),
  };

  const indicatorOverlays = indicatorLayers.filter(
    (l) => l.properties.group === "overlay",
  );

  if (indicatorOverlays.length) {
    overlayLayers.layers.push(...indicatorOverlays);
    layersCollection.unshift(overlayLayers);
  }

  return layersCollection;
};
