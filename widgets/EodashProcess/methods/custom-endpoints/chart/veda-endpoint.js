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
  const bbox = jsonformValue[bboxProperty];
  const endpoints = await fetchVedaCOGs(selectedStac);
  return await Promise.all(
    endpoints.map((dataEndpoint) => {
      return axios
        .post(vedaEndpoint + `?url=${dataEndpoint}`, {
          ...{
            type: "Feature",
            properties: {},
            geometry: {
              type: "Polygon",
              coordinates: [
                [
                  [bbox[0], bbox[1]],
                  [bbox[2], bbox[1]],
                  [bbox[2], bbox[3]],
                  [bbox[0], bbox[3]],
                  [bbox[0], bbox[1]],
                ],
              ],
            },
          },
        })
        .then((resp) => resp.data)
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
 *
 * @param {import("stac-ts").StacCollection} selectedStac
 */
async function fetchVedaCOGs(selectedStac) {
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
  /** @type {string[]} */
  const endpoints = [];
  for (const collection of collections) {
    let itemLinks = collection.links.filter((link) => link.rel == "item");
    endpoints.push(
      ...itemLinks.map((link) =>
        toAbsolute(
          link.href.replace(/\/\d{4}\//g, "/").replace(".json", ".tif"),
          "s3://veda-data-store/",
        ),
      ),
    );
  }
  endpoints.sort((a, b) => b.localeCompare(a));
  return endpoints.length > 365 ? endpoints.slice(0, 365) : endpoints;
}
