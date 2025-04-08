import { extractCollectionUrls } from "@/eodashSTAC/helpers";
import axios from "@/plugins/axios";
import { currentUrl } from "@/store/states";
import { toAbsolute } from "stac-js/src/http.js";
import { generateTimePairs, getBboxProperty } from "./utils";

/**
 * @typedef {{
 *   links: import("stac-ts").StacLink[];
 *   jsonformSchema: Record<string,any>;
 *   jsonformValue: Record<string,any>;
 *   selectedStac: import("stac-ts").StacCollection;
 * }} CustomEnpointInput
 */

/**
 * @param {CustomEnpointInput} inputs
 * @param {((input:CustomEnpointInput)=> Promise<any[] | undefined | null>)[]} callbacks
 */
export const handleCustomEndpoints = async (callbacks, inputs) => {
  for (const callback of callbacks) {
    const data = await callback(inputs);
    const isNotValid = data && data.length > 0 && data.some((item) => !item);
    if (isNotValid) {
      continue;
    }
    return data;
  }
  return undefined;
};

/**
 * @param {CustomEnpointInput} inputs
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
 * @param {CustomEnpointInput} inputs
 * @returns
 */
export async function handleSentinelHubProcess({
  links,
  jsonformValue,
  jsonformSchema,
  selectedStac,
}) {
  const sentinelHubLink = links.find(
    (link) => link.rel === "service" && link.endpoint === "sentinelhub",
  );
  const evalScriptLink = await getEvalScriptLink(selectedStac);
  if (!sentinelHubLink || !evalScriptLink) {
    return;
  }
  const endpoint = sentinelHubLink.href;
  const bboxProperty = getBboxProperty(jsonformSchema);
  const bbox = jsonformValue[bboxProperty];

  const clientId = import.meta.env.VITE_SENTINELHUB_CLIENT_ID;
  const clientSecret = import.meta.env.VITE_SENTINELHUB_CLIENT_SECRET;

  const bearer = await sentinelHubAuth(clientId, clientSecret);
  if (!bearer) {
    console.error(
      "[eodash] Error while fetching bearer token from sentinel hub",
    );
    return;
  }

  // generate 30 dates from the start and end date of the selected stac
  // generate time pairs from the selected stac temporal extent
  const timePairs = generateTimePairs(selectedStac.extent.temporal.interval);

  // fetch data from sentinel hub
  return await Promise.all(
    timePairs.map(([to, from]) => {
      return fetchSentinelHubData({
        url: endpoint,
        bearer,
        bbox,
        from,
        to,
        exampleLink: evalScriptLink,
      }).catch((err) =>
        console.error(
          "[eodash] Error while fetching data from sentinel hub endpoint:",
          err,
        ),
      );
    }),
  ).then((data) => data.flat());
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

/**
 * @param {string} clientId
 * @param {string} clientSecret
 * @returns {Promise<string | void>}
 */
async function sentinelHubAuth(clientId, clientSecret) {
  const sessionToken = sessionStorage.getItem("sentinelhub_token");
  const sessionTokenTime = /** @type {string} */ (
    sessionStorage.getItem("sentinelhub_token_time")
  );
  const isValid =
    new Date().getTime() - new Date(sessionTokenTime).getTime() < 3600 * 1000;

  // if the token is still valid, return it
  if (sessionToken && isValid) {
    return sessionToken;
  }
  const token = await retrieveSentinelHubToken(clientId, clientSecret);
  if (!token) {
    return;
  }
  sessionStorage.setItem("sentinelhub_token", token);
  sessionStorage.setItem("sentinelhub_token_time", new Date().toISOString());
  return token;
}
/**
 * @param {string} clientId
 * @param {string} clientSecret
 * @returns {Promise<string | void>}
 */
async function retrieveSentinelHubToken(clientId, clientSecret) {
  const url = "https://services.sentinel-hub.com/oauth/token";
  const headers = {
    "Content-Type": "application/x-www-form-urlencoded",
  };
  const body = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    response_type: "token",
    grant_type: "client_credentials",
  });
  return await axios
    .post(url, body, { headers })
    .then((resp) => resp.data.access_token);
}
/**
 *
 * @param {object} param0
 * @param {string} param0.url  - url to the sentinel hub endpoint
 * @param {string} param0.bearer - bearer token for authentication
 * @param {number[]} param0.bbox - bounding box of the area of interest
 * @param {string} param0.from - start date of the time range
 * @param {string} param0.to - end date of the time range
 * @param {number} [param0.timeout = 20000] - timeout for the request
 * @param {import("stac-ts").StacLink} param0.exampleLink - example link containing evalscript to use for the request
 * @returns
 */
async function fetchSentinelHubData({
  url,
  bearer,
  bbox,
  from,
  to,
  timeout = 20000,
  exampleLink,
}) {
  if (!exampleLink) {
    console.error(
      "[eodash] Error (sentinelhub): example link not found in indicator",
    );
    return;
  }
  if (!bbox) {
    console.error("[eodash] Error (sentinelhub): bbox not found");
    return;
  }
  if (!from || !to || new Date(from) > new Date(to)) {
    console.error(
      "[eodash] Error (sentinelhub): time range is faulty or not found",
      from,
      to,
    );
    return;
  }
  const evalscript = await axios
    .get(exampleLink.href, { responseType: "text" })
    .then((resp) => resp.data);

  if (!evalscript) {
    console.error(
      "[eodash] Error (sentinelhub): evalscript not found",
      evalscript,
    );
    return;
  }
  const body = {
    input: {
      bounds: {
        bbox,
      },

      data: [
        {
          dataFilter: {},
          type: exampleLink.dataId,
        },
      ],
    },
    aggregation: {
      evalscript,
      timeRange: {
        from,
        to,
      },
      aggregationInterval: {
        of: "P1D",
      },
      width: 100,
      height: 100,
    },
    calculations: {
      default: {},
    },
  };
  const config = {
    headers: {
      Authorization: `Bearer ${bearer}`,
      "Content-Type": "application/json",
    },
    params: {
      credentials: "same-origin",
    },
    timeout,
  };

  return await axios
    .post(url, body, config)
    .then((resp) => resp.data.data.outputs.data);
}
/**
 * @param {import("stac-ts").StacCollection} selectedStac
 */
async function getEvalScriptLink(selectedStac) {
  const evalScriptLink = selectedStac.links.find(
    (link) => link.rel === "example" && link.title === "evalscript",
  );
  if (evalScriptLink) {
    return evalScriptLink;
  }
  // retrieve the first example link from the indicator children
  for (const link of extractCollectionUrls(selectedStac, currentUrl.value)) {
    const scriptLink = axios
      .get(link)
      .then((resp) =>
        /** @type {import("stac-ts").StacCollection} */ (resp.data).links.find(
          (link) => link.rel === "example" && link.title === "evalscript",
        ),
      );

    if (scriptLink) {
      return scriptLink;
    }
  }
}
