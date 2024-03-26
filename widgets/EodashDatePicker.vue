<template>
  <span class="fill-height fill-width align-center justify-center">
    <div v-if="inline" class="fill-height fill-width">
      <!-- <p class="text-subtitle-1 ma-1 pa-2">currently selected date is {{ currentDate }}</p> -->
      <v-text-field base-color="primary" density="comfortable" type="date" bg-color="surface" color="primary"
        validate-on="input" min="1980-01-01" :max="new Date().toISOString().split(`T`)[0]" label="Select Date"
        :value="currentDate" v-model="currentDate" />
    </div>

    <v-date-picker v-else v-model="currentDate" color="primary" elevation="0" bg-color="surface" location="center"
      class="overflow-auto fill-height fill-width" :max="new Date()" position="relative"
      show-adjacent-months></v-date-picker>
  </span>
</template>
<script setup>
import { computed } from "vue";
import { datetime } from "@/store/States"

const props = defineProps(["inline"])
const currentDate = computed({
  get() {
    return props.inline ? datetime.value.split("T")[0] : new Date(datetime.value) ?? new Date()
  },
  /** @param {Date | string} updatedDate */
  set(updatedDate) {
    if (props.inline) {
      updatedDate = new Date(updatedDate) ?? new Date()
    }
    datetime.value = /** @type {Date} */ (updatedDate).toISOString()
  }
})
</script>
