import fs from "node:fs";
import path from "node:path";
import ts from "typescript";
import { describe, it, expect, beforeAll, afterAll } from "vitest";
import http from "node:http";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer, createExpressApp } from "../index.js";
import { buildMetadata } from "../generate-metadata.js";

async function createTestClientServer() {
  const server = createMcpServer();
  const [clientTransport, serverTransport] =
    InMemoryTransport.createLinkedPair();
  const client = new Client(
    { name: "test-client", version: "1.0.0" },
    { capabilities: {} },
  );
  await Promise.all([
    server.connect(serverTransport),
    client.connect(clientTransport),
  ]);
  return { server, client };
}

describe("eodash MCP Server - Core Tools", () => {
  it("initializes MCP server and delivers instructions via protocol handshake", async () => {
    const { client } = await createTestClientServer();
    const instructions = client.getInstructions();
    expect(instructions).toBeTruthy();
    expect(instructions).toContain("eodash");

    const tools = await client.listTools();
    expect(tools.tools.length).toBeGreaterThanOrEqual(6);
  });

  it("list_widgets tool returns all widgets and supports filtering by category", async () => {
    const { client } = await createTestClientServer();

    const allRes = await client.callTool({
      name: "list_widgets",
      arguments: {},
    });
    const allWidgets = JSON.parse(allRes.content[0].text);
    expect(allWidgets.length).toBeGreaterThanOrEqual(10);

    const mapWidget = allWidgets.find((w) => w.name === "EodashMap");
    expect(mapWidget).toBeDefined();
    expect(mapWidget.isBackground).toBe(true);

    const filteredRes = await client.callTool({
      name: "list_widgets",
      arguments: {
        category: "Visualization",
      },
    });
    const filteredWidgets = JSON.parse(filteredRes.content[0].text);
    expect(filteredWidgets.length).toBeGreaterThanOrEqual(2);
    expect(
      filteredWidgets.every((w) => w.category.includes("Visualization")),
    ).toBe(true);
  });

  it("get_widget_details returns full props and bindings for EodashMap", async () => {
    const { client } = await createTestClientServer();

    const res = await client.callTool({
      name: "get_widget_details",
      arguments: { widgetName: "EodashMap" },
    });
    const details = JSON.parse(res.content[0].text);
    expect(details.name).toBe("EodashMap");
    expect(details.props).toBeDefined();
    expect(Array.isArray(details.props)).toBe(true);

    const btnsProp = details.props.find((p) => p.name === "btns");
    expect(btnsProp).toBeDefined();
    expect(details.storeInteractions.reads).toContain("indicator");
    expect(details.storeInteractions.writes).toContain("mapEl");
    expect(details.stacExtensions).toContain("eox:flatstyle");
    expect(details.example.widget.name).toBe("EodashMap");
  });

  it("get_widget_details verifies props and bindings for EodashItemCatalog and EodashProcess", async () => {
    const { client } = await createTestClientServer();

    // Catalog widget
    const catalogRes = await client.callTool({
      name: "get_widget_details",
      arguments: { widgetName: "EodashItemCatalog" },
    });
    const catalog = JSON.parse(catalogRes.content[0].text);
    expect(catalog.name).toBe("EodashItemCatalog");
    expect(catalog.props.some((p) => p.name === "filters")).toBe(true);
    expect(catalog.storeInteractions.writes).toContain("selectedItem");

    // Process widget
    const processRes = await client.callTool({
      name: "get_widget_details",
      arguments: { widgetName: "EodashProcess" },
    });
    const proc = JSON.parse(processRes.content[0].text);
    expect(proc.name).toBe("EodashProcess");
    expect(proc.props.some((p) => p.name === "enableCompare")).toBe(true);
    expect(proc.props.some((p) => p.name === "vegaEmbedOptions")).toBe(true);
  });

  it("get_widget_details handles unknown widget gracefully", async () => {
    const { client } = await createTestClientServer();
    const res = await client.callTool({
      name: "get_widget_details",
      arguments: { widgetName: "NonExistentWidget" },
    });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain(
      "Widget 'NonExistentWidget' not found",
    );
  });

  it("get_custom_widget_guide returns complete templates for custom widgets", async () => {
    const { client } = await createTestClientServer();

    const resAll = await client.callTool({
      name: "get_custom_widget_guide",
      arguments: { type: "all" },
    });
    const guides = JSON.parse(resAll.content[0].text);
    expect(guides["web-component"]).toBeDefined();
    expect(guides["functional"]).toBeDefined();
    expect(guides["iframe"]).toBeDefined();
    expect(guides["eox-elements"]).toBeDefined();

    const resWc = await client.callTool({
      name: "get_custom_widget_guide",
      arguments: { type: "web-component" },
    });
    const wcGuide = JSON.parse(resWc.content[0].text);
    expect(wcGuide["web-component"].lifecycleHooks.onMounted).toBeDefined();
    expect(wcGuide["web-component"].example).toContain("tagName:");
    expect(wcGuide["web-component"].example).toContain("link:");
  });

  it("get_eodash_architecture returns grid layout, templates and reactive store details", async () => {
    const { client } = await createTestClientServer();

    const res = await client.callTool({
      name: "get_eodash_architecture",
      arguments: { topic: "all" },
    });
    const arch = JSON.parse(res.content[0].text);
    expect(arch.gridSystem.columns).toBe(12);
    const templateNames = arch.templateSystem.builtInTemplates.map(
      (t) => t.name,
    );
    expect(templateNames).toEqual(
      expect.arrayContaining(["lite", "explore", "expert", "compare"]),
    );
    expect(arch.templateSystem.builtInTemplates.length).toBeGreaterThanOrEqual(
      4,
    );
    expect(
      arch.reactiveStore.states.find((s) => s.name === "currentUrl"),
    ).toBeDefined();
    expect(
      arch.reactiveStore.stacStore.find((s) => s.name === "stacEndpoint"),
    ).toBeDefined();
    expect(
      arch.reactiveStore.actions.find((a) => a.name === "getLayers"),
    ).toBeDefined();

    // Partial topic filtering
    const gridRes = await client.callTool({
      name: "get_eodash_architecture",
      arguments: { topic: "grid-layout" },
    });
    const gridArch = JSON.parse(gridRes.content[0].text);
    expect(gridArch.gridSystem).toBeDefined();
    expect(gridArch.gridSystem.notation).toContain("0–11");
    expect(gridArch.templateSystem).toBeUndefined();

    // Custom widget types
    const widgetTypeRes = await client.callTool({
      name: "get_eodash_architecture",
      arguments: { topic: "custom-widgets" },
    });
    const widgetTypeArch = JSON.parse(widgetTypeRes.content[0].text);
    const types = widgetTypeArch.customWidgetSystem.types.map((t) => t.type);
    expect(types).toEqual(["web-component", "internal", "iframe"]);
  });
});

