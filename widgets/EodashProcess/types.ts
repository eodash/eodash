import type { StacLink, StacCollection } from "stac-ts";
import type { Ref } from "vue";

export interface CustomEnpointInput {
  links: StacLink[];
  jsonformSchema: Record<string, any>;
  jsonformValue: Record<string, any>;
  selectedStac: StacCollection;
  isPolling?: Ref<boolean>;
}
