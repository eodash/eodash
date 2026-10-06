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
| date snap | 93.1 → 102.5 | 7.9 → 4.3 | 10.8 → 10.6 | 11.2 → 10.7 | 13.0 → 12.8 | 15.6 → 16.5 | ±10.35% → ±12.83% | 20 → 20 | = |
| explore item | 70.7 → 76.5 | 9.8 → 7.6 | 13.9 → 13.4 | 15.1 → 14.0 | 17.3 → 16.3 | 24.6 → 20.4 | ±12.79% → ±12.33% | 20 → 20 | = |
| layer datetime | 96.3 → 95.9 | 8.7 → 8.7 | 9.4 → 9.4 | 12.2 → 12.3 | 12.1 → 12.2 | 43.4 → 43.3 | ±35.27% → ±34.60% | 20 → 20 | = |
| links=1 | 63.5 → 63.7 | 13.5 → 13.3 | 16.6 → 16.8 | 15.9 → 15.9 | 17.1 → 17.2 | 17.9 → 17.7 | ±4.81% → ±5.09% | 20 → 20 | = |
| links=10 | 58.8 → 61.5 | 14.1 → 13.8 | 17.4 → 16.9 | 17.1 → 16.4 | 17.6 → 17.4 | 18.4 → 18.1 | ±3.28% → ±4.01% | 20 → 20 | -2.9% |
| links=100 | 47.5 → 48.0 | 18.9 → 18.5 | 21.3 → 21.1 | 21.1 → 20.9 | 21.8 → 21.6 | 23.1 → 23.2 | ±2.52% → ±2.74% | 20 → 20 | = |
| geozarr bands | 30.3 → 29.3 | 25.3 → 23.3 | 35.7 → 33.9 | 34.7 → 35.9 | 40.2 → 42.9 | 50.6 → 50.0 | ±10.82% → ±10.81% | 20 → 20 | = |
| poi selection | 19.4 → 22.9 | 35.6 → 36.7 | 56.5 → 41.7 | 54.9 → 45.4 | 64.2 → 48.6 | 85.1 → 75.8 | ±12.22% → ±11.02% | 20 → 20 | = |
| select indicator | 15.6 → 13.2 | 55.2 → 49.1 | 63.7 → 79.8 | 65.1 → 78.4 | 68.9 → 88.8 | 85.2 → 99.6 | ±5.71% → ±8.78% | 20 → 20 | +25.5% |
| vector rendering | 14.1 → 14.0 | 53.5 → 53.7 | 77.9 → 64.6 | 74.8 → 76.4 | 91.8 → 89.7 | 95.2 → 135.4 | ±11.00% → ±13.92% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.2 | 305.5 → 305.5 | 305.5 → 305.5 | 305.6 → 305.6 | 306.0 → 305.9 | ±0.03% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 454.8 → 427.8 | 480.0 → 482.0 | 485.7 → 482.3 | 487.4 → 490.4 | 579.5 → 549.8 | ±2.87% → ±2.94% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 941.2 → 941.7 | 980.4 → 1007.6 | 1000.4 → 1019.5 | 1027.0 → 1045.8 | 1137.6 → 1123.4 | ±2.52% → ±2.45% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–13 → 0–10** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 37 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 33 | 0 | 404 |
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
