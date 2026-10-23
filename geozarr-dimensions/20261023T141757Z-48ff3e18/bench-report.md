### Benchmarks

Previous run → this run. Baseline [`00be46d9aa84b7497bf6c84f2b1baf04e71cf47f`](https://github.com/eodash/eodash/commit/00be46d9aa84b7497bf6c84f2b1baf04e71cf47f), 2026-10-23T14:03:22.965Z.

- date snap: moving the date rebuilds all six collections' layers
- explore item: selecting a catalog item renders its layer
- layer datetime: changing one layer's date replaces only that layer
- links=1, links=10, links=100: scales with the number of layers a collection contributes
- poi selection: selecting a POI indicator builds the observation points layer
- select indicator: loads a multi-collection indicator and its widgets
- vector rendering, geotiff rendering: draws a styled layer of each source type
- mosaic scrub: scrubbing the time range rebuilds the mosaic layer
- mirrored selection: selecting a mirrored indicator decodes its items and builds a layer

| benchmark | hz | min | p50 | mean | p75 | p99 | rme | samples | median Δ |
| --- | --- | --- | --- | --- | --- | --- | --- | --- | --- |
| date snap | 93.0 → 129.1 | 8.1 → 3.1 | 11.0 → 7.8 | 11.3 → 8.6 | 12.7 → 8.8 | 17.8 → 17.9 | ±10.92% → ±16.72% | 20 → 20 | -29.2% |
| explore item | 69.6 → 167.6 | 9.5 → 4.8 | 14.4 → 6.0 | 15.3 → 6.1 | 16.7 → 6.8 | 27.1 → 8.5 | ±13.14% → ±8.44% | 20 → 20 | -58.7% |
| layer datetime | 90.9 → 113.1 | 8.9 → 8.4 | 11.5 → 8.7 | 13.2 → 8.9 | 12.5 → 8.7 | 50.4 → 11.1 | ±38.66% → ±3.49% | 20 → 20 | -24.7% |
| links=1 | 58.3 → 69.6 | 14.7 → 13.1 | 17.3 → 13.2 | 17.2 → 15.9 | 17.5 → 14.6 | 17.9 → 47.3 | ±1.87% → ±26.76% | 20 → 20 | -23.9% |
| links=10 | 58.2 → 70.0 | 14.7 → 13.5 | 17.5 → 13.7 | 17.2 → 14.4 | 17.6 → 15.1 | 18.4 → 17.1 | ±2.33% → ±4.06% | 20 → 20 | -21.5% |
| links=100 | 48.2 → 59.6 | 18.5 → 15.5 | 21.0 → 16.3 | 20.8 → 16.9 | 21.7 → 18.1 | 23.7 → 19.4 | ±3.08% → ±3.88% | 20 → 20 | -22.1% |
| poi selection | 20.1 → 25.9 | 36.4 → 27.7 | 48.3 → 36.3 | 52.9 → 42.7 | 63.8 → 48.1 | 84.5 → 88.8 | ±12.57% → ±18.07% | 20 → 20 | -24.8% |
| select indicator | 15.9 → 19.4 | 39.0 → 31.5 | 67.0 → 54.7 | 67.3 → 56.8 | 85.9 → 64.6 | 90.5 → 106.7 | ±12.16% → ±15.85% | 20 → 20 | = |
| vector rendering | 14.0 → 17.6 | 53.2 → 46.2 | 74.2 → 58.1 | 78.6 → 58.0 | 91.5 → 61.8 | 143.3 → 81.2 | ±15.81% → ±7.78% | 20 → 20 | = |
| mosaic scrub | 3.3 → 3.3 | 305.3 → 304.9 | 305.5 → 305.1 | 305.6 → 305.1 | 305.6 → 305.2 | 306.1 → 305.5 | ±0.03% → ±0.02% | 20 → 20 | -0.1% |
| geotiff rendering | 2.1 → 2.3 | 449.6 → 407.6 | 461.8 → 428.5 | 468.9 → 431.5 | 472.5 → 435.9 | 529.2 → 457.5 | ±2.09% → ±1.23% | 20 → 20 | -7.2% |
| mirrored selection | 1.0 → 1.2 | 957.9 → 793.0 | 979.5 → 828.7 | 1009.0 → 837.3 | 1035.2 → 844.7 | 1207.7 → 966.4 | ±3.16% → ±2.50% | 20 → 20 | -15.4% |

Per run. A range means the runs differ. **Bold** where they do, or where this run did more than the baseline.

| benchmark | requests | fetches | bytes |
| --- | --- | --- | --- |
| date snap | 6 → 6 | 0 → 0 | 0 → 0 |
| explore item | 1 → 0 | 0 → 0 | 0 → 0 |
| layer datetime | 1 → 1 | 0 → 0 | 0 → 0 |
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
| explore item | none | | | | |
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
