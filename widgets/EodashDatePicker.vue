<template>
  <span class="fill-height fill-width align-center justify-center">
    <div v-if="inline" class="fill-height fill-width">

      <v-text-field base-color="primary" class="fill-height fill-width pa-2 align-center" type="date" bg-color="surface"
        color="primary" density="comfortable" label="Select Date" v-model="currentDate" variant="plain" hide-details />
    </div>
    <v-date-picker v-else ref="datePicker" :width="width" :height="height" hide-header v-model="currentDate"
      color="primary" bg-color="surface" location="center" class="overflow-auto fill-height fill-width"
      position="relative" show-adjacent-months></v-date-picker>
  </span>
</template>
<script setup>
import { computed, ref, onMounted } from "vue";
import { datetime } from "@/store/States"

const props = defineProps({
  inline: {
    type: Boolean
  }
})

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
      datetime.value = updatedDate.toISOString()
    } else {
      datetime.value = new Date().toISOString()
    }
  }
});

/**
 * @type {import("vue").Ref<import("vuetify/components").VDatePicker | null>}
 **/
const datePicker = ref(null)
/** @type {import("vue").Ref<string|undefined>} */
const width = ref()
/** @type {import("vue").Ref<string|undefined>} */
const height = ref()
onMounted(() => {
  /** @type {HTMLElement} */
  const parentEl = datePicker.value?.$el.parentElement?.parentElement
  width.value = parentEl?.clientWidth ? parentEl.clientWidth + "px" : undefined
  height.value = parentEl?.clientHeight ? parentEl.clientHeight + "px" : undefined
})
</script>
