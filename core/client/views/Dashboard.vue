<template>
  <HeaderComponent v-if="!eodash?.brand.noLayout" />
  <ErrorAlert v-model="error" />
  <EodashOverlay />
  <Suspense>
    <TemplateComponent :style="{ height: templateHeight }" />
    <template #fallback>
      <div class="loading-container">
        <Loading />
      </div>
    </template>
  </Suspense>
  <FooterComponent v-if="!eodash?.brand.noLayout" />
</template>

<script setup>
import { useEodashRuntime } from "@/composables/DefineEodash";
import { useURLSearchParametersSync, useUpdateTheme } from "@/composables";
import { useSTAcStore } from "@/store/stac";
import { computed, defineAsyncComponent, onErrorCaptured, ref } from "vue";
import { useDisplay } from "vuetify";
import { loadFont } from "@/utils";
import Loading from "@/components/Loading.vue";
import ErrorAlert from "@/components/ErrorAlert.vue";
import EodashOverlay from "@/components/EodashOverlay.vue";

const props = defineProps({
  config: {
    type: [String, Function],
  },
  isWebComponent: {
    type: Boolean,
    default: false,
  },
});

useURLSearchParametersSync();

const eodash = await useEodashRuntime(props.config);
if (!eodash) {
  throw new Error(
    "Eodash configuration is not defined. Please provide a valid configuration file or object.",
  );
}

const theme = useUpdateTheme("dashboardTheme", {
  ...(eodash?.brand?.theme ?? {}),
});
theme.change("dashboardTheme");

await loadFont(eodash?.brand?.font, props.isWebComponent);

const { loadSTAC, init } = useSTAcStore();
init(eodash.stacEndpoint);
await loadSTAC();

const { smAndDown } = useDisplay();

const TemplateComponent = computed(() =>
  smAndDown.value
    ? defineAsyncComponent(() => import(`@/components/MobileLayout.vue`))
    : defineAsyncComponent(() => import(`@/components/DashboardLayout.vue`)),
);

const HeaderComponent = defineAsyncComponent(
  () => import(`@/components/Header.vue`),
);
const FooterComponent = defineAsyncComponent(
  () => import(`@/components/Footer.vue`),
);

const templateHeight = "100%";

const error = ref("");
onErrorCaptured((e, comp, info) => {
  error.value = `
  ${e}.
  component: ${comp?.$.type.name}.
  info: ${info}.
  `;
});
</script>
<style>
.loading-container {
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

div.v-application__wrap {
  height: 100%;
  min-height: 100%;
}
eo-dash {
  overflow: hidden;
  display: block;
}
/* set eox-elements colors css vars to match the theme */
:root {
  --eox-theme-light-primary: var(--v-theme-primary) !important;
  --eox-theme-light-on-primary: var(--v-theme-on-primary) !important;
  --eox-theme-light-secondary: var(--v-theme-secondary) !important;
  --eox-theme-light-on-secondary: var(--v-theme-on-secondary) !important;
  --eox-theme-light-surface: var(--v-theme-surface) !important;
  --eox-theme-light-on-surface: var(--v-theme-on-surface) !important;
  --eox-theme-light-background: var(--v-theme-background) !important;
  --eox-theme-light-on-background: var(--v-theme-on-background) !important;
  --eox-theme-light-accent: var(--v-theme-accent) !important;
  --eox-theme-light-error: var(--v-theme-error) !important;
  --eox-theme-light-info: var(--v-theme-info) !important;
  --eox-theme-light-success: var(--v-theme-success) !important;
  --eox-theme-light-warning: var(--v-theme-warning) !important;
}
</style>
