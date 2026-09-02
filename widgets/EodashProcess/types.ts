import type { STACLink } from "@eodash/stac";
import type { STACCollection } from "@eodash/stac";
import type { Ref } from "vue";

export interface CustomEnpointInput {
  links: STACLink[];
  jsonformSchema: Record<string, any>;
  jsonformValue: Record<string, any>;
  rawJsonformValue?: Record<string, any>;
  selectedStac: STACCollection;
  isPolling?: Ref<boolean>;
  enableCompare?: boolean;
  jobs: Ref<AsyncJob[]>;
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
  links: STACLink[];
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
