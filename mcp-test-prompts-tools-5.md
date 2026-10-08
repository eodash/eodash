# EODash MCP Test Prompts & Scenarios

Use these test prompts to verify and benchmark AI interactions with the EODash MCP server tools.

---

## 1. Widget Discovery & Inspection

### Test 1.1: List all widgets

- **Prompt**:  
  `"What built-in widgets are available in eodash?"`
- **Expected Tool**: `list_widgets`
- **Verification**: Model should return a list of available widgets (e.g. `EodashMap`, `EodashTimeSlider`, `EodashLayerControl`, `EodashChart`, `EodashItemCatalog`, etc.).

### Test 1.2: Filter widgets by tag

- **Prompt**:  
  `"Which eodash widgets support time and temporal controls?"`
- **Expected Tool**: `list_widgets` with `{ tag: "time" }` or `{ search: "time" }`
- **Verification**: Model should highlight widgets like `EodashTimeSlider` and `EodashDatePicker`.

### Test 1.3: Inspect specific widget details

- **Prompt**:  
  `"How do I configure the EodashMap widget? What props, events, and slots does it support?"`
- **Expected Tool**: `get_widget_details` with `{ name: "EodashMap" }`
- **Verification**: Model should provide props (e.g., `id`, `view`, `staticLayers`, `enablePopups`), accepted events, and layout slots.

---

## 2. Architecture & Custom Widget Guides

### Test 2.1: Architecture concepts

- **Prompt**:  
  `"Explain how eodash handles global state management and how widgets communicate."`
- **Expected Tool**: `get_eodash_architecture` with `{ topic: "state" }`
- **Verification**: Model should describe Pinia/Vue composables, `useEodash`, URL state synchronization, and reactive store properties.

### Test 2.2: Building custom Web Component widget

- **Prompt**:  
  `"Show me a step-by-step guide and template to build a custom Web Component widget for eodash."`
- **Expected Tool**: `get_custom_widget_guide` with `{ widgetType: "web-component" }`
- **Verification**: Model should show Lit/vanilla Web Component wrapper and registration syntax in eodash config.

---

## 3. Dashboard Scaffolding & Configuration

### Test 3.1: Scaffold new Vue/Vite dashboard

- **Prompt**:  
  `"Scaffold a complete eodash project named 'my-climate-dashboard' using the expect template and Vue."`
- **Expected Tool**: `scaffold_dashboard` with `{ projectName: "my-climate-dashboard", template: "expect", projectType: "vue" }`
- **Verification**: Model returns `package.json`, `index.html`, `vite.config.js`, and entry point files ready to use.

### Test 3.2: Generate EODash config with custom widgets and brand

- **Prompt**:  
  `"Generate an eodash configuration file in TypeScript using the 'explore' template. The brand name should be 'Global Wildfire Tracker' with a dark theme and primary color '#e63946'. STAC endpoint is 'https://earth.esa.int/stac'."`
- **Expected Tool**: `generate_eodash_config` with `{ template: "explore", format: "ts", brand: { name: "Global Wildfire Tracker", theme: "dark", primaryColor: "#e63946" }, stacEndpoint: "https://earth.esa.int/stac" }`
- **Verification**: Returns syntactically valid `export default createConfig({...})` adhering to eodash types.

---

## 4. Layer Styling & Visualization

### Test 4.1: Vector Flatstyle (Point data with graduated colormap)

- **Prompt**:  
  `"Create an OpenLayers vector flatstyle for air quality sensor points. Color them by the 'pm25' attribute between 0 and 100 using the 'viridis' colormap. Include a tooltip showing station name and PM2.5 value."`
- **Expected Tool**: `generate_layer_style` with `{ styleType: "vector-flatstyle", vectorConfig: { mode: "graduated", attribute: "pm25", range: [0, 100], colormap: "viridis", tooltipFields: [{ id: "station_name", title: "Station" }, { id: "pm25", title: "PM2.5", appendix: " µg/m³" }] } }`
- **Verification**: Generates valid OpenLayers FlatStyle with expressions (`['interpolate', ['linear'], ['get', 'pm25'], ...]`), legend, and tooltip configuration.

### Test 4.2: Vector Flatstyle (Categorical land use)

- **Prompt**:  
  `"Generate a vector flatstyle for land use polygons based on the 'landcover' attribute with categories: 'forest', 'water', 'urban', and default fallback white."`
- **Expected Tool**: `generate_layer_style` with `{ styleType: "vector-flatstyle", vectorConfig: { mode: "categorical", attribute: "landcover", categories: [...] } }`
- **Verification**: Produces `['match', ['get', 'landcover'], 'forest', '#2d6a4f', ...]` flatstyle object.

### Test 4.3: Raster Flatstyle for Single-Band COG

- **Prompt**:  
  `"Generate a raster flatstyle for a single-band COG showing sea surface temperature between -2 and 35 degrees Celsius using the 'magma' colormap."`
