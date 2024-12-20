<template>
  <div ref="rootRef" class="datePicker">
    <VCDatePicker
      v-model.number="currentDate"
      :attributes="attributes"
      :masks="masks"
      expanded
      class="bg-surface overflow-auto"
      style="background-color: transparent; max-width: 100%"
    >
      <template #footer>
        <div class="d-flex flex-row align-center justify-center pb-1">
          <v-btn
            v-if="!hideArrows"
            density="compact"
            v-tooltip:bottom="'Set date to oldest available dataset'"
            variant="text"
            @click="jumpDate(true)"
          >
            <v-icon :icon="[mdiRayEndArrow]" />
          </v-btn>
          <div
            class="flex rounded-lg border border-gray-300 dark:border-gray-600"
            style="margin: 2px"
          >
            <input
              v-if="!hideInputField"
              :value="new Date(currentDate).toLocaleDateString()"
              style="margin: 1px"
              class="flex-grow px-1 py-1 dark:bg-gray-700"
            />
          </div>
          <v-btn
            v-if="!hideArrows"
            density="compact"
            variant="text"
            v-tooltip:bottom="'Set date to latest available dataset'"
            @click="jumpDate(false)"
          >
            <v-icon :icon="[mdiRayStartArrow]" />
          </v-btn>
        </div>
      </template>
    </VCDatePicker>
  </div>
</template>
<script setup>
import { DatePicker as VCDatePicker } from "v-calendar";
import "v-calendar/style.css";
import { watch, reactive, ref, customRef, toRef } from "vue";
import { useSTAcStore } from "@/store/stac";
import { datetime } from "@/store/states";
import { mdiRayStartArrow, mdiRayEndArrow } from "@mdi/js";
import { eodashCollections } from "@/utils/states";
import log from "loglevel";
import { makePanelTransparent } from "@/composables";

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

defineProps({
  hintText: {
    type: String,
    default: null,
  },
  hideArrows: {
    type: Boolean,
    default: false,
  },
  hideInputField: {
    type: Boolean,
    default: false,
  },
});

/**
 * Attributes displayed on datepicker
 *
 * @type {import("vue").Reactive<
 *   (
 *     | Partial<import("v-calendar/dist/types/src/utils/attribute").AttributeConfig>
 *     | undefined
 *   )[]
 * >}
 */
const attributes = reactive([]);

/** @type {import("vue").Ref<HTMLDivElement|null>} */
const rootRef = ref(null);

const selectedStac = toRef(useSTAcStore(), "selectedStac");

watch(
  selectedStac,
  async (updatedStac, previousStac) => {
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
          content: {
            style: {
              color: "#000000",
              "font-weight": "bold",
            },
          },
        });
      }
    }
  },
  { immediate: true },
);

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

makePanelTransparent(rootRef);
</script>
<style>
@media (min-width: 960px) {
  .datePicker {
    position: absolute;
    bottom: 0;
    width: 100%;
  }
}
.vc-day-content {
  color: #5e5e5e;
  font-weight: normal;
}

.vc-highlight-content-solid {
  color: white !important;
}
</style>
