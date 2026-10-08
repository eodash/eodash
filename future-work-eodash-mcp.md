# Future Work: eodash MCP Server

## Convention-Based Widget Metadata Co-location (Suggestion 3)

Currently, widget category classifications and supported STAC extensions (`eox:flatstyle`, `eodash:rasterform`, `eodash:tilematrixset`, etc.) are maintained in mapping dictionaries within `mcp-server/generate-metadata.js`.

### Future Plan:

- Co-locate STAC extensions, category metadata, and widget-specific schema hints directly within each widget's component definition (`defineOptions({ ... })` or structured JSDoc `@widgetMetadata { ... }`).
- Allow the metadata generator to dynamically extract STAC compatibility and widget category taxonomy directly from the component source code, eliminating central dictionary drift when adding new widgets or STAC capabilities.
