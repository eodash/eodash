### Benchmarks

Previous run → this run. Baseline [`d7b4ee3455d77ea45e8c755b9f6a8a3975eb6a10`](https://github.com/eodash/eodash/commit/d7b4ee3455d77ea45e8c755b9f6a8a3975eb6a10), 2026-10-01T09:19:13.552Z.

- layer datetime: changing one layer's date replaces only that layer
- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| layer datetime | 96.3 → 92.1 | 8.7 → 8.8 | 9.4 → 10.6 | 12.2 → 12.9 | 12.1 → 12.8 | 43.4 → 45.9 | ±35.27% → ±35.37% | 20 → 20 | = |
| date snap | 93.1 → 77.5 | 7.9 → 9.1 | 10.8 → 12.7 | 11.2 → 13.9 | 13.0 → 15.9 | 15.6 → 23.1 | ±10.35% → ±13.44% | 20 → 20 | = |
| explore item | 70.7 → 70.8 | 9.8 → 10.1 | 13.9 → 13.9 | 15.1 → 14.8 | 17.3 → 16.7 | 24.6 → 22.7 | ±12.79% → ±10.91% | 20 → 20 | = |
| links=1 | 63.5 → 60.1 | 13.5 → 13.4 | 16.6 → 17.1 | 15.9 → 16.8 | 17.1 → 17.4 | 17.9 → 19.2 | ±4.81% → ±4.38% | 20 → 20 | = |
| links=10 | 58.8 → 57.0 | 14.1 → 17.3 | 17.4 → 17.5 | 17.1 → 17.6 | 17.6 → 17.7 | 18.4 → 18.2 | ±3.28% → ±0.67% | 20 → 20 | = |
| links=100 | 47.5 → 45.2 | 18.9 → 19.1 | 21.3 → 22.0 | 21.1 → 22.2 | 21.8 → 23.8 | 23.1 → 25.1 | ±2.52% → ±3.73% | 20 → 20 | = |
| geozarr bands | 30.3 → 21.4 | 25.3 → 24.8 | 35.7 → 52.6 | 34.7 → 49.2 | 40.2 → 55.3 | 50.6 → 59.3 | ±10.82% → ±9.20% | 20 → 20 | +47.7% |
| poi selection | 19.4 → 20.3 | 35.6 → 35.5 | 56.5 → 43.3 | 54.9 → 53.4 | 64.2 → 68.8 | 85.1 → 78.8 | ±12.22% → ±13.90% | 20 → 20 | = |
| select indicator | 15.6 → 13.0 | 55.2 → 53.1 | 63.7 → 87.7 | 65.1 → 80.7 | 68.9 → 94.1 | 85.2 → 101.4 | ±5.71% → ±9.74% | 20 → 20 | +37.7% |
| vector rendering | 14.1 → 13.7 | 53.5 → 53.2 | 77.9 → 90.7 | 74.8 → 78.5 | 91.8 → 92.8 | 95.2 → 110.1 | ±11.00% → ±12.19% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.4 | 305.5 → 305.7 | 305.5 → 305.7 | 305.6 → 305.7 | 306.0 → 306.2 | ±0.03% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 454.8 → 443.3 | 480.0 → 478.6 | 485.7 → 477.3 | 487.4 → 485.5 | 579.5 → 535.3 | ±2.87% → ±2.23% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 941.2 → 942.2 | 980.4 → 979.0 | 1000.4 → 1010.8 | 1027.0 → 1025.9 | 1137.6 → 1260.0 | ±2.52% → ±3.78% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
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
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| date snap | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000015.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000018.json` | 20 | 0 | 0 | mocked |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 31 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11041K | 206 |

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
