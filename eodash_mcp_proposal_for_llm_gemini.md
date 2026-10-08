In a development environment (like Cursor or VS Code), these MCP tools transform the AI into an automated eodash configuration compiler and dashboard architect.

Proposed Developer & Operational MCP Tools

inspect_stac_endpoint(url: string, collectionId?: string): Queries remote STAC catalogs during configuration to inspect available bands, temporal extents, and asset extensions (e.g., renders or raster). It feeds exact metadata into the AI so generated layer configs match the underlying data structure perfectly.

validate_dashboard_config(configPath: string | object): Validates an eodash configuration file against the official TypeScript schema/JSON schema. Catches invalid widget props, missing required fields (like stacCombine), or malformed indicator routes before build time.

recommend_layout_and_widgets(stacMetadata: object): Analyzes a dataset's metadata structure and proposes optimal widget combinations (e.g., pairing EODashMap with a time-series chart widget for temporal raster datasets).

scaffold_custom_widget(widgetName: string, propsSchema: object): Generates boilerplate code for a custom Vue or Web Component widget that satisfies eodash's internal widget interface and event contracts.

sync_indicator_catalog(catalogUrl: string): An operational tool that parses an external STAC catalog and auto-generates or updates the indicators array in the dashboard config.

How the AI Uses Them in the Development Workflow

When a developer prompts: "Build an eodash config for this Sentinel-2 STAC catalog URL":

Discovery: The AI calls inspect_stac_endpoint to retrieve assets, spatial bounds, and visualization extensions.

Architecture: The AI runs recommend_layout_and_widgets to select the right dashboard templates and UI layout.

Config Generation: The AI writes the eodash.config.ts file, adding the map layers, branding, and widget bindings.

Verification: The AI executes validate_dashboard_config to catch schema errors or missing props before handing the file back to the developer.

Does it Make Sense?

Yes, this dev-focused approach delivers massive value. Manually authoring eodash configs involves tedious mapping between complex STAC asset properties and widget options. Automating this via dev-time MCP tools eliminates config syntax errors, cuts down indicator onboarding time from hours to seconds, and ensures standard compliance across multi-dashboard deployments.
