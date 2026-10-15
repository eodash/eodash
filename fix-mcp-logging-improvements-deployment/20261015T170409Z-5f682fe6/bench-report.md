### Benchmarks

Previous run → this run. Baseline [`75e4613f849d770bd18c18c490289cf6525cb7d6`](https://github.com/eodash/eodash/commit/75e4613f849d770bd18c18c490289cf6525cb7d6), 2026-10-13T10:12:50.134Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- geozarr bands: dragging a band rebuilds the source
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 88.6 → 126.0 | 7.5 → 5.2 | 11.1 → 7.6 | 12.4 → 8.2 | 14.3 → 8.5 | 20.2 → 12.5 | ±14.92% → ±9.68% | 20 → 20 | -31.2% |
| explore item | 68.8 → 108.2 | 7.1 → 7.3 | 14.4 → 8.8 | 16.8 → 9.6 | 17.6 → 10.9 | 40.3 → 14.0 | ±21.97% → ±10.20% | 20 → 20 | -39.2% |
| layer datetime | 92.0 → 103.3 | 8.9 → 8.8 | 9.5 → 9.1 | 13.0 → 9.9 | 13.0 → 11.0 | 48.5 → 12.8 | ±37.52% → ±6.87% | 20 → 20 | = |
| geozarr bands | 28.6 → 35.3 | 22.6 → 10.7 | 39.4 → 30.1 | 37.7 → 31.9 | 42.1 → 37.7 | 54.3 → 49.9 | ±12.27% → ±14.08% | 20 → 20 | = |
| links=1 | 56.8 → 70.8 | 14.5 → 13.0 | 17.1 → 13.3 | 18.8 → 15.1 | 17.3 → 13.8 | 45.0 → 36.8 | ±19.00% → ±19.62% | 20 → 20 | -22.3% |
| links=10 | 57.8 → 69.4 | 16.8 → 13.4 | 17.2 → 13.9 | 17.3 → 14.5 | 17.6 → 15.5 | 18.4 → 16.5 | ±1.15% → ±3.66% | 20 → 20 | -19.5% |
| links=100 | 47.1 → 54.4 | 18.6 → 16.1 | 21.5 → 18.7 | 21.4 → 18.5 | 22.2 → 19.2 | 25.7 → 19.8 | ±4.08% → ±2.73% | 20 → 20 | -12.8% |
| poi selection | 22.3 → 28.8 | 34.2 → 26.8 | 43.2 → 33.9 | 47.6 → 36.6 | 52.1 → 37.8 | 75.4 → 67.6 | ±12.80% → ±13.10% | 20 → 20 | -21.3% |
| select indicator | 14.7 → 18.3 | 47.6 → 31.7 | 73.6 → 53.4 | 71.5 → 60.4 | 84.4 → 63.9 | 98.0 → 138.4 | ±10.73% → ±19.13% | 20 → 20 | -27.4% |
| vector rendering | 14.2 → 16.9 | 53.5 → 48.0 | 74.2 → 52.1 | 74.6 → 63.6 | 91.7 → 78.3 | 96.5 → 105.5 | ±11.06% → ±13.98% | 20 → 20 | -29.8% |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.2 | 305.6 → 305.4 | 305.6 → 305.3 | 305.7 → 305.4 | 306.0 → 305.6 | ±0.03% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.4 | 454.0 → 395.9 | 463.0 → 412.2 | 474.6 → 414.5 | 479.4 → 418.8 | 543.2 → 452.6 | ±2.49% → ±1.47% | 20 → 20 | -11.0% |
| mirrored selection | 1.0 → 1.6 | 957.8 → 587.9 | 1000.6 → 629.1 | 1014.3 → 637.7 | 1046.5 → 660.4 | 1120.8 → 748.5 | ±2.02% → ±3.60% | 20 → 20 | -37.1% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–9 → 0–5** | **0 → 0** |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
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
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 3 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 12 | 0 | 404 |
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
