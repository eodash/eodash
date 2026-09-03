import { writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { JsonReporter } from "vitest/node";
import { fileKeyOf, filesInScope, keyOf, previousSamples } from "./baseline.js";
import { render } from "./markdown.js";

/**
 * @typedef {object} Sample
 * @property {string} file absolute path of the test file
 * @property {string} key
 * @property {string} state
 * @property {any} perf
 */

/**
 * @typedef {object} PerformanceReportConfig
 * @property {string} scope directory the measured tests live in, and the prefix test keys are relative to
 * @property {string} metaKey the `task.meta` field samples are attached to
 * @property {string} markdownFile written beside the json the base class writes
 * @property {string} title
 * @property {string | ((samples: Sample[]) => string)} intro everything above the table, so a config can lead with a caveat when a run warrants one
 * @property {string} [glossary]
 * @property {{label: string, value: (perf: any) => string}[]} columns
 * @property {((sample: Sample, previous: any) => string[])[]} [notes] remarks listed under the test they concern
 * @property {((samples: Sample[], previous: Map<string, any>, warmup: Map<string, any>) => string | null)[]} [sections] blocks after the table
 * @property {(sample: Sample) => string | null} [invalidReason] why a sample cannot be compared, which also keeps it from being used as a baseline
 */

/**
 * Vitest's json reporter, plus a markdown rendering of the same samples. It
 * knows nothing about what is measured: the columns, the prose and every claim
 * come from `report`.
 */
export class PerformanceReporter extends JsonReporter {
  /** @param {{outputFile: string, report: PerformanceReportConfig}} options */
  constructor({ report, ...options }) {
    super(options);
    this.report = report;
    // Kept as our own field: the base class types it as optional.
    this.outputFile = options.outputFile;
  }

  /** @param {ReadonlyArray<import("vitest/node").TestModule>} testModules */
  async onTestRunEnd(testModules) {
    const root = this.ctx.config.root;
    // Coverage, not success. A failing test still leaves a sample the config
    // can quarantine, but a file that contributed none would shrink the
    // baseline silently.
    const samples = samplesOf(testModules, this.report);
    const missing = filesInScope(root, this.report.scope).filter(
      (file) => !samples.some((sample) => sample.file === file),
    );
    if (missing.length) {
      this.ctx.logger.log(
        `performance report skipped, no samples from: ${missing
          .map((file) => file.replace(`${root}/`, ""))
          .join(", ")}`,
      );
      return;
    }

    const previous = await previousSamples(
      resolve(root, this.outputFile),
      this.report,
    );
    // What vitest itself timed before each file's first test. Scoped like the
    // samples are, so a wider run does not list files by absolute path.
    const warmup = new Map(
      testModules
        .filter((testModule) => testModule.moduleId.includes(this.report.scope))
        .map((testModule) => [
          fileKeyOf(testModule.moduleId, this.report.scope),
          testModule.diagnostic(),
        ]),
    );
    await super.onTestRunEnd(testModules);
    await writeFile(
      resolve(root, this.report.markdownFile),
      render(samples, previous, this.report, warmup),
    );
  }

  /**
   * Repo-relative paths and pretty-printed json, so the report does not churn
   * per machine.
   * @param {string} report
   */
  async writeReport(report) {
    const parsed = JSON.parse(report);
    for (const result of parsed.testResults ?? []) {
      result.name = result.name.replace(`${this.ctx.config.root}/`, "");
    }
    await super.writeReport(JSON.stringify(parsed, null, 2));
  }
}

/**
 * @param {ReadonlyArray<import("vitest/node").TestModule>} modules
 * @param {PerformanceReportConfig} config
 * @returns {Sample[]}
 */
const samplesOf = (modules, { scope, metaKey }) =>
  modules.flatMap((testModule) =>
    [...testModule.children.allTests()].flatMap((test) => {
      const perf = /** @type {any} */ (test.meta())[metaKey];
      return perf
        ? [
            {
              file: testModule.moduleId,
              key: keyOf(testModule.moduleId, test.name, scope),
              state: test.result().state,
              perf,
            },
          ]
        : [];
    }),
  );
