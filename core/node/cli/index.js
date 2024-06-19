#!/usr/bin/env node

import { buildApp, createDevServer, previewApp } from "./app.js";

const command = process.argv?.[2];
(async () => {
  switch (command) {
    case "dev":
      await createDevServer();
      break;
    case "build":
      await buildApp();
      break;
    case "preview":
      await previewApp();
      break;

    default:
      console.error("command not found");
      break;
  }
})();
