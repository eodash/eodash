import{aK as n,h as i,au as r,aL as u,aA as p}from"./framework.CELFSZoh.js";/*!
 * pinia v3.0.1
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */var s;(function(t){t.direct="direct",t.patchObject="patch object",t.patchFunction="patch function"})(s||(s={}));function R(t){const o=n(t),e={};for(const c in o){const a=o[c];a.effect?e[c]=i({get:()=>t[c],set(f){t[c]=f}}):(r(a)||u(a))&&(e[c]=p(t,c))}return e}export{R as s};
