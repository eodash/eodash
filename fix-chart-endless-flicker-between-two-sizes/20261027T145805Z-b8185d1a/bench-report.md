### Benchmarks

Previous run → this run. Baseline [`e880fd7aa750ebb66202660e5accf4435a08b5d7`](https://github.com/eodash/eodash/commit/e880fd7aa750ebb66202660e5accf4435a08b5d7), 2026-10-24T15:20:45.905Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
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
| date snap | 111.4 → 95.4 | 5.7 → 6.1 | 9.0 → 10.7 | 9.8 → 11.4 | 11.1 → 13.6 | 18.7 → 19.6 | ±15.53% → ±14.12% | 20 → 20 | = |
| explore item | 138.2 → 127.7 | 6.0 → 6.2 | 6.9 → 7.5 | 7.6 → 8.1 | 8.2 → 9.6 | 15.7 → 10.9 | ±15.03% → ±9.64% | 20 → 20 | = |
| layer datetime | 89.0 → 93.6 | 8.8 → 8.7 | 11.4 → 10.1 | 14.8 → 12.9 | 12.6 → 12.5 | 57.9 → 49.3 | ±41.78% → ±38.90% | 20 → 20 | = |
| links=1 | 62.3 → 64.7 | 13.2 → 13.4 | 17.0 → 16.1 | 16.2 → 15.7 | 17.1 → 17.3 | 17.3 → 18.5 | ±4.31% → ±5.95% | 20 → 20 | = |
| links=10 | 61.9 → 60.1 | 13.5 → 13.8 | 17.1 → 17.5 | 16.3 → 16.8 | 17.3 → 17.7 | 18.1 → 18.4 | ±4.65% → ±4.28% | 20 → 20 | = |
| links=100 | 53.7 → 51.9 | 16.8 → 17.6 | 18.5 → 19.2 | 18.7 → 19.3 | 19.2 → 20.1 | 21.1 → 22.2 | ±2.82% → ±2.89% | 20 → 20 | = |
| geozarr bands | 25.1 → 24.9 | 23.9 → 20.7 | 38.5 → 38.0 | 53.8 → 53.0 | 84.5 → 89.6 | 120.3 → 97.3 | ±27.96% → ±26.39% | 20 → 20 | = |
| poi selection | 25.0 → 17.7 | 32.5 → 36.2 | 41.8 → 62.4 | 41.1 → 62.1 | 43.4 → 77.9 | 60.1 → 109.0 | ±8.26% → ±15.30% | 20 → 20 | +49.4% |
| vector rendering | 15.0 → 14.8 | 50.6 → 56.0 | 66.8 → 64.9 | 68.3 → 70.5 | 72.3 → 68.3 | 91.8 → 124.7 | ±7.91% → ±12.09% | 20 → 20 | = |
| select indicator | 14.8 → 12.9 | 37.9 → 58.1 | 71.9 → 82.3 | 76.5 → 81.3 | 87.3 → 91.7 | 160.3 → 115.8 | ±18.29% → ±10.50% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.0 | 305.3 → 305.3 | 305.3 → 305.3 | 305.4 → 305.5 | 305.6 → 305.7 | ±0.02% → ±0.03% | 20 → 20 | = |
| geotiff rendering | 2.2 → 2.0 | 400.2 → 448.3 | 449.9 → 489.2 | 448.7 → 489.0 | 456.3 → 494.2 | 486.4 → 545.1 | ±2.22% → ±2.21% | 20 → 20 | +8.7% |
| mirrored selection | 1.0 → 0.9 | 912.2 → 1000.3 | 972.8 → 1043.2 | 981.9 → 1057.2 | 1008.4 → 1069.6 | 1125.4 → 1166.0 | ±2.53% → ±2.18% | 20 → 20 | +7.2% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–3 → 0–2** | **0 → 0–3K** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **mirrored selection** | **2 → 2** | **6 → 6** | **338K–644K → 338K–644K** |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| date snap | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000015.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000018.json` | 20 | 0 | 0 | mocked |
| explore item | none | | | | |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/zarr.json` | 0 | 1 | 0 | 200 |
|  | `/node_modules/.vite/vitest/ef98362b8a6b0c8cd804b0d227aa1ffeaba89786/deps/chunk-INHXZS53-2lHqYEfP.js` | 0 | 1 | 3K | 200 |
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
