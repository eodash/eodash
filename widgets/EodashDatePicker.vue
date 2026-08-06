<template>
  <div ref="rootRef" class="datePicker">
    <!-- show-utc keeps eox off local start-of-day, which otherwise shifts a
         stepped date back a day for anyone east of UTC. layer-id-key groups
         items by title, which is what the hover popup labels them with.
         externalMapRendering stops eox writing TIME params into the map
         sources: eodash re-renders those layers itself. -->
    <eox-timecontrol
      :key="mapElement"
      ref="timecontrolRef"
      show-utc
      layer-id-key="title"
      .for="mapElement"
      .externalMapRendering="true"
      .initDate="[datetime]"
      @select="onSelect"
    >
      <!-- Reversed: the date element has to precede the picker in the DOM,
           since popup mode anchors the calendar to its shadow root. -->
      <div class="d-flex flex-column-reverse">
        <!-- Sized and coloured to match the step arrows eox renders inside
             eox-timecontrol-date, so the row reads as one control. -->
        <div class="d-flex flex-row align-center justify-center pb-1">
          <v-btn
            v-if="!hideArrows"
            v-tooltip:bottom="'Set date to oldest available dataset'"
            icon
            size="small"
            variant="text"
            color="primary"
            @click="jumpDate(true)"
          >
            <v-icon :icon="[mdiPageFirst]" />
          </v-btn>
          <eox-timecontrol-date
            v-if="!hideInputField || toggleCalendar"
            class="d-flex align-center"
            .navigation="!hideArrows"
          ></eox-timecontrol-date>
          <v-btn
            v-if="!hideArrows"
            v-tooltip:bottom="'Set date to latest available dataset'"
            icon
            size="small"
            variant="text"
            color="primary"
            @click="jumpDate(false)"
          >
            <v-icon :icon="[mdiPageLast]" />
          </v-btn>
        </div>
        <eox-timecontrol-picker
          .showDots="true"
          .showItems="showItems"
          .popup="toggleCalendar"
        ></eox-timecontrol-picker>
      </div>
    </eox-timecontrol>
  </div>
</template>
<script setup>
import "@eox/timecontrol";
import { watch, customRef, onUnmounted, useTemplateRef } from "vue";
import { datetime, mapEl, mapCompareEl } from "@/store/states";
import { mdiPageFirst, mdiPageLast } from "@mdi/js";
import log from "loglevel";
import { useTransparentPanel } from "@/composables";

const props = defineProps({
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
  showItems: {
    type: Boolean,
    default: false,
  },
  map: {
    type: String,
    default: "first",
  },
});

const mapElement = props.map === "second" ? mapCompareEl : mapEl;

const rootEl = useTemplateRef("rootRef");

/** @type {import("vue").ShallowRef<import("@eox/timecontrol").EOxTimeControl | null>} */
const timecontrolEl = useTemplateRef("timecontrolRef");

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

    // Validate the date before setting
    if (isNaN(date.getTime())) {
      log.warn("Invalid date value provided to datepicker:", num);
      return;
    }

    datetime.value = date.toISOString();
  },
}));

// The UTC day the calendar shows. The calendar is day-resolution, so a day-level
// guard is enough to stop the datetime <-> calendar echo.
let calendarDay = "";

/** @param {Date} date */
const utcDay = (date) => date.toISOString().slice(0, 10);

/** @param {CustomEvent<{date: [Date, Date]}>} e */
const onSelect = (e) => {
  const [selected] = e.detail.date;
  calendarDay = utcDay(selected);
  applyDotColors();
  currentDate.value = selected.getTime();
};

// datetime is also written elsewhere (URL restore, time slider, chart clicks).
watch(datetime, (iso) => {
  const el = timecontrolEl.value;
  const date = new Date(iso);
  if (!el || utcDay(date) === calendarDay) {
    return;
  }
  calendarDay = utcDay(date);
  el.dateChange([iso, iso], el);
});

/** Number of `--dot-color-*` slots eox declares. */
const DOT_COLOR_SLOTS = 11;

/**
 * eox never carries the layer colour into its items, so the dots are coloured
 * here. It reads the slots off `body` and mounts the popup calendar there too,
 * so body is the only scope both the inline and popup calendars share. Slot N
 * follows eox's own group order, which is `sliderValues`.
 */
const applyDotColors = () => {
  const { style } = document.body;
  const sliders = timecontrolEl.value?.sliderValues ?? [];

  for (let idx = 0; idx < DOT_COLOR_SLOTS; idx++) {
    const color = sliders[idx]?.layerInstance?.get("color");
    if (color) {
      style.setProperty(`--dot-color-${idx + 1}`, color);
    } else {
      style.removeProperty(`--dot-color-${idx + 1}`);
    }
  }
};

onUnmounted(() => {
  const { style } = document.body;
  for (let idx = 0; idx < DOT_COLOR_SLOTS; idx++) {
    style.removeProperty(`--dot-color-${idx + 1}`);
  }
});

/**
 * @param {boolean} reverse
 */
function jumpDate(reverse) {
  // TODO: we need to handle time ranges and other options here
  const times = (timecontrolEl.value?.items.get() ?? []).map((item) =>
    new Date(item.utc).getTime(),
  );
  if (times.length) {
    currentDate.value = times.reduce((a, b) =>
      reverse ? Math.min(a, b) : Math.max(a, b),
    );
  }
}

useTransparentPanel(rootEl);
</script>
<style>
@media (min-width: 960px) {
  .datePicker {
    position: absolute;
    bottom: 0;
    left: 0;
    right: 0;
    margin-inline: auto;
    width: fit-content;
  }
}

.datePicker {
  backdrop-filter: blur(10px) !important;
  border-radius: 8px;
  border: none;
  box-shadow:
    0px 0px 1px rgba(24, 39, 75, 0.22),
    0px 6px 12px -6px rgba(24, 39, 75, 0.12),
    0px 8px 24px -4px rgba(24, 39, 75, 0.08);
  background-color: rgba(
    var(--v-theme-surface),
    var(--v-surface-opacity, 0.8)
  ) !important;
}

/* Level eox's 32px step arrows with the 40px jump buttons beside them. */
.datePicker eox-timecontrol-date::part(previous),
.datePicker eox-timecontrol-date::part(next) {
  width: 40px;
  height: 40px;
}

/* Must out-specify the `:host` defaults of the eox shadow styles.
   The popup calendar is appended to the document body, hence `body > .vc`. */
.datePicker eox-timecontrol-picker,
.datePicker eox-timecontrol-date,
body > .vc {
  --primary: rgb(var(--v-theme-primary));
  --on-primary: rgb(var(--v-theme-on-primary));
  --on-surface: rgb(var(--v-theme-on-surface));
  --surface-container-lowest: transparent;
}

body > .vc {
  --surface-container-lowest: rgba(
    var(--v-theme-surface),
    var(--v-surface-opacity, 0.8)
  );
  backdrop-filter: blur(10px);
  border-radius: 8px;
}
</style>