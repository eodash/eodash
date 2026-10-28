### Benchmarks

Previous run → this run. Baseline [`51a754d9dab23ffb452e56598f729cdead4d8547`](https://github.com/eodash/eodash/commit/51a754d9dab23ffb452e56598f729cdead4d8547), 2026-10-28T08:26:58.841Z.

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
| explore item | 121.1 → 116.1 | 6.0 → 6.8 | 8.5 → 8.1 | 8.9 → 9.2 | 9.6 → 10.6 | 18.7 → 17.4 | ±16.37% → ±14.22% | 20 → 20 | = |
| date snap | 93.0 → 88.3 | 7.6 → 7.7 | 10.7 → 12.0 | 11.4 → 12.4 | 12.5 → 14.4 | 20.3 → 22.9 | ±12.87% → ±15.33% | 20 → 20 | = |
| layer datetime | 100.7 → 90.1 | 8.7 → 8.9 | 9.1 → 11.1 | 10.2 → 13.4 | 12.0 → 12.6 | 12.8 → 52.1 | ±7.48% → ±39.44% | 20 → 20 | = |
| links=1 | 62.4 → 57.7 | 13.4 → 16.4 | 16.9 → 17.1 | 16.2 → 17.4 | 17.2 → 17.6 | 18.1 → 18.5 | ±4.77% → ±1.51% | 20 → 20 | = |
| links=10 | 64.3 → 56.7 | 13.9 → 16.5 | 15.4 → 17.6 | 15.7 → 17.6 | 17.3 → 17.8 | 17.7 → 18.5 | ±4.57% → ±1.24% | 20 → 20 | +14.6% |
| links=100 | 51.5 → 51.6 | 17.2 → 17.7 | 19.1 → 19.0 | 19.6 → 19.5 | 21.0 → 19.6 | 24.4 → 25.1 | ±4.96% → ±4.34% | 20 → 20 | = |
| geozarr bands | 22.2 → 21.7 | 23.2 → 34.7 | 48.5 → 46.9 | 60.3 → 46.6 | 90.1 → 48.0 | 98.5 → 55.1 | ±23.53% → ±4.97% | 20 → 20 | = |
| poi selection | 17.8 → 15.3 | 37.5 → 39.9 | 64.2 → 71.5 | 60.8 → 70.3 | 69.7 → 76.8 | 89.1 → 132.6 | ±12.91% → ±14.44% | 20 → 20 | = |
| select indicator | 13.2 → 11.0 | 54.3 → 61.9 | 82.3 → 100.5 | 79.8 → 95.7 | 92.9 → 109.7 | 108.0 → 126.0 | ±10.39% → ±10.02% | 20 → 20 | +22.1% |
| vector rendering | 14.9 → 14.0 | 59.6 → 61.9 | 65.4 → 69.7 | 68.0 → 73.1 | 68.1 → 75.8 | 100.6 → 106.5 | ±7.14% → ±8.11% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.2 → 305.3 | 305.4 → 305.5 | 305.4 → 305.5 | 305.5 → 305.6 | 305.8 → 305.8 | ±0.03% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.2 → 2.1 | 419.9 → 448.0 | 462.0 → 476.8 | 461.4 → 480.1 | 473.7 → 481.7 | 526.0 → 542.4 | ±3.02% → ±2.35% | 20 → 20 | = |
| mirrored selection | 1.0 → 0.9 | 1002.7 → 1020.2 | 1043.3 → 1050.5 | 1049.0 → 1063.6 | 1070.7 → 1076.5 | 1129.6 → 1168.9 | ±1.55% → ±1.71% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 0 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–5 → 0–1** | **0 → 0** |
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