describe("eodash MCP Server - Metadata Generator", () => {
  it("buildMetadata extracts full schema, props, and store items consistently", () => {
    const { widgetsMetadata, architectureMetadata } = buildMetadata();

    const widgetNames = Object.keys(widgetsMetadata);
    expect(widgetNames.length).toBeGreaterThanOrEqual(10);

    for (const name of widgetNames) {
      const widget = widgetsMetadata[name];
      expect(widget.name).toBe(name);
      expect(widget.category).toBeDefined();
      expect(widget.summary).toBeTruthy();
      expect(Array.isArray(widget.props)).toBe(true);
      expect(widget.props.length).toBeGreaterThan(0);
      expect(Array.isArray(widget.storeInteractions.reads)).toBe(true);
      expect(Array.isArray(widget.storeInteractions.writes)).toBe(true);
      expect(widget.example).toBeDefined();
    }

    expect(architectureMetadata.reactiveStore.states.length).toBeGreaterThan(0);
    expect(architectureMetadata.reactiveStore.stacStore.length).toBeGreaterThan(
      0,
    );
    expect(architectureMetadata.reactiveStore.actions.length).toBeGreaterThan(
      0,
    );

    // Verify JSDoc types are not truncated at nested curly braces
    const mapElState = architectureMetadata.reactiveStore.states.find(
      (s) => s.name === "mapEl",
    );
    expect(mapElState).toBeDefined();
    expect(mapElState.type).toContain("mapUpdateId?: number");

    const tooltipAdapterState = architectureMetadata.reactiveStore.states.find(
      (s) => s.name === "tooltipAdapter",
    );
    expect(tooltipAdapterState).toBeDefined();
    expect(tooltipAdapterState.type).toContain(
      "param: {key: string, value: any}",
    );

    // Verify no function locals leaked into stacStore
    const stacMemberNames = architectureMetadata.reactiveStore.stacStore.map(
      (s) => s.name,
    );
    expect(stacMemberNames).toContain("stacEndpoint");
    expect(stacMemberNames).toContain("init");
    expect(stacMemberNames).not.toContain("isPOI");
    expect(stacMemberNames).not.toContain("resp");

    // Verify store reads do not count useSTAcStore or function imports as reads
    for (const name of widgetNames) {
      const widget = widgetsMetadata[name];
      expect(widget.storeInteractions.reads).not.toContain("useSTAcStore");
    }

    // Verify STAC extensions vs core fields split
    expect(widgetsMetadata.EodashMap.stacExtensions).toContain("eox:flatstyle");
    expect(widgetsMetadata.EodashItemCatalog.stacExtensions).toContain(
      "eo:cloud_cover",
    );
    expect(widgetsMetadata.EodashItemCatalog.stacCoreFields).toContain(
      "datetime",
    );
    expect(widgetsMetadata.EodashItemCatalog.stacExtensions).not.toContain(
      "datetime",
    );
    expect(widgetsMetadata.EodashTimeSlider.stacCoreFields).toContain(
      "datetime",
    );
    expect(widgetsMetadata.EodashTimeSlider.stacExtensions).toHaveLength(0);
  });

  it("prevents drift between template widgets and metadata catalog", () => {
    const { widgetsMetadata } = buildMetadata();
    const knownWidgets = new Set(Object.keys(widgetsMetadata));
    const templatesDir = path.resolve(__dirname, "../../../templates");

    const templateFiles = fs
      .readdirSync(templatesDir)
      .filter((f) => f.endsWith(".js") && f !== "index.js" && f !== "baseConfig.js");

    expect(templateFiles.length).toBeGreaterThanOrEqual(4);

    for (const file of templateFiles) {
      const content = fs.readFileSync(path.join(templatesDir, file), "utf8");
      const sf = ts.createSourceFile(file, content, ts.ScriptTarget.Latest, true);

      function traverse(node) {
        if (
          ts.isPropertyAssignment(node) &&
          ts.isIdentifier(node.name) &&
          node.name.text === "name" &&
          ts.isStringLiteral(node.initializer)
        ) {
          const val = node.initializer.text;
          if (val.startsWith("Eodash")) {
            expect(
              knownWidgets.has(val),
              `Template ${file} references widget '${val}', but it is missing from metadata catalog.`,
            ).toBe(true);
          }
        }
        ts.forEachChild(node, traverse);
      }

      traverse(sf);
    }
  });
});

