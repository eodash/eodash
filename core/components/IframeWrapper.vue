<template>
  <iframe :src="src" style="width: 100%; height: 100%"></iframe>
</template>
<script setup>
defineProps({
  src: {
    type: String,
    required: true
  }
})
</script>
