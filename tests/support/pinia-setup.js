/**
 * Activates a pinia for every browser-project test, so modules that reach for a
 * store outside a component do not have to each install one.
 *
 * Set at import time rather than per test: a file whose composables capture the
 * store on first invocation needs one pinia for its whole run. Files that want
 * isolation between tests still call `setActivePinia(createPinia())` themselves.
 */
import { createPinia, setActivePinia } from "pinia";

setActivePinia(createPinia());
