import{ar as i,h as n,ak as r,as as p,ai as u}from"./framework.DpVaPR-D.js";/*!
 * pinia v2.3.0
 * (c) 2024 Eduardo San Martin Morote
 * @license MIT
 */var o;(function(t){t.direct="direct",t.patchObject="patch object",t.patchFunction="patch function"})(o||(o={}));function R(t){{const s=i(t),e={};for(const c in s){const a=s[c];a.effect?e[c]=n({get:()=>t[c],set(f){t[c]=f}}):(r(a)||p(a))&&(e[c]=u(t,c))}return e}}export{R as s};
