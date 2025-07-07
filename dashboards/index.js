import { default as primaryConfig } from "./primary";
import { deepmerge } from "deepmerge-ts";

/** @param {import("@/types").Eodash} config */
const getPrimary = (config) => deepmerge(primaryConfig, config || {});
getPrimary.primary = primaryConfig;

export { getPrimary };
