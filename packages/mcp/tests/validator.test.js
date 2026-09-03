import { describe, it, expect } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../index.js";
import {
  validateCatalogConfig,
  COLLECTION_SCHEMA_URL,
  INDICATOR_SCHEMA_URL,
} from "../generators/validator.js";

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

describe("eodash Catalog Schema Validator - Unit Tests", () => {
  it("validates a minimal valid collection configuration", async () => {
    const validCollection = {
      Name: "test-collection",
      Title: "Test Collection Title",
      Description: "Detailed description of the test collection.",
      Resources: [
        {
          Name: "COG source",
          Style: "styles/test.json",
          TimeEntries: [
            {
              Time: "2024-01-01T00:00:00Z",
              Assets: [
                {
                  Identifier: "cog_asset",
                  File: "https://example.com/test.tif",
                },
              ],
            },
          ],
        },
      ],
    };

    const res = await validateCatalogConfig({
      config: validCollection,
      configType: "collection",
    });

    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
    expect(res.configType).toBe("collection");
    expect(res.schemaUrl).toBe(COLLECTION_SCHEMA_URL);
  });

  it("validates a minimal valid indicator configuration", async () => {
    const validIndicator = {
      Name: "test-indicator",
      Title: "Test Indicator Title",
      Description: "Detailed description of the test indicator.",
      Collections: ["test-collection-1", "test-collection-2"],
    };

    const res = await validateCatalogConfig({
      config: validIndicator,
      configType: "indicator",
    });

    expect(res.valid).toBe(true);
    expect(res.errors).toHaveLength(0);
    expect(res.configType).toBe("indicator");
    expect(res.schemaUrl).toBe(INDICATOR_SCHEMA_URL);
  });

  it("auto-detects indicator and collection config types", async () => {
    const indRes = await validateCatalogConfig({
      config: {
        Name: "auto-indicator",
        Title: "Auto Indicator",
        Description: "Description text",
        Collections: ["col-a"],
      },
      configType: "auto",
    });
    expect(indRes.configType).toBe("indicator");

    const colRes = await validateCatalogConfig({
      config: {
        Name: "auto-collection",
        Title: "Auto Collection",
        Description: "Description text",
        Resources: [],
      },
      configType: "auto",
    });
    expect(colRes.configType).toBe("collection");
  });

  it("fails validation for invalid JSON string", async () => {
    const res = await validateCatalogConfig({
      config: "{ invalid json: true ",
    });

    expect(res.valid).toBe(false);
    expect(res.errors[0].message).toContain("JSON Parse error");
  });

  it("fails validation when required properties are missing", async () => {
    const invalidCol = {
      Name: "invalid-collection",
      // Missing Title and Resources
    };

    const res = await validateCatalogConfig({
      config: invalidCol,
      configType: "collection",
    });

    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThanOrEqual(1);
    expect(res.summary).toContain("Validation failed");
  });

  it("enforces rule: Style MUST be a URL string and not a JSON object", async () => {
    const colWithObjStyle = {
      Name: "obj-style-col",
      Title: "Object Style",
      Resources: [
        {
          Name: "COG source",
          Style: { "fill-color": "#ff0000" }, // Illegal object
          TimeEntries: [
            {
              Time: "2024-01-01T00:00:00Z",
              Assets: [{ Identifier: "a", File: "https://example.com/a.tif" }],
            },
          ],
        },
      ],
    };

    const res = await validateCatalogConfig({
      config: colWithObjStyle,
      configType: "collection",
    });

    expect(res.valid).toBe(false);
    expect(
      res.errors.some((e) => e.message.includes("Style MUST be a URL string")),
    ).toBe(true);
  });

  it("warns when Rasterform uses branching without keep_oneof_values: false", async () => {
    const colWithBranchingRasterform = {
      Name: "branch-col",
      Title: "Branching Rasterform",
      Resources: [
        {
          Name: "WMS resource",
          EndPoint: "https://example.com/wms",
          Type: "image/png",
          LayerId: "layer1",
          Rasterform: {
            oneOf: [
              { title: "Asset A", properties: {} },
              { title: "Asset B", properties: {} },
            ],
            options: {}, // Missing keep_oneof_values: false
          },
        },
      ],
    };

    const res = await validateCatalogConfig({
      config: colWithBranchingRasterform,
      configType: "collection",
    });

    expect(res.warnings.length).toBeGreaterThan(0);
    expect(res.warnings[0]).toContain("keep_oneof_values");
  });
});

describe("eodash MCP Tool - validate_catalog_config via Client", () => {
  it("calls validate_catalog_config tool via MCP client with valid indicator config", async () => {
    const { client } = await createTestClientServer();

    const result = await client.callTool({
      name: "validate_catalog_config",
      arguments: {
        config: {
          Name: "indicator-test",
          Title: "Indicator Test",
          Description: "Description text for indicator test",
          Collections: ["collection-1", "collection-2"],
        },
        configType: "indicator",
      },
    });

    expect(result.content[0].type).toBe("text");
    const data = JSON.parse(result.content[0].text);
    expect(data.valid).toBe(true);
    expect(data.configType).toBe("indicator");
  });

  it("calls validate_catalog_config tool via MCP client with invalid config string", async () => {
    const { client } = await createTestClientServer();

    const result = await client.callTool({
      name: "validate_catalog_config",
      arguments: {
        config: JSON.stringify({
          Name: "broken-collection",
          // Missing Resources and Title
        }),
        configType: "collection",
      },
    });

    const data = JSON.parse(result.content[0].text);
    expect(data.valid).toBe(false);
    expect(data.errors.length).toBeGreaterThan(0);
  });
});
