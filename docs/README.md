# Contributing to the docs

The documentation site is built with VitePress using `@eox/pages-theme-eox`. Pages are Markdown files in this `docs/` folder; the API reference under `docs/api/` is generated from the source code and must not be hand-edited.

## Commands

| Command | What it does |
| --- | --- |
| `npm run docs:dev` | Start the local dev server (hot reload) at `http://localhost:3333`. |
| `npm run docs:generate` | Build the CLI and type declarations, then run TypeDoc to regenerate `docs/api/`. |
| `npm run docs:build` | `docs:generate` then build the production site. |
| `npm run docs:preview` | Serve the production build locally. |

Run `npm run docs:generate` whenever you change a widget's props or a documented type, so the generated reference under `docs/api/` is up to date.

## Adding a page

1. Create a Markdown file in `docs/`, e.g. `docs/my-page.md`.
2. Link it in the sidebar by adding an entry to the relevant `sidebar` group in `docs/.vitepress/config.js`:

   ```js
   { text: "My Page", link: "/my-page" }
   ```

3. Link to it from other pages with a normal Markdown link: `[My Page](/my-page)`.

## Documenting an internal widget

Each internal widget has a guide page under `docs/widgets/internal-widgets/`. The file name must match the widget name exactly (e.g. `EodashMap.md`).

To pull in the widget's full property reference (types, defaults, descriptions), drop this comment in the page:

```md
<!-- @widget-props -->
```

It is replaced at build time with the generated props for the widget that matches the file name — so you do not write the property table by hand. The prop descriptions and defaults come from the JSDoc comments on the widget's `defineProps`, so document props in the component source.

A typical widget page:

```md
# EodashMap

Short description of what the widget does and where it is used.
## Example

\`\`\`js
{ widget: { name: "EodashMap", properties: { zoom: 3 } } }
\`\`\`

<!-- @widget-props -->


## See also

- [Another widget](/widgets/internal-widgets/EodashItemCatalog)
```

New widget pages appear in the sidebar and the index table at `docs/widgets/internal-widgets.md` automatically. If you add a brand-new widget, register it in `core/node/typedoc/widgets.ts` (the build will tell you if you forget).

For how the generation pipeline works under the hood, see [`.agents/08-documentation-setup.md`](../.agents/08-documentation-setup.md).