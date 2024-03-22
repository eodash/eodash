import { mapInstance } from '../core/store/States';
import { watch } from 'vue'
import { useSTAcStore } from '@/store/stac'
import { storeToRefs } from 'pinia'
import { EodashCollection } from './eodashSTAC';
import { toAbsolute } from 'stac-js/src/http.js';
import eodashConfig from "@/eodash"
import '@eox/map/dist/eox-map-advanced-layers-and-sources.js';
/**
 * @type {Function | null}
 */
let handleMoveEnd = null;

export const MapWidget = {
    id: Symbol(),
    widget: {
        link: 'https://cdn.skypack.dev/@eox/map',
        properties: {
            class: "fill-height fill-width overflow-none",
            center: [15, 48],
            layers: [{ type: "Tile", source: { type: "OSM" } }],
        },
        tagName: 'eox-map',
        onMounted(el, _, router) {
            const { selectedStac } = storeToRefs(useSTAcStore())
            watch(selectedStac, async (updatedStac) => {
                if (updatedStac) {
                    const parentCollUrl = toAbsolute(updatedStac.links[1].href, eodashConfig.stacEndpoint);
                    const childCollUrl = toAbsolute(updatedStac.links[1].href, parentCollUrl);
                    const eodash = new EodashCollection(childCollUrl);
                    el.layers = await eodash.createLayersJson();
                }
            }, { immediate: true })
            
            /** @type {any} */// (el).zoom = router.currentRoute.value.query['z'];
    
            mapInstance.value =  /** @type {any} */(el).map;
    
            mapInstance.value?.on('moveend', handleMoveEnd =
            /** @param {any} evt  */(evt) => {
                router.push({
                query: {
                    z: `${evt.map.getView().getZoom()}`
                }
                });
            });
        },
        onUnmounted(_el, _store, _router) {
            //@ts-expect-error
            mapInstance.value?.un('moveend', handleMoveEnd);
        }
    },
    type: 'web-component',
}