### Benchmarks

Previous run → this run. Baseline [`2c245b9bc376783753255bab7a170801c9bff320`](https://github.com/eodash/eodash/commit/2c245b9bc376783753255bab7a170801c9bff320), 2026-11-11T17:05:28.114Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- geozarr bands: dragging a band rebuilds the source
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 115.7 → 187.2 | 6.4 → 3.3 | 8.0 → 5.5 | 9.5 → 5.6 | 10.5 → 6.5 | 20.9 → 8.0 | ±18.68% → ±10.25% | 20 → 20 | -32.3% |
| date snap | 83.6 → 125.9 | 7.2 → 4.0 | 13.1 → 8.0 | 13.6 → 8.5 | 15.3 → 9.4 | 25.8 → 14.9 | ±18.29% → ±12.83% | 20 → 20 | -38.9% |
| layer datetime | 91.4 → 109.3 | 8.8 → 8.4 | 11.3 → 8.6 | 13.6 → 9.5 | 12.5 → 8.8 | 57.1 → 18.4 | ±43.96% → ±12.95% | 20 → 20 | -23.9% |
| links=1 | 56.4 → 73.8 | 16.9 → 13.0 | 17.3 → 13.1 | 18.0 → 13.6 | 17.5 → 13.3 | 28.0 → 17.4 | ±7.49% → ±4.28% | 20 → 20 | -24.3% |
| links=10 | 56.9 → 71.0 | 16.8 → 13.2 | 17.6 → 13.5 | 17.6 → 14.2 | 17.6 → 14.1 | 19.4 → 17.4 | ±1.53% → ±4.79% | 20 → 20 | -23.3% |
| links=100 | 52.1 → 56.5 | 17.3 → 15.6 | 19.3 → 18.4 | 19.4 → 17.8 | 20.2 → 18.7 | 25.4 → 19.1 | ±5.01% → ±3.33% | 20 → 20 | = |
| poi selection | 22.7 → 29.8 | 37.8 → 26.8 | 43.4 → 31.5 | 44.3 → 34.9 | 47.8 → 37.8 | 51.2 → 53.6 | ±4.17% → ±10.66% | 20 → 20 | -27.5% |
| geozarr bands | 22.0 → 21.2 | 28.1 → 42.7 | 46.5 → 44.1 | 47.2 → 61.1 | 50.1 → 46.2 | 64.2 → 304.8 | ±8.31% → ±54.62% | 20 → 20 | -5.1% |
| select indicator | 11.3 → 15.0 | 62.4 → 46.7 | 94.9 → 65.4 | 93.8 → 89.5 | 103.6 → 76.4 | 159.7 → 401.0 | ±12.31% → ±47.19% | 20 → 20 | -31.1% |
| vector rendering | 14.4 → 17.0 | 58.2 → 47.9 | 67.8 → 57.1 | 71.1 → 61.5 | 72.8 → 62.8 | 107.1 → 96.4 | ±8.38% → ±11.37% | 20 → 20 | -15.8% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.0 | 305.4 → 305.2 | 305.4 → 305.2 | 305.5 → 305.2 | 306.0 → 305.5 | ±0.03% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.5 → 2.1 | 84.7 → 432.4 | 486.6 → 477.4 | 466.3 → 482.1 | 494.6 → 493.2 | 540.5 → 564.9 | ±9.31% → ±3.50% | 20 → 20 | = |
| mirrored selection | 0.9 → 1.1 | 1012.3 → 821.7 | 1052.0 → 858.4 | 1060.2 → 893.4 | 1077.3 → 905.3 | 1155.2 → 1173.1 | ±1.62% → ±4.78% | 20 → 20 | -18.4% |

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
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
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
| poi selection | `/stac/indicators/pois.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/pois.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 19 | 0 | 200 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 10429K | 206 |

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
