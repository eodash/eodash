### Benchmarks

Previous run → this run. Baseline [`51a754d9dab23ffb452e56598f729cdead4d8547`](https://github.com/eodash/eodash/commit/51a754d9dab23ffb452e56598f729cdead4d8547), 2026-10-28T08:26:58.841Z.

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
| explore item | 121.1 → 169.3 | 6.0 → 4.6 | 8.5 → 5.6 | 8.9 → 6.4 | 9.6 → 6.1 | 18.7 → 15.1 | ±16.37% → ±18.97% | 20 → 20 | -34.1% |
| date snap | 93.0 → 112.3 | 7.6 → 4.9 | 10.7 → 9.1 | 11.4 → 9.5 | 12.5 → 9.5 | 20.3 → 18.7 | ±12.87% → ±14.28% | 20 → 20 | = |
| layer datetime | 100.7 → 106.5 | 8.7 → 8.7 | 9.1 → 8.9 | 10.2 → 9.5 | 12.0 → 9.4 | 12.8 → 11.8 | ±7.48% → ±5.70% | 20 → 20 | = |
| links=1 | 62.4 → 68.5 | 13.4 → 13.2 | 16.9 → 13.5 | 16.2 → 15.5 | 17.2 → 15.5 | 18.1 → 34.4 | ±4.77% → ±16.89% | 20 → 20 | = |
| links=10 | 64.3 → 67.2 | 13.9 → 13.4 | 15.4 → 13.8 | 15.7 → 15.4 | 17.3 → 15.9 | 17.7 → 28.5 | ±4.57% → ±11.93% | 20 → 20 | -10.4% |
| links=100 | 51.5 → 57.0 | 17.2 → 15.2 | 19.1 → 18.0 | 19.6 → 17.7 | 21.0 → 18.4 | 24.4 → 20.2 | ±4.96% → ±3.90% | 20 → 20 | = |
| poi selection | 17.8 → 26.6 | 37.5 → 30.1 | 64.2 → 34.6 | 60.8 → 40.0 | 69.7 → 43.4 | 89.1 → 67.8 | ±12.91% → ±13.43% | 20 → 20 | -46.2% |
| select indicator | 13.2 → 17.9 | 54.3 → 31.3 | 82.3 → 58.3 | 79.8 → 59.4 | 92.9 → 72.2 | 108.0 → 85.8 | ±10.39% → ±11.50% | 20 → 20 | -29.2% |
| geozarr bands | 22.2 → 22.9 | 23.2 → 39.3 | 48.5 → 43.0 | 60.3 → 43.8 | 90.1 → 43.1 | 98.5 → 53.6 | ±23.53% → ±3.66% | 20 → 20 | = |
| vector rendering | 14.9 → 17.3 | 59.6 → 47.6 | 65.4 → 57.6 | 68.0 → 59.7 | 68.1 → 62.6 | 100.6 → 86.2 | ±7.14% → ±9.07% | 20 → 20 | -11.8% |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.1 | 305.4 → 305.4 | 305.4 → 305.4 | 305.5 → 305.5 | 305.8 → 306.1 | ±0.03% → ±0.04% | 20 → 20 | = |
| geotiff rendering | 2.2 → 2.4 | 419.9 → 395.8 | 462.0 → 409.7 | 461.4 → 416.1 | 473.7 → 412.6 | 526.0 → 510.1 | ±3.02% → ±3.11% | 20 → 20 | -11.3% |
| mirrored selection | 1.0 → 1.5 | 1002.7 → 612.5 | 1043.3 → 652.1 | 1049.0 → 664.1 | 1070.7 → 666.1 | 1129.6 → 809.9 | ±1.55% → ±3.84% | 20 → 20 | -37.5% |

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
| **geozarr bands** | **0 → 0** | **0–5 → 0–1** | **0 → 0** |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 12264K | 206 |

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
