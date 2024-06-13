<template>
  <VCDatePicker v-model="currentDate" :masks="masks" :attributes="attributes">
    <template #default="{ inputValue, inputEvents }">
      <div class="flex rounded-lg border border-gray-300 dark:border-gray-600" style="margin: 2px;">
        <input :value="inputValue" v-on="inputEvents" style="margin: 1px;"
          class="flex-grow px-1 py-1 bg-white dark:bg-gray-700" />
      </div>
    </template>
  </VCDatePicker>
  <v-row align="center" justify="center" style="margin-top: 6px;">
    <v-btn density="compact" v-tooltip:bottom="'Set date to latest available dataset'" @click="jumpDate">
      <v-icon :icon="[mdiRayStartArrow]" />
    </v-btn>
  </v-row>
</template>

<script setup>
import { DatePicker as VCDatePicker } from 'v-calendar';
import 'v-calendar/style.css';
import { computed, ref, onMounted, watch, inject } from "vue";
import { eodashKey } from "@/utils/keys";
import { toAbsolute } from "stac-js/src/http.js";
import { storeToRefs } from "pinia";
import { useSTAcStore } from '@/store/stac';
import { datetime } from "@/store/States";
import { mdiRayStartArrow } from '@mdi/js';

function jumpDate() {
  if (attributes.value && attributes.value.length > 0) {
    // We have potentially multiple collections we need to iterate (currently only one)
    let latestDateMS = 0;
    attributes.value.forEach((coll) => {
      if (coll?.dates) {
        coll.dates.forEach((d) => {
          // TODO: we need to handle time ranges and other options here
          if (d instanceof Date && d.getTime() > latestDateMS) {
            latestDateMS = d.getTime();
          }
        })
      }
    })
    if (latestDateMS !== 0) {
      currentDate.value = new Date(latestDateMS);
    }
  }
}

const eodashConfig = /** @type {import("@/types").Eodash} */ inject(eodashKey);

const props = defineProps({
  inline: {
    type: Boolean
  }
})

const masks = ref({
  input: 'YYYY-MM-DD',
});

/**
 * Attributes displayed on datepicker
 * @type {import("vue").Ref<(import('v-calendar/dist/types/src/utils/attribute').AttributeConfig|undefined)[]>}
 */
const attributes = ref([]);

const currentDate = computed({
  get() {
    return props.inline ? datetime.value.split("T")[0] : new Date(datetime.value) ?? new Date()
  },
  /** @param {Date | string} updatedDate */
  set(updatedDate) {
    if (props.inline) {
      updatedDate = new Date(updatedDate);
    }
    //@ts-expect-error
    if (updatedDate instanceof Date && !isNaN(updatedDate)) {
      datetime.value = new Date(updatedDate.getTime() - updatedDate.getTimezoneOffset() * 60000).toISOString()
    } else {
      datetime.value = new Date().toISOString()
    }
  }
});
/** @type {import("@/types").WebComponentProps["onMounted"]} */
onMounted(() => {
  const { selectedStac } = storeToRefs(useSTAcStore());
  watch(
    [selectedStac],
    async ([updatedStac]) => {
      if (updatedStac) {
        const parentCollUrl = toAbsolute(
          `./${updatedStac.id}/collection.json`,
          eodashConfig.stacEndpoint
        );
        const childCollUrl = toAbsolute(
          updatedStac.links[1].href,
          parentCollUrl
        );

        const stacCollection = await (await fetch(childCollUrl)).json();
        const dates = stacCollection.links
          .filter(
            (/** @type {{ rel: string; datetime: string; }} */ item) => (
              item.rel === 'item' && 'datetime' in item
            )
          )
          .map((/** @type {{ datetime: string; }} */ it) => new Date(it.datetime));
        attributes.value = [
          {
            bar: true,
            dates,
          }
        ];
      }
    },
    { immediate: true }
  );
});

</script>
