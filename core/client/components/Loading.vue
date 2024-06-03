<template>
  <v-row class="d-flex justify-center align-center ">
    <v-col class="flex-column justify-center align-center">
      <ErrorAlert v-model="error" />
      <Suspense>
        <component v-if="loading.component" :is="loading.component" v-bind="loading.props"></component>
        <div v-else class="text-center">
          Loading...
        </div>
        <template #fallback>
          <div class="text-center">
            Loading...
          </div>
        </template>
      </Suspense>
    </v-col>
  </v-row>
</template>
<script setup>
import { inject, onErrorCaptured, ref } from 'vue';
import { eodashKey } from '@/utils/keys';
import { useDefineWidgets } from '@/composables/DefineWidgets';
import ErrorAlert from './ErrorAlert.vue';

const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey))

const [loading] = useDefineWidgets([eodash.template.loading])

const error = ref('')
onErrorCaptured((e, inst, info) => {
  error.value = `
  ${e}.
  component: ${inst?.$.type.name}.
  info: ${info}.
  `
})

</script>
