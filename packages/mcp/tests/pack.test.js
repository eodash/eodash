import { describe, it, expect } from "vitest";
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
    const jsonStart = output.indexOf("[");
    const jsonEnd = output.lastIndexOf("]") + 1;
    const jsonText =
      jsonStart !== -1 && jsonEnd !== 0
        ? output.slice(jsonStart, jsonEnd)
        : output;
    const packInfo = JSON.parse(jsonText);
    expect(packInfo).toBeDefined();
    expect(Array.isArray(packInfo)).toBe(true);

    const files = packInfo[0].files.map((f) => f.path);

    // Verify key files and directories are included in the tarball
    expect(files).toContain("index.js");
    expect(files).toContain("server.js");
    expect(files).toContain("helpers.js");
    expect(files).toContain("package.json");

    // Verify data and templates are included
    const hasData = files.some((f) => f.startsWith("data/"));
    const hasTemplates = files.some((f) => f.startsWith("templates/"));
    const hasTools = files.some((f) => f.startsWith("tools/"));

    expect(hasData).toBe(true);
    expect(hasTemplates).toBe(true);
    expect(hasTools).toBe(true);
  });
});
