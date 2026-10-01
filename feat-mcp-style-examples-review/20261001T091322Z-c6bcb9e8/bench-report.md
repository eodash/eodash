### Benchmarks

Previous run → this run. Baseline [`43546bbbb08c74a5fc511718631e01e32ccc8d62`](https://github.com/eodash/eodash/commit/43546bbbb08c74a5fc511718631e01e32ccc8d62), 2026-10-01T08:22:17.884Z.

- date snap: moving the date rebuilds all six collections' layers
- layer datetime: changing one layer's date replaces only that layer
- explore item: selecting a catalog item renders its layer
- links=10, links=1, links=100: scales with the number of layers a collection contributes
- geozarr bands: dragging a band rebuilds the source
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 116.4 → 95.6 | 3.7 → 6.2 | 9.2 → 10.4 | 9.4 → 11.2 | 9.7 → 13.2 | 19.1 → 18.2 | ±15.71% → ±13.30% | 20 → 20 | +13.6% |
| layer datetime | 110.0 → 97.2 | 8.5 → 8.8 | 8.6 → 9.9 | 13.2 → 10.5 | 8.7 → 12.0 | 81.9 → 13.4 | ±71.54% → ±7.23% | 20 → 20 | +15.1% |
| explore item | 91.5 → 70.5 | 8.2 → 9.6 | 11.3 → 13.8 | 11.6 → 15.8 | 12.8 → 16.5 | 18.6 → 32.1 | ±11.95% → ±18.79% | 20 → 20 | +22.7% |
| links=10 | 70.2 → 62.4 | 13.4 → 14.0 | 13.6 → 17.0 | 14.3 → 16.2 | 15.3 → 17.4 | 16.5 → 18.1 | ±3.56% → ±4.50% | 20 → 20 | +25.4% |
| geozarr bands | 31.4 → 32.9 | 20.4 → 14.1 | 34.5 → 37.0 | 34.2 → 34.7 | 42.4 → 41.3 | 44.8 → 55.4 | ±11.62% → ±16.32% | 20 → 20 | = |
| links=1 | 68.9 → 58.9 | 13.1 → 15.0 | 13.3 → 17.1 | 16.1 → 17.0 | 15.5 → 17.2 | 46.6 → 18.0 | ±25.99% → ±1.69% | 20 → 20 | +29.1% |
| links=100 | 54.1 → 47.0 | 16.8 → 18.9 | 19.0 → 21.4 | 18.6 → 21.3 | 19.7 → 21.8 | 20.3 → 23.8 | ±3.38% → ±2.74% | 20 → 20 | +13.2% |
| poi selection | 27.2 → 22.8 | 26.8 → 34.6 | 35.1 → 41.9 | 39.3 → 46.0 | 46.3 → 52.9 | 61.9 → 73.0 | ±13.21% → ±11.19% | 20 → 20 | = |
| select indicator | 18.7 → 15.7 | 32.2 → 38.8 | 54.6 → 62.0 | 57.4 → 67.9 | 69.5 → 82.8 | 92.9 → 98.4 | ±12.98% → ±12.28% | 20 → 20 | = |
| vector rendering | 17.3 → 14.0 | 48.0 → 53.3 | 54.1 → 79.9 | 60.9 → 76.5 | 76.0 → 91.5 | 89.8 → 128.6 | ±11.53% → ±13.39% | 20 → 20 | +47.9% |
| mosaic scrub | 3.3 → 3.3 | 304.9 → 305.2 | 305.1 → 305.5 | 305.2 → 305.5 | 305.2 → 305.7 | 305.5 → 306.0 | ±0.02% → ±0.03% | 20 → 20 | +0.1% |
| geotiff rendering | 2.2 → 2.1 | 426.6 → 448.2 | 447.4 → 473.1 | 463.8 → 478.9 | 480.4 → 490.6 | 580.7 → 529.4 | ±4.08% → ±2.37% | 20 → 20 | = |
| mirrored selection | 1.2 → 1.0 | 745.5 → 953.6 | 781.2 → 995.6 | 804.9 → 1013.3 | 833.1 → 1049.0 | 967.5 → 1154.2 | ±3.74% → ±2.81% | 20 → 20 | +27.4% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–8 → 0–17** | **0 → 0** |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
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
| layer datetime | `/stac/items/item-000003.json` | 20 | 0 | 0 | mocked |
| explore item | `/stac/collections/collection-a/aggregations` | 20 | 0 | 0 | mocked |
| links=10 | `/stac/indicators/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0010.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000009.json` | 20 | 0 | 0 | mocked |
| geozarr bands | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/zarr.json` | 0 | 38 | 0 | 200 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 12 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 21 | 0 | 404 |
| links=1 | `/stac/indicators/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/collections/sub-0001.json` | 20 | 0 | 0 | mocked |
|  | `/stac/items/item-000006.json` | 20 | 0 | 0 | mocked |
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
