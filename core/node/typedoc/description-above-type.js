/**
 * TypeDoc markdown theme `eodash`: render each member's description above its
 * type code block instead of after `Defined in:`. Rather than copy the ~70-line
 * stock `declaration` partial, we re-render the summary, strip that substring
 * from the original output, and prepend it. Registered via typedoc.config.json.
 */

import { MarkdownTheme, MarkdownThemeContext } from "typedoc-plugin-markdown";

class SummaryFirstContext extends MarkdownThemeContext {
  constructor(theme, page, options) {
    super(theme, page, options);

    const originalDeclaration = this.partials.declaration;
    const renderComment = this.partials.comment;

    this.partials = {
      ...this.partials,
      declaration: (model, opts = { headingLevel: 2, nested: false }) => {
        const output = originalDeclaration(model, opts);
        if (!model.comment?.summary?.length) return output;

        // Re-render the summary exactly as the stock partial embeds it.
        const summary = renderComment(model.comment, {
          headingLevel: opts.headingLevel,
          showSummary: true,
          showTags: false,
        });
        if (!summary || !output.includes(summary)) return output;

        const withoutSummary = output
          .replace(`\n\n${summary}`, "")
          .replace(summary, "");
        return `${summary}\n\n${withoutSummary}`.trim();
      },
    };
  }
}

class SummaryFirstTheme extends MarkdownTheme {
  getRenderContext(page) {
    return new SummaryFirstContext(this, page, this.application.options);
  }
}

export function load(app) {
  app.renderer.defineTheme("eodash", SummaryFirstTheme);
}
