### Benchmarks

Previous run → this run. Baseline [`d7b4ee3455d77ea45e8c755b9f6a8a3975eb6a10`](https://github.com/eodash/eodash/commit/d7b4ee3455d77ea45e8c755b9f6a8a3975eb6a10), 2026-10-01T09:19:13.552Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 93.1 → 108.5 | 7.9 → 6.8 | 10.8 → 8.8 | 11.2 → 9.7 | 13.0 → 11.0 | 15.6 → 15.0 | ±10.35% → ±11.95% | 20 → 20 | = |
| explore item | 70.7 → 88.7 | 9.8 → 8.2 | 13.9 → 11.6 | 15.1 → 13.1 | 17.3 → 13.3 | 24.6 → 35.2 | ±12.79% → ±25.21% | 20 → 20 | -16.9% |
| layer datetime | 96.3 → 96.3 | 8.7 → 8.6 | 9.4 → 9.1 | 12.2 → 14.8 | 12.1 → 11.6 | 43.4 → 80.0 | ±35.27% → ±59.32% | 20 → 20 | = |
| links=1 | 63.5 → 65.4 | 13.5 → 13.2 | 16.6 → 15.4 | 15.9 → 16.4 | 17.1 → 16.2 | 17.9 → 39.5 | ±4.81% → ±19.32% | 20 → 20 | = |
| links=10 | 58.8 → 68.2 | 14.1 → 13.5 | 17.4 → 14.7 | 17.1 → 14.7 | 17.6 → 15.7 | 18.4 → 16.3 | ±3.28% → ±3.48% | 20 → 20 | -16.0% |
| links=100 | 47.5 → 52.9 | 18.9 → 17.0 | 21.3 → 19.4 | 21.1 → 19.0 | 21.8 → 19.6 | 23.1 → 19.9 | ±2.52% → ±2.49% | 20 → 20 | -8.9% |
| geozarr bands | 30.3 → 34.0 | 25.3 → 19.9 | 35.7 → 31.6 | 34.7 → 31.0 | 40.2 → 34.9 | 50.6 → 43.0 | ±10.82% → ±10.94% | 20 → 20 | = |
| poi selection | 19.4 → 26.0 | 35.6 → 29.7 | 56.5 → 37.0 | 54.9 → 40.7 | 64.2 → 45.0 | 85.1 → 69.3 | ±12.22% → ±12.91% | 20 → 20 | -34.4% |
| select indicator | 15.6 → 18.6 | 55.2 → 34.2 | 63.7 → 59.3 | 65.1 → 56.1 | 68.9 → 62.6 | 85.2 → 77.5 | ±5.71% → ±9.31% | 20 → 20 | = |
| vector rendering | 14.1 → 16.5 | 53.5 → 46.4 | 77.9 → 53.1 | 74.8 → 66.8 | 91.8 → 88.1 | 95.2 → 115.6 | ±11.00% → ±15.91% | 20 → 20 | -31.9% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.1 | 305.5 → 305.3 | 305.5 → 305.3 | 305.6 → 305.4 | 306.0 → 305.7 | ±0.03% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.3 | 454.8 → 421.4 | 480.0 → 435.0 | 485.7 → 439.0 | 487.4 → 440.5 | 579.5 → 498.7 | ±2.87% → ±1.98% | 20 → 20 | -9.4% |
| mirrored selection | 1.0 → 1.2 | 941.2 → 788.8 | 980.4 → 824.8 | 1000.4 → 838.6 | 1027.0 → 854.7 | 1137.6 → 962.1 | ±2.52% → ±2.81% | 20 → 20 | -15.9% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–13 → 0–13** | **0 → 0** |
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
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 7 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 22 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 10123K | 206 |

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
