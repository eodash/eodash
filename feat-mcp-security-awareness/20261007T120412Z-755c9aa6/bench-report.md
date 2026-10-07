### Benchmarks

Previous run → this run. Baseline [`33a7c279a9aa62e61a3274eb1de4af3afdca0a35`](https://github.com/eodash/eodash/commit/33a7c279a9aa62e61a3274eb1de4af3afdca0a35), 2026-10-07T12:00:33.743Z.

- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 132.9 → 104.1 | 4.2 → 3.9 | 7.6 → 10.4 | 7.8 → 10.7 | 7.9 → 12.8 | 11.5 → 18.4 | ±8.26% → ±14.88% | 20 → 20 | +36.2% |
| layer datetime | 106.4 → 91.8 | 8.4 → 8.8 | 8.7 → 10.7 | 10.8 → 13.1 | 8.8 → 12.5 | 31.5 → 49.4 | ±27.91% → ±38.03% | 20 → 20 | +22.4% |
| explore item | 81.5 → 75.7 | 8.6 → 9.6 | 11.8 → 13.7 | 13.2 → 14.1 | 13.6 → 16.1 | 28.4 → 24.7 | ±16.72% → ±13.53% | 20 → 20 | = |
| links=1 | 71.5 → 60.3 | 12.9 → 13.5 | 13.1 → 16.8 | 15.0 → 16.8 | 14.4 → 16.9 | 38.1 → 22.8 | ±20.90% → ±5.57% | 20 → 20 | +27.8% |
| links=10 | 72.9 → 58.8 | 13.1 → 14.0 | 13.3 → 17.4 | 13.8 → 17.1 | 13.8 → 17.6 | 15.4 → 17.9 | ±2.92% → ±2.84% | 20 → 20 | +30.8% |
| links=100 | 61.7 → 48.1 | 15.6 → 18.8 | 16.1 → 21.0 | 16.2 → 20.9 | 16.6 → 21.6 | 17.5 → 23.8 | ±1.62% → ±3.24% | 20 → 20 | +30.7% |
| geozarr bands | 34.3 → 24.8 | 19.6 → 24.2 | 29.9 → 43.2 | 31.5 → 42.7 | 35.6 → 49.9 | 60.8 → 59.2 | ±15.31% → ±11.12% | 20 → 20 | +44.3% |
| poi selection | 31.1 → 21.6 | 23.9 → 35.5 | 32.2 → 43.5 | 33.3 → 48.7 | 34.8 → 57.4 | 49.5 → 71.5 | ±9.31% → ±11.42% | 20 → 20 | +35.1% |
| select indicator | 22.2 → 14.5 | 25.2 → 37.8 | 51.1 → 82.6 | 51.9 → 76.4 | 68.6 → 92.6 | 86.0 → 108.2 | ±17.43% → ±13.35% | 20 → 20 | +61.5% |
| vector rendering | 18.5 → 13.1 | 45.8 → 54.7 | 49.1 → 88.2 | 56.2 → 81.6 | 57.7 → 91.9 | 85.1 → 136.0 | ±10.58% → ±12.71% | 20 → 20 | +79.6% |
| mosaic scrub | 3.3 → 3.3 | 305.0 → 305.3 | 305.3 → 305.5 | 305.3 → 305.5 | 305.4 → 305.7 | 305.7 → 306.0 | ±0.03% → ±0.03% | 20 → 20 | +0.1% |
| geotiff rendering | 2.4 → 2.1 | 383.4 → 453.4 | 396.1 → 480.1 | 413.9 → 482.4 | 410.5 → 487.0 | 532.1 → 558.8 | ±4.65% → ±2.62% | 20 → 20 | +21.2% |
| mirrored selection | 1.5 → 1.0 | 602.4 → 974.2 | 639.2 → 1023.7 | 658.4 → 1044.2 | 676.0 → 1055.8 | 820.1 → 1247.9 | ±4.08% → ±3.12% | 20 → 20 | +60.2% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–13 → 0–10** | **0 → 0** |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
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
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| links=100 | `/stac/indicators/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0100.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000012.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 34 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 17 | 0 | 404 |
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
