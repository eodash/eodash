### Benchmarks

Previous run → this run. Baseline [`00be46d9aa84b7497bf6c84f2b1baf04e71cf47f`](https://github.com/eodash/eodash/commit/00be46d9aa84b7497bf6c84f2b1baf04e71cf47f), 2026-10-23T14:03:22.965Z.

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
| explore item | 69.6 → 212.1 | 9.5 → 3.1 | 14.4 → 4.9 | 15.3 → 5.0 | 16.7 → 6.0 | 27.1 → 7.4 | ±13.14% → ±11.95% | 20 → 20 | -66.0% |
| date snap | 93.0 → 143.3 | 8.1 → 6.5 | 11.0 → 7.0 | 11.3 → 7.0 | 12.7 → 7.2 | 17.8 → 7.6 | ±10.92% → ±1.80% | 20 → 20 | -36.1% |
| layer datetime | 90.9 → 110.4 | 8.9 → 8.4 | 11.5 → 8.6 | 13.2 → 9.2 | 12.5 → 9.0 | 50.4 → 12.0 | ±38.66% → ±5.65% | 20 → 20 | -25.5% |
| links=1 | 58.3 → 72.2 | 14.7 → 13.0 | 17.3 → 13.3 | 17.2 → 14.7 | 17.5 → 13.6 | 17.9 → 34.7 | ±1.87% → ±18.41% | 20 → 20 | -23.6% |
| links=10 | 58.2 → 70.3 | 14.7 → 13.1 | 17.5 → 13.5 | 17.2 → 14.4 | 17.6 → 15.3 | 18.4 → 19.8 | ±2.33% → ±5.89% | 20 → 20 | -22.6% |
| links=100 | 48.2 → 61.9 | 18.5 → 14.8 | 21.0 → 15.8 | 20.8 → 16.3 | 21.7 → 16.8 | 23.7 → 20.2 | ±3.08% → ±4.20% | 20 → 20 | -24.8% |
| geozarr bands | 29.6 → 24.2 | 21.6 → 25.8 | 38.4 → 43.4 | 37.3 → 44.3 | 42.7 → 46.3 | 64.5 → 84.8 | ±15.24% → ±14.18% | 20 → 20 | = |
| poi selection | 20.1 → 29.2 | 36.4 → 26.7 | 48.3 → 32.1 | 52.9 → 36.2 | 63.8 → 37.4 | 84.5 → 61.6 | ±12.57% → ±12.95% | 20 → 20 | -33.4% |
| select indicator | 15.9 → 18.2 | 39.0 → 28.0 | 67.0 → 62.6 | 67.3 → 60.6 | 85.9 → 73.9 | 90.5 → 88.7 | ±12.16% → ±13.16% | 20 → 20 | = |
| vector rendering | 14.0 → 18.5 | 53.2 → 44.5 | 74.2 → 49.9 | 78.6 → 55.8 | 91.5 → 61.4 | 143.3 → 86.1 | ±15.81% → ±9.31% | 20 → 20 | -32.7% |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.0 | 305.5 → 305.2 | 305.6 → 305.2 | 305.6 → 305.2 | 306.1 → 305.4 | ±0.03% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.5 | 449.6 → 379.1 | 461.8 → 397.1 | 468.9 → 399.8 | 472.5 → 410.5 | 529.2 → 416.7 | ±2.09% → ±1.37% | 20 → 20 | -14.0% |
| mirrored selection | 1.0 → 1.5 | 957.9 → 624.0 | 979.5 → 652.5 | 1009.0 → 671.3 | 1035.2 → 672.6 | 1207.7 → 839.4 | ±3.16% → ±3.73% | 20 → 20 | -33.4% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 1 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–23 → 0–2** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/zarr.json` | 0 | 1 | 0 | 200 |
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
