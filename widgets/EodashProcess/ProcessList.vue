<template>
  <div>
    <v-table
      v-if="jobs.length"
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
        <tr v-for="item in jobs" :key="item.jobID">
          <td>
            {{ new Date(item.job_start_datetime).toISOString().slice(0, 16) }}
          </td>
          <td>{{ item.status }}</td>
          <td style="padding: 0px">
            <v-btn
              :disabled="item.status !== 'successful'"
              color="primary"
              @click="loadProcess(item, selectedStac)"
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
              @click="downloadPreviousResults(item, selectedStac)"
              :icon="[mdiDownloadBox]"
              variant="text"
              v-tooltip="'Download results'"
            >
            </v-btn>
          </td>
          <td style="padding: 0px">
            <v-btn
              color="#ff5252"
              @click="deleteJob(item)"
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
import { mdiUploadBox, mdiDownloadBox, mdiTrashCanOutline } from "@mdi/js";
import { onMounted, toRefs } from "vue";
import { useSTAcStore } from "@/store/stac";
import { indicator } from "@/store/states";
import {
  deleteJob,
  downloadPreviousResults,
  jobs,
  loadProcess,
  updateJobsStatus,
} from "./methods/async";
import { useOnLayersUpdate } from "@/composables";

const { selectedStac } = toRefs(useSTAcStore());
onMounted(() => {
  updateJobsStatus(jobs, indicator.value);
});

useOnLayersUpdate(() => updateJobsStatus(jobs, indicator.value));
</script>
<style lang="scss">
div.v-table__wrapper {
  overflow: hidden !important;
  height: max-content !important;
}
</style>
