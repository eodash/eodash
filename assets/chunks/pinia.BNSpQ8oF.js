import{h as n,as as i,aI as r,aB as p,az as u}from"./framework.DKxocgDc.js";/*!
 * pinia v3.0.4
 * (c) 2025 Eduardo San Martin Morote
 * @license MIT
 */var o;(function(t){t.direct="direct",t.patchObject="patch object",t.patchFunction="patch function"})(o||(o={}));function R(t){const s=u(t),e={};for(const c in s){const a=s[c];a.effect?e[c]=n({get:()=>t[c],set(f){t[c]=f}}):(i(a)||r(a))&&(e[c]=p(t,c))}return e}export{R as s};
