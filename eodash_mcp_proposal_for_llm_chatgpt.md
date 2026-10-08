# Proposed MCP Architecture for eodash

## Context

This document proposes an MCP tool architecture for eodash issue #352, "MCP setup for eodash components".

The issue asks for an eodash-specific MCP server that provides a good foundation for LLMs generating content and snippets across eodash and its deployments. It explicitly mentions:

- setting up an initial dashboard VitePress instance, catalog, and narratives repository
- configuring an initial eodash and catalog for sample data
- creating vector and raster styles with legend, JSONForm, and tooltip
- configuring visualizations through supported endpoints via collection configuration
- defining processes with JSONForm configuration for GET/POST statistics
- configuring direct STAC API endpoints
- identifying links/metadata that need to be added to STAC APIs for eodash
- documenting and exposing custom widget examples and integration
- listing and inspecting widgets

Assumptions:

- Initial MCP server scaffolding already exists.
- Standard discovery tools such as list widgets, inspect widget props, and list templates are already implemented.
- The focus is therefore on higher-level eodash-specific capabilities and how an AI agent would use them.

The central design recommendation is:

Do not make the MCP server a large collection of low-level setters for individual JSON properties. Instead, provide semantic, composable operations that allow an AI to reason about eodash concepts such as dashboards, data sources, collections, visualizations, styles, processes, and validation.

The MCP server should act as a domain reasoning layer over eodash rather than merely being an RPC wrapper around configuration files.

---

# 1. Overall architecture

A useful conceptual architecture is:

AI agent
|
+-- Discovery / knowledge
| |
| +-- list / inspect / examples
|
+-- Semantic eodash tools
| |
| +-- create / configure / modify / validate
|
+-- eodash domain layer
|
+-- eodash configuration
+-- STAC
+-- OGC Processes
+-- visualization
+-- widgets
+-- styles

The desired agent workflow is:

intent
-> plan
-> inspect
-> configure
-> validate
-> fix
-> final configuration

rather than:

prompt
-> hallucinated JSON

---

# 2. Core design principles

## 2.1 Prefer semantic tools over JSON setters

Avoid exposing tools such as:

- set_background_widget
- set_widget_property
- set_stac_url
- set_brand_color
- set_collection_asset

These are too low-level.

Instead prefer:

- create_dashboard_config
- modify_dashboard_config
- configure_collection
- create_visualization
- configure_widget
- validate_dashboard_config

The MCP server should know the internal eodash configuration schema and hide unnecessary implementation details from the model.

## 2.2 Keep tools composable

An AI should be able to combine operations:

inspect STAC
-> configure collection
-> create visualization
-> add widget
-> validate

This is preferable to one enormous "generate everything" tool.

## 2.3 Make validation a first-class capability

LLMs will generate configurations that are syntactically plausible but semantically wrong.

A strong MCP workflow is:

generate
-> validate
-> inspect error
-> modify
-> validate again

Validation should detect missing properties, incompatible widget configuration, invalid data references, unavailable assets, and configuration combinations that technically parse but cannot work.

## 2.4 Separate knowledge from mutation

Static or semi-static knowledge should be exposed through discovery/resources/examples where appropriate.

Mutation tools should modify configuration or generate configuration.

This avoids putting the entire eodash knowledge base into every tool description.

## 2.5 Optimize for real user intent

The AI should be able to handle requests such as:

"Create a dashboard for this STAC API showing NDVI over Austria with a temporal slider and statistics."

It should not require the user to know:

- which widget IDs exist
- which JSON property names are required
- how collection configuration is structured
- which links have to be present in STAC
- how a legend is encoded

---

# 3. Recommended V1 tool set

The first useful implementation should be relatively small.

Recommended initial set:

1. find_examples
2. inspect_widget_usage
3. create_dashboard_config
4. inspect_config
5. modify_dashboard_config
6. validate_dashboard_config
7. inspect_stac
8. inspect_stac_collection
9. create_visualization
10. configure_collection

These should be tested against real end-to-end use cases before adding many more specialized tools.

---

# 4. Tool: create_dashboard_config

Purpose:
Create a complete or partial valid eodash dashboard configuration from a high-level specification.

Conceptual input:

create_dashboard_config(
id="alpine-monitor",
name="Alpine Environmental Monitor",
stac_endpoint="https://example.com/stac",
template="map-and-sidebar",
widgets=[...],
brand={...}
)

The input should allow partial information.

For example, the user could simply say:

"Create an eodash dashboard using this STAC API, with a map and a sidebar showing item metadata."

The AI should be able to call the tool without first constructing all internal configuration JSON.

