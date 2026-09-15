import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "fs/promises";
import { tmpdir } from "os";
import path from "path";
import { updateEnvRuntimeConfig } from "../../core/node/scripts/createDockerConfig.js";

let tmp = "";

beforeAll(async () => {
  tmp = await mkdtemp(path.join(tmpdir(), "eodash-docker-config-"));
});

afterAll(() => rm(tmp, { recursive: true, force: true }));

describe("updateEnvRuntimeConfig", () => {
  it("replaces inlined {}.EODASH_RUNTIME_CONFIG produced by Vite 8 / Rolldown", async () => {
    const testDir = path.join(tmp, "vite8-build");
    await mkdir(testDir, { recursive: true });

    const bundleSnippet =
      'var Gn=async(e={}.EODASH_RUNTIME_CONFIG)=>{let t,n=d(D);if(e){if(t=typeof e=="function"?await e():await I(()=>import(new URL(e,import.meta.url).href)...';
    const filePath = path.join(testDir, "main.js");
    await writeFile(filePath, bundleSnippet, "utf-8");

    const targetUrl =
      "https://hub-otc-sc.eox.at/services/eoxhub-gateway/aducat/eodash/config.js";
    await updateEnvRuntimeConfig(targetUrl, testDir);

    const updatedContent = await readFile(filePath, "utf-8");
    expect(updatedContent).toContain(`var Gn=async(e="${targetUrl}")=>{`);
    expect(updatedContent).not.toContain("{}.EODASH_RUNTIME_CONFIG");
  });

  it("replaces legacy minified identifiers and process.env.EODASH_RUNTIME_CONFIG", async () => {
    const testDir = path.join(tmp, "legacy-build");
    await mkdir(testDir, { recursive: true });

    const filePath1 = path.join(testDir, "chunk1.js");
    const filePath2 = path.join(testDir, "chunk2.js");

    await writeFile(
      filePath1,
      "const runtime = process.env.EODASH_RUNTIME_CONFIG || defaultCfg;",
      "utf-8",
    );
    await writeFile(
      filePath2,
      "const runtime = n.EODASH_RUNTIME_CONFIG || defaultCfg;",
      "utf-8",
    );

    const targetUrl = "https://example.com/custom-config.js";
    await updateEnvRuntimeConfig(targetUrl, testDir);

    expect(await readFile(filePath1, "utf-8")).toBe(
      `const runtime = "${targetUrl}" || defaultCfg;`,
    );
    expect(await readFile(filePath2, "utf-8")).toBe(
      `const runtime = "${targetUrl}" || defaultCfg;`,
    );
  });

  it("traverses subdirectories and ignores non-js files", async () => {
    const testDir = path.join(tmp, "nested");
    const subDir = path.join(testDir, "assets");
    await mkdir(subDir, { recursive: true });

    const jsFile = path.join(subDir, "bundle.js");
    const cssFile = path.join(subDir, "style.css");

    await writeFile(jsFile, "e={}.EODASH_RUNTIME_CONFIG", "utf-8");
    await writeFile(cssFile, "/* {}.EODASH_RUNTIME_CONFIG */", "utf-8");

    const targetUrl = "https://example.com/config.js";
    const count = await updateEnvRuntimeConfig(targetUrl, testDir);

    expect(count).toBe(1);
    expect(await readFile(jsFile, "utf-8")).toBe(`e="${targetUrl}"`);
    expect(await readFile(cssFile, "utf-8")).toBe(
      "/* {}.EODASH_RUNTIME_CONFIG */",
    );
  });

  it("returns 0 when no files match the pattern", async () => {
    const testDir = path.join(tmp, "no-match");
    await mkdir(testDir, { recursive: true });
    const jsFile = path.join(testDir, "other.js");
    await writeFile(jsFile, "console.log('hello')", "utf-8");

    const count = await updateEnvRuntimeConfig(
      "https://example.com/cfg.js",
      testDir,
    );
    expect(count).toBe(0);
  });
});
