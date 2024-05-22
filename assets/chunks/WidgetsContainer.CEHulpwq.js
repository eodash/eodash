import{useDefineWidgets as y}from"@/composables/DefineWidgets";import{O as x,U as d,h as n,l as v,o,c as m,G as E,m as f,t as H,b as k,an as C,ao as w,K as _,Q as A,p as L,F as S}from"./framework.DwvztmCA.js";const D=Symbol.for("vuetify:layout");function F(){const i=x(D);if(!i)throw new Error("[Vuetify] Could not find injected layout");return{layoutIsReady:d(),getLayoutItem:i.getLayoutItem,mainRect:i.mainRect,mainStyles:i.mainStyles}}class R extends HTMLDetailsElement{constructor(){super()}connectedCallback(){this.el=this,this.summary=this.querySelector("summary"),this.content=this.lastElementChild,this.animation=null,this.isClosing=!1,this.isExpanding=!1,this.summary.addEventListener("click",t=>this.onClick(t))}onClick(t){t==null||t.preventDefault(),this.el.style.overflow="hidden",this.isClosing||!this.el.open?this.doOpen():(this.isExpanding||this.el.open)&&this.shrink()}shrink(){this.isClosing=!0;const t=`${this.el.offsetHeight}px`,e=`${this.summary.offsetHeight}px`;this.animation&&this.animation.cancel(),this.animation=this.el.animate({height:[t,e]},{duration:300,easing:"ease-out"}),this.animation.onfinish=()=>this.onAnimationFinish(!1),this.animation.oncancel=()=>this.isClosing=!1}doOpen(){this.el.style.height=`${this.el.offsetHeight}px`,this.el.open=!0,window.requestAnimationFrame(()=>this.expand()),this.parentElement.querySelectorAll("details[open][exclusive]").forEach(e=>{e!==this&&e.onClick()})}expand(){this.isExpanding=!0;const t=`${this.el.offsetHeight}px`,e=`${this.summary.offsetHeight+this.content.offsetHeight}px`;this.animation&&this.animation.cancel(),this.animation=this.el.animate({height:[t,e]},{duration:300,easing:"ease-out"}),this.animation.onfinish=()=>this.onAnimationFinish(!0),this.animation.oncancel=()=>this.isExpanding=!1}onAnimationFinish(t){this.el.open=t,this.animation=null,this.isClosing=!1,this.isExpanding=!1,this.el.style.height=this.el.style.overflow=""}}customElements.define("animated-details",R,{extends:"details"});const q={__name:"WidgetsContainer",props:{widgets:{type:Array,required:!0}},setup(i){const e=y(i.widgets),l=n([]),r=n([]),h=n(""),u=n(0),{mainRect:p}=F();return v(async()=>{await d(()=>{var a;u.value=r.value.reduce((c,s)=>c+=s.clientHeight,0),h.value=(((a=l.value[0].parentElement)==null?void 0:a.scrollHeight)??0)-u.value-p.value.top+"px"})}),(a,c)=>(o(!0),m(S,null,E(L(e),(s,g)=>(o(),m("details",{is:"animated-details",ref_for:!0,ref_key:"detailsEls",ref:l,key:g,class:"overflow-auto",exclusive:""},[f("summary",{ref_for:!0,ref_key:"summaryEls",ref:r},H(s.value.title),513),f("span",{style:A({height:h.value}),class:"d-flex flex-column"},[(o(),k(_(s.value.component),C(w(s.value.props)),null,16))],4)]))),128))}};export{q as default};
