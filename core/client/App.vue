<template>
  <v-app class="fill-height">
    <ErrorAlert />
    <Suspense>
      <Dashboard :is-web-component="isWebComponent" :config="config" />

      <template #fallback>
        <div class="d-flex align-center justify-center fill-height"></div>
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
import log from "loglevel";
import { AxiosError } from "axios";

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
  // axios errors are handled by the interceptor
  if (e instanceof AxiosError) {
    return false;
  }
  log.error(e);
  errorState.value = {
    message: e.message,
    details: `component:${inst?.$.type.name}\nInfo:${info}`,
    severity: "error",
  };
  return false;
});
provideEodashInstance();
if (isWebComponent) {
  // Adopt styles into the shadowRoot when running as web component
  useAdoptStyles();
}
</script>
