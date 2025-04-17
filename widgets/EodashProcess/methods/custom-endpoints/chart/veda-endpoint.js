import axios from "@/plugins/axios";
import { getBboxProperty } from "../../utils";
import { toAbsolute } from "stac-js/src/http.js";
import { currentUrl } from "@/store/states";

/**
 * @param {import("^/EodashProcess/types").CustomEnpointInput} inputs
 */
export async function handleVedaEndpoint({
  links,
  jsonformSchema,
  jsonformValue,
  selectedStac,
}) {
  const vedaLink = links.find(
    (link) => link.rel === "service" && link.endpoint === "veda",
  );
  if (!vedaLink) {
    return;
  }
  const vedaEndpoint = vedaLink?.href;
  const bboxProperty = getBboxProperty(jsonformSchema);
  // this should be type geojson
  const bboxGeoJSON = JSON.parse(jsonformValue[bboxProperty]);

  const configs = await fetchVedaCOGsConfig(selectedStac);
  // TODO: convert jsonform bbox type to geojson in the schema to avoid the conversion here
  return await Promise.all(
    configs.map(({ endpoint, datetime }) => {
      return axios
        .post(vedaEndpoint + `?url=${endpoint}`, {
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
        .catch((resp) =>
          console.error(
            "[eodash] Error while fetching data from veda endpoint:",
            resp,
          ),
        );
    }),
  );
}

/**
 * Fetches the COGs endpoints from the STAC collections
 * @param {import("stac-ts").StacCollection} selectedStac
 */
async function fetchVedaCOGsConfig(selectedStac) {
  // retrieve the collections from the indicator
  const collectionLinks = selectedStac.links.filter(
    (link) => link.rel == "child",
  );
  /** @type {import("stac-ts").StacCollection[]} */
  const collections = [];
  if (!collectionLinks.length) {
    collections.push(selectedStac);
  } else {
    collections.push(
      ...(await Promise.all(
        collectionLinks.map((link) =>
          axios
            .get(toAbsolute(link.href, currentUrl.value))
            .then((resp) => resp.data),
        ),
      )),
    );
  }
  /** @type {{endpoint:string; datetime:string}[]} */
  const configs = [];
  for (const collection of collections) {
    let itemLinks = collection.links.filter((link) => link.rel == "item");
    configs.push(
      ...itemLinks.map((link) => ({
        endpoint: /** @type {string} */ (link["cog_href"]),
        datetime: /** @type string **/ (
          link["datetime"] ?? link["start_datetime"]
        ),
      })),
    );
  }

  // Sort by date ascending
  configs.sort(
    (a, b) => new Date(a.datetime).getTime() - new Date(b.datetime).getTime(),
  );

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
