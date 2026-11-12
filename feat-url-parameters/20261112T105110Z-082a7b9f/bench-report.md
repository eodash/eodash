### Benchmarks

Previous run → this run. Baseline [`2c245b9bc376783753255bab7a170801c9bff320`](https://github.com/eodash/eodash/commit/2c245b9bc376783753255bab7a170801c9bff320), 2026-11-11T17:05:28.114Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- select indicator: loads a multi-collection indicator and its widgets
- poi selection: selecting a POI indicator builds the observation points layer
- geozarr bands: dragging a band rebuilds the source
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 115.7 → 209.6 | 6.4 → 3.3 | 8.0 → 4.6 | 9.5 → 5.4 | 10.5 → 5.5 | 20.9 → 13.9 | ±18.68% → ±22.94% | 20 → 20 | -42.9% |
| date snap | 83.6 → 147.2 | 7.2 → 4.0 | 13.1 → 6.8 | 13.6 → 7.0 | 15.3 → 7.3 | 25.8 → 10.2 | ±18.29% → ±9.13% | 20 → 20 | -48.1% |
| layer datetime | 91.4 → 109.8 | 8.8 → 8.4 | 11.3 → 8.6 | 13.6 → 11.4 | 12.5 → 8.7 | 57.1 → 52.8 | ±43.96% → ±49.39% | 20 → 20 | -23.9% |
| links=1 | 56.4 → 74.7 | 16.9 → 12.7 | 17.3 → 13.0 | 18.0 → 13.4 | 17.5 → 13.3 | 28.0 → 15.5 | ±7.49% → ±3.29% | 20 → 20 | -24.9% |
| links=10 | 56.9 → 72.6 | 16.8 → 12.9 | 17.6 → 13.2 | 17.6 → 13.8 | 17.6 → 14.9 | 19.4 → 16.1 | ±1.53% → ±3.64% | 20 → 20 | -25.0% |
| links=100 | 52.1 → 62.5 | 17.3 → 14.6 | 19.3 → 15.1 | 19.4 → 16.5 | 20.2 → 15.6 | 25.4 → 25.1 | ±5.01% → ±9.59% | 20 → 20 | -21.8% |
| select indicator | 11.3 → 25.4 | 62.4 → 25.3 | 94.9 → 38.0 | 93.8 → 44.9 | 103.6 → 58.0 | 159.7 → 77.2 | ±12.31% → ±17.81% | 20 → 20 | -60.0% |
| poi selection | 22.7 → 33.4 | 37.8 → 25.7 | 43.4 → 28.2 | 44.3 → 32.0 | 47.8 → 30.9 | 51.2 → 67.4 | ±4.17% → ±16.22% | 20 → 20 | -35.1% |
| geozarr bands | 22.0 → 22.4 | 28.1 → 42.4 | 46.5 → 43.7 | 47.2 → 44.9 | 50.1 → 46.2 | 64.2 → 53.5 | ±8.31% → ±3.07% | 20 → 20 | -6.0% |
| vector rendering | 14.4 → 19.0 | 58.2 → 47.6 | 67.8 → 49.6 | 71.1 → 53.4 | 72.8 → 55.2 | 107.1 → 73.9 | ±8.38% → ±6.68% | 20 → 20 | -26.9% |
| geotiff rendering | 2.5 → 3.2 | 84.7 → 55.8 | 486.6 → 408.1 | 466.3 → 394.0 | 494.6 → 423.3 | 540.5 → 467.8 | ±9.31% → ±9.75% | 20 → 20 | -16.1% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 304.8 | 305.4 → 305.0 | 305.4 → 305.1 | 305.5 → 305.1 | 306.0 → 306.4 | ±0.03% → ±0.06% | 20 → 20 | -0.1% |
| mirrored selection | 0.9 → 1.6 | 1012.3 → 592.4 | 1052.0 → 619.1 | 1060.2 → 641.0 | 1077.3 → 651.3 | 1155.2 → 804.6 | ±1.62% → ±4.20% | 20 → 20 | -41.2% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
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
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
| vector rendering | `/stac/indicators/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/styled-vector-style.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/stormtracker.geojson` | 0 | 20 | 22467K | 200 |
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
| mirrored selection | `/stac/indicators/mirrored.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/mirrored.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11958K | 206 |

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
