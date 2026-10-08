import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { describe, it, expect, vi, beforeAll, afterAll } from "vitest";
import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { InMemoryTransport } from "@modelcontextprotocol/sdk/inMemory.js";
import { createMcpServer } from "../index.js";
import {
  validateCatalogConfig,
  COLLECTION_SCHEMA_URL,
  INDICATOR_SCHEMA_URL,
  createAjvInstance,
  getValidators,
  _resetValidatorsCache,
} from "../generators/validator.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FIXTURES_DIR = path.resolve(__dirname, "fixtures/schemas");
const fixtureCol = JSON.parse(
  fs.readFileSync(path.join(FIXTURES_DIR, "collection-schema.json"), "utf8"),
);
const fixtureInd = JSON.parse(
  fs.readFileSync(path.join(FIXTURES_DIR, "indicator-schema.json"), "utf8"),
);

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
  beforeAll(async () => {
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url) => {
      const urlStr = String(url);
      if (urlStr.includes("collection-schema.json")) {
        return {
          ok: true,
          status: 200,
          statusText: "OK",
          json: async () => fixtureCol,
        };
      }
      if (urlStr.includes("indicator-schema.json")) {
        return {
          ok: true,
          status: 200,
          statusText: "OK",
          json: async () => fixtureInd,
        };
      }
      throw new Error(`Unexpected fetch in test: ${url}`);
    });
    _resetValidatorsCache();
    await getValidators();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

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

  it("warns when Rasterform uses branching without keep_oneof_values: false", async () => {
    const colWithBranchingRasterform = {
      Name: "branch-col",
      Title: "Branching Rasterform",
      Description: "Description text",
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

  it("catches invalid Resources[].Flatstyle in catalog collection config", async () => {
    const invalidCol = {
      Name: "invalid-flatstyle-col",
      Title: "Invalid Flatstyle Resource",
      Description: "Testing Flatstyle on resource error",
      Resources: [
        {
          Name: "SAR Sigma0",
          Flatstyle: "https://example.com/style.json", // Invalid property on Resource
          TimeEntries: [],
        },
      ],
    };

    const res = await validateCatalogConfig({
      config: invalidCol,
      configType: "collection",
    });

    expect(res.valid).toBe(false);
    expect(
      res.errors.some((e) =>
        e.message.includes("Property 'Flatstyle' does not exist on Resources"),
      ),
    ).toBe(true);
  });

  it("calls validate_catalog_config via MCP client successfully", async () => {
    const { client } = await createTestClientServer();

    const response = await client.callTool({
      name: "validate_catalog_config",
      arguments: {
        config: JSON.stringify({
          Name: "test-client-collection",
          Title: "Client Collection Title",
          Description: "Valid description.",
          Resources: [
            {
              Name: "GeoJSON source",
              Style: "https://example.com/styles/vector.json",
              TimeEntries: [
                {
                  Time: "2024-01-01T00:00:00Z",
                  Assets: [
                    {
                      Identifier: "sample",
                      File: "https://example.com/data.geojson",
                    },
                  ],
                },
              ],
            },
          ],
        }),
        configType: "collection",
      },
    });

    const parsed = JSON.parse(response.content[0].text);
    expect(parsed.valid).toBe(true);
    expect(parsed.configType).toBe("collection");
  });

  it("uses cached validators for subsequent calls without additional network requests", async () => {
    const fetchSpy = vi.spyOn(globalThis, "fetch");
    const callsBefore = fetchSpy.mock.calls.length;

    const validCol = {
      Name: "cached-col",
      Title: "Cached Col",
      Description: "Cached Description",
      Resources: [
        {
          Name: "WMS",
          EndPoint: "https://example.com/wms",
          Type: "Time",
          LayerId: "lyr1",
        },
      ],
    };

    const res = await validateCatalogConfig({
      config: validCol,
      configType: "collection",
    });

    expect(res.valid).toBe(true);
    expect(fetchSpy.mock.calls.length).toBe(callsBefore);
  });

  it("throws when remote schema endpoint is unavailable", async () => {
    _resetValidatorsCache();
    vi.spyOn(globalThis, "fetch").mockImplementationOnce(async () => ({
      ok: false,
      status: 503,
      statusText: "Service Unavailable",
    }));

    await expect(getValidators()).rejects.toThrow(/HTTP 503/);
    _resetValidatorsCache();
    await getValidators();
  });

  it("rejects a collection that only the full schema catches", async () => {
    // Has Name, Title, Description, Resources (passes minimal fallback schema),
    // but Resource entry has invalid properties or violates full schema structure
    const invalidResourceCol = {
      Name: "bad-resource-col",
      Title: "Bad Resource Col",
      Description: "Description text",
      Resources: [
        {
          // Missing required Name and valid resource type
          InvalidField: true,
        },
      ],
    };

    const res = await validateCatalogConfig({
      config: invalidResourceCol,
      configType: "collection",
    });

    expect(res.valid).toBe(false);
    expect(res.errors.length).toBeGreaterThan(0);
  });

  it("validates every collection and indicator example against the full eodash schema", async () => {
    const examplesDir = path.resolve(__dirname, "../data/examples");

    const colExamples = JSON.parse(
      fs.readFileSync(path.join(examplesDir, "collection.json"), "utf8"),
    );
    for (const ex of colExamples) {
      const res = await validateCatalogConfig({
        config: ex.code,
        configType: "collection",
      });
      expect(
        res.valid,
        `Collection example ${ex.id} failed validation: ${JSON.stringify(res.errors)}`,
      ).toBe(true);
    }

    const indExamples = JSON.parse(
      fs.readFileSync(path.join(examplesDir, "indicator.json"), "utf8"),
    );
    for (const ex of indExamples) {
      const res = await validateCatalogConfig({
        config: ex.code,
        configType: "indicator",
      });
      expect(
        res.valid,
        `Indicator example ${ex.id} failed validation: ${JSON.stringify(res.errors)}`,
      ).toBe(true);
    }
  });

  it("compiles every jsonform and rasterform example schema with ajv", () => {
    const examplesDir = path.resolve(__dirname, "../data/examples");
    const ajv = createAjvInstance();

    const jsonforms = JSON.parse(
      fs.readFileSync(path.join(examplesDir, "jsonform.json"), "utf8"),
    );
    for (const ex of jsonforms) {
      const schema = ex.code?.schema || ex.code;
      expect(
        () => ajv.compile(schema),
        `Failed to compile jsonform schema for ${ex.id}`,
      ).not.toThrow();
    }

    const rasterforms = JSON.parse(
      fs.readFileSync(path.join(examplesDir, "rasterform.json"), "utf8"),
    );
    for (const ex of rasterforms) {
      const schema = ex.code?.schema || ex.code;
      expect(
        () => ajv.compile(schema),
        `Failed to compile rasterform schema for ${ex.id}`,
      ).not.toThrow();
    }
  });
});
