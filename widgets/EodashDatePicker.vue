<template>
  <div ref="rootRef" class="datePicker">
    <eox-timecontrol
      :key="revision"
      ref="timecontrolRef"
      show-utc
      layer-id-key="title"
      .controlValues="controlValues"
      .initDate="!!datetime ? [datetime] : null"
      @select="onSelect"
    >
      <div class="d-flex flex-column-reverse">
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
            ref="dateRef"
            class="d-flex align-center"
            .navigation="!hideArrows"
            @mousemove="showCalendar"
            @mouseleave="hideCalendar"
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
          ref="pickerRef"
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
import { watch, ref, customRef, onUnmounted, useTemplateRef } from "vue";
import { useSTAcStore } from "@/store/stac";
import { datetime } from "@/store/states";
import { mdiPageFirst, mdiPageLast } from "@mdi/js";
import { eodashCollections, eodashCompareCollections } from "@/utils/states";
import log from "loglevel";
import { useTransparentPanel } from "@/composables";
import { storeToRefs } from "pinia";

const props = defineProps({
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
    default: true,
  },
});

const rootEl = useTemplateRef("rootRef");

const dateEl = useTemplateRef("dateRef");

/** @type {import("vue").ShallowRef<HTMLElement | null>} */
const pickerEl = useTemplateRef("pickerRef");

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

// Guards the datetime <-> calendar echo, at the calendar's own day resolution.
let calendarDay = "";

/** @param {Date} date */
const utcDay = (date) =>
  isNaN(date.getTime()) ? "" : date.toISOString().slice(0, 10);

/** @param {CustomEvent<{date: [Date, Date]}>} e */
const onSelect = (e) => {
  const [selected] = e.detail.date;
  calendarDay = utcDay(selected);
  currentDate.value = selected.getTime();
};

watch(datetime, (iso) => {
  const el = timecontrolEl.value;
  const date = new Date(iso);
  if (!el || utcDay(date) === calendarDay) {
    return;
  }
  calendarDay = utcDay(date);
  el.dateChange([iso, iso], el);
});

/** @type {import("vue").Ref<import("@/types").DatePickerControlValue[]>} */
const controlValues = ref([]);

// eox only derives its items in `firstUpdated`, so a change needs a remount.
const revision = ref(0);

const { selectedCompareStac, selectedStac } = storeToRefs(useSTAcStore());

watch(
  [selectedStac, selectedCompareStac],
  async ([updatedStac, updatedCompareStac]) => {
    if (!updatedStac && !updatedCompareStac) {
      log.debug("No STAC selected, clearing datepicker dates");
      controlValues.value = [];
      revision.value++;
      return;
    }

    controlValues.value = [
      ...(await fetchCollectionsDates(eodashCollections)),
      ...(await fetchCollectionsDates(eodashCompareCollections, " (compare)")),
    ];
    revision.value++;
  },
  { immediate: true },
);

/**
 *
 * @param {import("@/eodashSTAC/EodashCollection").EodashCollection[]} eodashCollections
 * @param {string} [suffix] Keeps compare ids distinct.
 * @returns {Promise<import("@/types").DatePickerControlValue[]>}
 */
async function fetchCollectionsDates(eodashCollections, suffix = "") {
  const values = await Promise.all(
    eodashCollections.map(async (ec) => {
      await ec.fetchCollection();
      const dates = await ec.getDates();
      if (!dates?.length) {
        return null;
      }

      return {
        id: `${ec.collectionStac?.id ?? ""}${suffix}`,
        title: ec.collectionStac?.title ?? ec.collectionStac?.id ?? "",
        color: ec.color,
        timeControlValues: dates.map((date) => ({ date: date.toISOString() })),
      };
    }),
  ).catch((e) => {
    console.error("[eodash] Datepicker failed to read collection dates", e);
    return /** @type {import("@/types").DatePickerControlValue[]} **/ ([]);
  });

  return values.filter((value) => !!value);
}

/** Number of `--dot-color-*` slots eox declares. */
const DOT_COLOR_SLOTS = 11;

/**
 * sets a color for each layer
 *
 * @param {import("@/types").DatePickerControlValue[]} values
 */
const applyDotColors = (values) => {
  // The popup reads them off body, the inline calendar off the host.
  for (const el of [document.body, pickerEl.value]) {
    if (!el) {
      continue;
    }
    for (let idx = 0; idx < DOT_COLOR_SLOTS; idx++) {
      const color = values[idx]?.color;
      if (color) {
        el.style.setProperty(`--dot-color-${idx + 1}`, color);
      } else {
        el.style.removeProperty(`--dot-color-${idx + 1}`);
      }
    }
  }
};

// `post` so the remounted picker exists by the time it is written to.
watch(controlValues, applyDotColors, { immediate: true, flush: "post" });
onUnmounted(() => applyDotColors([]));

/** `cal` is only assigned inside initCalendar's setTimeout. */
const calendar = () =>
  /** @type {import("@eox/timecontrol/src/components/timecontrol-picker").EOxTimeControlPicker | null} */ (
    timecontrolEl.value?.getTimeControlPicker() ?? null
  )?.cal;

const popupEl = () =>
  /** @type {HTMLElement | undefined} */ (calendar()?.context?.mainElement);

/**
 * The popup opens on click by default; the old picker opened on hover.
 *
 * @param {MouseEvent} e
 */
const showCalendar = (e) => {
  if (!props.toggleCalendar || !isOverField(e)) {
    return;
  }
  calendar()?.show();
  popupEl()?.addEventListener("mouseleave", hideCalendar);
};

/**
 * Whether the pointer is over the date field, matched by geometry
 *
 * @param {MouseEvent} e
 */
const isOverField = (e) => {
  const field = dateEl.value?.shadowRoot
    ?.querySelector("input")
    ?.getBoundingClientRect();
  const row = dateEl.value?.getBoundingClientRect();

  return (
    !!field &&
    !!row &&
    e.clientX >= field.left &&
    e.clientX <= field.right &&
    e.clientY >= row.top &&
    e.clientY <= row.bottom
  );
};

/** @param {MouseEvent} e */
const hideCalendar = (e) => {
  const enteredEl = /** @type {Node | null} */ (e.relatedTarget);
  // Moving between the field and the popup must not close it.
  if (dateEl.value?.contains(enteredEl) || popupEl()?.contains(enteredEl)) {
    return;
  }
  calendar()?.hide();
};

/**
 * @param {boolean} reverse
 */
function jumpDate(reverse) {
  // TODO: we need to handle time ranges and other options here
  const times = controlValues.value.flatMap((coll) =>
    coll.timeControlValues.map(({ date }) => new Date(date).getTime()),
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

.datePicker eox-timecontrol-date::part(previous),
.datePicker eox-timecontrol-date::part(next) {
  width: 40px;
  height: 40px;
}

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
