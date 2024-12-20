import{d as O,e as z}from"./mdi.BUDpP7ob.js";import A from"./PopUp.lTEcs-iD.js";import{copyToClipBoard as _}from"@/utils";import{getLayers as M}from"@/store/actions";import{mapPosition as h}from"@/store/states";import{removeUnneededProperties as v}from"@/eodashSTAC/helpers";import{_ as J,av as j,aw as P,p as U,h as C,B as o,o as f,b as q,w as s,G as t,j as n,a as m,t as b,k as x,c as w,e as D,C as G,F as I}from"./framework.Gv4KJFRr.js";import"@/composables/DefineWidgets";const H={class:"pa-3 code-block"},K={style:{position:"absolute",bottom:"15px"}},Q={key:0,class:"text-success mr-3"},R={__name:"ExportState",props:j({getLayers:{type:Function,default:M}},{modelValue:{type:Boolean,required:!0,default:!1},modelModifiers:{}}),emits:["update:modelValue"],setup(u){const c=P(u,"modelValue"),y=u,p=U(!1),S=[{id:Symbol(),copyFn:async()=>await _(k.value,p),copyAs:"simple map"},{id:Symbol(),copyFn:async()=>await _(JSON.stringify(y.getLayers()),p),copyAs:"layers configuration"},{id:Symbol(),copyFn:async()=>await _($.value,p),copyAs:"map tour section"}],$=C(()=>{const[d,e,l]=h.value,r="### <!--{ layers=",i=`zoom="${l}" center=[${[d,e]}] animationOptions={duration:500}}-->
#### Tour step title
Text describing the current step of the tour and why it is interesting what the map shows currently
`;return`${r}'${JSON.stringify(v(y.getLayers()))}' ${i}`}),k=C(()=>{const[d,e,l]=h.value,r='## Map Example <!--{as="eox-map" style="width: 100%; height: 500px;" layers=',i=`zoom="${l}" center=[${[d,e]}] }-->`;return`${r}'${JSON.stringify(v(y.getLayers()))}' ${i}`});return(d,e)=>{const l=o("v-card-title"),r=o("v-icon"),i=o("v-expand-transition"),g=o("v-btn"),V=o("v-col"),B=o("v-row"),T=o("v-card-text"),F=o("v-divider"),L=o("v-spacer"),N=o("v-card-actions"),E=o("v-card");return f(),q(A,{modelValue:c.value,"onUpdate:modelValue":e[1]||(e[1]=a=>c.value=a)},{default:s(()=>[t(E,{style:{"max-height":"498px"}},{default:s(()=>[t(l,{class:"bg-primary",style:{"max-height":"49px"}},{default:s(()=>e[2]||(e[2]=[n("h5",{class:"text-h5"},"Storytelling map configuration",-1)])),_:1}),t(T,{class:"py-5 overflow-auto",style:{height:"400px"}},{default:s(()=>[e[4]||(e[4]=n("p",{class:"text-body-2"},[m(" Copy and paste this code into the map "),n("b",null,"layers field"),m(" of the storytelling editor: ")],-1)),n("div",H,b(x(v)(u.getLayers())),1),n("div",K,[t(i,null,{default:s(()=>[p.value?(f(),w("div",Q,[t(r,{color:"success",left:"",icon:[x(O)]},null,8,["icon"]),e[3]||(e[3]=n("small",null,"copied!",-1))])):D("",!0)]),_:1})]),t(B,{class:"d-flex pt-3 justify-end"},{default:s(()=>[t(V,{cols:"6",class:"flex-column align-center text-end"},{default:s(()=>[(f(),w(I,null,G(S,a=>t(g,{class:"text-body-2",onClick:a.copyFn,key:a.id,small:"",variant:"text","prepend-icon":[x(z)]},{default:s(()=>[m(" copy as "+b(a.copyAs),1)]),_:2},1032,["onClick","prepend-icon"])),64))]),_:1})]),_:1})]),_:1}),t(F),t(N,{style:{"max-height":"49px"}},{default:s(()=>[t(L),t(g,{variant:"text",onClick:e[0]||(e[0]=a=>c.value=!c.value)},{default:s(()=>e[5]||(e[5]=[m(" Close ")])),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])}}},ae=J(R,[["__scopeId","data-v-3b891766"]]);export{ae as default};
