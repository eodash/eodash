<template>
  <v-alert
    v-if="errorState.message"
    translate="yes"
    role="alert"
    location="start bottom"
    position="fixed"
    :icon="[icon]"
    variant="elevated"
    class="alert bg-surface rounded-xl px-4 py-3"
    :class="`alert-${errorState.severity}`"
    closable
    :close-icon="[mdiClose]"
    close-label="Dismiss"
    @click:close="resetError"
  >
    <div class="d-flex flex-column">
      <div
        class="text-subtitle-1 font-weight-bold mb-1"
        :class="`text-${errorState.severity}-accent`"
      >
        {{
          errorState.severity === "error"
            ? (eodash?.brand?.errorMessage ?? "Something went wrong")
            : "Notice"
        }}
      </div>
      <div class="text-body-2 message-body mb-2">
        {{ errorState.message }}
      </div>
      <v-expansion-panels
        v-if="errorState.details"
        variant="accordion"
        class="error-details"
      >
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
                  aria-label="Copy error details"
                  title="Copy error details"
                  @click="copyError"
                ></v-btn>
              </div>
              <pre>{{ errorState.details }}</pre>
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

const resetError = () => {
  errorState.value = { message: "", details: "", severity: "error" };
};

const copyError = () => {
  // undefined on insecure origins
  navigator.clipboard?.writeText(
    `${errorState.value.message}\n${errorState.value.details}`,
  );
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
.alert-error :deep(.v-alert__prepend) {
  color: rgb(var(--v-theme-error));
}
.alert-warning :deep(.v-alert__prepend) {
  color: #fb8c00;
}
.alert-info :deep(.v-alert__prepend) {
  color: rgb(var(--v-theme-info));
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
  font-family:
    ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono",
    "Courier New", monospace;
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