The tool should resolve appropriate templates, widgets, and properties where possible.

Why this matters:

Without this tool the model has to:

1. inspect templates
2. inspect widgets
3. understand internal property structures
4. construct JSON
5. hope that it is valid

With this tool the workflow becomes:

inspect STAC
-> create dashboard config
-> validate config

This is a strong MCP use case.

---

# 5. Tool: modify_dashboard_config

Purpose:
Apply semantic changes to an existing dashboard configuration.

Possible operations:

- add widget
- remove widget
- update widget
- move widget
- change template
- change STAC endpoint
- configure branding
- add or remove functionality

Example high-level request:

"Add a date picker, move the item filter to the left, make the map fullscreen, and add a statistics panel."

The tool should translate these operations into the appropriate eodash configuration changes.

A structured form could also be supported:

modify_dashboard_config(
changes=[
"add a date picker",
"move the item filter to the left",
"change the map to fullscreen",
"add a statistics panel"
]
)

The key is that the model should not have to manually manipulate deeply nested JSON.

---

# 6. Tool: validate_dashboard_config

This should be considered essential.

The tool should report:

- valid/invalid status
- errors
- warnings
- affected configuration paths
- suggested fixes where possible

Example:

VALID

Warnings:

- EodashDatePicker has no effect because no temporal dimension is available.
- Widget X has a property that is not required.

Or:

INVALID

template.widgets[2]:
widget requires property "collection"

Suggested fix:
Add a collection reference to "sentinel-2-l2a".

This enables an agent loop:

create
-> validate
-> fix
-> validate

This feedback loop is more valuable than simply exposing more documentation.

---

# 7. Tool: inspect_config

Purpose:
Provide a semantic description of an existing dashboard rather than dumping its entire JSON representation.

Example output:

Dashboard:
ID: gtif
STAC: https://example.com/stac

Background:
EodashMap

Widgets:

- ItemFilter
- DatePicker
- Statistics
- STACInfo

Data:

- collection X
- collection Y

Capabilities:

- temporal filtering
- item selection
- statistics

This is important for context efficiency.

A real eodash project may contain a large configuration that would waste model context if returned as raw JSON.

---

# 8. Tool: find_examples

This could become one of the most valuable tools.

Purpose:
Find small, curated, relevant examples from existing eodash projects.

Example:

find_examples(
capability="statistics",
widget="map",
data_type="raster"
)

Or:

find_examples(
query="raster visualization with legend and JSONForm"
)

The result should contain small, useful examples rather than entire repositories.

Potential examples:

- raster visualization
- vector visualization
- collection configuration
- statistics process
- tooltip
- JSONForm
- STAC integration
- custom widget integration
- dashboard layout

LLMs are particularly good at adapting known working examples.

This also addresses a major issue in the current eodash ecosystem: some important knowledge exists in stories, documentation, and examples rather than in formal machine-readable API descriptions.

---

# 9. Tool: inspect_widget_usage

The standard widget listing and property inspection tools are assumed to already exist.

This proposed tool is different.

Purpose:
Explain how a widget is normally used in an actual eodash application.

For a widget, return:

- minimal example
- realistic example
- relevant properties
- common combinations
- dependencies
- existing examples

Example:

inspect_widget_usage(
widget="EodashMap"
)

This should answer not only "what properties exist?" but also "how is this widget actually used in eodash?"

This is particularly important for custom or complex widgets.

---

# 10. Tool: inspect_stac

Purpose:
Inspect a STAC API and translate its contents into information useful for eodash.

Input:

inspect_stac(
endpoint="https://example.com/stac"
)

Return:

- collections
- spatial extent
- temporal extent
- assets
- EO extension information
- projection information
- relevant links
- available metadata
- likely visualization variables
- eodash-relevant capabilities

Example:

STAC API

Collections:
sentinel-2-l2a
spatial extent: Europe
temporal extent: 2018-2026
assets:
B04
B08
SCL

eodash-relevant:
temporal: yes
spatial: yes
raster assets: yes
EO extension: yes

This is the bridge between external EO data and eodash configuration.

---

# 11. Tool: inspect_stac_collection

Purpose:
Perform a more detailed inspection of a specific collection.

Return:

- fields
- dimensions
- temporal information
- spatial information
- assets
- EO metadata
- links
- likely raster/vector visualization options
- available variables
- potentially useful properties for filtering/tooltips

Example:

inspect_stac_collection(
endpoint="...",
collection="sentinel-2-l2a"
)

This should make it possible for the AI to automatically determine how a collection could be visualized.

---

# 12. Tool: configure_collection

This should be one of the main eodash-specific abstractions.