- **Expected Tool**: `generate_layer_style` with `{ styleType: "raster-flatstyle", rasterConfig: { mode: "single-band", bandIndex: 1, range: [-2, 35], colormap: "magma" } }`
- **Verification**: Generates valid OpenLayers FlatStyle `color` expressions using `['interpolate', ['linear'], ['band', 1], ...]`.

### Test 4.4: Raster Flatstyle for RGB COG

- **Prompt**:  
  `"Generate a raster flatstyle for true-color RGB COG with red in band 4, green in band 3, and blue in band 2."`
- **Expected Tool**: `generate_layer_style` with `{ styleType: "raster-flatstyle", rasterConfig: { mode: "rgb", redBand: 4, greenBand: 3, blueBand: 2 } }`
- **Verification**: Produces `['array', ['band', 4], ['band', 3], ['band', 2], 1]`.

### Test 4.5: Rasterform Interactive Form Schema

- **Prompt**:  
  `"Generate an schema for dynamic titiler visualization with a colormap picker and min/max value sliders between 0 and 250."`
- **Expected Tool**: `generate_layer_style` with `{ styleType: "rasterform", rasterFormConfig: { colormapOptions: ["viridis", "magma", "plasma"], defaultColormap: "viridis", min: 0, max: 250, defaultMin: 10, defaultMax: 200 } }`
- **Verification**: Returns valid JSON Schema backed by `@json-editor/json-editor` structure.

---

## 5. Curated Examples Discovery

### Test 5.1: Search by Category & Query

- **Prompt**:  
  `"Find curated eodash examples for Vector Tile styling and FlatGeobuf."`
- **Expected Tool**: `find_examples` with `{ category: "vector-flatstyle", query: "vectortile flatgeobuf" }`
- **Verification**: Returns matching real-world examples with code snippets, STAC links, and explanations.

### Test 5.2: Search by Feature / Data Type

- **Prompt**:  
  `"Show me examples of raster COG styles with interactive colormaps or legends."`
- **Expected Tool**: `find_examples` with `{ category: "raster-flatstyle", features: ["interactive-sliders", "legend"] }`
- **Verification**: Returns examples matching requested features.

---

## 6. Catalog & Indicator Schema Validation

### Test 6.1: Validate EODash Catalog Collection Configuration (PascalCase)

- **Prompt**:  
  `"Validate this eodash catalog collection configuration:
{
\"Name\": \"austria-temperature\",
\"Title\": \"Austria Surface Temperature\",
\"Description\": \"Surface temperature grid for Austria.\",
\"Resources\": [
{
\"Name\": \"temperature_resource\",
\"Style\": \"https://assets.example.com/styles/temp.json\"
}
]
}"`
- **Expected Tool**: `validate_catalog_config` with `{ configType: "catalog-collection", config: { ... } }`
- **Verification**: Returns `valid: true` according to `collection-schema.json`.

### Test 6.2: Catch Validation Errors (Direct JSON object in Style)

- **Prompt**:  
  `"Validate this eodash catalog collection configuration:
{
\"Name\": \"invalid-style-collection\",
\"Title\": \"Invalid Style Collection\",
\"Description\": \"Sample collection\",
\"Resources\": [
{
\"Name\": \"temperature_resource\",
\"Style\": { \"fill-color\": \"#ff0000\" }
}
]
}"`
- **Expected Tool**: `validate_catalog_config` with `{ configType: "catalog-collection", config: { ... } }`
- **Verification**: Returns `valid: false` flagging that `Style` MUST be a URL string and direct objects are forbidden.

### Test 6.3: Catch Invalid Resources[].Flatstyle Property

- **Prompt**:  
  `"Validate this eodash catalog collection configuration:
{
\"Name\": \"invalid-flatstyle-resource\",
\"Title\": \"Invalid Flatstyle on Resource\",
\"Description\": \"Collection using Flatstyle on a resource instead of Style.\",
\"Resources\": [
{
\"Name\": \"sar_resource\",
\"Flatstyle\": \"https://assets.example.com/styles/sar.json\"
}
]
}"`
- **Expected Tool**: `validate_catalog_config` with `{ configType: "catalog-collection", config: { ... } }`
- **Verification**: Returns `valid: false` indicating property `Flatstyle` does not exist on Resources (use `Style` instead).

---

## 7. Multi-Tool End-to-End Workflow

### Test 7.1: Full Dashboard Creation Scenario

- **Prompt**:  
  `"I want to create an eodash dashboard for tracking global ocean chlorophyll.
  1. Find any relevant examples of raster COG styling in eodash.
  2. Generate a raster flatstyle using viridis from 0.01 to 30.0 mg/m³.
  3. Generate the eodash dashboard config using the 'lite' template."`
- **Expected Flow**:
  1. Calls `find_examples` (e.g. `category: "raster-flatstyle"`, `query: "chlorophyll ocean"`).
  2. Calls `generate_layer_style` (`styleType: "raster-flatstyle"`, `range: [0.01, 30]`, `colormap: "viridis"`).
  3. Calls `generate_eodash_config` (`template: "lite"`, `brand: { name: "Global Ocean Chlorophyll" }`).
- **Verification**: AI synthesizes output into a complete, working dashboard configuration and OpenLayers style.
