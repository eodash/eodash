<template>
  <v-app-bar color="primary">
    <v-app-bar-title class="cursor-pointer">{{ title }}</v-app-bar-title>
    <v-toolbar-items v-if="eodash.routes">
      <v-btn v-for="route in eodash.routes" :key="route.to" variant="text" @click="navigateTo(route.to)">
        {{ route.title }}
      </v-btn>
    </v-toolbar-items>
    <v-img class="mx-12 logo" :src="eodash.brand?.logo" />
  </v-app-bar>
</template>
<script setup>
import { eodashKey } from '@/store/Keys';
import { inject } from 'vue';
import { useRouter } from 'vue-router';

const eodash = /** @type {import("@/types").Eodash} */(inject(eodashKey))

const title = eodash.brand?.name

const { push } = useRouter()

/**
 * @param {string} to
 */
const navigateTo = (to) => {
  if (to.toLowerCase().startsWith('http')) {
    window.open(to, '_self')
  } else {
    push(`/dashboard${to}`)
  }
}
</script>
<style scoped lang='scss'>
.logo {
  max-width: 140px;
}
</style>