Purpose:
Turn a data collection into an eodash-compatible visualization configuration.

Example:

configure_collection(
collection="sentinel-2",
visualization={
"asset": "NDVI",
...
},
interaction={
"tooltip": ...,
"filter": ...
}
)

The AI should be able to say:

"Configure this STAC collection as an eodash visualization."

The tool handles the eodash-specific glue.

This is arguably more valuable than exposing dozens of low-level configuration setters.

---

# 13. Tool: create_visualization

Purpose:
Create a complete visualization configuration rather than just a rendering style.

Example:

create_visualization(
data_type="raster",
asset="NDVI",
color_scheme="red-to-green",
range=[-1, 1],
legend=true,
tooltip=true
)

For vector:

create_visualization(
data_type="vector",
geometry="polygon",
attribute="population_density",
classification="quantile",
classes=5,
legend=true
)

The distinction should be:

STYLE:
how the data is rendered

VISUALIZATION:
how the data is exposed to the user, including style, legend, tooltip, interaction, filters, etc.

---

# 14. Potential later tool: create_style

This can be a reusable lower-level primitive.

Example:

create_style(
type="raster",
asset="B04",
min=0,
max=3000,
color_map="viridis"
)

For vectors:

create_style(
type="vector",
attribute="population",
classification="quantile",
classes=5
)

The style can then be consumed by create_visualization or configure_collection.

This is useful because the AI may often need to change only the rendering without rebuilding the complete visualization.

---

# 15. Potential later tool: create_legend

Reusable legend creation.

Examples:

create_legend(
type="continuous",
min=0,
max=100,
unit="%",
palette=[...]
)

or:

create_legend(
type="categorical",
categories=[...]
)

This should generate valid eodash-compatible configuration.

It is a lower-level primitive and probably does not need to be part of the first V1 unless the existing configuration API makes legend construction particularly difficult.

---

# 16. Potential later tool: create_tooltip

Example:

create_tooltip(
fields=[
"name",
"date",
"cloud_cover",
"ndvi"
]
)

Again, the purpose is to hide eodash-specific configuration syntax from the model.

---

# 17. Potential later tool: create_jsonform

This maps directly to the JSONForm requirement in issue #352.

Example:

create_jsonform(
fields=[
{
"name": "threshold",
"type": "number",
"default": 10
},
{
"name": "date",
"type": "date"
}
]
)

Or accept a simpler semantic schema:

create_jsonform(
schema={
"threshold": "number",
"date": "date",
"region": "select"
}
)

The MCP server generates the exact eodash-compatible representation.

---

# 18. Tool: inspect_process

Purpose:
Inspect an OGC Process endpoint and translate its inputs and outputs into information useful for eodash.

Example output:

Process:
name: zonal_statistics

Inputs:
geometry: Polygon
start_date: date
end_date: date

Outputs:
mean: number
min: number
max: number

This can be used to automatically construct the surrounding eodash configuration.

Workflow:

OGC Process
-> inspect_process
-> create_jsonform
-> create process configuration
-> add statistics widget
-> validate

---

# 19. Tool: create_process

This corresponds directly to the issue requirement to define a process with JSONForm configuration for GET/POST requests returning statistics.

Conceptually:

create_process(
endpoint="https://example.com/process",
method="POST",
inputs={...},
output="statistics"
)

Potentially a future semantic version could accept:

create_process(
purpose="calculate mean NDVI for the selected geometry and date",
endpoint="..."
)

The MCP server should configure the connection and eodash integration. It should not try to become a general-purpose EO processing engine.

---

# 20. STAC-specific metadata support

The issue specifically asks for the AI to know which links and metadata need to be added to a STAC API for eodash.

A dedicated tool could be:

create_eodash_stac_metadata(
collection=...
)

It should return recommended:

- links
- eodash metadata
- visualization hints
- processing links
- thumbnail configuration
- statistics information
- other required/recommended eodash conventions

This is preferable to relying on the LLM to remember eodash-specific STAC conventions.

An additional validation operation could check an existing collection:

validate_eodash_stac_collection(...)

and return:

Compatible: yes

Missing/recommended:

- ...
- ...

---

# 21. Widget mutation tools

Because standard widget discovery already exists, a generic mutation layer should be sufficient.

Recommended:

add_widget_to_dashboard(
widget="EodashDatePicker",
properties={...},
position="..."
)

remove_widget_from_dashboard(
widget_id="..."
)

configure_widget(
widget_id="...",
changes={
"title": "NDVI",
"properties": {...},
"layout": {...}
}
)

Avoid creating one tool per widget unless a particular widget has genuinely complex semantic behavior.

---

# 22. Custom widgets

