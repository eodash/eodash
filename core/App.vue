<template>
  <v-app>
    <!--   <RouterView v-slot="{ Component }">
      <template v-if="Component"> -->
    <Suspense>
      <!-- main content -->
      <Dashboard />

      <!-- loading state -->
      <template #fallback>
        <v-row class="d-flex justify-center align-center ">
          <v-col class="flex-column justify-center align-center">
            <Suspense>
              <component v-if="loading.component" :is="loading.component" v-bind="loading.props"></component>
              <div v-else class="text-center">
                Loading...
              </div>
            </Suspense>
          </v-col>
        </v-row>
      </template>
    </Suspense>
    <!-- </template>
    </RouterView> -->
  </v-app>
</template>

<script setup>
import { inject } from 'vue';
import { eodashKey } from './store/Keys';
import { useDefineWidgets } from './composables/DefineWidgets';
import Dashboard from './views/Dashboard.vue';

const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey))

const [loading] = useDefineWidgets([eodash.template.loading])
</script>
