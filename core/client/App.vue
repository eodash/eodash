<template>
  <v-app>
    <Suspense>
      <Dashboard :is-web-component="isWebComponent" :config="config" />

      <template #fallback>
        <ErrorAlert v-model="error" />
      </template>
    </Suspense>
  </v-app>
</template>

<script setup>
import Dashboard from "@/views/Dashboard.vue";
import ErrorAlert from "./components/ErrorAlert.vue";
import { onErrorCaptured, ref } from "vue";

defineProps({
  config: {
    type: String,
    required: false,
    default: undefined,
  },
});

// window.setEodashLoglevel("DEBUG")

const error = ref("");
const isWebComponent = !!document.querySelector("eo-dash");

onErrorCaptured((e, inst, info) => {
  error.value = `
  ${e}.
  component: ${inst?.$.type.name}.
  info: ${info}.
  `;
});
</script>
