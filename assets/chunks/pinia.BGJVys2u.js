import{aH as n,h as i,as as r,aI as p,ay as u}from"./framework.r-SdhhLy.js";/*!
 * pinia v3.0.3
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */var o;(function(t){t.direct="direct",t.patchObject="patch object",t.patchFunction="patch function"})(o||(o={}));function R(t){const s=n(t),e={};for(const c in s){const a=s[c];a.effect?e[c]=i({get:()=>t[c],set(f){t[c]=f}}):(r(a)||p(a))&&(e[c]=u(t,c))}return e}export{R as s};
