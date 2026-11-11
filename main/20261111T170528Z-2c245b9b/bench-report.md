### Benchmarks

Previous run → this run. Baseline [`3bd369e7258db23481438a2fdf67b2ed97d6cf6b`](https://github.com/eodash/eodash/commit/3bd369e7258db23481438a2fdf67b2ed97d6cf6b), 2026-10-28T12:53:57.683Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=10, links=1, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- select indicator: loads a multi-collection indicator and its widgets
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 156.2 → 115.7 | 5.2 → 6.4 | 6.4 → 8.0 | 6.6 → 9.5 | 7.2 → 10.5 | 8.6 → 20.9 | ±7.78% → ±18.68% | 20 → 20 | = |
| date snap | 112.6 → 83.6 | 7.2 → 7.2 | 8.9 → 13.1 | 9.3 → 13.6 | 10.2 → 15.3 | 14.3 → 25.8 | ±11.58% → ±18.29% | 20 → 20 | +47.2% |
| layer datetime | 103.3 → 91.4 | 8.5 → 8.8 | 8.9 → 11.3 | 11.3 → 13.6 | 9.9 → 12.5 | 40.8 → 57.1 | ±35.52% → ±43.96% | 20 → 20 | = |
| links=10 | 65.7 → 56.9 | 13.5 → 16.8 | 15.3 → 17.6 | 15.4 → 17.6 | 16.9 → 17.6 | 18.5 → 19.4 | ±5.48% → ±1.53% | 20 → 20 | +15.4% |
| links=1 | 66.0 → 56.4 | 13.3 → 16.9 | 15.8 → 17.3 | 15.3 → 18.0 | 16.9 → 17.5 | 17.4 → 28.0 | ±5.25% → ±7.49% | 20 → 20 | +9.5% |
| links=100 | 54.9 → 52.1 | 15.8 → 17.3 | 18.4 → 19.3 | 18.3 → 19.4 | 18.8 → 20.2 | 20.2 → 25.4 | ±2.77% → ±5.01% | 20 → 20 | +4.9% |
| geozarr bands | 22.5 → 22.0 | 42.2 → 28.1 | 44.0 → 46.5 | 44.5 → 47.2 | 45.4 → 50.1 | 48.6 → 64.2 | ±1.90% → ±8.31% | 20 → 20 | +5.7% |
| poi selection | 24.1 → 22.7 | 29.3 → 37.8 | 36.0 → 43.4 | 46.5 → 44.3 | 61.1 → 47.8 | 81.1 → 51.2 | ±17.68% → ±4.17% | 20 → 20 | = |
| vector rendering | 16.4 → 14.4 | 46.0 → 58.2 | 59.3 → 67.8 | 64.2 → 71.1 | 63.0 → 72.8 | 112.1 → 107.1 | ±13.03% → ±8.38% | 20 → 20 | = |
| select indicator | 16.9 → 11.3 | 33.8 → 62.4 | 68.3 → 94.9 | 65.1 → 93.8 | 80.9 → 103.6 | 92.1 → 159.7 | ±13.31% → ±12.31% | 20 → 20 | +39.0% |
| geotiff rendering | 2.2 → 2.5 | 427.3 → 84.7 | 451.0 → 486.6 | 458.3 → 466.3 | 462.3 → 494.6 | 562.6 → 540.5 | ±3.66% → ±9.31% | 20 → 20 | +7.9% |
| mosaic scrub | 3.3 → 3.3 | 305.0 → 305.2 | 305.2 → 305.4 | 305.3 → 305.4 | 305.3 → 305.5 | 305.7 → 306.0 | ±0.03% → ±0.03% | 20 → 20 | = |
| mirrored selection | 1.2 → 0.9 | 808.1 → 1012.3 | 850.9 → 1052.0 | 871.5 → 1060.2 | 919.4 → 1077.3 | 965.4 → 1155.2 | ±3.20% → ±1.62% | 20 → 20 | +23.6% |

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
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
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
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
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
