<template>
  <v-app-bar color="primary">
    <v-app-bar-title>{{ title }}</v-app-bar-title>
    <v-img class="mx-12" style="max-width: 140px;" :src="eodash.brand?.logo" />
  </v-app-bar>
</template>
<script setup>
import { eodashKey } from '@/utils/keys';
import { inject } from 'vue';

const eodash = /** @type {import("@/types").Eodash} */(inject(eodashKey))

const title = eodash.brand?.name

/**
 * @param {string} to
 */
const navigateTo = (to) => {
  window.open(to, '_self')
}
</script>