describe("eodash MCP Server - HTTP Endpoints", () => {
  let server;
  let baseUrl;

  beforeAll(async () => {
    const app = createExpressApp();
    await new Promise((resolve) => {
      server = http.createServer(app).listen(0, () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  afterAll(async () => {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  it("GET /health returns 200 and running status", async () => {
    const res = await fetch(`${baseUrl}/health`);
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toBe("eodash MCP Server is running");
  });

  it("GET / returns 405 Method Not Allowed per MCP Streamable HTTP spec", async () => {
    const res = await fetch(`${baseUrl}/`);
    expect(res.status).toBe(405);
    expect(res.headers.get("allow")).toBe("POST");
    const body = await res.json();
    expect(body.error.code).toBe(-32600);
  });

  it("GET /ui returns 200 HTML landing page with widget overview", async () => {
    const res = await fetch(`${baseUrl}/ui`);
    expect(res.status).toBe(200);
    expect(res.headers.get("content-type")).toContain("text/html");
    const html = await res.text();
    expect(html).toContain("eodash MCP Server");
    expect(html).toContain("Available Widgets");
    expect(html).toContain("EodashMap");
  });

  it("POST / with malformed JSON body returns 400 with standard JSON-RPC parse error", async () => {
    const res = await fetch(`${baseUrl}/`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json, text/event-stream",
      },
      body: "{ malformed json: true",
    });
    expect(res.status).toBe(400);
    const body = await res.json();
    expect(body.error.code).toBe(-32700);
    expect(body.error.message).toContain("Parse error");
  });

  it("DELETE / returns 200 stateless status", async () => {
    const res = await fetch(`${baseUrl}/`, { method: "DELETE" });
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body.message).toContain("Stateless");
  });

  it("POST / without required Accept header returns 406", async () => {
    const res = await fetch(`${baseUrl}/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jsonrpc: "2.0", method: "tools/list", id: 1 }),
    });
    expect(res.status).toBe(406);
  });

  it("POST / executes JSON-RPC tools/list and tools/call statelessly without session header", async () => {
    const headers = {
      "Content-Type": "application/json",
      Accept: "application/json, text/event-stream",
    };

    // 1. tools/list direct call
    const listRes = await fetch(`${baseUrl}/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "tools/list",
        params: {},
      }),
    });
    expect(listRes.status).toBe(200);
    const listBody = await listRes.json();
    expect(listBody.result?.tools?.length).toBeGreaterThanOrEqual(6);

    // 2. tools/call direct call
    const callRes = await fetch(`${baseUrl}/`, {
      method: "POST",
      headers,
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 2,
        method: "tools/call",
        params: {
          name: "list_widgets",
          arguments: {},
        },
      }),
    });
    expect(callRes.status).toBe(200);
    const callBody = await callRes.json();
    expect(callBody.result?.content?.[0]?.type).toBe("text");
    const widgets = JSON.parse(callBody.result.content[0].text);
    expect(widgets.length).toBeGreaterThanOrEqual(10);
  });
});
