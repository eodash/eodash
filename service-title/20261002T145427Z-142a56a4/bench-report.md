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
| date snap | 93.1 → 110.0 | 7.9 → 7.1 | 10.8 → 8.8 | 11.2 → 9.4 | 13.0 → 10.8 | 15.6 → 13.9 | ±10.35% → ±9.79% | 20 → 20 | = |
| explore item | 70.7 → 89.3 | 9.8 → 8.2 | 13.9 → 11.3 | 15.1 → 11.9 | 17.3 → 13.6 | 24.6 → 17.0 | ±12.79% → ±11.78% | 20 → 20 | -18.3% |
| layer datetime | 96.3 → 107.0 | 8.7 → 8.5 | 9.4 → 8.7 | 12.2 → 9.7 | 12.1 → 9.2 | 43.4 → 18.8 | ±35.27% → ±12.94% | 20 → 20 | -7.0% |
| links=1 | 63.5 → 67.5 | 13.5 → 13.1 | 16.6 → 15.6 | 15.9 → 15.0 | 17.1 → 16.0 | 17.9 → 17.2 | ±4.81% → ±4.53% | 20 → 20 | = |
| links=10 | 58.8 → 66.3 | 14.1 → 13.6 | 17.4 → 14.7 | 17.1 → 15.2 | 17.6 → 17.1 | 18.4 → 17.4 | ±3.28% → ±4.78% | 20 → 20 | -15.8% |
| links=100 | 47.5 → 51.7 | 18.9 → 17.2 | 21.3 → 19.5 | 21.1 → 19.4 | 21.8 → 20.2 | 23.1 → 21.5 | ±2.52% → ±2.86% | 20 → 20 | -8.2% |
| geozarr bands | 30.3 → 30.8 | 25.3 → 22.0 | 35.7 → 36.3 | 34.7 → 34.2 | 40.2 → 38.8 | 50.6 → 46.4 | ±10.82% → ±10.26% | 20 → 20 | = |
| poi selection | 19.4 → 20.7 | 35.6 → 34.3 | 56.5 → 55.7 | 54.9 → 51.7 | 64.2 → 60.7 | 85.1 → 73.9 | ±12.22% → ±12.09% | 20 → 20 | = |
| select indicator | 15.6 → 15.8 | 55.2 → 34.6 | 63.7 → 64.3 | 65.1 → 67.9 | 68.9 → 81.7 | 85.2 → 103.2 | ±5.71% → ±12.71% | 20 → 20 | = |
| vector rendering | 14.1 → 16.4 | 53.5 → 47.1 | 77.9 → 53.0 | 74.8 → 65.5 | 91.8 → 78.9 | 95.2 → 110.3 | ±11.00% → ±14.19% | 20 → 20 | -32.0% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.1 | 305.5 → 305.3 | 305.5 → 305.3 | 305.6 → 305.4 | 306.0 → 305.7 | ±0.03% → ±0.03% | 20 → 20 | -0.0% |
| geotiff rendering | 2.1 → 2.2 | 454.8 → 433.1 | 480.0 → 456.4 | 485.7 → 462.6 | 487.4 → 470.2 | 579.5 → 519.6 | ±2.87% → ±2.02% | 20 → 20 | -4.9% |
| mirrored selection | 1.0 → 1.2 | 941.2 → 803.9 | 980.4 → 845.9 | 1000.4 → 865.8 | 1027.0 → 871.4 | 1137.6 → 1007.2 | ±2.52% → ±3.35% | 20 → 20 | -13.7% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–13 → 0–8** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 1 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 15 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 10735K | 206 |

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
