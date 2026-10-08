import { describe, it, expect } from "vitest";
import ts from "typescript";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../index.js";
import { scaffoldDashboard } from "../generators/dashboard.js";
import { generateEodashConfig } from "../generators/config.js";
import { getAvailableTemplates } from "../helpers.js";

function assertValidJavaScript(filename, code) {
  const sf = ts.createSourceFile(
    filename,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  // TypeScript parser attaches syntax errors directly to source file parse diagnostics
  const diagnostics = sf.parseDiagnostics || [];
  if (diagnostics.length > 0) {
    const errMessages = diagnostics
      .map((d) => `${d.messageText} at pos ${d.start}`)
      .join("; ");
    throw new Error(`Syntax error in generated file '${filename}': ${errMessages}\n\nCode:\n${code}`);
  }
}

function assertValidJson(filename, content) {
  try {
    JSON.parse(content);
  } catch (err) {
    throw new Error(`Invalid JSON in generated file '${filename}': ${err.message}\n\nContent:\n${content}`);
  }
}

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
    expect(res.files["src/main.js"]).toContain("alpine-monitor");
    expect(res.files["src/main.js"]).toContain("https://example.com/stac");
    expect(res.files["src/main.js"]).toContain("Alpine Monitor");
    expect(res.files["eodash.config.js"]).toContain("entryPoint");
    expect(res.files["eodash.config.js"]).toContain(
      'import { defineConfig } from "@eodash/eodash/config"',
    );
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
    expect(res.files["package.json"]).toContain("@eox/storytelling");
    expect(res.files["docs/.vitepress/config.js"]).toContain("Climate Stories");
    expect(res.files["docs/.vitepress/config.js"]).toContain("isCustomElement");
    expect(res.files["docs/.vitepress/theme/index.js"]).toContain("enhanceApp");
    expect(res.files["docs/.vitepress/theme/index.js"]).toContain(
      "import.meta.env.SSR",
    );
    expect(res.files["docs/index.md"]).toContain("Climate Stories");
    expect(res.files["docs/dashboard.md"]).toContain('config="/config.js"');
    expect(res.files["docs/public/config.js"]).toBeDefined();
    expect(res.files["docs/public/story-content.md"]).toBeDefined();
    expect(res.files["Dockerfile"]).toContain("npm run docs:build");
    expect(res.files["Dockerfile"]).toContain("docs/.vitepress/dist");
    expect(res.files["docs/narratives/story-1.md"]).toContain(
      "<eox-storytelling",
    );
  });

  it("generates web-component integration boilerplate", () => {
    const res = scaffoldDashboard({
      name: "embedded-dash",
      projectType: "web-component",
    });

    expect(res.projectType).toBe("web-component");
    expect(res.files["index.html"]).toContain("<eo-dash");
    expect(res.files["index.html"]).toContain('config="/config.js"');
    expect(res.files["config.js"]).toBeDefined();
    expect(res.files["index.html"]).toContain("@eodash/eodash/webcomponent");
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

  it("supports all dynamically discovered templates", () => {
    const availableTemplates = getAvailableTemplates();
    expect(availableTemplates).toEqual(
      expect.arrayContaining(["explore", "lite", "expert", "compare"]),
    );

    for (const template of availableTemplates) {
      const res = generateEodashConfig({
        id: `test-${template}`,
        template,
      });
      expect(res.template).toBe(template);
      expect(res.configCode).toContain(`template: ${template}`);
    }
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

    // Merging custom widgets with a base template
    const resMerged = generateEodashConfig({
      id: "extended-lite",
      template: "lite",
      customWidgets,
    });
    expect(resMerged.template).toBe("custom");
    expect(resMerged.configCode).toContain(
      'import { lite } from "@eodash/eodash/templates";',
    );
    expect(resMerged.configCode).toContain("...lite,");
    expect(resMerged.configCode).toContain("custom-map");
  });

  it("verifies all scaffolded files parse as valid JS/JSON across all project types", () => {
    const projectTypes = [
      "standalone-spa",
      "vitepress-narratives",
      "web-component",
    ];

    for (const projectType of projectTypes) {
      const scaffold = scaffoldDashboard({
        name: `test-${projectType}`,
        projectType,
        template: "explore",
      });

      for (const [filename, content] of Object.entries(scaffold.files)) {
        if (filename.endsWith(".js")) {
          assertValidJavaScript(filename, content);
        } else if (filename.endsWith(".json")) {
          assertValidJson(filename, content);
        }
      }
    }
  });

  it("verifies all generated config outputs parse as valid JavaScript AST", () => {
    const templates = ["lite", "explore", "expert", "compare", "custom"];
    for (const tpl of templates) {
      const config = generateEodashConfig({
        id: `test-config-${tpl}`,
        template: tpl,
        brand: { name: `Brand ${tpl}` },
        customWidgets:
          tpl === "custom"
            ? [
                {
                  id: "custom-map",
                  title: "Custom Map",
                  layout: { x: 0, y: 0, w: 12, h: 6 },
                  widget: { name: "EodashMap" },
                },
              ]
            : [],
      });

      assertValidJavaScript("eodash.config.js", config.configCode);
    }
  });
});

describe("eodash MCP Server - Generator Tool Execution", () => {
  it("executes scaffold_dashboard MCP tool via protocol", async () => {
    const { client } = await createTestClientServer();

    const res = await client.callTool({
      name: "scaffold_dashboard",
      arguments: {
        name: "mcp-test-dash",
        projectType: "standalone-spa",
        template: "lite",
      },
    });

    const body = JSON.parse(res.content[0].text);
    expect(body.name).toBe("mcp-test-dash");
    expect(body.files["src/main.js"]).toContain("lite");
  });

  it("executes generate_eodash_config MCP tool via protocol", async () => {
    const { client } = await createTestClientServer();

    const res = await client.callTool({
      name: "generate_eodash_config",
      arguments: {
        id: "test-generated-config",
        template: "expert",
        brand: { name: "Test Generator" },
      },
    });

    const body = JSON.parse(res.content[0].text);
    expect(body.id).toBe("test-generated-config");
    expect(body.configCode).toContain("expert");
  });
});
