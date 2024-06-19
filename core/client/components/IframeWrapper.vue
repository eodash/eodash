<template>
  <iframe :src="src" class="fill-height fill-width"></iframe>
</template>
<script setup>
defineProps({
  src: {
    type: String,
    required: true,
  },
});
</script>
