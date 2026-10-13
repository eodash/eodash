---
layout: page
footer: false
---

<script setup>
import { withBase } from "vitepress";
</script>

# Welcome to EO Stories

Explore interactive indicators and narratives.

<eo-dash :config="withBase('/config.js')"></eo-dash>

<style>
eo-dash {
  display: block;
  height: calc(100dvh - var(--vp-nav-height));
  width: 100%;
}
.VPPage:has(eo-dash) {
  padding: 0;
  max-width: unset;
}
</style>
