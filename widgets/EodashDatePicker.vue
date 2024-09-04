<template>
  <VCDatePicker
    v-model.number="currentDate"
    :masks="masks"
    :attributes="attributes"
  >
    <template #default="{ inputValue, inputEvents }">
      <div
        class="flex rounded-lg border border-gray-300 dark:border-gray-600"
        style="margin: 2px"
      >
        <input
          :value="inputValue"
          v-on="inputEvents"
          style="margin: 1px"
          class="flex-grow px-1 py-1 bg-white dark:bg-gray-700"
        />
      </div>
    </template>
  </VCDatePicker>
  <v-row align="center" justify="center" style="margin-top: 6px">
    <v-btn
      style="padding: 0px; margin-right: 4px"
      density="compact"
      v-tooltip:bottom="'Set date to oldest available dataset'"
      @click="jumpDate(true)"
    >
      <v-icon :icon="[mdiRayEndArrow]" />
    </v-btn>
    <v-btn
      style="padding: 0px; margin-left: 4px"
      density="compact"
      v-tooltip:bottom="'Set date to latest available dataset'"
      @click="jumpDate(false)"
    >
      <v-icon :icon="[mdiRayStartArrow]" />
    </v-btn>
  </v-row>
</template>

<script setup>
import { DatePicker as VCDatePicker } from "v-calendar";
import "v-calendar/style.css";
import { watch, reactive, ref, customRef } from "vue";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import { datetime } from "@/store/States";
import { mdiRayStartArrow, mdiRayEndArrow } from "@mdi/js";
import { eodashCollections } from "@/utils/states";
import log from "loglevel";

// holds the number value of the datetime
const currentDate = customRef((track, trigger) => ({
  get() {
    track();
    return new Date(datetime.value).getTime();
  },
  /** @param {number} num */
  set(num) {
    trigger();
    log.debug("Datepicker setting currentDate", datetime.value);
    datetime.value = new Date(num).toISOString();
  },
}));

const masks = ref({
  input: "YYYY-MM-DD",
});

/**
 * Attributes displayed on datepicker
 *
 * @type {import("vue").Reactive<
 *   (
 *     | import("v-calendar/dist/types/src/utils/attribute").AttributeConfig
 *     | undefined
 *   )[]
 * >}
 */
const attributes = reactive([]);

const { selectedStac } = storeToRefs(useSTAcStore());

watch(selectedStac, async (updatedStac, previousStac) => {
  if (updatedStac && previousStac?.id !== updatedStac.id) {
    log.debug("Datepicker selected STAC change triggered");
    const wongPalette = [
      "#009E73",
      "#0072B2",
      "#E69F00",
      "#CC79A7",
      "#56B4E9",
      "#D55E00",
    ];
    // remove old values
    attributes.splice(0, attributes.length);

    for (let idx = 0; idx < eodashCollections.length; idx++) {
      log.debug("Retrieving dates", eodashCollections[idx]);
      await eodashCollections[idx].fetchCollection();
      const dates = [
        ...new Set(
          eodashCollections[idx].getItems()?.reduce((valid, it) => {
            const parsed = Date.parse(/** @type {string} */ (it.datetime));
            if (parsed) {
              valid.push(new Date(parsed));
            }
            return valid;
          }, /** @type {Date[]} */ ([])),
        ),
      ];
      attributes.push({
        key: "id-" + idx.toString() + Math.random().toString(16).slice(2),
        bar: {
          style: {
            backgroundColor: wongPalette[idx % wongPalette.length],
          },
        },
        dates,
      });
    }
    // We try to set the current time selection
    // to latest extent date
    // @ts-expect-error it seems the temporal extent is not defined in type
    const interval = updatedStac?.extent?.temporal?.interval;
    if (interval && interval.length > 0 && interval[0].length > 1) {
      const endInterval = new Date(interval[0][1]);
      log.debug("Datepicker: found stac extent, setting time to latest value", endInterval);
      currentDate.value = endInterval?.getTime();
    }
  }
});

/**
 * @param {boolean} reverse
 */
function jumpDate(reverse) {
  if (attributes.length) {
    let latestDateMS = reverse ? Infinity : -Infinity;
    attributes.forEach((coll) => {
      if (coll?.dates) {
        coll.dates.forEach((d) => {
          // TODO: we need to handle time ranges and other options here
          if (d instanceof Date) {
            const mathFun = reverse ? "min" : "max";
            latestDateMS = Math[mathFun](latestDateMS, d.getTime());
          }
        });
      }
    });
    currentDate.value =
      latestDateMS === -Infinity
        ? Date.now()
        : latestDateMS === Infinity
          ? 0
          : latestDateMS;
  }
}
</script>
