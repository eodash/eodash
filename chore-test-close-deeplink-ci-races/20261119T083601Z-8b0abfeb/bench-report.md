### Benchmarks

Previous run → this run. Baseline [`8ba8f75881568d0e1f0256498b7d032749358b7a`](https://github.com/eodash/eodash/commit/8ba8f75881568d0e1f0256498b7d032749358b7a), 2026-11-18T11:11:17.895Z.

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
| explore item | 201.2 → 203.2 | 3.4 → 3.9 | 4.9 → 4.8 | 5.2 → 5.2 | 5.8 → 5.5 | 9.7 → 9.8 | ±13.01% → ±13.49% | 20 → 20 | = |
| date snap | 119.0 → 119.3 | 6.1 → 6.1 | 9.6 → 9.4 | 8.9 → 9.0 | 10.2 → 9.9 | 13.2 → 16.6 | ±11.07% → ±14.13% | 20 → 20 | = |
| layer datetime | 114.8 → 112.1 | 8.5 → 8.5 | 8.6 → 8.7 | 8.7 → 9.0 | 8.7 → 8.8 | 9.7 → 12.9 | ±1.62% → ±6.01% | 20 → 20 | = |
| links=1 | 72.8 → 68.4 | 13.0 → 13.2 | 13.2 → 13.6 | 13.8 → 14.8 | 13.8 → 16.6 | 16.5 → 17.1 | ±4.12% → ±5.13% | 20 → 20 | = |
| links=10 | 70.9 → 66.0 | 13.2 → 13.5 | 13.5 → 14.3 | 14.2 → 15.3 | 15.2 → 17.0 | 16.9 → 17.9 | ±4.26% → ±5.41% | 20 → 20 | = |
| links=100 | 62.0 → 56.9 | 15.1 → 15.4 | 16.2 → 18.1 | 16.2 → 17.7 | 16.8 → 18.8 | 17.8 → 20.2 | ±2.78% → ±3.87% | 20 → 20 | +11.4% |
| geozarr bands | 3.1 → 25.5 | 53.2 → 24.6 | 436.3 → 43.1 | 424.1 → 40.7 | 443.5 → 44.6 | 494.9 → 47.7 | ±9.88% → ±8.06% | 20 → 20 | -90.1% |
| poi selection | 31.6 → 31.3 | 24.3 → 25.4 | 30.5 → 29.9 | 33.1 → 34.2 | 35.4 → 38.4 | 55.8 → 61.3 | ±11.48% → ±14.38% | 20 → 20 | = |
| select indicator | 22.3 → 18.7 | 22.4 → 28.0 | 50.7 → 59.5 | 49.1 → 65.2 | 57.9 → 85.1 | 71.9 → 138.1 | ±13.04% → ±21.33% | 20 → 20 | = |
| vector rendering | 19.2 → 18.8 | 47.9 → 46.2 | 49.0 → 51.0 | 53.3 → 54.2 | 51.4 → 60.1 | 81.6 → 76.8 | ±8.43% → ±7.17% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.1 | 305.3 → 305.3 | 305.4 → 305.4 | 305.4 → 305.4 | 305.7 → 305.7 | ±0.02% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.3 → 2.3 | 412.8 → 410.4 | 434.1 → 444.3 | 435.9 → 444.9 | 444.5 → 463.5 | 480.6 → 500.4 | ±2.01% → ±2.80% | 20 → 20 | = |
| mirrored selection | 1.3 → 1.3 | 713.4 → 722.1 | 742.3 → 762.0 | 747.9 → 777.6 | 759.8 → 792.4 | 831.2 → 883.1 | ±1.88% → ±3.06% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **1–10 → 0–1** | **0 → 0** |
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
