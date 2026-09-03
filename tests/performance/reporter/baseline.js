import { readdirSync } from "node:fs";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

/** Divides a sample's file from the test's own name. */
export const SEPARATOR = " :: ";

/**
 * A file's identity across runs: its path below `scope`, without the extension.
 * @param {string} file
 * @param {string} scope
 */
export const fileKeyOf = (file, scope) =>
  (file.split(scope)[1] ?? file).replace(/\.test\.\w+$/, "");

/**
 * A sample's identity across runs: its file plus the test name.
 * @param {string} file
 * @param {string} name
 * @param {string} scope
 */
export const keyOf = (file, name, scope) =>
  `${fileKeyOf(file, scope)}${SEPARATOR}${name}`;

/**
 * Test files on disk below `scope`. A run that did not cover all of them is
 * filtered, and writing it would replace the baseline with rows that only look
 * better for being absent.
 * @param {string} root
 * @param {string} scope
 * @returns {string[]}
 */
export const filesInScope = (root, scope) => {
  /** @param {string} dir @returns {string[]} */
  const walk = (dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((entry) =>
      entry.isDirectory()
        ? walk(`${dir}/${entry.name}`)
        : /\.test\.\w+$/.test(entry.name)
          ? [`${dir}/${entry.name}`]
          : [],
    );
  return walk(resolve(root, scope));
};

/**
 * Each sample paired with its predecessor, keeping only those that have one and
 * that the config is willing to compare. Both the report and its summary read
 * this, so neither can claim a comparison the other did not make.
 *
 * @param {import("./index.js").Sample[]} samples
 * @param {Map<string, any>} previous
 * @param {((sample: import("./index.js").Sample) => string | null) | undefined} invalidReason
 * @returns {Map<string, any>}
 */
export const comparableTo = (samples, previous, invalidReason) => {
  /** @type {Map<string, any>} */
  const comparable = new Map();
  for (const sample of samples) {
    const before = previous.get(sample.key);
    if (before && !invalidReason?.(sample)) comparable.set(sample.key, before);
  }
  return comparable;
};

/**
 * Samples out of the report the last run left behind. Missing or unreadable
 * means a first run, not an error. Samples the config would refuse to compare
 * are dropped here too: being old does not make an unusable sample usable.
 *
 * @param {string} file
 * @param {import("./index.js").PerformanceReportConfig} config
 * @returns {Promise<Map<string, any>>}
 */
export const previousSamples = async (
  file,
  { scope, metaKey, invalidReason },
) => {
  const json = await readFile(file, "utf8")
    .then(JSON.parse)
    .catch(() => null);
  return new Map(
    (json?.testResults ?? []).flatMap((/** @type {any} */ result) =>
      (result.assertionResults ?? []).flatMap((/** @type {any} */ test) => {
        const perf = test.meta?.[metaKey];
        const sample = {
          file: result.name,
          key: keyOf(result.name, test.title, scope),
          state: test.status,
          perf,
        };
        return perf && !invalidReason?.(sample) ? [[sample.key, perf]] : [];
      }),
    ),
  );
};
