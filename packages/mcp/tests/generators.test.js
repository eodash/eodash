import { describe, it, expect } from "vitest";
import ts from "typescript";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../index.js";
import { findExamples } from "../generators/examples.js";

function assertValidJavaScript(filename, code) {
  const sf = ts.createSourceFile(
    filename,
    code,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.JS,
  );
  const diagnostics = sf.parseDiagnostics || [];
  if (diagnostics.length > 0) {
    const errMessages = diagnostics
      .map((d) => `${d.messageText} at pos ${d.start}`)
      .join("; ");
    throw new Error(
      `Syntax error in file '${filename}': ${errMessages}\n\nCode:\n${code}`,
    );
  }
}

function assertValidJson(filename, content) {
  try {
    JSON.parse(content);
  } catch (err) {
    throw new Error(
      `Invalid JSON in file '${filename}': ${err.message}\n\nContent:\n${content}`,
    );
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

describe("eodash Scaffold & Config Examples Discovery", () => {
  it("discovers standalone SPA, VitePress, and Web Component scaffolds", () => {
    const scaffolds = findExamples({
      category: "dashboard-scaffold",
      limit: 10,
    });

    expect(scaffolds.results.length).toBeGreaterThanOrEqual(3);
    const ids = scaffolds.results.map((s) => s.id);
    expect(ids).toContain("dashboard-scaffold-spa");
    expect(ids).toContain("dashboard-scaffold-vitepress");
    expect(ids).toContain("dashboard-scaffold-webcomponent");

    for (const scaffold of scaffolds.results) {
      expect(typeof scaffold.code).toBe("object");
      for (const [filename, content] of Object.entries(scaffold.code)) {
        if (filename.endsWith(".js")) {
          assertValidJavaScript(filename, content);
        } else if (filename.endsWith(".json")) {
          assertValidJson(filename, content);
        }
      }
    }
  });

  it("discovers standard and custom dashboard configurations", () => {
    const configs = findExamples({
      category: "dashboard-config",
      limit: 10,
    });

    expect(configs.results.length).toBeGreaterThanOrEqual(2);
    const ids = configs.results.map((c) => c.id);
    expect(ids).toContain("dashboard-config-standard-lite");
    expect(ids).toContain("dashboard-config-custom-widgets");

    for (const config of configs.results) {
      expect(typeof config.code).toBe("string");
      assertValidJavaScript(`${config.id}.js`, config.code);
    }
  });
});

describe("eodash MCP Server - Discovery Tool Execution for Scaffolds and Configs", () => {
  it("executes find_examples MCP tool to discover scaffold templates via protocol", async () => {
    const { client } = await createTestClientServer();

    const res = await client.callTool({
      name: "find_examples",
      arguments: {
        category: "dashboard-scaffold",
        query: "vitepress",
      },
    });

    const body = JSON.parse(res.content[0].text);
    expect(body.results.length).toBeGreaterThanOrEqual(1);
    expect(body.results[0].id).toBe("dashboard-scaffold-vitepress");
    expect(body.results[0].code["docs/.vitepress/config.js"]).toContain(
      "isCustomElement",
    );
  });

  it("executes find_examples MCP tool to discover config patterns via protocol", async () => {
    const { client } = await createTestClientServer();

    const res = await client.callTool({
      name: "find_examples",
      arguments: {
        category: "dashboard-config",
        query: "custom-widgets",
      },
    });

    const body = JSON.parse(res.content[0].text);
    expect(body.results.length).toBeGreaterThanOrEqual(1);
    expect(body.results[0].id).toBe("dashboard-config-custom-widgets");
    expect(body.results[0].code).toContain("CustomSensorChart");
  });
});
