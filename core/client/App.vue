<template>
  <v-app>
    <Suspense>
      <Dashboard :is-web-component="!!$host" :config="config" />

      <template #fallback>
        <ErrorAlert v-model="error" />
      </template>
    </Suspense>
  </v-app>
</template>

<script setup>
import Dashboard from "@/views/Dashboard.vue";
import ErrorAlert from "./components/ErrorAlert.vue";
import { onErrorCaptured, ref, useHost } from "vue";

defineProps({
  config: {
    type: String,
    required: false,
    default: undefined,
  },
});

const error = ref("");
const $host = useHost();

onErrorCaptured((e, inst, info) => {
  error.value = `
  ${e}.
  component: ${inst?.$.type.name}.
  info: ${info}.
  `;
});
</script>
