#!/usr/bin/env node

import { buildApp, createDevServer, previewApp } from './cli.js'

const command = process.argv?.[2];
(async () => {
  const baseFlag = (  
    process.argv.indexOf('--base') > -1 ? process.argv[process.argv.indexOf('--base')+1] : null
  );
  switch (command) {
    case "dev":
      await createDevServer();
      break;
    case "build":
      await buildApp(baseFlag);
      break;
    case "preview":
      await previewApp();
      break;

    default:
      console.error('command not found')
      break;
  }
})();
