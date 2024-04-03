<template>
  <v-dialog absolute :fullscreen="fullscreen" scroll-strategy="none" v-model="dialog">
    <v-card>
      <v-card-actions>
        <v-btn icon variant="text" @click="dialog = false">&#x2715;</v-btn>
      </v-card-actions>
      <eox-storytelling v-bind="storyProps" />
    </v-card>
  </v-dialog>
</template>
<script setup>
import { eodashKey } from "@/store/Keys";
import "@eox/storytelling"
import { ref, inject, onMounted } from "vue"
import { useCookies } from 'vue3-cookies'
const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey))

const dialog = ref(false)
const fullscreen = eodash.template.intro?.fullscreen
delete eodash.template.intro?.fullscreen

const storyProps = eodash.template.intro

const { cookies } = useCookies()
if (!cookies.get('user_session_m')) {
  dialog.value = true
}
onMounted(() => {
  cookies.set('user_session_m', Date.now().toString(), '1m')
})

</script>
