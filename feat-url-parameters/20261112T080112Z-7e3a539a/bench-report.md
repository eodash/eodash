### Benchmarks

Previous run → this run. Baseline [`2c245b9bc376783753255bab7a170801c9bff320`](https://github.com/eodash/eodash/commit/2c245b9bc376783753255bab7a170801c9bff320), 2026-11-11T17:05:28.114Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 115.7 → 154.4 | 6.4 → 4.5 | 8.0 → 6.8 | 9.5 → 6.9 | 10.5 → 7.8 | 20.9 → 12.6 | ±18.68% → ±13.74% | 20 → 20 | = |
| date snap | 83.6 → 113.9 | 7.2 → 5.2 | 13.1 → 8.9 | 13.6 → 9.6 | 15.3 → 10.1 | 25.8 → 19.9 | ±18.29% → ±16.58% | 20 → 20 | -32.4% |
| layer datetime | 91.4 → 111.8 | 8.8 → 8.5 | 11.3 → 8.7 | 13.6 → 9.0 | 12.5 → 8.8 | 57.1 → 11.9 | ±43.96% → ±4.82% | 20 → 20 | -23.0% |
| links=1 | 56.4 → 73.2 | 16.9 → 13.0 | 17.3 → 13.1 | 18.0 → 13.8 | 17.5 → 13.4 | 28.0 → 17.3 | ±7.49% → ±4.43% | 20 → 20 | -24.0% |
| links=10 | 56.9 → 69.6 | 16.8 → 13.3 | 17.6 → 13.6 | 17.6 → 14.5 | 17.6 → 16.0 | 19.4 → 17.2 | ±1.53% → ±4.78% | 20 → 20 | -22.7% |
| links=100 | 52.1 → 54.4 | 17.3 → 17.0 | 19.3 → 18.3 | 19.4 → 18.4 | 20.2 → 18.6 | 25.4 → 19.8 | ±5.01% → ±1.57% | 20 → 20 | = |
| geozarr bands | 22.0 → 23.6 | 28.1 → 25.2 | 46.5 → 43.3 | 47.2 → 43.6 | 50.1 → 45.4 | 64.2 → 62.0 | ±8.31% → ±7.94% | 20 → 20 | -6.9% |
| poi selection | 22.7 → 25.8 | 37.8 → 30.8 | 43.4 → 37.8 | 44.3 → 40.1 | 47.8 → 43.0 | 51.2 → 59.9 | ±4.17% → ±9.27% | 20 → 20 | -12.8% |
| vector rendering | 14.4 → 17.3 | 58.2 → 45.7 | 67.8 → 59.3 | 71.1 → 58.7 | 72.8 → 62.0 | 107.1 → 79.5 | ±8.38% → ±6.72% | 20 → 20 | -12.5% |
| select indicator | 11.3 → 14.5 | 62.4 → 45.9 | 94.9 → 71.7 | 93.8 → 74.0 | 103.6 → 86.8 | 159.7 → 117.0 | ±12.31% → ±13.06% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.0 | 305.4 → 305.1 | 305.4 → 305.1 | 305.5 → 305.2 | 306.0 → 305.3 | ±0.03% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.5 → 2.2 | 84.7 → 408.5 | 486.6 → 451.2 | 466.3 → 459.2 | 494.6 → 465.4 | 540.5 → 581.9 | ±9.31% → ±4.08% | 20 → 20 | -7.3% |
| mirrored selection | 0.9 → 1.2 | 1012.3 → 790.1 | 1052.0 → 823.7 | 1060.2 → 836.5 | 1077.3 → 865.2 | 1155.2 → 912.8 | ±1.62% → ±1.95% | 20 → 20 | -21.7% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–1 → 0–1** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
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
| vector rendering | `/stac/indicators/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-vector.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/styled-vector-style.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/stormtracker.geojson` | 0 | 20 | 22467K | 200 |
| select indicator | `/stac/indicators/multi.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/multi-c0.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c1.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/multi-c2.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
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
