import type { StacLink, StacCollection } from "stac-ts";
import type { Ref } from "vue";

export interface CustomEnpointInput {
  links: StacLink[];
  jsonformSchema: Record<string, any>;
  jsonformValue: Record<string, any>;
  selectedStac: StacCollection;
  isPolling?: Ref<boolean>;
}

export type EOxHubProcessResponse = { id: string } & (
  | {
      urls: string[];
    }
  | Record<string, { urls: string[]; mimetype: string }>
);

export type AsyncProcessResponse = {
  type: string;
  urls: string[];
  id: string;
}[];
