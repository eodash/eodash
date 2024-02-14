/**
 * Node module imports Map,
 * used for importing node modules web components from the config.
 **/
export default {
  '@eox/itemfilter': async () => await import('@eox/itemfilter'),
  '@eox/stacinfo': async () => await import('@eox/stacinfo'),
  '@eox/map': async () => await import('@eox/map'),
};
