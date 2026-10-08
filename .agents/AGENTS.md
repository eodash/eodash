# eodash AI Knowledge Base

Master index and foundational mandates for development. This document complements `GEMINI.md` and serves as the primary entry point for AI context.

## 1. Context Modules (`.agents/`)

- **[01 Architecture](./01-architecture.md)**: Deployment modes, state management, configuration pipeline, and STAC data flow.
- **[02 Widget System](./02-widgets.md)**: Internal vs web-component workflows, dynamic loading, and layout system.
- **[03 EOx Integration](./03-eox-integration.md)**: Reactive Bridge pattern, component entanglements, and runtime quirks.
- **[04 OGC Process](./04-eodash-process.md)**: Deep dive into the OGC API Process widget and layer ID resolution.

## 2. Philosophy & Heuristics

- **EOx-First:** eodash is a thin orchestration layer. If a feature or fix belongs in an EOx component (e.g., `<eox-map>`), prioritize upstream changes. Investigate `node_modules/@eox/*/src` before modifying Vue wrappers.
- **Search Heuristic:** Widgets load via `import.meta.glob`. Do **not** grep for Vue imports (e.g., `import EodashMap`) to find usage. Instead, search `templates/` for the widget name.
- **Language & Types:** Use plain JavaScript for Vue components (`<script setup>`). Define types using JSDoc imports from `@/types`: `/** @type {import("@/types").YourType} */`.
- **No Emojis:** Never include emojis in any produced content, source code, comments, documentation, commit messages, PR descriptions, or generated files.

## 3. Testing & Validation

- **Logic-First (Vitest):** UI tests are fragile due to Shadow DOM. Prioritize testing pure functions in `methods/*.js`. Verify JSON outputs directly.
- **PR Descriptions:** Always check for and follow `.github/pull_request_template.md` when drafting PR descriptions.
- **Component Testing (Cypress):** Located in `tests/cypress/components/`. Use `.shadow()` to access EOx element internals.
- **Async Synchronization:** EOx elements are Lit-based. Use `await element.updateComplete` after `nextTick()` to ensure the DOM has updated.

## 4. Key Developer Commands

| Command               | Purpose                               |
| --------------------- | ------------------------------------- |
| `npm run dev`         | Start dev server (SPA mode)           |
| `npm run dev:lib`     | Start dev server (Web Component mode) |
| `npm run build`       | Build SPA, Library, or CLI            |
| `npm run check`       | PR Gate: Typecheck and Lint           |
| `npm run test:client` | Run Cypress component tests           |
| `npm run test:mcp`    | Run MCP Server & Generator test suite |

_Note: `npm install` triggers a rollup build for the CLI. If the CLI is missing, run `npm run build:cli`._

## 5. MCP Generators & Tooling Longevity Mandates

- **Synchronize Generators on Core API Updates:** When modifying `createEodash` options, `defineConfig` imports, brand/theme type definitions in `@/types`, or adding/updating templates in `templates/`, always check and update generator templates in `packages/mcp/generators/dashboard.js` and `packages/mcp/generators/config.js`.
- **Verify Generator Boilerplate in CI:** Run `npm run test:mcp` to ensure all scaffolded boilerplate files and generated configs parse as valid, error-free JavaScript/JSON AST.
- **Zero Silent Tooling Workarounds:** Never mask command, test, or typecheck failures with ad-hoc flags or memory inflation (e.g. `NODE_OPTIONS=...`, `--force`). Diagnose and resolve root config issues.
