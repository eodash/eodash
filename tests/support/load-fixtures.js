/**
 * Fixtures the browser cannot fetch for itself, loaded once per run by
 * `vitest.config.js` and handed to the tests through `provide`.
 *
 * Every read fails the run rather than returning nothing. A baseline and the
 * run compared against it have to measure the same input, so a rotated item or
 * a host that is down has to stop the run rather than shift the numbers or
 * drop rows from a ranked table.
 */
import { parquetReadObjects } from "hyparquet";

const EOPF = "https://api.explorer.eopf.copernicus.eu/stac";
const EOPF_COLLECTION = "sentinel-2-l2a";
/** Pinned: the explorer's newest item rotates, and a fixture cannot. */
const EOPF_ITEM =
  "S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722";
const ZARR_TYPE = "application/vnd.zarr; version=3; profile=multiscales";
const GTIF = "https://gtif-austria.github.io/public-catalog/GTIF-Austria";

/**
 * @template T
 * @param {string} fixture what is missing, when it is
 * @param {string | undefined} url
 * @param {(response: Response) => Promise<T>} readBody
 */
const fetchOrFail = async (fixture, url, readBody) => {
  if (!url) {
    throw new Error(`bench fixture: no url for ${fixture}`);
  }
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`bench fixture: ${fixture} answered ${response.status}`);
  }
  return readBody(response);
};

/** @param {string} fixture @param {string | undefined} url */
const fetchJson = (fixture, url) =>
  fetchOrFail(fixture, url, (response) => response.json());

/** @param {string} fixture @param {string | undefined} url */
const fetchBytes = (fixture, url) =>
  fetchOrFail(fixture, url, (response) => response.arrayBuffer());

/**
 * Parquet numbers arrive as BigInt, which `provide` cannot serialize.
 * @param {unknown} value
 */
const toSerializable = (value) =>
  JSON.parse(
    JSON.stringify(value, (_, field) =>
      typeof field === "bigint" ? Number(field) : field,
    ),
  );

/** The EOPF item behind the bands benchmark. */
const loadGeozarrFixture = async () => {
  const itemUrl = `${EOPF}/collections/${EOPF_COLLECTION}/items/${EOPF_ITEM}`;
  const [item, collection] = await Promise.all([
    fetchJson("the eopf item", itemUrl),
    fetchJson("the eopf collection", `${EOPF}/collections/${EOPF_COLLECTION}`),
  ]);

  const [zarrAssetName, zarrAsset] =
    Object.entries(item.assets ?? {}).find(
      ([, asset]) => asset?.type === ZARR_TYPE,
    ) ?? [];
  if (!zarrAsset) {
    throw new Error(`bench fixture: ${EOPF_ITEM} carries no zarr asset`);
  }

  const styleLink = collection.links?.find(
    (link) =>
      link.rel === "style" && link["asset:keys"]?.includes(zarrAssetName),
  );
  return {
    zarrAssetName,
    zarrAsset,
    style: await fetchJson("the geozarr style", styleLink?.href),
  };
};

/**
 * A styled COG from GTIF-Austria. Items are published only as a parquet
 * mirror, so the first row is the fixture.
 * @param {string} collectionId
 */
const loadGeoTiffFixture = async (collectionId) => {
  const collectionUrl = `${GTIF}/${collectionId}/${collectionId}`;
  const collection = await fetchJson(
    `the ${collectionId} collection`,
    `${collectionUrl}/collection.json`,
  );
  const styleLink = collection.links?.find((link) => link.rel === "style");
  const [assetKey] = styleLink?.["asset:keys"] ?? [];

  const mirror = await fetchBytes(
    `the ${collectionId} mirror`,
    `${collectionUrl}/items.parquet`,
  );
  const [mirroredItem] = await parquetReadObjects({ file: mirror, rowEnd: 1 });
  const asset = mirroredItem?.assets?.[assetKey];
  if (!asset) {
    throw new Error(
      `bench fixture: ${collectionId} row 0 carries no ${assetKey} asset`,
    );
  }

  return {
    assetKey,
    asset: toSerializable(asset),
    style: await fetchJson(`the ${collectionId} style`, styleLink?.href),
  };
};

/** Keyed as the tests `inject` them. */
export const loadFixtures = async () => ({
  geozarrFixture: await loadGeozarrFixture(),
  geotiffFixture: await loadGeoTiffFixture("gtif-wind-atlas"),
});