Custom widgets should probably be treated as a later feature.

The issue correctly notes that custom widgets involve powerful logic that is not particularly well documented and that an AI may not naturally discover this concept.

A future tool could look conceptually like:

create_custom_widget(
purpose="show a histogram of selected values",
framework="vue"
)

The output should probably include:

- source file
- registration/configuration
- example usage
- required dependencies
- integration instructions

This is more of a coding-agent capability than a normal configuration capability.

It should not be a V1 priority.

---

# 23. Project generation

Eventually there could be a high-level:

generate_project(
description="Create an eodash dashboard showing Sentinel-2 NDVI for Austria with a date selector and statistics panel."
)

Internally it could execute:

inspect_stac
-> find_examples
-> create_dashboard_config
-> configure_collection
-> create_visualization
-> add_widget
-> validate
-> generate project

However, this should NOT be implemented first.

It should be built on top of the lower-level semantic tools.

---

# 24. A particularly useful additional capability: eodash_plan

A potentially very powerful tool is a planning tool.

The AI provides a desired dashboard:

"I want a dashboard showing Sentinel-2 NDVI over Austria, with a temporal slider, item information, and a chart showing average NDVI."

The tool returns a structured plan:

PLAN

Data:
STAC collection: sentinel-2
variable: NDVI

Visualizations:

1. Map
2. Item metadata
3. NDVI statistics

Interactions:

- temporal filter
- item selection

Required capabilities:

- STAC
- raster visualization
- EOxElements
- process endpoint

Available:

- STAC collection
- raster asset
- temporal dimension

Missing:

- statistics process

This is valuable because the AI can ask the user only about genuinely missing information.

The workflow becomes:

intent
-> plan
-> inspect
-> configure
-> validate

instead of:

intent
-> generate JSON immediately

This gives the MCP server a natural place to encode eodash domain knowledge.

---

# 25. Resources / knowledge

MCP resources should also be considered, not just tools.

Potential resources:

eodash://concepts/collection-config
eodash://concepts/stac-integration
eodash://concepts/styles
eodash://concepts/processes
eodash://examples/raster-visualization
eodash://examples/statistics
eodash://examples/custom-widget
eodash://examples/dashboard-layout

The purpose is to let the AI retrieve detailed domain knowledge only when needed.

This is especially useful for relatively static documentation and examples.

---

# 26. Another useful tool: explain_config

A tool such as:

explain_config(
path="template.widgets[2]"
)

could return an explanation such as:

"This widget displays the selected STAC item's metadata. It is an EOxElements web component. Its `for` property is bound to the current selected item and therefore updates automatically when the user selects a different item."

This is useful for coding agents that need to understand an existing deployment.

It also helps with debugging and modifying configurations.

---

# 27. Tools that should NOT be created

Avoid turning every configuration property into a separate MCP tool.

Do NOT create tools such as:

- set_background_widget
- set_widget_property
- set_stac_url
- set_brand_color
- set_collection_asset
- set_map_center
- set_map_zoom
- set_legend_color
- set_tooltip_field

These expose implementation details instead of eodash concepts.

Also avoid:

- generate_eodash_json

The LLM can already generate JSON. The MCP server should provide domain knowledge, validation, and semantic operations that the LLM does not reliably have.

Avoid dozens of widget-specific configuration tools such as:

- configure_datepicker
- configure_itemfilter
- configure_map
- configure_stacinfo
- configure_statistics

unless a widget has genuinely complex semantics that cannot be represented through a generic configure_widget operation.

---

# 28. Three key end-to-end workflows

## Workflow A: Create a dashboard

User:

"Create an eodash dashboard for this STAC API."

Agent:

1. inspect_stac(endpoint)
2. inspect_stac_collection(...)
3. find_examples(...)
4. create_dashboard_config(...)
5. configure_collection(...)
6. add/configure widgets
7. validate_dashboard_config()

If validation finds errors, the agent fixes them and validates again.

## Workflow B: Debug an existing dashboard

User:

"My eodash dashboard doesn't show the collection."

Agent:

1. inspect_config()
2. inspect_stac()
3. inspect_stac_collection()
4. validate_dashboard_config()

Potential result:

"The collection exists, but the configured visualization references asset `data`, while the collection exposes `B04`, `B08`, and `SCL`."

Agent then:

1. configure_collection(...)
2. validate_dashboard_config()

This may ultimately be more useful than generation because it gives AI a practical debugging loop.

## Workflow C: Add statistics

User:

"Add a panel showing average NDVI for the selected region."

Agent:

