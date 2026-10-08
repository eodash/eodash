#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { getMetadata } from "./helpers.js";
import { registerWidgetTools } from "./tools/widgets.js";
import { registerArchitectureTools } from "./tools/architecture.js";
import { registerDiscoveryTools } from "./tools/discovery.js";
import { registerStacTools } from "./tools/stac.js";
import { createExpressApp as createExpressAppInternal } from "./server.js";
import { getValidators } from "./generators/validator.js";
import { logger } from "./helpers/logger.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const pkgPath = fs.existsSync(path.join(__dirname, "package.json"))
  ? path.join(__dirname, "package.json")
  : path.join(__dirname, "../package.json");

const pkg = fs.existsSync(pkgPath)
  ? JSON.parse(fs.readFileSync(pkgPath, "utf8"))
  : { name: "@eodash/mcp-server", version: "1.0.0" };

export { getMetadata };

/**
 * Creates and registers tools on an McpServer instance
 */
export function createMcpServer() {
  const { widgetsData, architectureData } = getMetadata();

  const server = new McpServer(
    {
      name: pkg.name || "@eodash/mcp-server",
      version: pkg.version || "1.0.0",
    },
    {
      instructions:
        "Inspect, configure, and scaffold @eodash/eodash instances, widgets, layouts, styles, and STAC integrations. " +
        "NOTE: MCP generation tools return code/files in-memory and do NOT write directly to disk; use file writing tools to write returned files.",
    },
  );

  registerWidgetTools(server, widgetsData);
  registerArchitectureTools(server, architectureData);
  registerDiscoveryTools(server);
  registerStacTools(server);

  return server;
}

export function createExpressApp() {
  return createExpressAppInternal(createMcpServer);
}

async function startServer() {
  if (process.argv.includes("--help") || process.argv.includes("-h")) {
    console.log(`
eodash MCP Server

Usage:
  eodash-mcp-server [options]

Options:
  --stdio, -s       Run server with STDIO transport (for MCP desktop clients & local integration)
  --port <port>     Port for SSE/HTTP server (default: 3001)
  --host <host>     Host for SSE/HTTP server (default: 127.0.0.1)
  --skip-schema-preload Skip startup warming of remote STAC schemas
  --help, -h        Show help
`);
    process.exit(0);
  }

  const skipPreload =
    process.env.SKIP_SCHEMA_PRELOAD === "true" ||
    process.argv.includes("--skip-schema-preload");

  if (!skipPreload) {
    // Warm up schemas at startup from authoritative remote URL
    try {
      await getValidators();
    } catch (err) {
      logger.fatal({
        event: "startup_schema_preload_failed",
        error: err.message,
      });
      process.exit(1);
    }
  }

  if (process.argv.includes("--stdio") || process.argv.includes("-s")) {
    const server = createMcpServer();
    const transport = new StdioServerTransport();
    await server.connect(transport);
    logger.info({
      event: "server_started",
      transport: "stdio",
    });
    return;
  }

  const app = createExpressApp();
  let port = parseInt(process.env.PORT || "3001", 10);
  let host = process.env.HOST || "127.0.0.1";

  const portArgIndex = process.argv.indexOf("--port");
  if (portArgIndex > -1 && process.argv[portArgIndex + 1]) {
    port = parseInt(process.argv[portArgIndex + 1], 10);
  }

  const hostArgIndex = process.argv.indexOf("--host");
  if (hostArgIndex > -1 && process.argv[hostArgIndex + 1]) {
    host = process.argv[hostArgIndex + 1];
  }

  app.listen(port, host, () => {
    logger.info({
      event: "server_started",
      transport: "http",
      host,
      port,
      url: `http://${host}:${port}`,
      node_version: process.version,
    });
  });
}

function isDirectExecution() {
  if (!process.argv[1]) return false;
  try {
    const realArgv1 = fs.realpathSync(path.resolve(process.argv[1]));
    const realFilename = fs.realpathSync(__filename);
    return realArgv1 === realFilename;
  } catch {
    return path.resolve(process.argv[1]) === path.resolve(__filename);
  }
}

// Auto start if executed directly
if (isDirectExecution()) {
  startServer().catch((err) => {
    logger.fatal({
      event: "server_start_failed",
      error: err.message,
      stack: err.stack,
    });
    process.exit(1);
  });
}
