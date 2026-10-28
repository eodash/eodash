### Benchmarks

Previous run → this run. Baseline [`0f424891e50efe58809d991c45b0319d0e4f2a6e`](https://github.com/eodash/eodash/commit/0f424891e50efe58809d991c45b0319d0e4f2a6e), 2026-10-27T16:40:52.571Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- geozarr bands: dragging a band rebuilds the source
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 111.9 → 143.4 | 6.4 → 5.5 | 9.0 → 7.3 | 10.1 → 7.1 | 9.8 → 7.9 | 21.3 → 8.8 | ±20.59% → ±6.99% | 20 → 20 | = |
| date snap | 92.4 → 89.7 | 7.1 → 7.6 | 11.8 → 10.9 | 11.5 → 11.9 | 13.0 → 13.9 | 19.2 → 19.7 | ±12.41% → ±12.68% | 20 → 20 | = |
| layer datetime | 96.8 → 108.7 | 8.7 → 8.5 | 9.6 → 8.8 | 10.8 → 9.3 | 12.3 → 9.3 | 17.6 → 11.6 | ±11.12% → ±5.04% | 20 → 20 | = |
| links=1 | 59.4 → 69.6 | 13.6 → 13.2 | 16.9 → 13.5 | 18.1 → 14.6 | 17.6 → 16.3 | 43.1 → 17.7 | ±19.28% → ±5.57% | 20 → 20 | -20.6% |
| links=10 | 59.3 → 69.5 | 13.7 → 13.5 | 17.4 → 13.8 | 17.0 → 14.5 | 17.6 → 15.7 | 21.2 → 16.8 | ±4.90% → ±3.80% | 20 → 20 | -20.4% |
| links=100 | 53.0 → 59.1 | 17.2 → 15.1 | 18.9 → 17.2 | 19.0 → 17.0 | 19.2 → 18.0 | 22.4 → 19.4 | ±3.06% → ±3.83% | 20 → 20 | -9.0% |
| poi selection | 15.7 → 29.8 | 38.5 → 25.0 | 70.9 → 31.6 | 67.8 → 36.2 | 75.4 → 35.6 | 98.2 → 66.9 | ±11.07% → ±15.78% | 20 → 20 | -55.3% |
| select indicator | 13.9 → 15.4 | 42.3 → 42.6 | 87.2 → 66.1 | 76.6 → 70.2 | 89.5 → 79.3 | 100.0 → 135.7 | ±11.07% → ±15.13% | 20 → 20 | = |
| geozarr bands | 21.0 → 21.2 | 42.5 → 42.9 | 46.4 → 45.4 | 48.9 → 47.9 | 49.5 → 50.3 | 86.2 → 69.7 | ±10.60% → ±6.71% | 20 → 20 | = |
| vector rendering | 14.4 → 18.1 | 53.8 → 47.0 | 67.3 → 53.4 | 73.1 → 57.2 | 70.0 → 60.8 | 123.9 → 85.3 | ±12.90% → ±9.61% | 20 → 20 | -20.7% |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.1 | 305.4 → 305.3 | 305.4 → 305.3 | 305.4 → 305.3 | 305.7 → 305.6 | ±0.02% → ±0.02% | 20 → 20 | -0.0% |
| geotiff rendering | 2.2 → 2.4 | 420.6 → 391.4 | 435.5 → 411.5 | 450.2 → 418.0 | 458.8 → 430.3 | 524.7 → 447.9 | ±3.27% → ±1.81% | 20 → 20 | -5.5% |
| mirrored selection | 1.0 → 1.4 | 978.9 → 651.2 | 1019.9 → 690.4 | 1042.9 → 697.5 | 1064.0 → 716.4 | 1184.2 → 776.7 | ±2.42% → ±2.54% | 20 → 20 | -32.3% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
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
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 12264K | 206 |

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
