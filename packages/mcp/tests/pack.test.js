import fs from "node:fs";
import { describe, it, expect, vi } from "vitest";
import { execSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const MCP_DIR = path.resolve(__dirname, "..");

describe("MCP Package Packaging and Integrity", () => {
  it("packages all required directories and files in npm pack dry run", () => {
    const output = execSync("npm pack --dry-run --json", {
      cwd: MCP_DIR,
      encoding: "utf8",
    });

    // Extract JSON array from output, ignoring any preceding build logs / prefixes
    const jsonEnd = output.lastIndexOf("]");
    let packInfo = null;
    if (jsonEnd !== -1) {
      let depth = 0;
      for (let i = jsonEnd; i >= 0; i--) {
        if (output[i] === "]") depth++;
        else if (output[i] === "[") {
          depth--;
          if (depth === 0) {
            try {
              packInfo = JSON.parse(output.slice(i, jsonEnd + 1));
              break;
            } catch {
              // continue searching
            }
          }
        }
      }
    }

    expect(packInfo).toBeDefined();
    expect(Array.isArray(packInfo)).toBe(true);

    const files = packInfo[0].files.map((f) => f.path);

    // Verify key files and directories are included in the tarball
    expect(files).toContain("dist/index.js");
    expect(files).toContain("dist/server.js");
    expect(files).toContain("dist/helpers.js");
    expect(files).toContain("package.json");

    // Verify data and templates are included
    const hasData = files.some((f) => f.startsWith("data/"));
    const hasTemplates = files.some((f) => f.startsWith("templates/"));

    expect(hasData).toBe(true);
    expect(hasTemplates).toBe(true);
  });

  it("runs the bundled dist/index.js directly over stdio", async () => {
    const { Client } =
      await import("@modelcontextprotocol/sdk/client/index.js");
    const { StdioClientTransport } =
      await import("@modelcontextprotocol/sdk/client/stdio.js");

    const transport = new StdioClientTransport({
      command: "node",
      args: [path.resolve(MCP_DIR, "dist/index.js"), "--stdio"],
      env: { ...process.env, SKIP_SCHEMA_PRELOAD: "true" },
    });
    const client = new Client({
      name: "bundle-test-client",
      version: "1.0.0",
    });
    await client.connect(transport);

    const tools = await client.listTools();
    expect(tools.tools.length).toBeGreaterThanOrEqual(6);
    const names = tools.tools.map((t) => t.name);
    expect(names).toContain("generate_map_from_stac");

    await transport.close();
  });

  it("installs the packed tarball in an empty directory and answers tools/list", async () => {
    const { Client } =
      await import("@modelcontextprotocol/sdk/client/index.js");
    const { StdioClientTransport } =
      await import("@modelcontextprotocol/sdk/client/stdio.js");

    const tmpDir = path.resolve(MCP_DIR, ".pack-test");
    if (fs.existsSync(tmpDir)) {
      fs.rmSync(tmpDir, { recursive: true, force: true });
    }
    fs.mkdirSync(tmpDir, { recursive: true });

    let tarballPath = "";
    try {
      const tarballName = execSync("npm pack --quiet", {
        cwd: MCP_DIR,
        encoding: "utf8",
      })
        .trim()
        .split("\n")
        .pop();
      tarballPath = path.resolve(MCP_DIR, tarballName || "");
      expect(fs.existsSync(tarballPath)).toBe(true);

      execSync(`tar -xzf "${tarballPath}" -C "${tmpDir}"`);

      const pkgDistIndex = path.join(tmpDir, "package/dist/index.js");
      expect(fs.existsSync(pkgDistIndex)).toBe(true);

      const transport = new StdioClientTransport({
        command: "node",
        args: [pkgDistIndex, "--stdio"],
        env: { ...process.env, SKIP_SCHEMA_PRELOAD: "true" },
      });
      const client = new Client({
        name: "tarball-client",
        version: "1.0.0",
      });
      await client.connect(transport);

      const tools = await client.listTools();
      expect(tools.tools.length).toBeGreaterThanOrEqual(6);
      await transport.close();
    } finally {
      if (tarballPath && fs.existsSync(tarballPath)) {
        fs.rmSync(tarballPath, { force: true });
      }
      if (fs.existsSync(tmpDir)) {
        fs.rmSync(tmpDir, { recursive: true, force: true });
      }
    }
  });

  it("throws a clear error at startup when data/*.json is missing", async () => {
    const { getMetadata, _resetMetadataCache } = await import("../helpers.js");
    _resetMetadataCache();
    const existsSpy = vi.spyOn(fs, "existsSync").mockReturnValue(false);
    try {
      expect(() => getMetadata()).toThrow(
        /Metadata not found in @eodash\/mcp\/data\//,
      );
    } finally {
      existsSpy.mockRestore();
      _resetMetadataCache();
    }
  });
});
