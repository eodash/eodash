#!/usr/bin/env node

import { fileURLToPath } from 'url';

// global paths
export const appPath = fileURLToPath(new URL("..", import.meta.url));
export const execPath = fileURLToPath(new URL(process.cwd(), import.meta.url));
export const configPath = execPath + "/config.js";


