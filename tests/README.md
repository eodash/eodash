# Tests

This guide explains how to run and write tests in `eodash`. We use Vitest across the board.

Tests are split into four projects. The `unit`, `component`, and `template` projects run in headless Chromium via Playwright, while `cli` runs in Node.

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
| `npm run test:template`  | Run the template project.                                      |
| `npm run test:cli`       | Run the CLI project.                                           |
| `npm run vitest`         | Open the Vitest UI in watch mode for unit and component tests. |
| `npm run vitest:browser` | Open a headed browser to watch component tests render.         |

To run a specific file, append the path after `--`:

```sh
npm run test:component -- tests/component/EodashLayerControl.test.js
```

## Directory layout

Tests are split by what they actually do

```
tests/
  component/   # Tests that mount Vue components. Heavy things are mocked here.
  unit/        # Plain JS function tests (STAC pipeline, store logic). No mounting allowed.
  template/    # Full-app tests per template, against real STAC endpoints.
  cli/         # Tests for the Node CLI.
  support/     # Shared helpers like mount.js, element stubs, and store mocks.
  fixtures/    # Mock data or stand-ins shared across tiers.
```

## Writing tests

### Where does it go?

Ask in order, first "yes" wins. Each behavior is tested in one tier only.

1. Is it a plain function, data in and data out? `tests/unit/`. All edge cases go here.
2. Is it one widget's rendering, props, or events? `tests/component/`. Assert what the widget hands to the mocked boundary, not what happens behind it.
3. Does it need widgets, store, map, and network working together? `tests/template/`. One user-driven flow per feature, asserting hardcoded values from a pinned indicator.
4. Is it the CLI or the build? `tests/cli/`.

Guidelines to avoid duplicate coverage:

- Write expected values by hand rather than computing them. When a test needs the source's own logic to derive the right answer, that logic is better covered by a unit test with fixed inputs and outputs.
- Higher tiers verify wiring, not logic. Once a unit test establishes a function's correctness, a single template flow showing the app calls it is enough; its variations don't need to be repeated there.

### Mounting components

Helpers in `tests/support/mount.js` can be used to mount Vue components.

- `mountComponent` for standard widgets.
- `mountAsyncComponent` for widgets with async setup.

### Mocking

Keep component tests hermetic: mock network requests and heavy external web components.

The idea is that mocking defers coverage, but it doesn't replace it; any code written by eodash that is mocked in component testing needs its own unit tests or template tier coverage.
