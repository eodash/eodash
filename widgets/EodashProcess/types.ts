import type { StacLink, StacCollection } from "stac-ts";
import type { Ref } from "vue";

export interface CustomEnpointInput {
  links: StacLink[];
  jsonformSchema: Record<string, any>;
  jsonformValue: Record<string, any>;
  selectedStac: StacCollection;
  isPolling?: Ref<boolean>;
}
export interface AsyncJob {
  type: string;
  processID: string;
  jobID: string;
  status: "successful" | "failed" | "running";
  message: string;
  /** percentage of completion */
  progress: number | string;
  /** stringified object of parameters  */
  parameters: string;
  /** ISO datetime string */
  job_start_datetime: string;
  /** ISO datetime string */
  job_end_datetime: string;
  /** typically contains links to differen types of the results */
  links: StacLink[];
}

export type EOxHubProcessResults =
  | {
      urls: string[];
    }
  | {
      [K in string as K extends "urls" ? never : K]: {
        urls: string[];
        mimetype: string;
      };
    };

export type AsyncProcessResults = {
  type: string;
  urls: string[];
  id: string;
}[];
