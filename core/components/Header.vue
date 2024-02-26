<template>
  <v-app-bar color="primary">
    <v-app-bar-title @click="push('/')" class="cursor-pointer">{{ title }}</v-app-bar-title>
    <v-toolbar-items v-if="eodashConfig.routes">
      <v-btn v-for="route in eodashConfig.routes" :key="route.to" variant="text" @click="navigateTo(route.to)">
        {{ route.title }}
      </v-btn>
    </v-toolbar-items>
    <v-img class="mx-12 logo" :src="eodashConfig.brand?.logo" />
  </v-app-bar>
</template>
<script setup>
import { eodashConfigKey } from '@/store/Keys';
import { inject } from 'vue';
import { useRouter } from 'vue-router';

const eodashConfig = /** @type {EodashConfig} */(inject(eodashConfigKey))

const title = eodashConfig.brand?.name

const { push } = useRouter()

/**
 * @param {string} to
 */
const navigateTo = (to) => {
  if (to.toLowerCase().startsWith('http')) {
    window.open(to, '_self')
  } else {
    push(to)
  }
}
</script>
<style scoped lang='scss'>
.logo {
  max-width: 140px;
}
</style>
