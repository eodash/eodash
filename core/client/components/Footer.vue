<template>
  <v-footer
    ref="footer"
    :height="mdAndDown ? '48px' : 'auto'"
    color="secondary"
    app
    class="d-flex justify-end"
  >
    <p class="pt-0 footer-text">
      {{ eodash.brand.footerText ?? "" }}
    </p>
  </v-footer>
</template>
<script setup>
import { eodashKey } from "@/utils/keys";
import { ref } from "vue";
import { inject } from "vue";
import { useDisplay } from "vuetify";

/**
 * Footer template ref
 *
 * @type {import("vue").Ref<
 *   import("vuetify/lib/components/index").VFooter | null
 * >}
 */
const footer = ref(null);
const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey));

const { mdAndDown } = useDisplay();
</script>
<style scoped>
.footer-text {
  font-size: 0.8rem;
}
</style>
