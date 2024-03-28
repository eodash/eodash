<template>
  <v-dialog absolute :fullscreen="fullscreen" v-model="dialog">
    <v-card>
      <v-card-action>
        <v-btn icon variant="text" @click="dialog = false">&#x2715;</v-btn>
      </v-card-action>
      <eox-storytelling v-bind="storyProps" />
    </v-card>
  </v-dialog>
</template>
<script setup>
import { eodashKey } from "@/store/Keys";
import "@eox/storytelling"
import { ref, inject } from "vue"

const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey))

const dialog = ref(true)

const fullscreen = eodash.template.intro?.fullscreen
delete eodash.template.intro?.fullscreen

const storyProps = eodash.template.intro

</script>
