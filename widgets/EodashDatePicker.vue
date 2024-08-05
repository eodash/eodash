<template>
  <VCDatePicker v-model="currentDate" :masks="masks" :attributes="attributes">
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
import { computed, ref, onMounted, watch, inject } from "vue";
import { eodashKey } from "@/utils/keys";
import { toAbsolute } from "stac-js/src/http.js";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import { datetime } from "@/store/States";
import { mdiRayStartArrow, mdiRayEndArrow } from "@mdi/js";
import { extractCollectionUrls } from "@/utils/helpers";
import axios from "axios";

/**
 * @param {boolean} reverse
 */
function jumpDate(reverse) {
  if (attributes.value && attributes.value.length > 0) {
    // We have potentially multiple collections we need to iterate (currently only one)
    let latestDateMS = reverse ? Infinity : -Infinity;
    attributes.value.forEach((coll) => {
      if (coll?.dates) {
        coll.dates.forEach((d) => {
          // TODO: we need to handle time ranges and other options here
          if (d instanceof Date) {
            if (
              (!reverse && d.getTime() > latestDateMS) ||
              (reverse && d.getTime() < latestDateMS)
            ) {
              latestDateMS = d.getTime();
            }
          }
        });
      }
    });
    if (latestDateMS !== 0) {
      currentDate.value = new Date(latestDateMS);
    }
  }
}

const eodashConfig = /** @type {import("@/types").Eodash} */ inject(eodashKey);

const masks = ref({
  input: "YYYY-MM-DD",
});

/**
 * Attributes displayed on datepicker
 *
 * @type {import("vue").Ref<
 *   (
 *     | import("v-calendar/dist/types/src/utils/attribute").AttributeConfig
 *     | undefined
 *   )[]
 * >}
 */
const attributes = ref([]);

const currentDate = computed({
  get() {
    return datetime.value ? new Date(datetime.value) : new Date();
  },
  /** @param {Date | string} updatedDate */
  set(updatedDate) {
    if (updatedDate instanceof Date && !isNaN(updatedDate.getTime())) {
      datetime.value = new Date(
        updatedDate.getTime() - updatedDate.getTimezoneOffset() * 60000,
      ).toISOString();
    } else {
      datetime.value = new Date().toISOString();
    }
  },
});
/** @type {import("@/types").WebComponentProps["onMounted"]} */
onMounted(() => {
  const { selectedStac } = storeToRefs(useSTAcStore());
  watch(
    [selectedStac],
    async ([updatedStac], [previousStac]) => {
      if (updatedStac && updatedStac !== previousStac) {
        const parentCollUrl = toAbsolute(
          `./${updatedStac.id}/collection.json`,
          eodashConfig.stacEndpoint,
        );
        const collectionUrls = extractCollectionUrls(
          selectedStac.value,
          parentCollUrl,
        );
        const wongPalette = [
          "#009E73",
          "#0072B2",
          "#E69F00",
          "#CC79A7",
          "#56B4E9",
          "#D55E00",
        ];
        for (let idx = 0; idx < collectionUrls.length; idx++) {
          const stacCollection = await axios
            .get(collectionUrls[idx])
            .then((resp) => resp.data);
          let dates = stacCollection.links
            .filter(
              (/** @type {{ rel: string; datetime: string }} */ item) =>
                item.rel === "item" && "datetime" in item,
            )
            .map(
              (/** @type {{ datetime: string }} */ it) => new Date(it.datetime),
            );
          const resultLength = dates.length;
          // data sanitation, we remove invalid dates in
          // case there was badly formatted date information
          dates = dates.filter((/** @type Date **/ d) => !isNaN(d.getTime()));
          if (resultLength !== dates.length) {
            console.log(
              `Warning: Some dates for collection ${stacCollection.id} were invalid`,
            );
          }
          attributes.value = [
            {
              bar: {
                style: {
                  backgroundColor: wongPalette[idx % wongPalette.length],
                },
              },
              dates,
            },
          ];
        }
        // We try to set the current time selection
        // to latest extent date
        // @ts-expect-error it seems the temporal extent is not defined in type
        const interval = updatedStac?.extent?.temporal?.interval;
        if (interval && interval.length > 0 && interval[0].length > 1) {
          currentDate.value = new Date(interval[0][1]);
        }
      }
    },
    { immediate: true },
  );
});
</script>
