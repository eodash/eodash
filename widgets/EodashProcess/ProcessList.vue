<template>
  <div>
    <v-table
      v-if="currentJobs.length"
      density="compact"
      style="background-color: transparent"
    >
      <thead>
        <tr>
          <th class="text-left">Executed on</th>
          <th class="text-left">Status</th>
          <th class="text-left"></th>
          <th class="text-left"></th>
          <th class="text-left"></th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in currentJobs" :key="item.jobID">
          <td>
            <a
              class="processUrl"
              target="_blank"
              v-tooltip="'Process details'"
              :href="getJobStatusUrl(item.jobID, currentIndicator)"
              >{{
                new Date(item.job_start_datetime).toISOString().slice(0, 16)
              }} <v-icon>mdi-open-in-new</v-icon></a
            >
          </td>
          <td>{{ item.status }}</td>
          <td style="padding: 0px">
            <v-btn
              :disabled="item.status !== 'successful'"
              color="primary"
              @click="loadProcess(item, currentStac, mapElement)"
              :icon="[mdiUploadBox]"
              variant="text"
              v-tooltip="'Load results to map'"
            >
            </v-btn>
          </td>
          <td style="padding: 0px">
            <v-btn
              :disabled="item.status !== 'successful'"
              color="primary"
              @click="downloadPreviousResults(item, currentStac)"
              :icon="[mdiDownloadBox]"
              variant="text"
              v-tooltip="'Download results'"
            >
            </v-btn>
          </td>
          <td style="padding: 0px">
            <v-btn
              color="#ff5252"
              @click="
                deleteJob(
                  toRef(() => currentJobs),
                  item,
                  currentIndicator,
                )
              "
              :icon="[mdiTrashCanOutline]"
              variant="text"
              v-tooltip="'Remove job'"
            >
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
<script setup>
/* eslint-disable @typescript-eslint/no-unused-vars */
import { mdiUploadBox, mdiDownloadBox, mdiTrashCanOutline, mdiOpenInNew } from "@mdi/js";
import { onMounted, toRef, toRefs } from "vue";
import { useSTAcStore } from "@/store/stac";
import { compareIndicator, indicator } from "@/store/states";
import {
  deleteJob,
  downloadPreviousResults,
  loadProcess,
  updateJobsStatus,
  getJobStatusUrl,
} from "./methods/async";
import { useOnLayersUpdate } from "@/composables";
import { compareJobs, jobs } from "./states";
const { enableCompare, mapElement } = defineProps({
  enableCompare: {
    type: Boolean,
    default: false,
  },
  mapElement: {
    /** @type {import("vue").PropType<import("@eox/map").EOxMap | null>} */
    type: Object,
    default: () => null,
  },
});
const { selectedStac, selectedCompareStac } = toRefs(useSTAcStore());
const currentJobs = enableCompare ? compareJobs : jobs;
const currentIndicator = enableCompare ? compareIndicator : indicator;
const currentStac = enableCompare ? selectedCompareStac : selectedStac;

onMounted(() => {
  updateJobsStatus(currentJobs, currentIndicator.value);
});

useOnLayersUpdate(() => updateJobsStatus(currentJobs, currentIndicator.value));
</script>
<style lang="scss">
div.v-table__wrapper {
  overflow: hidden !important;
  height: max-content !important;
}
.processUrl {
  text-decoration: none;
  color: var(--v-theme-primary);
}
</style>
