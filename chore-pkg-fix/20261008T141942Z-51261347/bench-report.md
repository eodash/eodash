### Benchmarks

Previous run → this run. Baseline [`72fb0f5f855ea27d7a5c9ebf829ec76e991dc99a`](https://github.com/eodash/eodash/commit/72fb0f5f855ea27d7a5c9ebf829ec76e991dc99a), 2026-10-08T14:11:23.074Z.

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
| date snap | 91.6 → 124.2 | 7.9 → 3.2 | 11.3 → 8.8 | 11.6 → 8.6 | 13.0 → 9.1 | 18.4 → 11.8 | ±12.12% → ±8.90% | 20 → 20 | = |
| explore item | 64.4 → 89.5 | 10.0 → 8.1 | 16.1 → 10.9 | 16.3 → 13.2 | 17.5 → 13.3 | 23.4 → 39.2 | ±10.59% → ±28.43% | 20 → 20 | -32.4% |
| layer datetime | 91.3 → 97.1 | 8.9 → 8.5 | 11.1 → 8.8 | 13.0 → 14.5 | 12.4 → 11.2 | 47.1 → 76.7 | ±36.34% → ±57.67% | 20 → 20 | -19.9% |
| links=1 | 57.6 → 71.4 | 16.2 → 12.9 | 17.1 → 13.3 | 17.5 → 14.2 | 17.4 → 14.8 | 22.7 → 19.9 | ±4.14% → ±6.10% | 20 → 20 | -22.2% |
| links=10 | 57.8 → 71.5 | 16.3 → 13.2 | 17.4 → 13.6 | 17.3 → 14.0 | 17.5 → 14.8 | 18.0 → 15.8 | ±0.99% → ±3.00% | 20 → 20 | -21.9% |
| links=100 | 47.5 → 59.8 | 19.1 → 15.8 | 21.1 → 16.1 | 21.1 → 16.8 | 21.8 → 18.0 | 24.5 → 18.5 | ±3.24% → ±3.10% | 20 → 20 | -23.7% |
| geozarr bands | 28.9 → 29.7 | 23.3 → 20.9 | 40.1 → 33.4 | 37.9 → 35.7 | 46.4 → 43.1 | 57.9 → 48.3 | ±14.13% → ±11.10% | 20 → 20 | = |
| poi selection | 16.4 → 26.8 | 41.4 → 25.4 | 65.4 → 34.6 | 65.4 → 39.4 | 77.6 → 46.6 | 110.0 → 56.4 | ±13.26% → ±11.65% | 20 → 20 | -47.1% |
| select indicator | 14.3 → 20.4 | 46.9 → 28.2 | 72.6 → 52.3 | 73.4 → 52.2 | 84.2 → 61.4 | 102.8 → 69.8 | ±10.47% → ±10.97% | 20 → 20 | -27.9% |
| vector rendering | 13.8 → 16.4 | 55.2 → 47.3 | 86.0 → 56.8 | 76.9 → 63.8 | 90.1 → 75.9 | 108.7 → 92.1 | ±11.41% → ±10.61% | 20 → 20 | -34.0% |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.1 | 305.6 → 305.3 | 305.6 → 305.4 | 305.7 → 305.4 | 305.9 → 305.8 | ±0.02% → ±0.03% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.4 | 427.5 → 394.7 | 464.5 → 411.0 | 474.2 → 420.3 | 476.1 → 432.2 | 559.6 → 480.4 | ±3.19% → ±2.54% | 20 → 20 | -11.5% |
| mirrored selection | 1.0 → 1.5 | 955.5 → 605.1 | 995.4 → 643.3 | 1022.2 → 657.8 | 1022.3 → 677.8 | 1263.6 → 807.4 | ±3.64% → ±3.85% | 20 → 20 | -35.4% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 1 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–14 → 0–11** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 2 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 25 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 10123K | 206 |

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
