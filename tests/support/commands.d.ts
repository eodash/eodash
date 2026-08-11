// Pulls in the playwright provider's `BrowserCommandContext` augmentation
// (`ctx.context`) and declares the custom commands registered in vitest.config.
import "@vitest/browser-playwright";

declare module "vitest/browser" {
  interface BrowserCommands {
    serveFiles: (routes: Record<string, string>) => Promise<void>;
    serveResponses: (
      routes: Record<
        string,
        "abort" | { status?: number; body?: string; contentType?: string }
      >,
    ) => Promise<void>;
    stopServingFiles: () => Promise<void>;
  }
}
