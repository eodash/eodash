import{useDefineWidgets as v}from"@/composables/DefineWidgets";import{au as k,av as V,B as u,o as a,c as r,G as m,w as i,b as _,K as b,k as l,H as h,e as c,r as w}from"./framework.BsmD132R.js";const y={key:1},C={__name:"PopUp",props:k({widget:{type:Object,default:void 0}},{modelValue:{type:Boolean,required:!0,default:!1},modelModifiers:{}}),emits:["update:modelValue"],setup(e){const s=V(e,"modelValue"),o=e,[t]=v([o==null?void 0:o.widget]);return(n,d)=>{const p=u("v-sheet"),f=u("v-dialog");return a(),r("span",null,[m(f,{"max-width":"500px","max-height":"500px",absolute:"",scrollable:"","scroll-strategy":"block","close-on-back":"",modelValue:s.value,"onUpdate:modelValue":d[0]||(d[0]=g=>s.value=g)},{default:i(()=>[m(p,null,{default:i(()=>[e.widget?(a(),_(h(l(t).component),b({key:l(t).id},l(t).props),null,16)):c("",!0),n.$slots.default?(a(),r("span",y,[w(n.$slots,"default")])):c("",!0)]),_:3})]),_:3},8,["modelValue"])])}}};export{C as default};