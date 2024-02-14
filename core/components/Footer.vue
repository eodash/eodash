<template>
  <v-footer ref="footer" :height="mdAndDown ? '48px' : 'auto'" color="secondary" app class="d-flex justify-space-between">
    <p class="pt-0 footer-text">
      Phasellus feugiat arcu sapien, et iaculis ipsum elementum sit amet. Mauris cursus commodo interdum.
    </p>
    <div class="footer-text">
      {{ new Date().getFullYear() }} — <strong>{{ title }}</strong>
    </div>
  </v-footer>
</template>
<script setup>
import { eodashConfigKey } from '@/store/Keys';
import { ref } from 'vue';
import { inject } from 'vue';
import { useDisplay } from 'vuetify/lib/framework.mjs';

/**
 * Footer template ref
 * @type {import('vue').Ref<import('vuetify/lib/components/index.mjs').VFooter | null>}
 */
const footer = ref(null)
const eodashConfig = /** @type {EodashConfig} */(inject(eodashConfigKey))

const title = eodashConfig.brand?.shortName ?? eodashConfig.brand?.name
const { mdAndDown } = useDisplay()
</script>
<style scoped lang='scss'>
.footer-text {
  font-size: 0.8rem;
}
</style>
