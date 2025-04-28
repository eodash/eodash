<template>
  <div ref="rootRef" class="datePicker">
    <VCDatePicker
      ref="datePicker"
      v-model.number="currentDate"
      :attributes="attributes"
      :masks="masks"
      expanded
      class="bg-surface overflow-auto"
      style="background-color: transparent; max-width: 100%"
    >
      <template v-if="toggleCalendar" #default="{ inputValue, inputEvents }">
        <div
          class="bg-surface d-flex flex-row align-center justify-center pb-1"
          style="overflow: hidden; width: 100%"
        >
          <v-btn
            v-if="!hideArrows"
            density="compact"
            :size="lgAndDown ? 'x-small' : 'large'"
            v-tooltip:bottom="'Set date to oldest available dataset'"
            variant="text"
            @click="jumpDate(true)"
            class="py-2"
            style="flex-shrink: 1"
          >
            <v-icon :icon="[mdiRayEndArrow]" />
          </v-btn>
          <div
            class="flex rounded-lg border border-gray-300 dark:border-gray-600"
            style="margin: 2px; min-width: 0"
          >
            <input
              v-if="!hideInputField"
              :value="inputValue"
              v-on="inputEvents"
              class="flex-grow px-1 py-1 dark:bg-gray-700"
              style="
                margin: 1px;
                width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            />
          </div>
          <v-btn
            v-if="!hideArrows"
            density="compact"
            :size="lgAndDown ? 'x-small' : 'large'"
            variant="text"
            v-tooltip:bottom="'Set date to latest available dataset'"
            @click="jumpDate(false)"
            class="py-2"
            style="flex-shrink: 1"
          >
            <v-icon :icon="[mdiRayStartArrow]" />
          </v-btn>
        </div>
      </template>
      <template v-else #footer>
        <div
          class="d-flex flex-row align-center justify-center pb-1"
          style="overflow: hidden; width: 100%"
        >
          <v-btn
            v-if="!hideArrows"
            density="compact"
            :size="lgAndDown ? 'x-small' : 'large'"
            v-tooltip:bottom="'Set date to oldest available dataset'"
            variant="text"
            @click="jumpDate(true)"
            class="py-2"
            style="flex-shrink: 1"
          >
            <v-icon :icon="[mdiRayEndArrow]" />
          </v-btn>
          <div
            class="flex rounded-lg border border-gray-300 dark:border-gray-600"
            style="margin: 2px; min-width: 0"
          >
            <input
              v-if="!hideInputField"
              :value="maskedCurrentDate"
              @change="onInputChange"
              class="flex-grow px-1 py-1 dark:bg-gray-700"
              style="
                margin: 1px;
                width: 100%;
                white-space: nowrap;
                overflow: hidden;
                text-overflow: ellipsis;
              "
            />
          </div>
          <v-btn
            v-if="!hideArrows"
            density="compact"
            :size="lgAndDown ? 'x-small' : 'large'"
            variant="text"
            v-tooltip:bottom="'Set date to latest available dataset'"
            @click="jumpDate(false)"
            class="py-2"
            style="flex-shrink: 1"
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
import { useDisplay } from "vuetify";
import "v-calendar/style.css";
import {
  watch,
  reactive,
  ref,
  customRef,
  toRef,
  onMounted,
  computed,
  useTemplateRef,
} from "vue";
import { useSTAcStore } from "@/store/stac";
import { datetime } from "@/store/states";
import { mdiRayStartArrow, mdiRayEndArrow } from "@mdi/js";
import { eodashCollections, collectionsPalette } from "@/utils/states";
import log from "loglevel";
import { makePanelTransparent } from "@/composables";

const { lgAndDown } = useDisplay();

const rootEl = useTemplateRef("rootRef");

const datePickerEl = useTemplateRef("datePicker");

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
    const date = new Date(num);
    datetime.value = date.toISOString();
    //@ts-expect-error supports move method https://vcalendar.io/datepicker/basics.html#basics
    datePickerEl.value?.move({
      month: date.getMonth() + 1,
      year: date.getFullYear(),
    });
  },
}));

const masks = ref({
  input: "YYYY-MM-DD",
});

/** @param {Date} date */
const formatDate = (date) => {
  const years = date.getFullYear();
  const month = date.getMonth() + 1;
  const day = date.getDate();
  return `${years}-${month < 10 ? "0" + month : month}-${
    day < 10 ? "0" + day : day
  }`;
};
/**
 *
 * @param e {Event}
 */
const onInputChange = (e) => {
  currentDate.value = new Date(
    /** @type {HTMLInputElement} */ (e.target)?.value,
  ).getTime();
};
const maskedCurrentDate = computed(() =>
  formatDate(new Date(currentDate.value)),
);

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
  toggleCalendar: {
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

const selectedStac = toRef(useSTAcStore(), "selectedStac");

watch(
  selectedStac,
  async (updatedStac, previousStac) => {
    if (updatedStac && previousStac?.id !== updatedStac.id) {
      log.debug("Datepicker selected STAC change triggered");
      // remove old values
      attributes.splice(0, attributes.length);

      for (let idx = 0; idx < eodashCollections.length; idx++) {
        log.debug("Retrieving dates", eodashCollections[idx]);
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
          dot: {
            style: {
              backgroundColor:
                collectionsPalette[idx % collectionsPalette.length],
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

// fixes calendar dispalcement on lib mode
const transform = ref("");
onMounted(() => {
  transform.value = document.querySelector("eo-dash")
    ? "translate3d(50px,-80px,0)"
    : "translate3d(0px,-80px,0)";
});

makePanelTransparent(rootEl);
</script>
<style>
.vc-popover-content {
  --vc-nav-hover-bg: rgba(var(--v-theme-on-surface), 0.1);
  --vc-nav-item-active-color: rgb(var(--v-theme-on-secondary));
  --vc-nav-item-active-bg: rgba(var(--v-theme-secondary), 0.8);
  --vc-focus-ring: 0 0 0 2px rgba(var(--v-theme-secondary), 0.5);
}
.vc-container {
  --vc-day-content-hover-bg: rgba(var(--v-theme-on-surface), 0.2);
  --vc-focus-ring: 0 0 0 2px rgba(var(--v-theme-secondary), 0.4);
  --vc-header-arrow-hover-bg: rgba(var(--v-theme-secondary), 0.1);
}
.vc-attr {
  --vc-accent-600: rgba(var(--v-theme-secondary), 0.8);
}
.datePicker {
  --vc-day-content-hover-bg: red;
}

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

.vc-popover-content-wrapper {
  transform: v-bind("transform") !important;
}
</style>
