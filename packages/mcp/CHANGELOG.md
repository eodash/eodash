# Changelog

## [5.0.0](https://github.com/eodash/eodash/compare/mcp-v1.1.0...mcp-v5.0.0) (2026-10-28)


### Features

* handling of response.contents for VEGA provided by "Whatever Origin" proxy ([#456](https://github.com/eodash/eodash/issues/456)) ([75e4613](https://github.com/eodash/eodash/commit/75e4613f849d770bd18c18c490289cf6525cb7d6))
* Initialize MCP server, first tools list_widgets, get_widget_details, get_custom_widget_guide, get_eodash_architecture ([#448](https://github.com/eodash/eodash/issues/448)) ([8a50b0c](https://github.com/eodash/eodash/commit/8a50b0c6773b6dcefad0a76cd3864a4822c682c5))
* mcp add curated examples at find_examples  for vega charts, collection configs, jsonform, process body and others ([#481](https://github.com/eodash/eodash/issues/481)) ([8fcfcaf](https://github.com/eodash/eodash/commit/8fcfcaf23d3f44214f40f998182bb865ca088289))
* mcp add find_examples, validate_catalog_config tools ([#459](https://github.com/eodash/eodash/issues/459)) ([b42732f](https://github.com/eodash/eodash/commit/b42732f2f6e69aa26a12595e677ff7e37997b8f4))
* mcp add generate_map_from_stac tool to expose eodash/stac package via mcp ([#484](https://github.com/eodash/eodash/issues/484)) ([97b04d9](https://github.com/eodash/eodash/commit/97b04d93c274a45c21832ec6c20ff009137a39d4))
* mcp consider security and misuse, adds a docker building and logging ([#488](https://github.com/eodash/eodash/issues/488)) ([e3e70ca](https://github.com/eodash/eodash/commit/e3e70cad52ad367cb999c58df4a75152ab11b671))
* Render GeoZarr dimensions ([#498](https://github.com/eodash/eodash/issues/498)) ([e880fd7](https://github.com/eodash/eodash/commit/e880fd7aa750ebb66202660e5accf4435a08b5d7))


### Bug Fixes

* mcp prometheus /metrics, logging sanitation and improvements ([#494](https://github.com/eodash/eodash/issues/494)) ([2717b4e](https://github.com/eodash/eodash/commit/2717b4e90bbc57d33f7a2820ed4728d4013b2595))
* token exhaustion and payload bloat in generate_map_from_stac ([#495](https://github.com/eodash/eodash/issues/495)) ([a537a5f](https://github.com/eodash/eodash/commit/a537a5ff6898ee9596f4b4230abe27d5898f1f92))


### Miscellaneous Chores

* release 5.0.0 ([91db070](https://github.com/eodash/eodash/commit/91db070fcd4f775b37a33d432fb5780ec100fb7d))

## [1.1.0](https://github.com/eodash/eodash/compare/mcp-v1.0.0...mcp-v1.1.0) (2026-10-28)


### Features

* mcp prometheus /metrics, logging sanitation and improvements ([#494](https://github.com/eodash/eodash/issues/494)) ([2717b4e](https://github.com/eodash/eodash/commit/2717b4e90bbc57d33f7a2820ed4728d4013b2595))
* token exhaustion and payload bloat in generate_map_from_stac ([#495](https://github.com/eodash/eodash/issues/495)) ([a537a5f](https://github.com/eodash/eodash/commit/a537a5ff6898ee9596f4b4230abe27d5898f1f92))