1. inspect_config()
2. inspect_stac_collection()
3. inspect_process(endpoint)
4. find_examples("NDVI statistics")
5. create_process(...)
6. create_jsonform(...)
7. add_widget(...)
8. validate_dashboard_config()

The agent can identify whether the required processing backend already exists.

---

# 29. Recommended implementation phases

## Phase 1: Semantic configuration foundation

Implement:

- create_dashboard_config
- inspect_config
- modify_dashboard_config
- validate_dashboard_config
- find_examples
- inspect_widget_usage

Goal:

The AI can understand and manipulate a dashboard without manually dealing with raw configuration structure.

## Phase 2: EO/STAC integration

Implement:

- inspect_stac
- inspect_stac_collection
- configure_collection
- validate_eodash_stac_collection
- create_eodash_stac_metadata

Goal:

The AI can take an external STAC API and turn it into useful eodash configuration.

## Phase 3: Visualization and processing

Implement:

- create_visualization
- create_style
- create_legend
- create_tooltip
- create_jsonform
- inspect_process
- create_process

Goal:

The AI can construct complete data visualizations and statistics workflows.

## Phase 4: Project and coding-agent capabilities

Implement:

- generate_project
- create_custom_widget
- eodash_plan
- explain_config

Goal:

The MCP becomes useful for larger coding-agent workflows and complete eodash deployment generation.

---

# 30. How to evaluate whether the MCP is actually useful

Do not evaluate individual tools in isolation.

Create a small benchmark of real user requests:

1. "Create a dashboard from this STAC API."
2. "Add NDVI visualization."
3. "Add a date picker."
4. "Add a tooltip containing cloud cover and acquisition date."
5. "Create a statistics panel."
6. "Change the raster color scale."
7. "Why is this collection not displaying?"
8. "Add another collection to the existing dashboard."
9. "Make this vector layer use five quantile classes."
10. "Create the required STAC metadata for this collection."

For every task measure:

- number of tool calls
- whether the AI selected the right tools
- whether the final configuration is valid
- whether it works at runtime
- how much raw eodash knowledge the model needed to know itself
- whether it hallucinated configuration
- whether the agent needed human correction

The ultimate test should be whether a reasonably capable coding model can accomplish these tasks with very little knowledge of eodash-specific JSON syntax.

---

# 31. The most important conceptual distinction

There are really three MCP layers:

## Layer 1: EOxElements MCP

Provides knowledge about components/widgets themselves.

Examples:

- what widgets exist
- widget properties
- component API
- component examples

## Layer 2: eodash MCP

Provides knowledge about how those components are composed into an eodash application.

Examples:

- dashboard configuration
- collection configuration
- visualization
- STAC integration
- processes
- eodash-specific conventions
- deployment structure

## Layer 3: General coding agent

Uses both MCPs to modify the actual repository/application.

This separation is important.

EOxElements answers:

"What does this widget do?"

eodash MCP answers:

"How do I use this widget in an eodash dashboard?"

The coding agent answers:

"Which files do I modify and how do I integrate the result into this repository?"

---

# 32. Recommended V1 in one concise list

If implementation effort is limited, prioritize these:

1. find_examples
2. inspect_widget_usage
3. create_dashboard_config
4. inspect_config
5. modify_dashboard_config
6. validate_dashboard_config
7. inspect_stac
8. inspect_stac_collection
9. configure_collection
10. create_visualization

Then add:

11. inspect_process
12. create_process
13. create_jsonform
14. create_style
15. create_legend
16. create_tooltip
17. validate_eodash_stac_collection
18. create_eodash_stac_metadata

Later:

19. eodash_plan
20. explain_config
21. generate_project
22. create_custom_widget

---

# 33. Final recommendation

The MCP server should not try to expose every eodash configuration capability as a separate tool.

Its core value should be:

1. Give the AI structured knowledge about eodash concepts.
2. Let the AI inspect real eodash configurations and external EO resources.
3. Let the AI perform semantic configuration operations.
4. Validate the result against actual eodash rules.
5. Provide examples of known-good configurations.
6. Allow the AI to iterate until the configuration is valid.

The strongest agent loop is:

USER INTENT
|
v
PLAN
|
v
INSPECT DATA / EXISTING CONFIG
|
v
SELECT EXAMPLE / PATTERN
|
v
CREATE / MODIFY CONFIG
|
v
VALIDATE
|
+---- invalid ----> FIX
| |
| v
+---------------- VALIDATE
|
v
WORKING EODASH CONFIGURATION

The central idea is that the MCP should hide eodash's configuration complexity from the model while exposing the concepts an eodash developer actually thinks about.

In short:

Do not build "MCP for eodash JSON."

Build "MCP for reasoning about eodash applications."
