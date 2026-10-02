import { chromium } from "playwright";

const BASE_URL = process.env.CONTAINER_TEST_URL || "http://localhost:8080";
const EXPECTED_RUNTIME_CONFIG = process.env.EXPECTED_RUNTIME_CONFIG;
const EXPECTED_TEMPLATES = process.env.EXPECTED_TEMPLATES
  ? process.env.EXPECTED_TEMPLATES.split(",").map((t) => t.trim())
  : ["lite", "expert", "compare", "explore"];

async function waitForServer(url, timeoutMs = 30000) {
  const start = Date.now();
  while (Date.now() - start < timeoutMs) {
    try {
      const res = await fetch(url);
      if (res.ok) {
        return;
      }
    } catch {
      // server not ready yet
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error(
    `Server at ${url} did not become ready within ${timeoutMs}ms`,
  );
}

async function runContainerTest() {
  console.log(`[test:docker] Target URL: ${BASE_URL}`);
  console.log(
    `[test:docker] Expected Templates: ${EXPECTED_TEMPLATES.join(", ")}`,
  );
  if (EXPECTED_RUNTIME_CONFIG) {
    console.log(
      `[test:docker] Expected Runtime Config URL: ${EXPECTED_RUNTIME_CONFIG}`,
    );
  }

  await waitForServer(BASE_URL);
  console.log(`[test:docker] Server reachable at ${BASE_URL}`);

  // 1. Verify HTML Entry Point
  const indexRes = await fetch(`${BASE_URL}/`);
  if (!indexRes.ok) {
    throw new Error(`Failed to fetch index.html: status ${indexRes.status}`);
  }
  const indexHtml = await indexRes.text();
  if (!indexHtml.includes('id="app"')) {
    throw new Error('index.html missing element with id="app"');
  }

  // 2. Verify config.js contract
  const configRes = await fetch(`${BASE_URL}/config.js`);
  if (!configRes.ok) {
    throw new Error(`Failed to fetch config.js: status ${configRes.status}`);
  }
  const configJs = await configRes.text();
  if (!configJs.includes("export default config")) {
    throw new Error("config.js missing 'export default config'");
  }
  if (!configJs.includes("importedModule.getBaseConfig")) {
    throw new Error("config.js missing 'importedModule.getBaseConfig'");
  }
  if (configJs.includes("importedModule[key]")) {
    throw new Error("config.js contains broken 'importedModule[key]' indexing");
  }

  // 3. Verify .vite/manifest.json and templates entry point
  const manifestRes = await fetch(`${BASE_URL}/.vite/manifest.json`);
  if (!manifestRes.ok) {
    throw new Error(
      `Failed to fetch manifest.json: status ${manifestRes.status}`,
    );
  }
  const manifest = await manifestRes.json();
  if (!manifest["templates/index.js"]) {
    throw new Error("manifest.json missing 'templates/index.js' entry");
  }

  const templatesFile = manifest["templates/index.js"].file;
  const templatesRes = await fetch(`${BASE_URL}/${templatesFile}`);
  if (!templatesRes.ok) {
    throw new Error(
      `Failed to fetch ${templatesFile}: status ${templatesRes.status}`,
    );
  }
  const templatesJs = await templatesRes.text();
  if (!templatesJs.includes("getBaseConfig")) {
    throw new Error(`${templatesFile} does not export 'getBaseConfig'`);
  }

  // 4. Verify bundle runtime config replacement if expected
  if (EXPECTED_RUNTIME_CONFIG) {
    const mainEntry = manifest["index.html"]?.file;
    if (mainEntry) {
      const mainRes = await fetch(`${BASE_URL}/${mainEntry}`);
      const mainJs = await mainRes.text();
      if (mainJs.includes("{}.EODASH_RUNTIME_CONFIG")) {
        throw new Error(
          "Main bundle contains unreplaced {}.EODASH_RUNTIME_CONFIG",
        );
      }
      if (!mainJs.includes(EXPECTED_RUNTIME_CONFIG)) {
        throw new Error(
          `Main bundle does not contain expected runtime config URL: ${EXPECTED_RUNTIME_CONFIG}`,
        );
      }
    }
  }

  // 5. Browser Execution and Component Mounting
  const browser = await chromium.launch({
    headless: true,
    args: ["--no-sandbox", "--disable-setuid-sandbox"],
  });

  const page = await browser.newPage();
  const pageErrors = [];
  const consoleErrors = [];

  // Zero-tolerance listener for unhandled exceptions
  page.on("pageerror", (err) => {
    console.error("[browser:pageerror]", err);
    pageErrors.push(err.message || String(err));
  });

  // Listener for console errors
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      console.error("[browser:console.error]", msg.text());
      consoleErrors.push(msg.text());
    }
  });

  // Mock external brand and STAC endpoints to avoid test flakiness
  await page.route("https://hub-brands.eox.at/**", (route) => {
    route.fulfill({
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      contentType: "application/javascript",
      body: 'export const config = { theme: { primary_color: "#002742", secondary_color: "#0071C2" } };',
    });
  });

  await page.route("**/catalog.json*", (route) => {
    route.fulfill({
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      contentType: "application/json",
      body: JSON.stringify({
        id: "test-catalog",
        type: "Catalog",
        stac_version: "1.0.0",
        description: "Test Catalog",
        links: [],
      }),
    });
  });

  await page.route("**/collections*", (route) => {
    route.fulfill({
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      contentType: "application/json",
      body: JSON.stringify({
        collections: [],
        links: [],
      }),
    });
  });

  await page.route("https://example.com/**", (route) => {
    route.fulfill({
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
      },
      contentType: "application/json",
      body: JSON.stringify({
        id: "test-api",
        type: "Catalog",
        stac_version: "1.0.0",
        description: "Test API",
        collections: [],
        links: [],
      }),
    });
  });

  console.log(`[test:docker] Navigating browser to ${BASE_URL}...`);
  await page.goto(BASE_URL, { waitUntil: "domcontentloaded" });

  // Assert Vue root element is mounted and visible
  const appElement = page.locator("#app");
  await appElement.waitFor({ state: "visible", timeout: 15000 });

  // Assert Vuetify application container mounted
  const vApp = page.locator(".v-application");
  await vApp.waitFor({ state: "visible", timeout: 15000 });

  // Assert main content area mounted
  const vMain = page.locator(".v-main");
  await vMain.waitFor({ state: "visible", timeout: 15000 });

  // Assert eox-layout element attached
  const layout = page.locator("eox-layout");
  await layout.waitFor({ state: "attached", timeout: 15000 });

  // Assert no unhandled page errors occurred
  if (pageErrors.length > 0) {
    await browser.close();
    throw new Error(
      `Unhandled browser page error(s) during execution:\n${pageErrors.join("\n")}`,
    );
  }

  // Filter console errors (ignoring known benign network aborts if any)
  const fatalConsoleErrors = consoleErrors.filter(
    (msg) =>
      msg.includes("Uncaught") ||
      msg.includes("TypeError") ||
      msg.includes("ReferenceError") ||
      msg.includes("SyntaxError") ||
      msg.includes("[Vue warn]") ||
      msg.includes("Failed to load module script") ||
      msg.includes("importedModule"),
  );

  if (fatalConsoleErrors.length > 0) {
    await browser.close();
    throw new Error(
      `Fatal console error(s) detected during execution:\n${fatalConsoleErrors.join("\n")}`,
    );
  }

  await browser.close();
  console.log(`[test:docker] Test passed for ${BASE_URL}!`);
}

runContainerTest().catch((err) => {
  console.error("[test:docker] Container test failed:", err);
  process.exit(1);
});
