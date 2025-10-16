/// <reference types="vite/client" />

declare module "*.vue" {
  import type { DefineComponent } from "vue";
  const component: DefineComponent<object, object, unknown>;
  export default component;
}
declare interface Window {
  eodashStore: typeof import("@/store").default;
  setEodashLoglevel: typeof import("loglevel").setLevel;
}
declare module "user:config" {
  const eodash: import("@/types").Eodash | Promise<import("@/types").Eodash>;
  export default eodash;
}
declare module "stac-js" {
  export const Collection: {
    new (data?: object): import("stac-ts").StacCollection;
  };
  export const Item: { new (data?: object): import("stac-ts").StacItem };
}
declare module "stac-js/src/http.js" {
  const toAbsolute: (...args: string[]) => string;
  export { toAbsolute };
}

declare const __userConfigExist__: boolean;
declare module "@eox/ui/vuetify/blueprint.js" {
  import type { Blueprint } from "vuetify";
  const eox: Blueprint;
  export { eox };
}

declare module "@json-editor/json-editor/src/editor" {
  export class AbstractEditor {
    schema: Record<string, any>;
    active: boolean;
    options: Record<string, any>;
    formname: string;
    path: string;
    parent?: AbstractEditor;
    container?: HTMLElement;
    input?: HTMLElement;
    label?: HTMLElement;
    header?: HTMLElement;

    constructor(
      options: {
        jsoneditor: any;
        schema: Record<string, any>;
        path?: string;
        formname?: string;
        parent?: AbstractEditor;
        container?: HTMLElement;
      },
      defaults: any,
    );

    // Core lifecycle methods
    build(): void;
    preBuild(): void;
    postBuild(): void;
    destroy(): void;
    register(): void;
    unregister(): void;

    // Event handling
    onChildEditorChange(editor: AbstractEditor, eventData?: unknown): void;
    notify(): void;
    change(eventData?: unknown): void;
    onChange(
      bubble?: boolean,
      fromTemplate?: boolean,
      eventData?: unknown,
    ): void;
    onMove(): void;
    onWatchedFieldChange(): void;

    // Value management
    setValue(value: unknown): void;
    getValue(): any;
    refreshValue(): void;
    getDefault(): unknown;
    applyConstFilter(value: unknown): unknown;

    // State management
    isActive(): boolean;
    activate(): void;
    deactivate(): void;
    enable(): void;
    disable(): void;
    isEnabled(): boolean;
    isRequired(): boolean;
    isDefaultRequired(): boolean;

    // Dependencies
    registerDependencies(): void;
    evaluateDependencies(): void;
    checkDependency(path: string, choices: unknown): void;

    // Container and UI
    setContainer(container: HTMLElement): void;
    setContainerAttributes(): void;
    setOptInCheckbox(): void;
    getNumColumns(): number;

    // Watch functionality
    setupWatchListeners(): void;
    refreshWatchedFieldValues(): boolean;
    getWatchedFieldValues(): Record<string, unknown>;

    // Links
    addLinks(): void;
    addLink(link: HTMLElement): void;
    getLink(data: {
      href: string;
      rel?: string;
      mediaType?: string;
      download?: boolean | string;
      class?: string;
    }): HTMLElement;

    // UI helpers
    getButton(
      text: string,
      icon?: string,
      title?: string,
      args?: unknown[],
    ): HTMLElement;
    setButtonText(
      button: HTMLElement,
      text: string,
      icon?: string,
      title?: string,
      args?: unknown[],
    ): HTMLElement;
    updateHeaderText(): void;
    getHeaderText(titleOnly?: boolean): string;
    getTitle(): string;
    cleanText(txt: string): string;

    // Utility methods
    getPathDepth(): number;
    getChildEditors(): boolean | Record<string, AbstractEditor>;
    getDisplayText(arr: unknown[]): string[];
    getValidId(id?: string | number): string;
    setInputAttributes(inputAttribute: string[], input?: HTMLElement): void;
    expandCallbacks(
      scope: string,
      options: Record<string, unknown>,
    ): Record<string, unknown>;
    showValidationErrors(errors: unknown[]): void;
  }
}
