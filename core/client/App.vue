<template>
  <v-app class="fill-height">
    <ErrorAlert />
    <Suspense>
      <Dashboard :is-web-component="isWebComponent" :config="config" />

      <template #fallback>
        <div class="d-flex align-center justify-center fill-height">
        </div>
      </template>
    </Suspense>
  </v-app>
</template>

<script setup>
import Dashboard from "@/views/Dashboard.vue";
import ErrorAlert from "./components/ErrorAlert.vue";
import { provideEodashInstance, useAdoptStyles } from "@/composables";
import { onErrorCaptured } from "vue";
import { errorState } from "@/store/states";

defineProps({
  config: {
    type: [String, Function],
    required: false,
    default: undefined,
  },
});

// window.setEodashLoglevel("DEBUG")

const isWebComponent = !!document.querySelector("eo-dash");

onErrorCaptured((e, inst, info) => {
  const message = e instanceof Error ? e.message : String(e);
  errorState.value = {
    message: `${message}. component: ${inst?.$.type.name}. info: ${info}.`,
    severity: "error",
    critical: false,
  };
});
provideEodashInstance();
if (isWebComponent) {
  // Adopt styles into the shadowRoot when running as web component
  useAdoptStyles();
}
</script>
