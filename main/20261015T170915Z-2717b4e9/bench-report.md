### Benchmarks

Previous run → this run. Baseline [`75e4613f849d770bd18c18c490289cf6525cb7d6`](https://github.com/eodash/eodash/commit/75e4613f849d770bd18c18c490289cf6525cb7d6), 2026-10-13T10:12:50.134Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
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
| date snap | 88.6 → 123.2 | 7.5 → 2.9 | 11.1 → 8.7 | 12.4 → 9.1 | 14.3 → 9.8 | 20.2 → 16.8 | ±14.92% → ±15.29% | 20 → 20 | = |
| explore item | 68.8 → 86.8 | 7.1 → 8.4 | 14.4 → 11.2 | 16.8 → 13.3 | 17.6 → 13.7 | 40.3 → 34.9 | ±21.97% → ±24.31% | 20 → 20 | -22.2% |
| layer datetime | 92.0 → 97.1 | 8.9 → 8.7 | 9.5 → 8.9 | 13.0 → 12.9 | 13.0 → 12.2 | 48.5 → 55.8 | ±37.52% → ±45.45% | 20 → 20 | -6.8% |
| links=1 | 56.8 → 64.0 | 14.5 → 13.1 | 17.1 → 16.0 | 18.8 → 16.7 | 17.3 → 16.7 | 45.0 → 39.1 | ±19.00% → ±18.62% | 20 → 20 | -5.9% |
| links=10 | 57.8 → 69.9 | 16.8 → 13.5 | 17.2 → 13.8 | 17.3 → 14.4 | 17.6 → 15.4 | 18.4 → 16.9 | ±1.15% → ±3.54% | 20 → 20 | -20.1% |
| links=100 | 47.1 → 53.5 | 18.6 → 16.9 | 21.5 → 18.9 | 21.4 → 18.8 | 22.2 → 19.9 | 25.7 → 21.4 | ±4.08% → ±3.41% | 20 → 20 | -11.9% |
| geozarr bands | 28.6 → 32.4 | 22.6 → 19.9 | 39.4 → 32.7 | 37.7 → 32.8 | 42.1 → 38.6 | 54.3 → 44.8 | ±12.27% → ±11.23% | 20 → 20 | = |
| poi selection | 22.3 → 25.8 | 34.2 → 28.4 | 43.2 → 38.1 | 47.6 → 39.9 | 52.1 → 40.7 | 75.4 → 62.5 | ±12.80% → ±9.29% | 20 → 20 | = |
| select indicator | 14.7 → 15.5 | 47.6 → 45.9 | 73.6 → 69.6 | 71.5 → 67.3 | 84.4 → 73.7 | 98.0 → 95.4 | ±10.73% → ±10.03% | 20 → 20 | = |
| vector rendering | 14.2 → 15.8 | 53.5 → 47.8 | 74.2 → 54.8 | 74.6 → 70.0 | 91.7 → 95.4 | 96.5 → 100.0 | ±11.06% → ±15.28% | 20 → 20 | -26.2% |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.1 | 305.6 → 305.4 | 305.6 → 305.3 | 305.7 → 305.4 | 306.0 → 305.6 | ±0.03% → ±0.02% | 20 → 20 | = |
| geotiff rendering | 2.1 → 2.2 | 454.0 → 428.0 | 463.0 → 439.9 | 474.6 → 447.9 | 479.4 → 448.3 | 543.2 → 513.3 | ±2.49% → ±2.35% | 20 → 20 | -5.0% |
| mirrored selection | 1.0 → 1.2 | 957.8 → 756.9 | 1000.6 → 794.7 | 1014.3 → 814.9 | 1046.5 → 832.2 | 1120.8 → 971.4 | ±2.02% → ±3.39% | 20 → 20 | -20.6% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| **explore item** | **1 → 1–2** | **0 → 0** | **0 → 0** |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–9 → 0–11** | **0 → 0** |
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
|  | `/stac/catalog.json/search` | 1 | 0 | 0 | mocked |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 9 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 12 | 0 | 404 |
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
