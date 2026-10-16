### Benchmarks

Previous run → this run. Baseline [`2717b4e90bbc57d33f7a2820ed4728d4013b2595`](https://github.com/eodash/eodash/commit/2717b4e90bbc57d33f7a2820ed4728d4013b2595), 2026-10-15T17:09:15.652Z.

- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- geozarr bands: dragging a band rebuilds the source
- links=10, links=1, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 123.2 → 96.3 | 2.9 → 8.0 | 8.7 → 10.6 | 9.1 → 10.9 | 9.8 → 11.9 | 16.8 → 17.4 | ±15.29% → ±11.56% | 20 → 20 | +22.0% |
| layer datetime | 97.1 → 94.7 | 8.7 → 8.8 | 8.9 → 9.3 | 12.9 → 13.1 | 12.2 → 12.2 | 55.8 → 54.7 | ±45.45% → ±43.71% | 20 → 20 | = |
| explore item | 86.8 → 68.2 | 8.4 → 10.7 | 11.2 → 14.2 | 13.3 → 16.3 | 13.7 → 16.2 | 34.9 → 40.6 | ±24.31% → ±21.27% | 20 → 20 | = |
| geozarr bands | 32.4 → 30.3 | 19.9 → 13.2 | 32.7 → 38.9 | 32.8 → 37.9 | 38.6 → 48.7 | 44.8 → 57.3 | ±11.23% → ±15.51% | 20 → 20 | = |
| links=10 | 69.9 → 59.1 | 13.5 → 14.0 | 13.8 → 17.3 | 14.4 → 17.0 | 15.4 → 17.4 | 16.9 → 18.0 | ±3.54% → ±2.88% | 20 → 20 | +25.5% |
| links=1 | 64.0 → 55.7 | 13.1 → 16.0 | 16.0 → 17.1 | 16.7 → 19.3 | 16.7 → 17.4 | 39.1 → 47.9 | ±18.62% → ±20.00% | 20 → 20 | +6.5% |
| links=100 | 53.5 → 47.7 | 16.9 → 19.1 | 18.9 → 21.4 | 18.8 → 21.0 | 19.9 → 21.7 | 21.4 → 23.2 | ±3.41% → ±2.77% | 20 → 20 | +13.2% |
| poi selection | 25.8 → 19.6 | 28.4 → 35.8 | 38.1 → 50.3 | 39.9 → 54.8 | 40.7 → 65.5 | 62.5 → 84.5 | ±9.29% → ±12.96% | 20 → 20 | +32.2% |
| select indicator | 15.5 → 15.3 | 45.9 → 48.4 | 69.6 → 65.0 | 67.3 → 68.4 | 73.7 → 75.6 | 95.4 → 100.2 | ±10.03% → ±10.84% | 20 → 20 | = |
| vector rendering | 15.8 → 13.9 | 47.8 → 52.6 | 54.8 → 81.8 | 70.0 → 77.5 | 95.4 → 92.7 | 100.0 → 121.8 | ±15.28% → ±12.87% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.3 | 305.4 → 305.5 | 305.3 → 305.6 | 305.4 → 305.7 | 305.6 → 306.3 | ±0.02% → ±0.04% | 20 → 20 | = |
| geotiff rendering | 2.2 → 2.1 | 428.0 → 448.0 | 439.9 → 458.9 | 447.9 → 468.6 | 448.3 → 480.1 | 513.3 → 545.8 | ±2.35% → ±2.49% | 20 → 20 | = |
| mirrored selection | 1.2 → 1.0 | 756.9 → 946.2 | 794.7 → 1000.7 | 814.9 → 1005.4 | 832.2 → 1032.6 | 971.4 → 1128.3 | ±3.39% → ±2.15% | 20 → 20 | +25.9% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| **explore item** | **1–2 → 1–2** | **0 → 0** | **0 → 0** |
| **geozarr bands** | **0 → 0** | **0–11 → 0–12** | **0 → 0** |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **mirrored selection** | **2 → 2** | **6 → 6** | **338K–644K → 338K–644K** |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| date snap | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000015.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000018.json` | 20 | 0 | 0 | mocked |
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
|  | `/stac/catalog.json/search` | 1 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 8 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 17 | 0 | 404 |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| vector rendering | `/stac/indicators/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/styled-vector-style.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/stormtracker.geojson` | 0 | 20 | 22467K | 200 |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| mirrored selection | `/stac/indicators/mirrored.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/mirrored.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 10429K | 206 |

</details>

<details><summary>Glossary</summary>

| column | meaning |
| --- | --- |
| hz | runs per second |
| min | fastest sample |
| p50 | median; what the last column compares |
| mean | average |
| p75 | 75th percentile |
| p99 | 99th percentile |
| rme | relative margin of error |
| samples | timed iterations |
| median Δ | change in the median (p50) when it leaves the middle two thirds of the baseline's samples; `=` inside |
| requests | requests the application issued through its HTTP client per run; the tests resolve them from fixtures (`mocked`), so nothing is transferred |
| fetches | requests the browser issued over the network per run: tiles, data files, anything the tests do not intercept |
| bytes | encoded body size of the responses; 0 where the origin sends no `timing-allow-origin` header |
| status | `mocked` where the tests resolved the request; HTTP codes where the browser fetched it; both where the application did both |

</details>
