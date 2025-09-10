<template>
<v-main>
  <eox-timeslider .for="mapEl"/>
</v-main>
 </template>
<script setup>
import { mapEl } from "@/store/states";
import "@eox/timeslider"
</script>
