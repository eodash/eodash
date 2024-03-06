#!/usr/bin/env node

import path from 'path';
import { fileURLToPath } from 'url';

// global paths
export const appPath = fileURLToPath(new URL("..", import.meta.url));
export const execPath = fileURLToPath(new URL(process.cwd(), import.meta.url));
export const dotEodashPath = path.join(execPath, "/.eodash");
export const configPath = path.join(dotEodashPath, "/config.js");
export const buildTargetPath = path.join(dotEodashPath, '/dist')

