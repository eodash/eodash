import { describe, it, expect } from "vitest";
import { createMcpServer } from "../../mcp-server/index.js";
import { scaffoldDashboard } from "../../mcp-server/generators/dashboard.js";
import { generateEodashConfig } from "../../mcp-server/generators/config.js";

describe("eodash Generators - scaffoldDashboard", () => {
  it("generates standalone SPA boilerplate", () => {
    const res = scaffoldDashboard({
      name: "alpine-monitor",
      projectType: "standalone-spa",
      stacEndpoint: "https://example.com/stac",
      template: "explore",
      brandName: "Alpine Monitor",
    });

    expect(res.projectType).toBe("standalone-spa");
    expect(res.name).toBe("alpine-monitor");
    expect(res.files["package.json"]).toBeDefined();
    expect(res.files["eodash.config.js"]).toContain("alpine-monitor");
    expect(res.files["eodash.config.js"]).toContain("https://example.com/stac");
    expect(res.files["eodash.config.js"]).toContain("Alpine Monitor");
    expect(res.files["index.html"]).toBeDefined();
    expect(res.files["Dockerfile"]).toBeDefined();
    expect(res.files[".gitignore"]).toBeDefined();
  });

  it("generates vitepress narratives boilerplate", () => {
    const res = scaffoldDashboard({
      name: "climate-stories",
      projectType: "vitepress-narratives",
      brandName: "Climate Stories",
    });

    expect(res.projectType).toBe("vitepress-narratives");
    expect(res.files["docs/.vitepress/config.js"]).toContain("Climate Stories");
    expect(res.files["docs/index.md"]).toContain("Climate Stories");
    expect(res.files["docs/dashboard.md"]).toContain("<eo-dash");
    expect(res.files["docs/narratives/story-1.md"]).toContain("<eo-dash");
  });

  it("generates web-component integration boilerplate", () => {
    const res = scaffoldDashboard({
      name: "embedded-dash",
      projectType: "web-component",
    });

    expect(res.projectType).toBe("web-component");
    expect(res.files["index.html"]).toContain("<eo-dash");
    expect(res.files["index.html"]).toContain("@eodash/eodash/web-component");
  });
});

describe("eodash Generators - generateEodashConfig", () => {
  it("generates valid standard template config code", () => {
    const res = generateEodashConfig({
      id: "austria-gtif",
      stacEndpoint: "https://gtif-austria.eox.at/catalog.json",
      template: "explore",
      brand: {
        name: "GTIF Austria",
        theme: {
          colors: {
            primary: "#003366",
          },
        },
      },
    });

    expect(res.id).toBe("austria-gtif");
    expect(res.template).toBe("explore");
    expect(res.configCode).toContain('id: "austria-gtif"');
    expect(res.configCode).toContain(
      "https://gtif-austria.eox.at/catalog.json",
    );
    expect(res.configCode).toContain("template: explore");
    expect(res.configCode).toContain('"primary": "#003366"');
  });

  it("generates custom widget layout config", () => {
    const customWidgets = [
      {
        id: "custom-map",
        title: "Main Map",
        layout: { x: 0, y: 0, w: 9, h: 12 },
        widget: {
          name: "EodashMap",
          properties: {
            btns: ["fullscreen"],
          },
        },
      },
      {
        id: "catalog-panel",
        title: "Catalog",
        layout: { x: 9, y: 0, w: 3, h: 12 },
        widget: {
          name: "EodashItemCatalog",
          properties: {},
        },
      },
    ];

    const res = generateEodashConfig({
      id: "custom-dashboard",
      template: "custom",
      customWidgets,
    });

    expect(res.template).toBe("custom");
    expect(res.configCode).toContain("custom-map");
    expect(res.configCode).toContain("catalog-panel");
    expect(res.configCode).toContain("EodashMap");
  });
});

describe("eodash MCP Server - Generator Tool Execution", () => {
  it("executes scaffold_dashboard MCP tool", async () => {
    const server = createMcpServer();
    const tool = server._registeredTools?.["scaffold_dashboard"];
    expect(tool).toBeDefined();

    const res = await tool.handler({
      name: "mcp-test-dash",
      projectType: "standalone-spa",
      template: "lite",
    });

    const body = JSON.parse(res.content[0].text);
    expect(body.name).toBe("mcp-test-dash");
    expect(body.files["eodash.config.js"]).toContain("lite");
  });

  it("executes generate_eodash_config MCP tool", async () => {
    const server = createMcpServer();
    const tool = server._registeredTools?.["generate_eodash_config"];
    expect(tool).toBeDefined();

    const res = await tool.handler({
      id: "test-generated-config",
      template: "expert",
      brand: { name: "Test Generator" },
    });

    const body = JSON.parse(res.content[0].text);
    expect(body.id).toBe("test-generated-config");
    expect(body.configCode).toContain("expert");
  });
});
