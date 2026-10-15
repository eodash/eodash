### Benchmarks

Previous run → this run. Baseline [`75e4613f849d770bd18c18c490289cf6525cb7d6`](https://github.com/eodash/eodash/commit/75e4613f849d770bd18c18c490289cf6525cb7d6), 2026-10-13T10:12:50.134Z.

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
| explore item | 68.8 → 138.1 | 7.1 → 5.2 | 14.4 → 7.1 | 16.8 → 8.4 | 17.6 → 8.4 | 40.3 → 21.7 | ±21.97% → ±24.97% | 20 → 20 | -51.0% |
| date snap | 88.6 → 103.7 | 7.5 → 5.5 | 11.1 → 10.4 | 12.4 → 10.3 | 14.3 → 12.5 | 20.2 → 14.9 | ±14.92% → ±11.91% | 20 → 20 | = |
| layer datetime | 92.0 → 98.4 | 8.9 → 8.7 | 9.5 → 8.9 | 13.0 → 12.1 | 13.0 → 12.6 | 48.5 → 44.0 | ±37.52% → ±36.26% | 20 → 20 | -6.3% |
| links=1 | 56.8 → 64.6 | 14.5 → 13.3 | 17.1 → 16.5 | 18.8 → 15.7 | 17.3 → 17.0 | 45.0 → 18.1 | ±19.00% → ±5.37% | 20 → 20 | -3.2% |
| links=10 | 57.8 → 69.0 | 16.8 → 13.9 | 17.2 → 14.0 | 17.3 → 14.5 | 17.6 → 14.8 | 18.4 → 17.3 | ±1.15% → ±3.45% | 20 → 20 | -18.6% |
| links=100 | 47.1 → 51.3 | 18.6 → 18.5 | 21.5 → 19.1 | 21.4 → 19.5 | 22.2 → 19.7 | 25.7 → 22.9 | ±4.08% → ±2.56% | 20 → 20 | = |
| geozarr bands | 28.6 → 30.8 | 22.6 → 21.5 | 39.4 → 37.1 | 37.7 → 34.7 | 42.1 → 39.1 | 54.3 → 50.6 | ±12.27% → ±11.78% | 20 → 20 | = |
| poi selection | 22.3 → 17.6 | 34.2 → 34.8 | 43.2 → 63.8 | 47.6 → 61.4 | 52.1 → 71.8 | 75.4 → 85.9 | ±12.80% → ±12.22% | 20 → 20 | = |
| select indicator | 14.7 → 15.4 | 47.6 → 46.1 | 73.6 → 64.1 | 71.5 → 68.0 | 84.4 → 82.7 | 98.0 → 89.7 | ±10.73% → ±10.45% | 20 → 20 | = |
| vector rendering | 14.2 → 13.8 | 53.5 → 53.7 | 74.2 → 85.0 | 74.6 → 77.7 | 91.7 → 91.3 | 96.5 → 129.7 | ±11.06% → ±13.24% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 305.0 | 305.6 → 305.3 | 305.6 → 305.4 | 305.7 → 305.4 | 306.0 → 305.7 | ±0.03% → ±0.03% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.1 | 454.0 → 446.7 | 463.0 → 478.1 | 474.6 → 485.3 | 479.4 → 484.9 | 543.2 → 596.5 | ±2.49% → ±3.65% | 20 → 20 | = |
| mirrored selection | 1.0 → 0.9 | 957.8 → 1012.9 | 1000.6 → 1048.6 | 1014.3 → 1066.2 | 1046.5 → 1080.2 | 1120.8 → 1183.0 | ±2.02% → ±2.15% | 20 → 20 | = |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| explore item | 1 → 0 | 0 → 0 | 0 → 0 |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
| links=1 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=10 | 3 → 3 | 0 → 0 | 0 → 0 |
| links=100 | 3 → 3 | 0 → 0 | 0 → 0 |
| **geozarr bands** | **0 → 0** | **0–9 → 0–3** | **0 → 0** |
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
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zattrs` | 0 | 12 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/measurements/reflectance/.zgroup` | 0 | 11 | 0 | 404 |
|  | `/esa-zarr-sentinel-explorer-fra/tests-output/sentinel-2-l2a/S2B_MSIL2A_20260917T142959_N0512_R139_T26WMD_20260917T152722.zarr/time/.zattrs` | 0 | 1 | 0 | 404 |
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
|  | `/tests/support/assets/mirror.parquet` | 0 | 100 | 9818K | 206 |

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
