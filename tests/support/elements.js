/**
 * Define a bare custom element once. Widgets guard their heavy eox imports
 * with `if (!customElements.get(tag)) await import(...)` — pre-defining the
 * tag short-circuits the import so the async setup resolves instantly.
 *
 * @param {string} tag
 * @param {CustomElementConstructor} [Class] Stub with declared fields when a
 *   test asserts property (not attribute) bindings, or when the widget writes
 *   into element properties on mount.
 * @returns {CustomElementConstructor} The registered constructor.
 */
export function stubCustomElement(tag, Class = class extends HTMLElement {}) {
  if (!customElements.get(tag)) {
    customElements.define(tag, Class);
  }
  return /** @type {CustomElementConstructor} */ (customElements.get(tag));
}
