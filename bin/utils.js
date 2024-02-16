#!/usr/bin/env node

import fs from "fs/promises";

export const copyFolders = async (from, to) => {
  await fs.cp(from, to, { recursive: true }, (err) => {
    if (err) throw err;
    console.log(`copied files from ${from} to ${to}`);
  });

}

export const copyFile = async (from, to) => {
  try {
    await fs.copyFile(from, to);
    console.log(`${from} was copied to ${to}`);
  } catch (e) {
    throw e
  }
}


export const readFile = async (filePath) => {
  return await fs.readFile(filePath, 'utf8', (err, data) => {
    if (err) throw err;
    console.log(`read file : ${filePath}`);
    return data
  });
}
