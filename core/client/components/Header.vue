<template>
  <v-app-bar color="primary">
    <v-app-bar-title class="header">{{ title }}</v-app-bar-title>
    <v-img class="mx-12 logo" :src="eodash.brand?.logo" />
  </v-app-bar>
</template>
<script setup>
import { eodashKey } from "@/utils/keys";
import { inject } from "vue";

const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey));

const title = eodash.brand?.name;
</script>
<style scoped>
.logo {
  max-width: 140px;
}
</style>
