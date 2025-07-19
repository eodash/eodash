import { inject } from 'vue';
import { eodashKey } from './keys';

/**
/** @type {import('@/types').Eodash | null}*/

let _eodash = null;

/**
 * Call this once in a top-level component to inject and store the reactive eodash object.
 * @throws {Error} If eodash is not found in the inject context
 */
export function provideEodashInstance() {
  const injected = inject(eodashKey);
  if (!injected) {
    throw new Error('Missing injected eodash – did you forget to call provideEodashInstance in a component?');
  }
  _eodash = injected;
}

/**
 * Access the reactive eodash configuration anywhere after it has been provided.
 * @returns {import('@/types').Eodash | null}
 * @throws {Error} If eodash was not yet provided
 */
export function useEodash() {
  if (!_eodash) {
    throw new Error('Eodash not yet available – call provideEodashInstance() first.');
  }
  return _eodash;
}
