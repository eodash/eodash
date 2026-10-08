### Benchmarks

Previous run → this run. Baseline [`2f0b70e56f38a670ef02544ad2d2d8edcc9c5843`](https://github.com/eodash/eodash/commit/2f0b70e56f38a670ef02544ad2d2d8edcc9c5843), 2026-10-07T13:20:15.990Z.

- explore item: selecting a catalog item renders its layer
- date snap: moving the date rebuilds all six collections' layers
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
| explore item | 75.7 → 106.6 | 9.3 → 6.0 | 14.3 → 9.4 | 14.0 → 9.8 | 15.2 → 10.5 | 21.7 → 14.3 | ±11.95% → ±10.59% | 20 → 20 | -34.6% |
| date snap | 95.6 → 108.3 | 7.9 → 6.5 | 10.1 → 9.6 | 10.9 → 9.4 | 12.3 → 10.0 | 15.7 → 11.4 | ±10.56% → ±6.15% | 20 → 20 | = |
| layer datetime | 94.1 → 108.1 | 8.8 → 8.3 | 10.5 → 8.6 | 11.2 → 12.3 | 12.5 → 9.1 | 19.8 → 64.0 | ±12.46% → ±57.81% | 20 → 20 | -18.5% |
| links=1 | 60.4 → 72.5 | 13.5 → 12.8 | 17.1 → 13.1 | 16.7 → 14.4 | 17.3 → 13.8 | 17.9 → 30.3 | ±3.29% → ±15.04% | 20 → 20 | -23.2% |
| links=10 | 58.0 → 74.3 | 16.8 → 13.1 | 17.2 → 13.2 | 17.2 → 13.5 | 17.4 → 13.3 | 17.9 → 14.9 | ±0.90% → ±2.15% | 20 → 20 | -23.3% |
| links=100 | 47.6 → 63.8 | 18.8 → 15.4 | 21.3 → 15.6 | 21.1 → 15.7 | 21.7 → 15.8 | 25.0 → 16.2 | ±3.49% → ±0.60% | 20 → 20 | -26.8% |
| geozarr bands | 29.0 → 34.0 | 22.1 → 17.8 | 36.3 → 30.6 | 36.7 → 31.6 | 42.4 → 38.3 | 60.4 → 46.2 | ±12.27% → ±12.41% | 20 → 20 | = |
| select indicator | 13.8 → 28.1 | 42.5 → 20.9 | 73.8 → 33.3 | 76.2 → 38.6 | 90.2 → 49.8 | 103.6 → 62.2 | ±10.38% → ±14.19% | 20 → 20 | -55.0% |
| poi selection | 18.9 → 33.1 | 36.4 → 24.2 | 59.7 → 29.5 | 55.4 → 31.2 | 64.1 → 32.1 | 73.0 → 49.5 | ±9.88% → ±9.59% | 20 → 20 | -50.5% |
| vector rendering | 13.9 → 17.9 | 53.3 → 46.7 | 83.7 → 50.4 | 76.4 → 58.9 | 91.7 → 70.1 | 107.0 → 95.5 | ±11.79% → ±12.27% | 20 → 20 | -39.7% |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 304.8 | 305.5 → 305.0 | 306.7 → 305.0 | 305.7 → 305.0 | 323.7 → 305.3 | ±0.76% → ±0.02% | 20 → 20 | -0.2% |
| geotiff rendering | 2.1 → 2.5 | 425.2 → 374.6 | 479.1 → 394.7 | 479.7 → 398.5 | 486.5 → 400.8 | 508.6 → 441.7 | ±1.73% → ±2.33% | 20 → 20 | -17.6% |
| mirrored selection | 1.0 → 1.8 | 943.6 → 530.8 | 994.2 → 552.9 | 1011.6 → 564.9 | 1043.5 → 565.7 | 1121.9 → 668.0 | ±2.43% → ±3.21% | 20 → 20 | -44.4% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| **explore item** | **1 → 1–2** | **0 → 0** | **0 → 0** |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–20 → 0–9** | **0 → 0** |
| select indicator | 7 → 7 | 1 → 1 | 0 → 0 |
| poi selection | 2 → 2 | 1 → 1 | 0 → 0 |
| vector rendering | 4 → 4 | 1 → 1 | 1123K → 1123K |
| mosaic scrub | 1 → 1 | 0 → 0 | 0 → 0 |
| geotiff rendering | 4 → 4 | 0 → 0 | 0 → 0 |
| **mirrored selection** | **2 → 2** | **6 → 6** | **338K–644K → 338K–644K** |

<details><summary>urls, totals over 20 runs</summary>

| benchmark | url | requests | fetches | bytes | status |
| --- | --- | --- | --- | --- | --- |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
|  | `/stac/catalog.json/search` | 1 | 0 | 0 | mocked |
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
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 15 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 5 | 0 | 404 |
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
