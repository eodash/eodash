import { describe, it, expect } from "vitest";
import { createMcpServer } from "../../mcp-server/index.js";

describe("eodash MCP Server", () => {
  it("initializes MCP server and registers tools", () => {
    const server = createMcpServer();
    expect(server).toBeDefined();
  });

  it("list_widgets tool returns all widgets and supports filtering by category", async () => {
    const server = createMcpServer();
    // In @modelcontextprotocol/sdk, tools are registered in server._registeredTools or called via internal handler
    const listWidgetsTool = server._registeredTools?.["list_widgets"];
    expect(listWidgetsTool).toBeDefined();

    const allRes = await listWidgetsTool.handler({});
    const allWidgets = JSON.parse(allRes.content[0].text);
    expect(allWidgets.length).toBeGreaterThanOrEqual(10);

    const mapWidget = allWidgets.find((w) => w.name === "EodashMap");
    expect(mapWidget).toBeDefined();
    expect(mapWidget.isBackground).toBe(true);

    const filteredRes = await listWidgetsTool.handler({
      category: "Visualization",
    });
    const filteredWidgets = JSON.parse(filteredRes.content[0].text);
    expect(filteredWidgets.length).toBeGreaterThanOrEqual(2);
    expect(
      filteredWidgets.every((w) => w.category.includes("Visualization")),
    ).toBe(true);
  });

  it("get_widget_details tool returns full props, store interactions and example", async () => {
    const server = createMcpServer();
    const tool = server._registeredTools?.["get_widget_details"];
    expect(tool).toBeDefined();

    const res = await tool.handler({ widgetName: "EodashMap" });
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

  it("get_widget_details handles unknown widget gracefully", async () => {
    const server = createMcpServer();
    const tool = server._registeredTools?.["get_widget_details"];
    const res = await tool.handler({ widgetName: "NonExistentWidget" });
    expect(res.isError).toBe(true);
    expect(res.content[0].text).toContain(
      "Widget 'NonExistentWidget' not found",
    );
  });

  it("get_custom_widget_guide returns complete templates for custom widgets", async () => {
    const server = createMcpServer();
    const tool = server._registeredTools?.["get_custom_widget_guide"];
    expect(tool).toBeDefined();

    const resAll = await tool.handler({ type: "all" });
    const guides = JSON.parse(resAll.content[0].text);
    expect(guides["web-component"]).toBeDefined();
    expect(guides["functional"]).toBeDefined();
    expect(guides["iframe"]).toBeDefined();
    expect(guides["eox-elements"]).toBeDefined();

    const resWc = await tool.handler({ type: "web-component" });
    const wcGuide = JSON.parse(resWc.content[0].text);
    expect(wcGuide["web-component"].lifecycleHooks.onMounted).toBeDefined();
  });

  it("get_eodash_architecture returns grid layout, templates and reactive store details", async () => {
    const server = createMcpServer();
    const tool = server._registeredTools?.["get_eodash_architecture"];
    expect(tool).toBeDefined();

    const res = await tool.handler({ topic: "all" });
    const arch = JSON.parse(res.content[0].text);
    expect(arch.gridSystem.columns).toBe(12);
    expect(arch.templateSystem.builtInTemplates.map((t) => t.name)).toEqual([
      "lite",
      "explore",
      "expert",
      "compare",
    ]);
    expect(
      arch.reactiveStore.states.find((s) => s.name === "currentUrl"),
    ).toBeDefined();
    expect(
      arch.reactiveStore.stacStore.find((s) => s.name === "stacEndpoint"),
    ).toBeDefined();
    expect(
      arch.reactiveStore.actions.find((a) => a.name === "getLayers"),
    ).toBeDefined();
  });
});
