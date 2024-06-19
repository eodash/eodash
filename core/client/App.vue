<template>
  <v-app>
    <Suspense>
      <Dashboard />

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

const error = ref("");
onErrorCaptured((e, inst, info) => {
  error.value = `
  ${e}.
  component: ${inst?.$.type.name}.
  info: ${info}.
  `;
});
</script>
