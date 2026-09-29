import axios from "@/plugins/axios";
import { getBboxProperty } from "../../utils";
import { eodashCollections, eodashCompareCollections } from "@/store/stac";
import { getDatetimeProperty, isSTACItem } from "@eodash/stac/helpers";

/**
 * @param {import("^/EodashProcess/types").CustomEnpointInput} inputs
 */
export async function handleVedaEndpoint({
  links,
  jsonformSchema,
  jsonformValue,
  enableCompare = false,
}) {
  const vedaLink = links.find(
    (link) =>
      link.rel === "service" &&
      (link.endpoint === "veda" || link.endpoint === "veda_stac"),
  );
  if (!vedaLink) {
    return;
  }
  const vedaEndpoint = vedaLink?.href;
  const bboxProperty = getBboxProperty(jsonformSchema);
  // this should be type geojson
  const bboxGeoJSON = JSON.parse(jsonformValue[bboxProperty]);

  const configs = await fetchVedaCOGsConfig(enableCompare, vedaLink);
  // TODO: convert jsonform bbox type to geojson in the schema to avoid the conversion here
  const results = await Promise.all(
    configs.map(({ endpoint, datetime }) => {
      const url = new URL(vedaEndpoint);
      const key = vedaLink.endpoint === "veda_stac" ? "ids" : "url";
      url.searchParams.set(key, endpoint);

      return axios
        .post(url.toString(), {
          ...{
            type: "Feature",
            properties: {},
            geometry: bboxGeoJSON,
          },
        })
        .then((resp) => {
          const fetchedSats = resp.data.properties.statistics;
          fetchedSats.date = datetime;
          return fetchedSats;
        })
        .catch((resp) => {
          console.error(
            "[eodash] Error while fetching data from veda endpoint:",
            resp,
          );
          return null;
        });
    }),
  );
  // Filter out the nulls (failed requests) before returning
  return results.filter((result) => result !== null);
}

/**
 * The COG endpoint and datetime of every item the indicator's collections hold,
 * sampled down to what the chart can show.
 * @param {boolean} enableCompare
 * @param {import("@eodash/stac").STACLink} vedaLink
 */
async function fetchVedaCOGsConfig(enableCompare, vedaLink) {
  const readers = enableCompare ? eodashCompareCollections : eodashCollections;
  /** @type {{endpoint:string; datetime:string}[]} */
  const configs = [];

  for (const reader of readers) {
    /** @type {import("@eodash/stac").STACItem[] | import("@eodash/stac").ItemLink[]} */
    const items = await reader.getItems();
    const datetimeProperty = getDatetimeProperty(items);
    if (!datetimeProperty) {
      continue;
    }
    for (const item of items) {
      // an item keeps its datetime under `properties`, an item link at the top
      const datetime = isSTACItem(item)
        ? item.properties[datetimeProperty]
        : item[datetimeProperty];
      // an item link carries the cog already, an item has it on its assets
      const cogHref =
        item["cog_href"] ??
        Object.values(item.assets ?? {}).find(
          (asset) =>
            asset.href.startsWith("s3://veda-data-store") &&
            asset.type === "image/tiff; application=geotiff",
        )?.href;
      const endpoint = vedaLink.endpoint === "veda_stac" ? item.id : cogHref;
      if (endpoint && typeof datetime === "string") {
        configs.push({ endpoint, datetime });
      }
    }
  }

  const maxConfigs = 50;
  if (configs.length <= maxConfigs) {
    return configs;
  }
  // we need to sample if the number of configs are more than 50
  const totalSize = configs.length;
  const sampledConfigs = [];
  for (let i = 0; i < maxConfigs; i++) {
    // Calculate the index to pick, ensuring distribution and inclusion of first/last
    const index = Math.floor((i * (totalSize - 1)) / (maxConfigs - 1));
    sampledConfigs.push(configs[index]);
  }
  return sampledConfigs;
}
