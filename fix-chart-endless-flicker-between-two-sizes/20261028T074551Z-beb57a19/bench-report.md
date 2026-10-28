### Benchmarks

Previous run → this run. Baseline [`0f424891e50efe58809d991c45b0319d0e4f2a6e`](https://github.com/eodash/eodash/commit/0f424891e50efe58809d991c45b0319d0e4f2a6e), 2026-10-27T16:40:52.571Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=10, links=1, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- select indicator: loads a multi-collection indicator and its widgets
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 111.9 → 124.1 | 6.4 → 6.5 | 9.0 → 7.6 | 10.1 → 8.6 | 9.8 → 8.5 | 21.3 → 16.7 | ±20.59% → ±15.62% | 20 → 20 | = |
| date snap | 92.4 → 94.1 | 7.1 → 7.3 | 11.8 → 11.1 | 11.5 → 11.2 | 13.0 → 12.3 | 19.2 → 17.6 | ±12.41% → ±11.49% | 20 → 20 | = |
| layer datetime | 96.8 → 98.9 | 8.7 → 8.7 | 9.6 → 9.0 | 10.8 → 10.4 | 12.3 → 12.4 | 17.6 → 13.7 | ±11.12% → ±8.91% | 20 → 20 | = |
| links=10 | 59.3 → 56.4 | 13.7 → 16.8 | 17.4 → 17.8 | 17.0 → 17.7 | 17.6 → 17.9 | 21.2 → 18.5 | ±4.90% → ±0.96% | 20 → 20 | = |
| links=1 | 59.4 → 55.7 | 13.6 → 16.9 | 16.9 → 17.3 | 18.1 → 19.2 | 17.6 → 17.6 | 43.1 → 47.4 | ±19.28% → ±20.14% | 20 → 20 | = |
| links=100 | 53.0 → 52.7 | 17.2 → 17.4 | 18.9 → 18.4 | 19.0 → 19.2 | 19.2 → 19.3 | 22.4 → 26.3 | ±3.06% → ±5.85% | 20 → 20 | = |
| geozarr bands | 21.0 → 25.0 | 42.5 → 22.1 | 46.4 → 46.3 | 48.9 → 42.6 | 49.5 → 48.1 | 86.2 → 56.3 | ±10.60% → ±10.40% | 20 → 20 | = |
| select indicator | 13.9 → 14.8 | 42.3 → 39.8 | 87.2 → 70.6 | 76.6 → 72.9 | 89.5 → 88.9 | 100.0 → 106.3 | ±11.07% → ±12.64% | 20 → 20 | = |
| poi selection | 15.7 → 16.9 | 38.5 → 41.8 | 70.9 → 66.3 | 67.8 → 62.6 | 75.4 → 73.9 | 98.2 → 87.2 | ±11.07% → ±10.90% | 20 → 20 | = |
| vector rendering | 14.4 → 14.6 | 53.8 → 57.9 | 67.3 → 64.6 | 73.1 → 71.5 | 70.0 → 70.5 | 123.9 → 124.7 | ±12.90% → ±11.91% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.2 | 305.4 → 305.3 | 305.4 → 305.4 | 305.4 → 305.4 | 305.7 → 305.7 | ±0.02% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.2 → 2.2 | 420.6 → 423.7 | 435.5 → 473.2 | 450.2 → 465.5 | 458.8 → 477.4 | 524.7 → 491.2 | ±3.27% → ±2.13% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.0 | 978.9 → 983.3 | 1019.9 → 1028.7 | 1042.9 → 1041.3 | 1064.0 → 1044.1 | 1184.2 → 1159.6 | ±2.42% → ±2.13% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
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
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
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
