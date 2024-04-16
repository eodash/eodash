<template>
  <v-dialog absolute scrollable :fullscreen="fullscreen" scroll-strategy="block" close-on-back
    @update:modelValue="handleCloseDialog" v-model="dialog">
    <v-card class="ma-2 pa-2">
      <v-card-actions>
        <v-btn icon variant="text" position="fixed" style="right: 8px;" class="pa-2"
          @click="closeDialog">&#x2715;</v-btn>
      </v-card-actions>
      <eox-storytelling v-bind="storyProps" />
    </v-card>
  </v-dialog>
</template>
<script setup>
import { eodashKey } from "@/store/Keys";
import "@eox/storytelling"
import { watch } from "vue";
import { ref, inject } from "vue"
import { useRouter } from "vue-router";
import { isInternalRoute } from '@/utils'

const eodash = /** @type {import("@/types").Eodash} */ (inject(eodashKey))

/**
 * @typedef {{
 * markdown?:string;
 * unstyled?:boolean;
 * markdownUrl?:string;
 * showNav?:boolean;
 * nav?:Array<unknown>
 * }} StorytellingProps
 */


const dialog = ref(false)
const fullscreen = ref(false)
/** @type {import("vue").Ref<StorytellingProps>} */
const storyProps = ref({})

/**  @param {import('@/types').InternalRoute | import("@/types").MarkdownDialog | undefined} val */
const getStorytellingProps = (val) => {
  /** @param {StorytellingProps} val */
  return (({ markdown, unstyled, markdownUrl, showNav, nav }) => ({ markdown, unstyled, markdownUrl, showNav, nav }))(val ?? {})
}

const { currentRoute, push } = useRouter()

/** @param {boolean} modelValue */
const handleCloseDialog = (modelValue) => {
  if (modelValue === false) {
    push("/dashboard")
  }
}

const closeDialog = () => {
  dialog.value = false;
  handleCloseDialog(false)
}

watch(currentRoute, (updatedRoute) => {
  if (updatedRoute.path === '/dashboard/privacy-policy') {
    fullscreen.value = eodash.template.privacyPolicy?.fullscreen ?? false
    storyProps.value = getStorytellingProps(eodash.template.privacyPolicy)
    dialog.value = true
    return
  }

  const match = eodash.routes?.find(route => route.to === updatedRoute.path.split("/dashboard")[1])
  if (match && isInternalRoute(match)) {
    fullscreen.value = match.fullscreen ?? false
    storyProps.value = getStorytellingProps(match)
    dialog.value = true
  }
})
</script>
