import { isSTACItem } from "./items.js";

/**
 * Which of `datetime`, `start_datetime` or `end_datetime` the given records
 * carry, in that order of preference. Parquet rows qualify as well as links.
 *
 * @param {import("../types").EodashLink[] | import("../types").EodashItem[] | undefined | null} [linksOrItems]
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
        (l) =>
          //@ts-expect-error TODO
          l["properties"]?.[prop] &&
          //@ts-expect-error TODO
          typeof l["properties"]?.[prop] === "string",
      );
      if (!propExists) {
        continue;
      }
      return prop;
    }
  }
  for (const prop of datetimeProperties) {
    const propExists = linksOrItems.some(
      //@ts-expect-error todo
      (l) => l[prop] && typeof l[prop] === "string",
    );
    if (!propExists) {
      continue;
    }
    return prop;
  }
}

/**
 * Which of `times` sits nearest `datetime`, or -1 when there is nothing to
 * compare against. Equidistant candidates resolve to the earlier one.
 *
 * @param {number[]} times epoch milliseconds, oldest first
 * @param {import("../types").Datetime} [datetime]
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
 * Builds layercontrol LayerDatetime + timeControlValues from a list of dates.
 *
 * @param {Date[] | undefined} dates
 * @param {string | null} [currentStep] - target datetime; snapped to the closest available date
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
