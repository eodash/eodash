### Benchmarks

Previous run → this run. Baseline [`3bd369e7258db23481438a2fdf67b2ed97d6cf6b`](https://github.com/eodash/eodash/commit/3bd369e7258db23481438a2fdf67b2ed97d6cf6b), 2026-10-28T12:53:57.683Z.

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
| explore item | 156.2 → 171.0 | 5.2 → 4.0 | 6.4 → 5.2 | 6.6 → 7.4 | 7.2 → 7.1 | 8.6 → 20.8 | ±7.78% → ±30.55% | 20 → 20 | -19.5% |
| date snap | 112.6 → 118.2 | 7.2 → 6.4 | 8.9 → 8.4 | 9.3 → 8.9 | 10.2 → 9.8 | 14.3 → 14.7 | ±11.58% → ±11.81% | 20 → 20 | = |
| layer datetime | 103.3 → 114.1 | 8.5 → 8.4 | 8.9 → 8.6 | 11.3 → 8.8 | 9.9 → 8.6 | 40.8 → 11.1 | ±35.52% → ±4.17% | 20 → 20 | -3.9% |
| links=1 | 66.0 → 73.8 | 13.3 → 12.9 | 15.8 → 13.1 | 15.3 → 13.6 | 16.9 → 14.3 | 17.4 → 15.7 | ±5.25% → ±3.23% | 20 → 20 | -17.4% |
| links=10 | 65.7 → 70.3 | 13.5 → 13.0 | 15.3 → 13.3 | 15.4 → 14.4 | 16.9 → 15.4 | 18.5 → 20.0 | ±5.48% → ±6.22% | 20 → 20 | -12.8% |
| links=100 | 54.9 → 60.3 | 15.8 → 14.7 | 18.4 → 15.1 | 18.3 → 17.5 | 18.8 → 17.2 | 20.2 → 35.3 | ±2.77% → ±14.56% | 20 → 20 | -18.0% |
| poi selection | 24.1 → 32.3 | 29.3 → 25.3 | 36.0 → 30.8 | 46.5 → 31.5 | 61.1 → 34.0 | 81.1 → 42.0 | ±17.68% → ±7.14% | 20 → 20 | -14.3% |
| select indicator | 16.9 → 20.2 | 33.8 → 29.1 | 68.3 → 53.3 | 65.1 → 64.3 | 80.9 → 71.8 | 92.1 → 199.6 | ±13.31% → ±31.96% | 20 → 20 | = |
| geozarr bands | 22.5 → 22.9 | 42.2 → 39.3 | 44.0 → 43.3 | 44.5 → 43.7 | 45.4 → 44.3 | 48.6 → 47.2 | ±1.90% → ±1.94% | 20 → 20 | = |
| vector rendering | 16.4 → 18.0 | 46.0 → 45.9 | 59.3 → 51.2 | 64.2 → 57.3 | 63.0 → 66.1 | 112.1 → 81.1 | ±13.03% → ±8.98% | 20 → 20 | -13.8% |
| geotiff rendering | 2.2 → 3.2 | 427.3 → 54.7 | 451.0 → 411.0 | 458.3 → 397.2 | 462.3 → 424.7 | 562.6 → 443.1 | ±3.66% → ±9.64% | 20 → 20 | -8.9% |
| mosaic scrub | 3.3 → 3.3 | 305.0 → 305.0 | 305.2 → 305.1 | 305.3 → 305.1 | 305.3 → 305.2 | 305.7 → 305.4 | ±0.03% → ±0.02% | 20 → 20 | = |
| mirrored selection | 1.2 → 1.5 | 808.1 → 597.2 | 850.9 → 644.8 | 871.5 → 660.4 | 919.4 → 677.9 | 965.4 → 839.3 | ±3.20% → ±4.31% | 20 → 20 | -24.2% |

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
| geotiff rendering | `/stac/indicators/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/styled-geotiff.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/styled-geotiff-style.json` | 20 | 0 | 0 | mocked |
| mosaic scrub | `/raster/collections/mosaicked/WebMercatorQuad/tilejson.json` | 20 | 0 | 0 | mocked |
| mirrored selection | `/stac/indicators/mirrored.json` | 20 | 20 | 0 | mocked, 404 |
|  | `/stac/collections/mirrored.json` | 20 | 0 | 0 | mocked |
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 11346K | 206 |

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
