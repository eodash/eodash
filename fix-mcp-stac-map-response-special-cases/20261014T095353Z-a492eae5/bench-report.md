### Benchmarks

Previous run → this run. Baseline [`75e4613f849d770bd18c18c490289cf6525cb7d6`](https://github.com/eodash/eodash/commit/75e4613f849d770bd18c18c490289cf6525cb7d6), 2026-10-13T10:12:50.134Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- select indicator: loads a multi-collection indicator and its widgets
- poi selection: selecting a POI indicator builds the observation points layer
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 88.6 → 154.1 | 7.5 → 3.4 | 11.1 → 6.7 | 12.4 → 6.7 | 14.3 → 7.1 | 20.2 → 9.6 | ±14.92% → ±8.10% | 20 → 20 | -39.4% |
| explore item | 68.8 → 82.9 | 7.1 → 5.6 | 14.4 → 12.5 | 16.8 → 13.2 | 17.6 → 14.9 | 40.3 → 21.0 | ±21.97% → ±13.74% | 20 → 20 | = |
| layer datetime | 92.0 → 107.8 | 8.9 → 8.5 | 9.5 → 8.7 | 13.0 → 10.1 | 13.0 → 9.0 | 48.5 → 27.0 | ±37.52% → ±22.57% | 20 → 20 | -8.9% |
| links=1 | 56.8 → 73.1 | 14.5 → 13.0 | 17.1 → 13.3 | 18.8 → 13.7 | 17.3 → 13.6 | 45.0 → 16.1 | ±19.00% → ±3.61% | 20 → 20 | -22.3% |
| links=10 | 57.8 → 67.3 | 16.8 → 13.4 | 17.2 → 14.9 | 17.3 → 15.0 | 17.6 → 16.3 | 18.4 → 17.4 | ±1.15% → ±4.35% | 20 → 20 | -13.1% |
| links=100 | 47.1 → 54.2 | 18.6 → 16.9 | 21.5 → 18.9 | 21.4 → 18.5 | 22.2 → 19.4 | 25.7 → 20.2 | ±4.08% → ±2.93% | 20 → 20 | -12.1% |
| geozarr bands | 28.6 → 30.7 | 22.6 → 19.5 | 39.4 → 36.0 | 37.7 → 34.4 | 42.1 → 39.3 | 54.3 → 45.8 | ±12.27% → ±10.22% | 20 → 20 | = |
| select indicator | 14.7 → 20.0 | 47.6 → 27.6 | 73.6 → 51.4 | 71.5 → 56.0 | 84.4 → 71.8 | 98.0 → 91.1 | ±10.73% → ±16.41% | 20 → 20 | -30.2% |
| poi selection | 22.3 → 29.7 | 34.2 → 29.3 | 43.2 → 32.6 | 47.6 → 34.4 | 52.1 → 34.8 | 75.4 → 46.6 | ±12.80% → ±7.20% | 20 → 20 | -24.3% |
| vector rendering | 14.2 → 16.1 | 53.5 → 47.8 | 74.2 → 57.3 | 74.6 → 66.6 | 91.7 → 79.3 | 96.5 → 104.4 | ±11.06% → ±13.02% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.2 | 305.6 → 305.4 | 305.6 → 305.4 | 305.7 → 305.5 | 306.0 → 305.8 | ±0.03% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.1 | 454.0 → 430.6 | 463.0 → 474.4 | 474.6 → 480.8 | 479.4 → 489.9 | 543.2 → 598.7 | ±2.49% → ±4.25% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.3 | 957.8 → 690.2 | 1000.6 → 752.6 | 1014.3 → 763.3 | 1046.5 → 804.5 | 1120.8 → 869.1 | ±2.02% → ±3.24% | 20 → 20 | -24.8% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–9 → 0–11** | **0 → 0** |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
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
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
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
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 20 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 7 | 0 | 404 |
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
