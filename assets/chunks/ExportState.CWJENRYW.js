import{d as O,e as z}from"./mdi.BUDpP7ob.js";import A from"./PopUp.Cwrhkf0Q.js";import{copyToClipBoard as y}from"@/utils";import{getLayers as M}from"@/store/Actions";import{mapPosition as C}from"@/store/States";import{removeUnneededProperties as v}from"@/utils/helpers";import{_ as J,au as j,av as D,s as P,h as S,o as f,b as U,w as o,D as t,I as e,j as c,t as b,k as x,c as w,e as q,E as G,a as u,F as H,p as K,l as Q}from"./framework.aHzNIzoY.js";import"@/composables/DefineWidgets";const g=s=>(K("data-v-d5e3ad53"),s=s(),Q(),s),R=g(()=>c("h5",{class:"text-h5"},"Storytelling map configuration",-1)),W=g(()=>c("p",{class:"text-body-2"},[u(" Copy and paste this code into the map "),c("b",null,"layers field"),u(" of the storytelling editor: ")],-1)),X={class:"pa-3 code-block"},Y={style:{position:"absolute",bottom:"15px"}},Z={key:0,class:"text-success mr-3"},ee=g(()=>c("small",null,"copied!",-1)),te={__name:"ExportState",props:j({getLayers:{type:Function,default:M}},{modelValue:{type:Boolean,required:!0,default:!1},modelModifiers:{}}),emits:["update:modelValue"],setup(s){const d=D(s,"modelValue"),_=s,p=P(!1),$=[{id:Symbol(),copyFn:async()=>await y(V.value,p),copyAs:"simple map"},{id:Symbol(),copyFn:async()=>await y(JSON.stringify(_.getLayers()),p),copyAs:"layers configuration"},{id:Symbol(),copyFn:async()=>await y(k.value,p),copyAs:"map tour section"}],k=S(()=>{const[m,a,l]=C.value,r="### <!--{ layers=",i=`zoom="${l}" center=[${[m,a]}] animationOptions={duration:500}}-->
#### Tour step title
Text describing the current step of the tour and why it is interesting what the map shows currently
`;return`${r}'${JSON.stringify(v(_.getLayers()))}' ${i}`}),V=S(()=>{const[m,a,l]=C.value,r='## Map Example <!--{as="eox-map" style="width: 100%; height: 500px;" layers=',i=`zoom="${l}" center=[${[m,a]}] }-->`;return`${r}'${JSON.stringify(v(_.getLayers()))}' ${i}`});return(m,a)=>{const l=t("v-card-title"),r=t("v-icon"),i=t("v-expand-transition"),h=t("v-btn"),T=t("v-col"),B=t("v-row"),F=t("v-card-text"),L=t("v-divider"),N=t("v-spacer"),E=t("v-card-actions"),I=t("v-card");return f(),U(A,{modelValue:d.value,"onUpdate:modelValue":a[1]||(a[1]=n=>d.value=n)},{default:o(()=>[e(I,{style:{"max-height":"498px"}},{default:o(()=>[e(l,{class:"bg-primary",style:{"max-height":"49px"}},{default:o(()=>[R]),_:1}),e(F,{class:"py-5 overflow-auto",style:{height:"400px"}},{default:o(()=>[W,c("div",X,b(x(v)(s.getLayers())),1),c("div",Y,[e(i,null,{default:o(()=>[p.value?(f(),w("div",Z,[e(r,{color:"success",left:"",icon:[x(O)]},null,8,["icon"]),ee])):q("",!0)]),_:1})]),e(B,{class:"d-flex pt-3 justify-end"},{default:o(()=>[e(T,{cols:"6",class:"flex-column align-center text-end"},{default:o(()=>[(f(),w(H,null,G($,n=>e(h,{class:"text-body-2",onClick:n.copyFn,key:n.id,small:"",variant:"text","prepend-icon":[x(z)]},{default:o(()=>[u(" copy as "+b(n.copyAs),1)]),_:2},1032,["onClick","prepend-icon"])),64))]),_:1})]),_:1})]),_:1}),e(L),e(E,{style:{"max-height":"49px"}},{default:o(()=>[e(N),e(h,{variant:"text",onClick:a[0]||(a[0]=n=>d.value=!d.value)},{default:o(()=>[u(" Close ")]),_:1})]),_:1})]),_:1})]),_:1},8,["modelValue"])}}},de=J(te,[["__scopeId","data-v-d5e3ad53"]]);export{de as default};