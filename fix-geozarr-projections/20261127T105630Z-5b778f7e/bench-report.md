### Benchmarks

Previous run → this run. Baseline [`cb9559651b00e8ca43053a9c65d90d5ca844c935`](https://github.com/eodash/eodash/commit/cb9559651b00e8ca43053a9c65d90d5ca844c935), 2026-11-25T09:41:59.719Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- select indicator: loads a multi-collection indicator and its widgets
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- geozarr bands: dragging a band rebuilds the source
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| explore item | 209.7 → 231.2 | 3.9 → 3.4 | 4.6 → 4.3 | 5.0 → 4.4 | 5.5 → 4.7 | 7.9 → 5.8 | ±11.45% → ±6.21% | 20 → 20 | = |
| date snap | 103.4 → 117.2 | 7.2 → 6.0 | 10.1 → 9.2 | 9.8 → 9.0 | 10.4 → 10.1 | 10.8 → 13.7 | ±4.88% → ±10.68% | 20 → 20 | = |
| layer datetime | 102.0 → 115.0 | 8.6 → 8.4 | 8.9 → 8.6 | 11.3 → 8.7 | 10.2 → 8.7 | 38.5 → 9.6 | ±32.74% → ±1.78% | 20 → 20 | -2.8% |
| links=1 | 58.5 → 73.1 | 15.8 → 13.0 | 17.1 → 13.2 | 17.1 → 13.7 | 17.5 → 13.3 | 18.1 → 16.3 | ±1.57% → ±3.84% | 20 → 20 | -23.0% |
| links=10 | 63.4 → 71.1 | 13.6 → 13.3 | 16.5 → 13.5 | 16.0 → 14.2 | 17.3 → 14.1 | 20.8 → 17.0 | ±5.97% → ±4.18% | 20 → 20 | -18.4% |
| links=100 | 53.1 → 59.4 | 17.7 → 15.2 | 18.8 → 16.9 | 18.8 → 17.0 | 19.0 → 18.2 | 20.0 → 20.4 | ±1.42% → ±4.28% | 20 → 20 | -10.6% |
| select indicator | 17.9 → 22.0 | 29.8 → 26.0 | 61.0 → 52.3 | 64.2 → 50.2 | 80.0 → 56.8 | 131.1 → 86.2 | ±18.73% → ±14.37% | 20 → 20 | = |
| poi selection | 29.3 → 31.3 | 24.7 → 26.3 | 32.8 → 31.0 | 36.0 → 32.7 | 40.2 → 37.8 | 56.8 → 41.9 | ±12.12% → ±7.70% | 20 → 20 | = |
| vector rendering | 19.4 → 19.6 | 47.3 → 48.4 | 48.9 → 49.0 | 52.1 → 51.6 | 53.3 → 51.2 | 63.0 → 66.6 | ±5.23% → ±4.79% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.1 → 305.1 | 305.4 → 305.3 | 305.4 → 305.3 | 305.5 → 305.3 | 306.4 → 305.6 | ±0.05% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.2 → 2.3 | 422.6 → 405.6 | 450.3 → 429.5 | 452.7 → 433.9 | 458.7 → 440.6 | 493.8 → 469.6 | ±1.71% → ±1.69% | 20 → 20 | -4.6% |
| geozarr bands | 3.0 → 2.3 | 57.8 → 420.9 | 457.2 → 435.0 | 436.0 → 437.9 | 462.4 → 441.5 | 478.0 → 483.4 | ±9.64% → ±1.71% | 20 → 20 | -4.9% |
| mirrored selection | 1.3 → 1.3 | 728.4 → 701.3 | 773.7 → 740.4 | 784.0 → 744.9 | 795.8 → 752.2 | 904.2 → 839.6 | ±2.96% → ±2.19% | 20 → 20 | -4.3% |

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
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **1–10 → 10** | **0 → 0** |
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
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 20 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b01/c/0/0` | 0 | 60 | 0 | 200, 206 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b03/c/0/0` | 0 | 60 | 0 | 200, 206 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/r720m/b02/c/0/0` | 0 | 60 | 0 | 200, 206 |
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
