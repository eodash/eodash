### Benchmarks

Previous run → this run. Baseline [`0f424891e50efe58809d991c45b0319d0e4f2a6e`](https://github.com/eodash/eodash/commit/0f424891e50efe58809d991c45b0319d0e4f2a6e), 2026-10-27T16:29:35.936Z.

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
| explore item | 119.3 → 111.9 | 6.0 → 6.4 | 8.6 → 9.0 | 9.2 → 10.1 | 9.4 → 9.8 | 19.0 → 21.3 | ±17.88% → ±20.59% | 20 → 20 | = |
| date snap | 96.7 → 92.4 | 7.3 → 7.1 | 10.8 → 11.8 | 11.1 → 11.5 | 13.2 → 13.0 | 18.0 → 19.2 | ±13.10% → ±12.41% | 20 → 20 | = |
| layer datetime | 101.7 → 96.8 | 8.4 → 8.7 | 8.9 → 9.6 | 10.5 → 10.8 | 12.3 → 12.3 | 20.7 → 17.6 | ±14.97% → ±11.12% | 20 → 20 | = |
| links=1 | 65.2 → 59.4 | 13.2 → 13.6 | 16.3 → 16.9 | 15.6 → 18.1 | 17.0 → 17.6 | 17.8 → 43.1 | ±5.38% → ±19.28% | 20 → 20 | = |
| links=10 | 66.7 → 59.3 | 13.5 → 13.7 | 13.9 → 17.4 | 15.2 → 17.0 | 17.1 → 17.6 | 19.1 → 21.2 | ±5.96% → ±4.90% | 20 → 20 | +25.2% |
| links=100 | 52.7 → 53.0 | 16.4 → 17.2 | 19.4 → 18.9 | 19.0 → 19.0 | 19.5 → 19.2 | 21.0 → 22.4 | ±2.40% → ±3.06% | 20 → 20 | = |
| poi selection | 25.1 → 15.7 | 33.6 → 38.5 | 40.3 → 70.9 | 40.5 → 67.8 | 42.8 → 75.4 | 55.4 → 98.2 | ±6.22% → ±11.07% | 20 → 20 | +76.0% |
| select indicator | 12.3 → 13.9 | 53.0 → 42.3 | 89.6 → 87.2 | 84.7 → 76.6 | 96.5 → 89.5 | 103.7 → 100.0 | ±8.87% → ±11.07% | 20 → 20 | = |
| geozarr bands | 26.8 → 21.0 | 11.4 → 42.5 | 43.5 → 46.4 | 41.9 → 48.9 | 46.3 → 49.5 | 52.1 → 86.2 | ±10.59% → ±10.60% | 20 → 20 | = |
| vector rendering | 14.7 → 14.4 | 58.3 → 53.8 | 65.4 → 67.3 | 69.8 → 73.1 | 68.1 → 70.0 | 111.6 → 123.9 | ±9.10% → ±12.90% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.1 | 305.3 → 305.4 | 305.4 → 305.4 | 305.4 → 305.4 | 305.9 → 305.7 | ±0.03% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.0 → 2.2 | 468.9 → 420.6 | 483.0 → 435.5 | 491.3 → 450.2 | 504.4 → 458.8 | 543.6 → 524.7 | ±1.99% → ±3.27% | 20 → 20 | -9.8% |
| mirrored selection | 1.0 → 1.0 | 1004.0 → 978.9 | 1030.3 → 1019.9 | 1039.4 → 1042.9 | 1053.7 → 1064.0 | 1141.3 → 1184.2 | ±1.60% → ±2.42% | 20 → 20 | = |

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
