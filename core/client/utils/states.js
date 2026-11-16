import { reactive, ref, shallowRef } from "vue";

/**
 * Base layers shown when a collection brings none of its own.
 * Set from `EodashMap`'s `baseLayers` prop, which no store action can reach.
 *
 * @type {import("vue").ShallowRef<import("@eox/map").EoxLayer[]>}
 */
export const defaultBaseLayers = shallowRef([]);

/**
 * Whether the opening view came from the link rather than from a collection,
 * so that a shared position is not overridden by a zoom to the collection.
 */
export const hasRestoredView = ref(false);

/**
 * Whether a newly rendered collection moves the map to its extent.
 * Set from `EodashMap`'s `zoomToExtent` prop, which no store action can reach.
 */
export const shouldZoomToExtent = ref(false);

/**
 * Which item-level time properties the data layers carry. Turning both off also skips
 * fetching the collection's dates.
 * @type {import("@/types").LayerTimeProperties}
 */
export const layerTimeProperties = reactive({
  layerDatetime: true,
  timeControlValues: true,
});

/** whether it's the first load of the app, used to track if there are params in the url */
export const isFirstLoad = ref(false);

/**
 * Current value of the layer control JSON form for the latest layer the user interacted with.
 * @type {import("vue").Ref<Record<string, any> | undefined>}
 */
export const layerControlFormValue = ref({});

/**
 * Current value of the layer control JSON form for the latest layer the user interacted with.
 * @type {import("vue").Ref<Record<string, any> | undefined>}
 */
export const layerControlFormValueCompare = ref({});

/**
 * STAC indicators color palette, defaults to Bank-Wong palette
 *  @type {string[]} */
export const collectionsPalette = reactive([
  "#009E73",
  "#0072B2",
  "#E69F00",
  "#CC79A7",
  "#56B4E9",
  "#D55E00",
]);
