<template>
  <v-row class="d-flex justify-center align-center">
    <v-col class="flex-column justify-center align-center">
      <Suspense>
        <component
          :is="loading?.component"
          v-if="loading?.component"
          v-bind="loading?.props"
        ></component>
        <div v-else class="text-center">Loading...</div>
        <template #fallback>
          <div class="text-center">Loading...</div>
        </template>
      </Suspense>
    </v-col>
  </v-row>
</template>
<script setup>
import { useDefineTemplate } from "@/composables/DefineTemplate";

const { loading } = useDefineTemplate();
</script>
