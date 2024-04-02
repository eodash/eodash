<template>
  <v-footer ref="footer" :height="mdAndDown ? '48px' : 'auto'" color="secondary" app
    class="d-flex justify-space-between">
    <p class="pt-0 footer-text">
      {{ eodash.brand.footerText ?? "" }}
    </p>
    <div class="footer-text">
      <a href="https://github.com/eodash/eodash" target="_blank">eodash</a> by
      <a href="https://eox.at" target="_blank">
        <img src="/EOX_Logo_white.svg" height="11px">
      </a>
    </div>
  </v-footer>
</template>
<script setup>
import { eodashKey } from '@/store/Keys';
import { ref } from 'vue';
import { inject } from 'vue';
import { useDisplay } from 'vuetify/lib/framework.mjs';

/**
 * Footer template ref
 * @type {import('vue').Ref<import('vuetify/lib/components/index.mjs').VFooter | null>}
 */
const footer = ref(null)
const eodash = /** @type {import("@/types").Eodash} */(inject(eodashKey))

const { mdAndDown } = useDisplay()
</script>
<style scoped lang='scss'>
.footer-text {
  font-size: 0.8rem;
}
.footer-text a {
  color: white;
}
</style>
