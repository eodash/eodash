import { vi } from "vitest";

/**
 * Minimal reader for datepicker comparison tests, without remote STAC requests.
 * @param {string} id
 * @param {string} title
 * @param {{ color?: string; self?: string }} [options]
 * @returns {import("@eodash/stac").Reader}
 */
export const createDatePickerReader = (
  id,
  title,
  { color = "#ff0000", self } = {},
) =>
  /** @type {import("@eodash/stac").Reader} */ (
    /** @type {unknown} */ ({
      id,
      stac: { id, title, links: self ? [{ rel: "self", href: self }] : [] },
      color,
      getDates: vi.fn().mockResolvedValue([new Date("2024-06-15T00:00:00Z")]),
    })
  );
