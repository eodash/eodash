<template>
  <v-row class="d-flex justify-center align-center ">
    <v-col class="flex-column justify-center align-center">
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
import { inject } from 'vue';
import { eodashKey } from '@/utils/keys';
import { useDefineWidgets } from '@/composables/DefineWidgets';

const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey))

const [loading] = useDefineWidgets([eodash.template.loading])

</script>
