<template>
  <HeaderComponent v-if="!eodash.brand.noLayout" />
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
  <FooterComponent v-if="!eodash.brand.noLayout" />
</template>

<script setup>
import { useEodashRuntime } from "@/composables/DefineEodash";
import { useURLSearchParametersSync, useUpdateTheme } from "@/composables";
import { useSTAcStore } from "@/store/stac";
import { computed, defineAsyncComponent, onErrorCaptured, ref } from "vue";
import { useDisplay } from "vuetify/lib/framework";
import { loadFont } from "@/utils";
import Loading from "@/components/Loading.vue";
import ErrorAlert from "@/components/ErrorAlert.vue";
import EodashOverlay from "@/components/EodashOverlay.vue";

const props = defineProps({
  config: {
    type: String,
  },
  isWebComponent: {
    type: Boolean,
    default: false,
  },
});

useURLSearchParametersSync();

const eodash = await useEodashRuntime(props.config);

const theme = useUpdateTheme("dashboardTheme", {
  ...(eodash.brand?.theme ?? {}),
});
theme.global.name.value = "dashboardTheme";

await loadFont(eodash.brand?.font, props.isWebComponent);

const { loadSTAC } = useSTAcStore();
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

const templateHeight = props.isWebComponent ? "100%" : "100dvh";

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
  height: 100dvh;
  display: flex;
  align-items: center;
  justify-content: center;
}

div.v-application__wrap {
  min-height: fit-content;
}
eo-dash {
  overflow: hidden;
}
/* set eox-elements colors css vars to match the theme */
/*
eox-layercontrol,
eox-map,
eox-drawtools,
eox-timecontrol,
eox-jsonform,
eox-chart,
eox-stacinfo,
eox-itemfilter {
  --primary-color: rgb(var(--v-theme-primary));
  --eox-primary-color: rgb(var(--v-theme-primary));
  --eox-secondary-color: rgb(var(--v-theme-secondary));
  --eox-accent-color: rgb(var(--v-theme-accent));
  --eox-error-color: rgb(var(--v-theme-error));
  --eox-info-color: rgb(var(--v-theme-info));
  --eox-success-color: rgb(var(--v-theme-success));
  --eox-warning-color: rgb(var(--v-theme-warning));
  --range-slider-color: rgb(var(--v-theme-primary));
  --range-slider-track-color: rgb(var(--v-theme-on-primary));
} */
</style>
