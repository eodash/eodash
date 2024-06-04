<template>
  <VDatePicker v-model="currentDate">
    
  </VDatePicker>
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
      datetime.value = new Date(updatedDate.getTime() - updatedDate.getTimezoneOffset() * 60000).toISOString()
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
  /*
  const parentEl = datePicker.value?.$el.parentElement?.parentElement
  width.value = parentEl?.clientWidth ? parentEl.clientWidth + "px" : undefined
  height.value = parentEl?.clientHeight ? parentEl.clientHeight + "px" : undefined
  */
})
</script>
