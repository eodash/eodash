<template>
  <HeaderComponent v-if="!eodash.brand.noLayout" />
  <ErrorAlert v-model="error" />
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
import { defineAsyncComponent, onErrorCaptured, ref } from "vue";
import { useDisplay } from "vuetify/lib/framework.mjs";
import { loadFont } from "@/utils";
import Loading from "@/components/Loading.vue";
import ErrorAlert from "@/components/ErrorAlert.vue";

const props = defineProps({
  config: {
    type: String,
  },
  isWebComponent: {
    type: Boolean,
    default: false,
  },
});
const eodash = await useEodashRuntime(props.config);

useURLSearchParametersSync();

const theme = useUpdateTheme("dashboardTheme", eodash.brand?.theme);
theme.global.name.value = "dashboardTheme";

await loadFont(
  eodash.brand?.font?.family,
  eodash.brand?.font?.link,
  props.isWebComponent,
);

const { loadSTAC } = useSTAcStore();
await loadSTAC();

const { smAndDown } = useDisplay();
const TemplateComponent = smAndDown.value
  ? defineAsyncComponent(() => import(`@/components/MobileLayout.vue`))
  : defineAsyncComponent(() => import(`@/components/DashboardLayout.vue`));

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
</style>
