import{aI as n,h as i,at as r,aJ as p,az as u}from"./framework.B-gP_OBW.js";/*!
 * pinia v3.0.3
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */var s;(function(t){t.direct="direct",t.patchObject="patch object",t.patchFunction="patch function"})(s||(s={}));function R(t){const o=n(t),e={};for(const c in o){const a=o[c];a.effect?e[c]=i({get:()=>t[c],set(f){t[c]=f}}):(r(a)||p(a))&&(e[c]=u(t,c))}return e}export{R as s};
