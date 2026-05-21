import vuetify from "./vuetify";
import { createPinia } from "pinia";
import VCalendar from "v-calendar";
import store from "../store";
import log from "loglevel";
import { eodashKey } from "@/utils/keys";
import { reactive } from "vue";
import { errorState } from "@/store/states";

export const pinia = createPinia();

/** @param {import("vue").App} app */
export function registerPlugins(app) {
  window.eodashStore = store;
  window.setEodashLoglevel = log.setLevel;

  // Intercept console.error to catch map-related errors
  const originalError = console.error;

  //@ts-expect-error message can be dynamic
  const updateErrorState = (message, isUncaught = false) => {
    const lowerMessage = message.toLowerCase();

    // 1. Style Load/Parse Issue (from fetchJson, map, or OpenLayers internals)
    if (
      (lowerMessage.includes("style definition") &&
        (lowerMessage.includes("fail") ||
          lowerMessage.includes("error") ||
          lowerMessage.includes("parse"))) ||
      lowerMessage.includes("expected an array of numbers") ||
      lowerMessage.includes("invalid expression") ||
      lowerMessage.includes("parsestyle") ||
      lowerMessage.includes("expressiontoglsl")
    ) {
      errorState.value = {
        message: `Failed to load or parse style definition.\n\nDescription: An error occurred while fetching or parsing the layer style. This is often due to a malformed expression or incorrect data type in the style JSON.\n\nHow to solve:\n- Check if the style URL is valid.\n- Verify the file contains valid JSON.\n- Confirm all expressions (e.g., color, opacity) use the correct syntax and types.\n- Confirm CORS headers allow access from this domain.\n\nDetails: ${message}`,
        severity: "warning",
        critical: false,
      };
      return true;
    }

    // 2. Map Error
    if (
      lowerMessage.includes("flat style") ||
      lowerMessage.includes("openlayers") ||
      lowerMessage.includes("style validation")
    ) {
      errorState.value = {
        message: `Map Error: ${message}`,
        severity: "warning",
        critical: false,
      };
      return true;
    }

    // 3. Chart Error
    if (
      lowerMessage.includes("canvasrenderingcontext2d.drawimage") ||
      lowerMessage.includes("passed-in image is \"broken\"") ||
      lowerMessage.includes("vega")
    ) {
      errorState.value = {
        message: `Chart Rendering Error: ${message}`,
        severity: "warning",
        critical: false,
      };
      return true;
    }

    if (isUncaught) {
      errorState.value = {
        message,
        severity: "error",
        critical: false,
      };
      return true;
    }

    return false;
  };

  console.error = (...args) => {
    const message = args
      .map((arg) => {
        if (arg instanceof Error || arg instanceof DOMException) {
          return arg.toString();
        }
        return typeof arg === "object" ? JSON.stringify(arg) : String(arg);
      })
      .join(" ");

    updateErrorState(message);
    originalError.apply(console, args);
  };

  // Catch uncaught errors
  window.addEventListener("error", (event) => {
    const error = event.error;
    const msg = error instanceof Error
      ? error.toString()
      : `${event.message} at ${event.filename}:${event.lineno}:${event.colno}`;
    updateErrorState(msg, true);
  });

  // Catch unhandled promise rejections
  window.addEventListener("unhandledrejection", (event) => {
    const reason = event.reason;
    const message = reason instanceof Error ? reason.toString() : String(reason);
    updateErrorState(message, true);
    originalError("Unhandled Rejection:", reason);
  });

  app
    .use(vuetify)
    .use(pinia)
    // Use plugin with optional defaults
    .use(VCalendar, {})
    //@ts-expect-error reactive placeholder for eodash
    .provide(eodashKey, reactive({}));

  app.config.errorHandler = (err) => {
    const message = err instanceof Error ? err.toString() : String(err);
    updateErrorState(message, true);
    originalError(err);
  };
}
