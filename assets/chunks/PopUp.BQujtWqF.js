import{useDefineWidgets as y}from"@/composables/DefineWidgets";import{at as k,au as v,B as i,o as a,c as u,G as r,w as m,K as c,b as w,k as l,H as V,e as p,r as _}from"./framework.DpVaPR-D.js";const b={key:1},W={__name:"PopUp",props:k({widget:{type:Object,default:void 0},maxWidth:{type:String,default:"500px"},maxHeight:{type:String,default:"500px"},width:{type:String,default:"500px"},height:{type:String,default:"500px"}},{modelValue:{type:Boolean,required:!0,default:!1},modelModifiers:{}}),emits:["update:modelValue"],setup(t){const d=v(t,"modelValue"),e=t,g={maxWidth:e.maxWidth,maxHeight:e.maxHeight,width:e.width,height:e.height},[o]=y([e==null?void 0:e.widget]);return(s,n)=>{const f=i("v-sheet"),h=i("v-dialog");return a(),u("span",null,[r(h,c(g,{absolute:"",scrollable:"","scroll-strategy":"block","close-on-back":"",modelValue:d.value,"onUpdate:modelValue":n[0]||(n[0]=x=>d.value=x)}),{default:m(()=>[r(f,null,{default:m(()=>[t.widget?(a(),w(V(l(o).component),c({key:l(o).id},l(o).props),null,16)):p("",!0),s.$slots.default?(a(),u("span",b,[_(s.$slots,"default")])):p("",!0)]),_:3})]),_:3},16,["modelValue"])])}}};export{W as default};