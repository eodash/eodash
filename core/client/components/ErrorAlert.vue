<template>
  <v-alert
    v-if="errorState.message"
    translate="yes"
    :location="errorState.critical ? 'center' : 'start bottom'"
    :position="errorState.critical ? 'absolute' : 'fixed'"
    @click:close="resetError"
    :icon="[icon]"
    class="alert bg-surface rounded-xl px-4 py-3"
    :class="[
      { 'critical-error': errorState.critical },
      `alert-${errorState.severity}`
    ]"
    closable
    :close-icon="[mdiClose]"
  >
    <div class="d-flex flex-column">
      <div class="text-subtitle-1 font-weight-bold mb-1" :class="`text-${errorState.severity}-accent`">
        {{ title }}
      </div>
      <div v-if="errorState.message" class="text-body-2 message-body mb-2">
        {{ conciseMessage }}
      </div>
      <v-expansion-panels v-if="remainingDetails" variant="accordion" class="error-details">
        <v-expansion-panel
          title="Further Details"
          elevation="0"
          bg-color="transparent"
        >
          <v-expansion-panel-text>
            <div class="technical-info pa-2 rounded bg-grey-darken-4 text-mono">
              <div class="d-flex justify-end mb-1">
                <v-btn
                  size="x-small"
                  variant="text"
                  :icon="[mdiContentCopy]"
                  @click="copyError"
                ></v-btn>
              </div>
              <pre>{{ remainingDetails }}</pre>
            </div>
          </v-expansion-panel-text>
        </v-expansion-panel>
      </v-expansion-panels>
    </div>
  </v-alert>
</template>
<script setup>
import { eodashKey } from "@/utils/keys";
import {
  mdiClose,
  mdiAlertCircle,
  mdiAlert,
  mdiInformation,
  mdiContentCopy,
} from "@mdi/js";
import { inject, computed } from "vue";
import { errorState } from "@/store/states";

const eodash = inject(eodashKey);

const title = computed(() => {
  if (errorState.value.critical) {
    return eodash?.brand?.errorMessage ?? "Unable to load catalog endpoint";
  }
  return errorState.value.severity === "warning" ? "Notice" : "Something went wrong";
});

const icon = computed(() => {
  switch (errorState.value.severity) {
    case "warning":
      return mdiAlert;
    case "info":
      return mdiInformation;
    default:
      return mdiAlertCircle;
  }
});

const conciseMessage = computed(() => {
  const msg = errorState.value.message;
  if (!msg || typeof msg !== "string") return "";
  const lines = msg.split("\n").filter((l) => l.trim());
  return lines[0];
});

const remainingDetails = computed(() => {
  const msg = errorState.value.message;
  if (!msg || typeof msg !== "string") return "";
  const lines = msg.split("\n");
  const firstLineIndex = lines.findIndex((l) => l.trim() === conciseMessage.value);
  if (firstLineIndex === -1) return msg;
  const remaining = lines.slice(firstLineIndex + 1).join("\n").trim();
  return remaining || null;
});

const resetError = () => {
  errorState.value = { message: "", severity: "error", critical: false };
};

const copyError = () => {
  navigator.clipboard.writeText(errorState.value.message);
};
</script>
<style scoped>
.alert {
  z-index: 10000;
  max-width: 450px;
  margin: 16px;
  margin-bottom: 25px;
  transition: all 0.3s ease;
  backdrop-filter: blur(12px);
  border: 1px solid rgba(128, 128, 128, 0.2);
  box-shadow: 0 4px 24px rgba(0, 0, 0, 0.12);
  border-left-width: 6px !important;
}
.alert-error {
  border-left-color: rgb(var(--v-theme-error)) !important;
}
.alert-warning {
  border-left-color: #fb8c00 !important;
}
.alert-info {
  border-left-color: rgb(var(--v-theme-info)) !important;
}
.text-error-accent {
  color: rgb(var(--v-theme-error));
}
.text-warning-accent {
  color: #bf360c; /* Deep orange for high contrast on light bg */
}
.text-info-accent {
  color: rgb(var(--v-theme-info));
}
.message-body {
  color: rgba(var(--v-theme-on-surface), 0.87);
  line-height: 1.4;
}
.critical-error {
  max-width: 600px;
  box-shadow: 0 12px 48px rgba(0, 0, 0, 0.25) !important;
  border-left-width: 8px !important;
}
.error-details {
  background: transparent !important;
}
:deep(.v-expansion-panel) {
  background-color: transparent !important;
  color: inherit !important;
}
:deep(.v-expansion-panel-title) {
  min-height: 28px !important;
  padding: 0 8px !important;
  font-size: 0.75rem !important;
  opacity: 0.7;
}
:deep(.v-expansion-panel-text__wrapper) {
  padding: 0 !important;
}
.technical-info {
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 0.75rem;
  max-height: 200px;
  overflow: auto;
  white-space: pre-wrap;
  word-break: break-all;
}
.technical-info pre {
  margin: 0;
}
.bg-surface {
  background-color: rgba(var(--v-theme-surface), 0.98) !important;
}
</style>
