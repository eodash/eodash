### Benchmarks

Previous run → this run. Baseline [`0f424891e50efe58809d991c45b0319d0e4f2a6e`](https://github.com/eodash/eodash/commit/0f424891e50efe58809d991c45b0319d0e4f2a6e), 2026-10-27T16:40:52.571Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
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
| explore item | 111.9 → 121.1 | 6.4 → 6.0 | 9.0 → 8.5 | 10.1 → 8.9 | 9.8 → 9.6 | 21.3 → 18.7 | ±20.59% → ±16.37% | 20 → 20 | = |
| date snap | 92.4 → 93.0 | 7.1 → 7.6 | 11.8 → 10.7 | 11.5 → 11.4 | 13.0 → 12.5 | 19.2 → 20.3 | ±12.41% → ±12.87% | 20 → 20 | = |
| layer datetime | 96.8 → 100.7 | 8.7 → 8.7 | 9.6 → 9.1 | 10.8 → 10.2 | 12.3 → 12.0 | 17.6 → 12.8 | ±11.12% → ±7.48% | 20 → 20 | = |
| links=1 | 59.4 → 62.4 | 13.6 → 13.4 | 16.9 → 16.9 | 18.1 → 16.2 | 17.6 → 17.2 | 43.1 → 18.1 | ±19.28% → ±4.77% | 20 → 20 | = |
| links=10 | 59.3 → 64.3 | 13.7 → 13.9 | 17.4 → 15.4 | 17.0 → 15.7 | 17.6 → 17.3 | 21.2 → 17.7 | ±4.90% → ±4.57% | 20 → 20 | = |
| links=100 | 53.0 → 51.5 | 17.2 → 17.2 | 18.9 → 19.1 | 19.0 → 19.6 | 19.2 → 21.0 | 22.4 → 24.4 | ±3.06% → ±4.96% | 20 → 20 | = |
| geozarr bands | 21.0 → 22.2 | 42.5 → 23.2 | 46.4 → 48.5 | 48.9 → 60.3 | 49.5 → 90.1 | 86.2 → 98.5 | ±10.60% → ±23.53% | 20 → 20 | = |
| poi selection | 15.7 → 17.8 | 38.5 → 37.5 | 70.9 → 64.2 | 67.8 → 60.8 | 75.4 → 69.7 | 98.2 → 89.1 | ±11.07% → ±12.91% | 20 → 20 | = |
| select indicator | 13.9 → 13.2 | 42.3 → 54.3 | 87.2 → 82.3 | 76.6 → 79.8 | 89.5 → 92.9 | 100.0 → 108.0 | ±11.07% → ±10.39% | 20 → 20 | = |
| vector rendering | 14.4 → 14.9 | 53.8 → 59.6 | 67.3 → 65.4 | 73.1 → 68.0 | 70.0 → 68.1 | 123.9 → 100.6 | ±12.90% → ±7.14% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.2 | 305.4 → 305.4 | 305.4 → 305.4 | 305.4 → 305.5 | 305.7 → 305.8 | ±0.02% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.2 → 2.2 | 420.6 → 419.9 | 435.5 → 462.0 | 450.2 → 461.4 | 458.8 → 473.7 | 524.7 → 526.0 | ±3.27% → ±3.02% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 978.9 → 1002.7 | 1019.9 → 1043.3 | 1042.9 → 1049.0 | 1064.0 → 1070.7 | 1184.2 → 1129.6 | ±2.42% → ±1.55% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–5** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **mirrored selection** | **2 → 2** | **6 → 6** | **338K–644K → 338K–644K** |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| explore item | none | | | | |
| date snap | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000015.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000018.json` | 20 | 0 | 0 | mocked |
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
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b02/c/0/0` | 0 | 5 | 0 | 200, 206 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b03/c/0/0` | 0 | 4 | 0 | 200, 206 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 9818K | 206 |

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
