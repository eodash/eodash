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
import { computed, ref, onMounted, watch, reactive } from "vue";
import { storeToRefs } from "pinia";
import { useSTAcStore } from "@/store/stac";
import { datetime } from "@/store/States";
import { mdiRayStartArrow, mdiRayEndArrow } from "@mdi/js";
import { eodashCollections } from "@/utils/states";

/**
 * @param {boolean} reverse
 */
function jumpDate(reverse) {
  if (attributes.length) {
    // We have potentially multiple collections we need to iterate (currently only one)
    let latestDateMS = reverse ? Infinity : -Infinity;
    attributes.forEach((coll) => {
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

onMounted(() => {
  const { selectedStac } = storeToRefs(useSTAcStore());
  watch(
    [selectedStac],
    async ([updatedStac]) => {
      if (updatedStac) {
        const wongPalette = [
          "#009E73",
          "#0072B2",
          "#E69F00",
          "#CC79A7",
          "#56B4E9",
          "#D55E00",
        ];

        // remove old values
        attributes.length = 0;
        for (let idx = 0; idx < eodashCollections.length; idx++) {
          const dates = [
            ...new Set(
              eodashCollections[idx]
                .getItems()
                ?.map((it) => new Date(/** @type {string} */ (it.datetime))),
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
      }
    },
    { immediate: true },
  );
});
</script>
