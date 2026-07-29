# Tests

This guide explains how to run and write tests in `eodash`. We use Vitest across the board.

Tests are split into three projects. The `unit` and `component` projects run in headless Chromium via Playwright, while `cli` runs in Node.

## Setup

You need to install dependencies and the Playwright browser before running tests locally.

```sh
npm install
npx playwright install chromium
```

## Running

The main commands are:

| Command                  | Action                                                         |
| ------------------------ | -------------------------------------------------------------- |
| `npm run test`           | Run all test projects headlessly (this is what CI runs).       |
| `npm run test:unit`      | Run the unit project.                                          |
| `npm run test:component` | Run the component project.                                     |
| `npm run test:cli`       | Run the CLI project.                                           |
| `npm run vitest`         | Open the Vitest UI in watch mode for unit and component tests. |
| `npm run vitest:browser` | Open a headed browser to watch component tests render.         |

To run a specific file, append the path after `--`:

```sh
npm run test:component -- tests/component/EodashLayerControl.test.js
```

## Directory layout

Tests are split by what they actually do

```text
tests/
  component/   # Tests that mount Vue components. Heavy things are mocked here.
  unit/        # Plain JS function tests (STAC pipeline, store logic). No mounting allowed.
  cli/         # Tests for the Node CLI.
  support/     # Shared helpers like mount.js, element stubs, and store mocks.
  fixtures/    # Mock data or stand-ins shared across tiers.
```

## Writing tests

### Where does it go?

- **`tests/unit/`**: feature-level functions and composables: the STAC pipeline, store logic, widget `methods/`. Test a feature's entry points with realistic inputs instead of writing a suite per helper. No mounting here.
- **`tests/component/`**: Vue components and their reactivity: rendering, props and events, state writes. Mock what the unit tier already covers and drive the component through DOM events.
- **`tests/template/`** (upcoming): e2e integration tests between widgets, states, and feature pipelines working together in a full app against real STAC endpoints, with little to no mocking.

### Mounting components

Helpers in `tests/support/mount.js` can be used to mount Vue components.

- `mountComponent` for standard widgets.
- `mountAsyncComponent` for widgets with async setup.

### Mocking

Keep component tests hermetic: mock network requests and heavy external web components.

The idea is that mocking defers coverage,but it doesn't replace it; any code written by eodash that is mocked in component testing needs its own unit tests or template tier coverage.
