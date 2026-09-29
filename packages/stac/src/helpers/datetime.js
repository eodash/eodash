import { isSTACItem } from "./items.js";

/**
 * Identifies the preferred datetime property available in a given set of STAC links or items.
 * Checks for `datetime`, `start_datetime`, or `end_datetime`, in that order of preference.
 *
 * @param {import("../types").STACLink[] | import("../types").STACItem[] | undefined | null} [linksOrItems]
 */
export function getDatetimeProperty(linksOrItems) {
  if (!linksOrItems?.length) {
    return undefined;
  }
  const first = linksOrItems[0];
  let checkProperties = false;
  if (isSTACItem(first)) {
    checkProperties = true;
  }

  // TODO: consider other properties for datetime ranges

  const datetimeProperties = /** @type {const} */ ([
    "datetime",
    "start_datetime",
    "end_datetime",
  ]);
  if (checkProperties) {
    for (const prop of datetimeProperties) {
      const propExists = linksOrItems.some(
        (l) => isSTACItem(l) && isDatetime(l.properties?.[prop]),
      );
      if (!propExists) {
        continue;
      }
      return prop;
    }
  }
  for (const prop of datetimeProperties) {
    const propExists = linksOrItems.some((l) => isDatetime(l[prop]));
    if (!propExists) {
      continue;
    }
    return prop;
  }
}

/**
 * Checks whether a value is a valid string or Date representation of a datetime.
 *
 * @param {unknown} value
 * @returns {boolean}
 */
function isDatetime(value) {
  return typeof value === "string" || value instanceof Date;
}

/**
 * Finds the index of the time value closest to the target datetime.
 * Equidistant candidates resolve to the earlier one. Returns -1 if no match is found.
 *
 * @param {number[]} times - Array of epoch milliseconds, ordered oldest to newest.
 * @param {import("../types").Datetime} [datetime] - Target datetime to compare against.
 */
export function findClosestIndex(times, datetime) {
  const target = datetime ? new Date(datetime).getTime() : NaN;
  if (isNaN(target) || !times.length) {
    return -1;
  }
  return times.reduce(
    (best, time, index) =>
      Math.abs(time - target) < Math.abs(times[best] - target) ? index : best,
    0,
  );
}

/**
 * Builds layer control parameters (`layerDatetime` and `timeControlValues`) from a list of dates.
 * Snaps the `currentStep` to the nearest available date if not exactly matched.
 *
 * @param {Date[] | undefined} dates
 * @param {string | null} [currentStep] - Target datetime; snapped to the closest available date.
 * @returns {{ layerDatetime: Record<string, any> | undefined, timeControlValues: { date: string }[] | undefined }}
 */
export const extractLayerTimeValues = (dates, currentStep) => {
  if (!currentStep || !dates?.length || dates.length <= 1) {
    return { layerDatetime: undefined, timeControlValues: undefined };
  }

  const controlValues = dates.map((d) => d.toISOString()).sort();
  const timeControlValues = controlValues.map((date) => ({ date }));

  currentStep = new Date(currentStep).toISOString();
  if (!controlValues.includes(currentStep)) {
    const target = new Date(currentStep).getTime();
    currentStep = controlValues.reduce((best, d) =>
      Math.abs(new Date(d).getTime() - target) <
      Math.abs(new Date(best).getTime() - target)
        ? d
        : best,
    );
  }

  const layerDatetime = {
    controlValues,
    currentStep,
    slider: true,
    navigation: true,
    play: false,
    displayFormat: "DD.MM.YYYY HH:mm",
    animateOnClickInterval: false,
    showUTC: true,
  };

  return { layerDatetime, timeControlValues };
};
