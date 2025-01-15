import{at as i,h as n,ak as r,au as u,ai as p}from"./framework.BDJVpM2J.js";/*!
 * pinia v2.3.0
 * (c) 2024 Eduardo San Martin Morote
 * @license MIT
 */var s;(function(t){t.direct="direct",t.patchObject="patch object",t.patchFunction="patch function"})(s||(s={}));function R(t){{const o=i(t),e={};for(const c in o){const a=o[c];a.effect?e[c]=n({get:()=>t[c],set(f){t[c]=f}}):(r(a)||u(a))&&(e[c]=p(t,c))}return e}}export{R as s};
