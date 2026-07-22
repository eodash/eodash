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
              v-tooltip="'Process details'"
              class="processUrl"
              target="_blank"
              :href="getJobStatusUrl(item.jobID, currentIndicator)"
              >{{
                new Date(item.job_start_datetime).toISOString().slice(0, 16)
              }}
              <v-icon :icon="[mdiOpenInNew]" />
            </a>
          </td>
          <td>{{ item.status }}</td>
          <td style="padding: 0px">
            <v-btn
              v-tooltip="'Load results to map'"
              :disabled="item.status !== 'successful'"
              color="primary"
              :icon="[mdiUploadBox]"
              variant="text"
              @click="loadProcess(item, currentStac, mapElement)"
            >
            </v-btn>
          </td>
          <td style="padding: 0px">
            <v-btn
              v-tooltip="'Download results'"
              :disabled="item.status !== 'successful'"
              color="primary"
              :icon="[mdiDownloadBox]"
              variant="text"
              @click="downloadPreviousResults(item, currentStac)"
            >
            </v-btn>
          </td>
          <td style="padding: 0px">
            <v-btn
              v-tooltip="'Remove job'"
              color="#ff5252"
              :icon="[mdiTrashCanOutline]"
              variant="text"
              @click="
                deleteJob(
                  toRef(() => currentJobs),
                  item,
                  currentIndicator,
                )
              "
            >
            </v-btn>
          </td>
        </tr>
      </tbody>
    </v-table>
  </div>
</template>
<script setup>
import {
  mdiUploadBox,
  mdiDownloadBox,
  mdiTrashCanOutline,
  mdiOpenInNew,
} from "@mdi/js";
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
