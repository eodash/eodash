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
| date snap | 88.6 → 148.5 | 7.5 → 4.5 | 11.1 → 6.9 | 12.4 → 6.9 | 14.3 → 7.1 | 20.2 → 9.2 | ±14.92% → ±6.29% | 20 → 20 | -38.0% |
| explore item | 68.8 → 98.8 | 7.1 → 8.0 | 14.4 → 9.1 | 16.8 → 11.2 | 17.6 → 11.1 | 40.3 → 27.7 | ±21.97% → ±20.96% | 20 → 20 | -36.8% |
| layer datetime | 92.0 → 111.3 | 8.9 → 8.5 | 9.5 → 8.7 | 13.0 → 9.1 | 13.0 → 8.8 | 48.5 → 12.4 | ±37.52% → ±5.92% | 20 → 20 | -8.9% |
| links=1 | 56.8 → 69.9 | 14.5 → 13.0 | 17.1 → 13.2 | 18.8 → 15.4 | 17.3 → 15.6 | 45.0 → 38.7 | ±19.00% → ±20.67% | 20 → 20 | -22.6% |
| links=10 | 57.8 → 70.8 | 16.8 → 13.3 | 17.2 → 13.5 | 17.3 → 14.2 | 17.6 → 15.5 | 18.4 → 16.3 | ±1.15% → ±3.65% | 20 → 20 | -21.5% |
| links=100 | 47.1 → 54.3 | 18.6 → 16.3 | 21.5 → 19.2 | 21.4 → 18.5 | 22.2 → 19.6 | 25.7 → 19.9 | ±4.08% → ±3.26% | 20 → 20 | = |
| geozarr bands | 28.6 → 32.4 | 22.6 → 20.6 | 39.4 → 34.7 | 37.7 → 32.6 | 42.1 → 36.6 | 54.3 → 47.2 | ±12.27% → ±10.64% | 20 → 20 | = |
| poi selection | 22.3 → 29.7 | 34.2 → 28.8 | 43.2 → 33.1 | 47.6 → 34.6 | 52.1 → 35.1 | 75.4 → 57.4 | ±12.80% → ±9.44% | 20 → 20 | -23.3% |
| select indicator | 14.7 → 19.5 | 47.6 → 29.1 | 73.6 → 53.7 | 71.5 → 56.8 | 84.4 → 69.3 | 98.0 → 90.4 | ±10.73% → ±15.03% | 20 → 20 | = |
| vector rendering | 14.2 → 17.8 | 53.5 → 46.9 | 74.2 → 52.4 | 74.6 → 58.9 | 91.7 → 70.8 | 96.5 → 86.7 | ±11.06% → ±11.07% | 20 → 20 | -29.4% |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.1 | 305.6 → 305.3 | 305.6 → 305.7 | 305.7 → 305.5 | 306.0 → 311.0 | ±0.03% → ±0.24% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.1 | 454.0 → 422.6 | 463.0 → 463.4 | 474.6 → 471.0 | 479.4 → 479.7 | 543.2 → 559.1 | ±2.49% → ±3.23% | 20 → 20 | = |
| mirrored selection | 1.0 → 1.4 | 957.8 → 676.5 | 1000.6 → 704.1 | 1014.3 → 732.2 | 1046.5 → 756.4 | 1120.8 → 905.3 | ±2.02% → ±4.24% | 20 → 20 | -29.6% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–9 → 0–13** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 18 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 10 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 9206K | 206 |

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
