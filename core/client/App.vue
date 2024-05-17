<template>
  <v-app>
    <Suspense>
      <!-- main content -->
      <Dashboard />

      <!-- loading state -->
      <template #fallback>
        <Loading />
      </template>
    </Suspense>
  </v-app>
</template>

<script setup>
import Loading from '@/components/Loading.vue';
import Dashboard from '@/views/Dashboard.vue';

</script>
