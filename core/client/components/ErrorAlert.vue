<template>
  <v-alert
    v-if="error"
    translate="yes"
    location="start bottom"
    type="error"
    position="fixed"
    @click:close="error = ''"
    variant="elevated"
    :icon="[mdiAlertCircle]"
    class="alert"
    closable
    :close-icon="[mdiClose]"
  >
    {{ errorMessage }}
    <details is="animated-details">
      <summary>Error</summary>
      {{ error }}
    </details>
  </v-alert>
</template>
<script setup>
import { eodashKey } from "@/utils/keys";
import { mdiClose, mdiAlertCircle } from "@mdi/js";
import { inject } from "vue";

const error = defineModel({ type: String, required: true });
const eodash = inject(eodashKey);
const errorMessage =
  eodash?.brand.errorMessage ?? "something went wrong, please try again later";
</script>
<style scoped>
.alert {
  z-index: 10000;
}
</style>
