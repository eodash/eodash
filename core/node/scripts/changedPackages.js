import { execFileSync } from "node:child_process";
import { appendFileSync, globSync, readFileSync } from "node:fs";
import { basename, dirname } from "node:path";

/**
 * Which scopes (`app` plus each workspace package) a branch touched, so CI
 * runs only those suites.
 *
 * Usage: `node core/node/scripts/changedPackages.js <baseRef>` from the repo
 * root. Writes `<scope>=true|false` lines plus `scopes=<json array>` to
 * `$GITHUB_OUTPUT` and stdout. No base ref: everything counts as changed. A
 * git failure exits non-zero on purpose: better a red job than an empty diff
 * silently skipping every suite.
 */

/** The app itself: everything the workspaces do not own. */
const APP = "app";

/**
 * No single scope owns these, so a change runs everything (`.github/`: CI
 * edits must still prove the suites pass).
 */
const SHARED = [
  "package.json",
  "package-lock.json",
  "vitest.config.js",
  "tests/support/",
  ".github/",
];

/** The app's sources; unlisted root files (docs/, Dockerfile, ...) map to no scope. */
const APP_PATHS = ["core/", "widgets/", "templates/", "tests/"];

/**
 * Package directory names whose suites also run when the app's sources change,
 * because they read those sources rather than importing the built package.
 * Comma separated, set by the workflow; empty when no package does.
 */
const RUN_ON_APP_CHANGE = (process.env.RUN_ON_APP_CHANGE ?? "")
  .split(",")
  .map((scope) => scope.trim())
  .filter(Boolean);

const [baseRef] = process.argv.slice(2);
const scopes = [APP, ...workspaceScopes()];
const changed = baseRef ? scopesOf(changedFiles(baseRef)) : new Set(scopes);

report(changed);

/**
 * Scope names: the directory name of every workspace package. Matching on the
 * manifest skips a directory npm does not consider a workspace yet, and yields
 * nothing at all while `packages/` is still absent.
 *
 * @returns {string[]}
 */
function workspaceScopes() {
  /** @type {string[]} */
  const workspaces =
    JSON.parse(readFileSync("package.json", "utf-8")).workspaces ?? [];
  return workspaces
    .flatMap((glob) => globSync(`${glob}/package.json`))
    .map((manifest) => basename(dirname(manifest)));
}

/**
 * @param {string} baseRef what the branch is merging into, e.g. `origin/main`
 * @returns {string[]} paths, relative to the repository root
 */
function changedFiles(baseRef) {
  // -z keeps unicode paths unquoted; --no-renames lists both sides of a move.
  return execFileSync(
    "git",
    ["diff", "--name-only", "-z", "--no-renames", `${baseRef}...HEAD`],
    { encoding: "utf-8" },
  )
    .split("\0")
    .filter(Boolean);
}

/**
 * @param {string[]} files
 * @returns {Set<string>} the scopes those files belong to
 */
function scopesOf(files) {
  if (files.some((file) => SHARED.some((path) => file.startsWith(path)))) {
    return new Set(scopes);
  }
  const touched = new Set();
  let appSourcesChanged = false;
  for (const file of files) {
    const [, scope] = file.match(/^packages\/([^/]+)\//) ?? [];
    if (scope && scopes.includes(scope)) {
      // the app imports the packages, so its suites cover their changes too
      touched.add(scope);
      touched.add(APP);
    } else if (APP_PATHS.some((path) => file.startsWith(path))) {
      touched.add(APP);
      appSourcesChanged = true;
    }
  }
  // a package that reads the app's sources, rather than importing the built
  // package, only proves it still works by running against the changed app.
  // Keyed off the sources, not the `app` scope, which a package change also sets.
  if (appSourcesChanged) {
    RUN_ON_APP_CHANGE.filter((scope) => scopes.includes(scope)).forEach(
      (scope) => touched.add(scope),
    );
  }
  return touched;
}

/** @param {Set<string>} changed */
function report(changed) {
  const touched = scopes.filter((scope) => changed.has(scope));
  const paths = touched.map((scope) =>
    scope === APP ? "." : `./packages/${scope}`,
  );
  const lines = [
    `${APP}=${changed.has(APP)}`,
    // drives the packages job's matrix, so the app is not one of its entries
    `packages=${JSON.stringify(touched.filter((scope) => scope !== APP))}`,
    // ready to hand to a tool that takes package directories, e.g. pkg-pr-new
    `paths=${paths.join(" ")}`,
  ].join("\n");

  if (process.env.GITHUB_OUTPUT) {
    appendFileSync(process.env.GITHUB_OUTPUT, `${lines}\n`);
  }
  // "nothing ran" has to be visible: gating is only safe when a skipped suite
  // is stated rather than inferred from a green check.
  if (process.env.GITHUB_STEP_SUMMARY) {
    appendFileSync(
      process.env.GITHUB_STEP_SUMMARY,
      `Suites to run: ${touched.join(", ") || "none"}\n`,
    );
  }
  console.log(lines);
}
