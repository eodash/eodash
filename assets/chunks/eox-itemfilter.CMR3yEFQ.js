/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const xr=globalThis,Ai=xr.ShadowRoot&&(xr.ShadyCSS===void 0||xr.ShadyCSS.nativeShadow)&&"adoptedStyleSheets"in Document.prototype&&"replace"in CSSStyleSheet.prototype,rs=Symbol(),xn=new WeakMap;let ra=class{constructor(t,e,r){if(this._$cssResult$=!0,r!==rs)throw Error("CSSResult is not constructable. Use `unsafeCSS` or `css` instead.");this.cssText=t,this.t=e}get styleSheet(){let t=this.o;const e=this.t;if(Ai&&t===void 0){const r=e!==void 0&&e.length===1;r&&(t=xn.get(e)),t===void 0&&((this.o=t=new CSSStyleSheet).replaceSync(this.cssText),r&&xn.set(e,t))}return t}toString(){return this.cssText}};const ia=t=>new ra(typeof t=="string"?t:t+"",void 0,rs),na=(t,e)=>{if(Ai)t.adoptedStyleSheets=e.map(r=>r instanceof CSSStyleSheet?r:r.styleSheet);else for(const r of e){const i=document.createElement("style"),n=xr.litNonce;n!==void 0&&i.setAttribute("nonce",n),i.textContent=r.cssText,t.appendChild(i)}},wn=Ai?t=>t:t=>t instanceof CSSStyleSheet?(e=>{let r="";for(const i of e.cssRules)r+=i.cssText;return ia(r)})(t):t;/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{is:sa,defineProperty:oa,getOwnPropertyDescriptor:aa,getOwnPropertyNames:la,getOwnPropertySymbols:ca,getPrototypeOf:ha}=Object,jt=globalThis,$n=jt.trustedTypes,ua=$n?$n.emptyScript:"",_n=jt.reactiveElementPolyfillSupport,Xt=(t,e)=>t,$r={toAttribute(t,e){switch(e){case Boolean:t=t?ua:null;break;case Object:case Array:t=t==null?t:JSON.stringify(t)}return t},fromAttribute(t,e){let r=t;switch(e){case Boolean:r=t!==null;break;case Number:r=t===null?null:Number(t);break;case Object:case Array:try{r=JSON.parse(t)}catch{r=null}}return r}},ki=(t,e)=>!sa(t,e),En={attribute:!0,type:String,converter:$r,reflect:!1,hasChanged:ki};Symbol.metadata??(Symbol.metadata=Symbol("metadata")),jt.litPropertyMetadata??(jt.litPropertyMetadata=new WeakMap);class kt extends HTMLElement{static addInitializer(e){this._$Ei(),(this.l??(this.l=[])).push(e)}static get observedAttributes(){return this.finalize(),this._$Eh&&[...this._$Eh.keys()]}static createProperty(e,r=En){if(r.state&&(r.attribute=!1),this._$Ei(),this.elementProperties.set(e,r),!r.noAccessor){const i=Symbol(),n=this.getPropertyDescriptor(e,i,r);n!==void 0&&oa(this.prototype,e,n)}}static getPropertyDescriptor(e,r,i){const{get:n,set:s}=aa(this.prototype,e)??{get(){return this[r]},set(o){this[r]=o}};return{get(){return n==null?void 0:n.call(this)},set(o){const l=n==null?void 0:n.call(this);s.call(this,o),this.requestUpdate(e,l,i)},configurable:!0,enumerable:!0}}static getPropertyOptions(e){return this.elementProperties.get(e)??En}static _$Ei(){if(this.hasOwnProperty(Xt("elementProperties")))return;const e=ha(this);e.finalize(),e.l!==void 0&&(this.l=[...e.l]),this.elementProperties=new Map(e.elementProperties)}static finalize(){if(this.hasOwnProperty(Xt("finalized")))return;if(this.finalized=!0,this._$Ei(),this.hasOwnProperty(Xt("properties"))){const r=this.properties,i=[...la(r),...ca(r)];for(const n of i)this.createProperty(n,r[n])}const e=this[Symbol.metadata];if(e!==null){const r=litPropertyMetadata.get(e);if(r!==void 0)for(const[i,n]of r)this.elementProperties.set(i,n)}this._$Eh=new Map;for(const[r,i]of this.elementProperties){const n=this._$Eu(r,i);n!==void 0&&this._$Eh.set(n,r)}this.elementStyles=this.finalizeStyles(this.styles)}static finalizeStyles(e){const r=[];if(Array.isArray(e)){const i=new Set(e.flat(1/0).reverse());for(const n of i)r.unshift(wn(n))}else e!==void 0&&r.push(wn(e));return r}static _$Eu(e,r){const i=r.attribute;return i===!1?void 0:typeof i=="string"?i:typeof e=="string"?e.toLowerCase():void 0}constructor(){super(),this._$Ep=void 0,this.isUpdatePending=!1,this.hasUpdated=!1,this._$Em=null,this._$Ev()}_$Ev(){var e;this._$ES=new Promise(r=>this.enableUpdating=r),this._$AL=new Map,this._$E_(),this.requestUpdate(),(e=this.constructor.l)==null||e.forEach(r=>r(this))}addController(e){var r;(this._$EO??(this._$EO=new Set)).add(e),this.renderRoot!==void 0&&this.isConnected&&((r=e.hostConnected)==null||r.call(e))}removeController(e){var r;(r=this._$EO)==null||r.delete(e)}_$E_(){const e=new Map,r=this.constructor.elementProperties;for(const i of r.keys())this.hasOwnProperty(i)&&(e.set(i,this[i]),delete this[i]);e.size>0&&(this._$Ep=e)}createRenderRoot(){const e=this.shadowRoot??this.attachShadow(this.constructor.shadowRootOptions);return na(e,this.constructor.elementStyles),e}connectedCallback(){var e;this.renderRoot??(this.renderRoot=this.createRenderRoot()),this.enableUpdating(!0),(e=this._$EO)==null||e.forEach(r=>{var i;return(i=r.hostConnected)==null?void 0:i.call(r)})}enableUpdating(e){}disconnectedCallback(){var e;(e=this._$EO)==null||e.forEach(r=>{var i;return(i=r.hostDisconnected)==null?void 0:i.call(r)})}attributeChangedCallback(e,r,i){this._$AK(e,i)}_$EC(e,r){var i;const n=this.constructor.elementProperties.get(e),s=this.constructor._$Eu(e,n);if(s!==void 0&&n.reflect===!0){const o=(((i=n.converter)==null?void 0:i.toAttribute)!==void 0?n.converter:$r).toAttribute(r,n.type);this._$Em=e,o==null?this.removeAttribute(s):this.setAttribute(s,o),this._$Em=null}}_$AK(e,r){var i;const n=this.constructor,s=n._$Eh.get(e);if(s!==void 0&&this._$Em!==s){const o=n.getPropertyOptions(s),l=typeof o.converter=="function"?{fromAttribute:o.converter}:((i=o.converter)==null?void 0:i.fromAttribute)!==void 0?o.converter:$r;this._$Em=s,this[s]=l.fromAttribute(r,o.type),this._$Em=null}}requestUpdate(e,r,i){if(e!==void 0){if(i??(i=this.constructor.getPropertyOptions(e)),!(i.hasChanged??ki)(this[e],r))return;this.P(e,r,i)}this.isUpdatePending===!1&&(this._$ES=this._$ET())}P(e,r,i){this._$AL.has(e)||this._$AL.set(e,r),i.reflect===!0&&this._$Em!==e&&(this._$Ej??(this._$Ej=new Set)).add(e)}async _$ET(){this.isUpdatePending=!0;try{await this._$ES}catch(r){Promise.reject(r)}const e=this.scheduleUpdate();return e!=null&&await e,!this.isUpdatePending}scheduleUpdate(){return this.performUpdate()}performUpdate(){var e;if(!this.isUpdatePending)return;if(!this.hasUpdated){if(this.renderRoot??(this.renderRoot=this.createRenderRoot()),this._$Ep){for(const[s,o]of this._$Ep)this[s]=o;this._$Ep=void 0}const n=this.constructor.elementProperties;if(n.size>0)for(const[s,o]of n)o.wrapped!==!0||this._$AL.has(s)||this[s]===void 0||this.P(s,this[s],o)}let r=!1;const i=this._$AL;try{r=this.shouldUpdate(i),r?(this.willUpdate(i),(e=this._$EO)==null||e.forEach(n=>{var s;return(s=n.hostUpdate)==null?void 0:s.call(n)}),this.update(i)):this._$EU()}catch(n){throw r=!1,this._$EU(),n}r&&this._$AE(i)}willUpdate(e){}_$AE(e){var r;(r=this._$EO)==null||r.forEach(i=>{var n;return(n=i.hostUpdated)==null?void 0:n.call(i)}),this.hasUpdated||(this.hasUpdated=!0,this.firstUpdated(e)),this.updated(e)}_$EU(){this._$AL=new Map,this.isUpdatePending=!1}get updateComplete(){return this.getUpdateComplete()}getUpdateComplete(){return this._$ES}shouldUpdate(e){return!0}update(e){this._$Ej&&(this._$Ej=this._$Ej.forEach(r=>this._$EC(r,this[r]))),this._$EU()}updated(e){}firstUpdated(e){}}kt.elementStyles=[],kt.shadowRootOptions={mode:"open"},kt[Xt("elementProperties")]=new Map,kt[Xt("finalized")]=new Map,_n==null||_n({ReactiveElement:kt}),(jt.reactiveElementVersions??(jt.reactiveElementVersions=[])).push("2.0.4");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const _r=globalThis,Er=_r.trustedTypes,Sn=Er?Er.createPolicy("lit-html",{createHTML:t=>t}):void 0,Oi="$lit$",Ge=`lit$${(Math.random()+"").slice(9)}$`,Pi="?"+Ge,da=`<${Pi}>`,bt=document,Kt=()=>bt.createComment(""),Jt=t=>t===null||typeof t!="object"&&typeof t!="function",is=Array.isArray,ns=t=>is(t)||typeof(t==null?void 0:t[Symbol.iterator])=="function",ci=`[ 	
\f\r]`,Wt=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Mn=/-->/g,An=/>/g,gt=RegExp(`>|${ci}(?:([^\\s"'>=/]+)(${ci}*=${ci}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),kn=/'/g,On=/"/g,ss=/^(?:script|style|textarea|title)$/i,pa=t=>(e,...r)=>({_$litType$:t,strings:e,values:r}),F=pa(1),ot=Symbol.for("lit-noChange"),ae=Symbol.for("lit-nothing"),Pn=new WeakMap,vt=bt.createTreeWalker(bt,129);function os(t,e){if(!Array.isArray(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Sn!==void 0?Sn.createHTML(e):e}const as=(t,e)=>{const r=t.length-1,i=[];let n,s=e===2?"<svg>":"",o=Wt;for(let l=0;l<r;l++){const a=t[l];let h,p,g=-1,b=0;for(;b<a.length&&(o.lastIndex=b,p=o.exec(a),p!==null);)b=o.lastIndex,o===Wt?p[1]==="!--"?o=Mn:p[1]!==void 0?o=An:p[2]!==void 0?(ss.test(p[2])&&(n=RegExp("</"+p[2],"g")),o=gt):p[3]!==void 0&&(o=gt):o===gt?p[0]===">"?(o=n??Wt,g=-1):p[1]===void 0?g=-2:(g=o.lastIndex-p[2].length,h=p[1],o=p[3]===void 0?gt:p[3]==='"'?On:kn):o===On||o===kn?o=gt:o===Mn||o===An?o=Wt:(o=gt,n=void 0);const m=o===gt&&t[l+1].startsWith("/>")?" ":"";s+=o===Wt?a+da:g>=0?(i.push(h),a.slice(0,g)+Oi+a.slice(g)+Ge+m):a+Ge+(g===-2?l:m)}return[os(t,s+(t[r]||"<?>")+(e===2?"</svg>":"")),i]};class Zt{constructor({strings:e,_$litType$:r},i){let n;this.parts=[];let s=0,o=0;const l=e.length-1,a=this.parts,[h,p]=as(e,r);if(this.el=Zt.createElement(h,i),vt.currentNode=this.el.content,r===2){const g=this.el.content.firstChild;g.replaceWith(...g.childNodes)}for(;(n=vt.nextNode())!==null&&a.length<l;){if(n.nodeType===1){if(n.hasAttributes())for(const g of n.getAttributeNames())if(g.endsWith(Oi)){const b=p[o++],m=n.getAttribute(g).split(Ge),_=/([.?@])?(.*)/.exec(b);a.push({type:1,index:s,name:_[2],strings:m,ctor:_[1]==="."?cs:_[1]==="?"?hs:_[1]==="@"?us:ir}),n.removeAttribute(g)}else g.startsWith(Ge)&&(a.push({type:6,index:s}),n.removeAttribute(g));if(ss.test(n.tagName)){const g=n.textContent.split(Ge),b=g.length-1;if(b>0){n.textContent=Er?Er.emptyScript:"";for(let m=0;m<b;m++)n.append(g[m],Kt()),vt.nextNode(),a.push({type:2,index:++s});n.append(g[b],Kt())}}}else if(n.nodeType===8)if(n.data===Pi)a.push({type:2,index:s});else{let g=-1;for(;(g=n.data.indexOf(Ge,g+1))!==-1;)a.push({type:7,index:s}),g+=Ge.length-1}s++}}static createElement(e,r){const i=bt.createElement("template");return i.innerHTML=e,i}}function xt(t,e,r=t,i){var n,s;if(e===ot)return e;let o=i!==void 0?(n=r._$Co)==null?void 0:n[i]:r._$Cl;const l=Jt(e)?void 0:e._$litDirective$;return(o==null?void 0:o.constructor)!==l&&((s=o==null?void 0:o._$AO)==null||s.call(o,!1),l===void 0?o=void 0:(o=new l(t),o._$AT(t,r,i)),i!==void 0?(r._$Co??(r._$Co=[]))[i]=o:r._$Cl=o),o!==void 0&&(e=xt(t,o._$AS(t,e.values),o,i)),e}class ls{constructor(e,r){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=r}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:r},parts:i}=this._$AD,n=((e==null?void 0:e.creationScope)??bt).importNode(r,!0);vt.currentNode=n;let s=vt.nextNode(),o=0,l=0,a=i[0];for(;a!==void 0;){if(o===a.index){let h;a.type===2?h=new It(s,s.nextSibling,this,e):a.type===1?h=new a.ctor(s,a.name,a.strings,this,e):a.type===6&&(h=new ds(s,this,e)),this._$AV.push(h),a=i[++l]}o!==(a==null?void 0:a.index)&&(s=vt.nextNode(),o++)}return vt.currentNode=bt,n}p(e){let r=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,r),r+=i.strings.length-2):i._$AI(e[r])),r++}}class It{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,r,i,n){this.type=2,this._$AH=ae,this._$AN=void 0,this._$AA=e,this._$AB=r,this._$AM=i,this.options=n,this._$Cv=(n==null?void 0:n.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const r=this._$AM;return r!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=r.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,r=this){e=xt(this,e,r),Jt(e)?e===ae||e==null||e===""?(this._$AH!==ae&&this._$AR(),this._$AH=ae):e!==this._$AH&&e!==ot&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):ns(e)?this.k(e):this._(e)}S(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.S(e))}_(e){this._$AH!==ae&&Jt(this._$AH)?this._$AA.nextSibling.data=e:this.T(bt.createTextNode(e)),this._$AH=e}$(e){var r;const{values:i,_$litType$:n}=e,s=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=Zt.createElement(os(n.h,n.h[0]),this.options)),n);if(((r=this._$AH)==null?void 0:r._$AD)===s)this._$AH.p(i);else{const o=new ls(s,this),l=o.u(this.options);o.p(i),this.T(l),this._$AH=o}}_$AC(e){let r=Pn.get(e.strings);return r===void 0&&Pn.set(e.strings,r=new Zt(e)),r}k(e){is(this._$AH)||(this._$AH=[],this._$AR());const r=this._$AH;let i,n=0;for(const s of e)n===r.length?r.push(i=new It(this.S(Kt()),this.S(Kt()),this,this.options)):i=r[n],i._$AI(s),n++;n<r.length&&(this._$AR(i&&i._$AB.nextSibling,n),r.length=n)}_$AR(e=this._$AA.nextSibling,r){var i;for((i=this._$AP)==null?void 0:i.call(this,!1,!0,r);e&&e!==this._$AB;){const n=e.nextSibling;e.remove(),e=n}}setConnected(e){var r;this._$AM===void 0&&(this._$Cv=e,(r=this._$AP)==null||r.call(this,e))}}class ir{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,r,i,n,s){this.type=1,this._$AH=ae,this._$AN=void 0,this.element=e,this.name=r,this._$AM=n,this.options=s,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=ae}_$AI(e,r=this,i,n){const s=this.strings;let o=!1;if(s===void 0)e=xt(this,e,r,0),o=!Jt(e)||e!==this._$AH&&e!==ot,o&&(this._$AH=e);else{const l=e;let a,h;for(e=s[0],a=0;a<s.length-1;a++)h=xt(this,l[i+a],r,a),h===ot&&(h=this._$AH[a]),o||(o=!Jt(h)||h!==this._$AH[a]),h===ae?e=ae:e!==ae&&(e+=(h??"")+s[a+1]),this._$AH[a]=h}o&&!n&&this.j(e)}j(e){e===ae?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class cs extends ir{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===ae?void 0:e}}class hs extends ir{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==ae)}}class us extends ir{constructor(e,r,i,n,s){super(e,r,i,n,s),this.type=5}_$AI(e,r=this){if((e=xt(this,e,r,0)??ae)===ot)return;const i=this._$AH,n=e===ae&&i!==ae||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,s=e!==ae&&(i===ae||n);n&&this.element.removeEventListener(this.name,this,i),s&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var r;typeof this._$AH=="function"?this._$AH.call(((r=this.options)==null?void 0:r.host)??this.element,e):this._$AH.handleEvent(e)}}class ds{constructor(e,r,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=r,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){xt(this,e)}}const fa={P:Oi,A:Ge,C:Pi,M:1,L:as,R:ls,D:ns,V:xt,I:It,H:ir,N:hs,U:us,B:cs,F:ds},Ln=_r.litHtmlPolyfillSupport;Ln==null||Ln(Zt,It),(_r.litHtmlVersions??(_r.litHtmlVersions=[])).push("3.1.2");const ga=(t,e,r)=>{const i=(r==null?void 0:r.renderBefore)??e;let n=i._$litPart$;if(n===void 0){const s=(r==null?void 0:r.renderBefore)??null;i._$litPart$=n=new It(e.insertBefore(Kt(),s),s,void 0,r??{})}return n._$AI(t),n};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let _e=class extends kt{constructor(){super(...arguments),this.renderOptions={host:this},this._$Do=void 0}createRenderRoot(){var t;const e=super.createRenderRoot();return(t=this.renderOptions).renderBefore??(t.renderBefore=e.firstChild),e}update(t){const e=this.render();this.hasUpdated||(this.renderOptions.isConnected=this.isConnected),super.update(t),this._$Do=ga(e,this.renderRoot,this.renderOptions)}connectedCallback(){var t;super.connectedCallback(),(t=this._$Do)==null||t.setConnected(!0)}disconnectedCallback(){var t;super.disconnectedCallback(),(t=this._$Do)==null||t.setConnected(!1)}render(){return ot}};var Cn;_e._$litElement$=!0,_e.finalized=!0,(Cn=globalThis.litElementHydrateSupport)==null||Cn.call(globalThis,{LitElement:_e});const Rn=globalThis.litElementPolyfillSupport;Rn==null||Rn({LitElement:_e});(globalThis.litElementVersions??(globalThis.litElementVersions=[])).push("4.0.4");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Re=t=>(e,r)=>{r!==void 0?r.addInitializer(()=>{customElements.define(t,e)}):customElements.define(t,e)};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ya={attribute:!0,type:String,converter:$r,reflect:!1,hasChanged:ki},ma=(t=ya,e,r)=>{const{kind:i,metadata:n}=r;let s=globalThis.litPropertyMetadata.get(n);if(s===void 0&&globalThis.litPropertyMetadata.set(n,s=new Map),s.set(r.name,t),i==="accessor"){const{name:o}=r;return{set(l){const a=e.get.call(this);e.set.call(this,l),this.requestUpdate(o,a,t)},init(l){return l!==void 0&&this.P(o,void 0,t),l}}}if(i==="setter"){const{name:o}=r;return function(l){const a=this[o];e.call(this,l),this.requestUpdate(o,a,t)}}throw Error("Unsupported decorator location: "+i)};function G(t){return(e,r)=>typeof r=="object"?ma(t,e,r):((i,n,s)=>{const o=n.hasOwnProperty(s);return n.constructor.createProperty(s,o?{...i,wrapped:!0}:i),o?Object.getOwnPropertyDescriptor(n,s):void 0})(t,e,r)}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function rt(t){return G({...t,state:!0,attribute:!1})}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function de(t,e,r){return t?e(t):r==null?void 0:r(t)}/**
 * @license
 * Copyright 2021 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */function*Vt(t,e){if(t!==void 0){let r=0;for(const i of t)yield e(i,r++)}}/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ps={ATTRIBUTE:1,CHILD:2,PROPERTY:3,BOOLEAN_ATTRIBUTE:4,EVENT:5,ELEMENT:6},fs=t=>(...e)=>({_$litDirective$:t,values:e});let gs=class{constructor(t){}get _$AU(){return this._$AM._$AU}_$AT(t,e,r){this._$Ct=t,this._$AM=e,this._$Ci=r}_$AS(t,e){return this.update(t,e)}update(t,e){return this.render(...e)}};/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const{I:va}=fa,jn=()=>document.createComment(""),Yt=(t,e,r)=>{var i;const n=t._$AA.parentNode,s=e===void 0?t._$AB:e._$AA;if(r===void 0){const o=n.insertBefore(jn(),s),l=n.insertBefore(jn(),s);r=new va(o,l,t,t.options)}else{const o=r._$AB.nextSibling,l=r._$AM,a=l!==t;if(a){let h;(i=r._$AQ)==null||i.call(r,t),r._$AM=t,r._$AP!==void 0&&(h=t._$AU)!==l._$AU&&r._$AP(h)}if(o!==s||a){let h=r._$AA;for(;h!==o;){const p=h.nextSibling;n.insertBefore(h,s),h=p}}}return r},yt=(t,e,r=t)=>(t._$AI(e,r),t),ba={},xa=(t,e=ba)=>t._$AH=e,wa=t=>t._$AH,hi=t=>{var e;(e=t._$AP)==null||e.call(t,!1,!0);let r=t._$AA;const i=t._$AB.nextSibling;for(;r!==i;){const n=r.nextSibling;r.remove(),r=n}};/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Tn=(t,e,r)=>{const i=new Map;for(let n=e;n<=r;n++)i.set(t[n],n);return i},ys=fs(class extends gs{constructor(t){if(super(t),t.type!==ps.CHILD)throw Error("repeat() can only be used in text expressions")}dt(t,e,r){let i;r===void 0?r=e:e!==void 0&&(i=e);const n=[],s=[];let o=0;for(const l of t)n[o]=i?i(l,o):o,s[o]=r(l,o),o++;return{values:s,keys:n}}render(t,e,r){return this.dt(t,e,r).values}update(t,[e,r,i]){const n=wa(t),{values:s,keys:o}=this.dt(e,r,i);if(!Array.isArray(n))return this.ut=o,s;const l=this.ut??(this.ut=[]),a=[];let h,p,g=0,b=n.length-1,m=0,_=s.length-1;for(;g<=b&&m<=_;)if(n[g]===null)g++;else if(n[b]===null)b--;else if(l[g]===o[m])a[m]=yt(n[g],s[m]),g++,m++;else if(l[b]===o[_])a[_]=yt(n[b],s[_]),b--,_--;else if(l[g]===o[_])a[_]=yt(n[g],s[_]),Yt(t,a[_+1],n[g]),g++,_--;else if(l[b]===o[m])a[m]=yt(n[b],s[m]),Yt(t,n[g],n[b]),b--,m++;else if(h===void 0&&(h=Tn(o,m,_),p=Tn(l,g,b)),h.has(l[g]))if(h.has(l[b])){const k=p.get(o[m]),z=k!==void 0?n[k]:null;if(z===null){const I=Yt(t,n[g]);yt(I,s[m]),a[m]=I}else a[m]=yt(z,s[m]),Yt(t,n[g],z),n[k]=null;m++}else hi(n[b]),b--;else hi(n[g]),g++;for(;m<=_;){const k=Yt(t,a[_+1]);yt(k,s[m]),a[m++]=k}for(;g<=b;){const k=n[g++];k!==null&&hi(k)}return this.ut=o,xa(t,a),ot}});/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */let pi=class extends gs{constructor(t){if(super(t),this.it=ae,t.type!==ps.CHILD)throw Error(this.constructor.directiveName+"() can only be used in child bindings")}render(t){if(t===ae||t==null)return this._t=void 0,this.it=t;if(t===ot)return t;if(typeof t!="string")throw Error(this.constructor.directiveName+"() called with a non-string value");if(t===this.it)return this._t;this.it=t;const e=[t];return e.raw=e,this._t={_$litType$:this.constructor.resultType,strings:e,values:[]}}};pi.directiveName="unsafeHTML",pi.resultType=1;const Dn=fs(pi);/**
 * @license
 * Copyright 2020 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const ms=Symbol.for(""),$a=t=>{if((t==null?void 0:t.r)===ms)return t==null?void 0:t._$litStatic$},Ot=t=>({_$litStatic$:t,r:ms}),Nn=new Map,_a=t=>(e,...r)=>{const i=r.length;let n,s;const o=[],l=[];let a,h=0,p=!1;for(;h<i;){for(a=e[h];h<i&&(s=r[h],(n=$a(s))!==void 0);)a+=n+e[++h],p=!0;h!==i&&l.push(s),o.push(a),h++}if(h===i&&o.push(e[i]),p){const g=o.join("$$lit$$");(e=Nn.get(g))===void 0&&(o.raw=o,Nn.set(g,e=o)),r=l}return t(e,...r)},wr=_a(F);(()=>{var t=Object.defineProperty,e=Math.pow,r=(c,d,x)=>d in c?t(c,d,{enumerable:!0,configurable:!0,writable:!0,value:x}):c[d]=x,i=(c,d,x)=>(r(c,typeof d!="symbol"?d+"":d,x),x),n=(c,d)=>` ${d&&d.length>0?d.map(x=>`<link rel="stylesheet" href="${x}" />`).join(""):""} <style> ${c} </style> <div class="range-slider-box"> <div class="row"> <div id="range-slider" class="range-slider"> <div class="container"> <div class="panel"></div> <div class="panel-fill"></div> <div class="container"> <div class="pointer" tabindex="0" role="slider"> <div class="pointer-shape"></div> </div> </div> </div> </div> </div> </div>`,s=":host{--width:300px;--height:.25rem;--opacity:.4;--panel-bg:#cbd5e1;--panel-bg-hover:#94a3b8;--panel-bg-fill:#475569;--panel-bg-border-radius:1rem;--pointer-width:1rem;--pointer-height:1rem;--pointer-bg:#fff;--pointer-bg-hover:#dcdcdc;--pointer-bg-focus:#dcdcdc;--pointer-shadow:0 0 2px rgba(0,0,0,0.8);--pointer-shadow-hover:0 0 2px #000;--pointer-shadow-focus:var(--pointer-shadow-hover);--pointer-border:1px solid hsla(0,0%,88%,0.5);--pointer-border-hover:1px solid #94a3b8;--pointer-border-focus:var(--pointer-border-hover);--pointer-border-radius:100%;--animate-onclick:.3s}:host{max-width:100%}.range-slider-box{display:flex;position:relative;flex-direction:column}.range-slider{position:relative;width:var(--width,100%);height:var(--height,0.25rem);touch-action:none;max-width:100%;box-sizing:border-box;cursor:pointer}.row{width:100%;display:flex;align-items:center}.range-slider.disabled{opacity:var(--opacity,0.4);cursor:default}.pointer.disabled{-webkit-filter:brightness(0.8);filter:brightness(0.8);cursor:default}.range-slider *{box-sizing:border-box}.container{position:absolute;width:100%;height:100%}.panel{position:absolute;z-index:10;width:100%;height:100%;background:var(--panel-bg,#2d4373);border-radius:var(--panel-bg-border-radius,1rem);overflow:hidden;transition:.3s all ease}.panel-fill{background:var(--panel-bg-fill,#000);border-radius:var(--panel-bg-border-radius,1rem);overflow:hidden;height:100%;position:absolute;z-index:10}.panel:hover{background:var(--panel-bg-hover,#5f79b7)}.disabled .panel:hover{background:var(--panel-bg,#5f79b7)}.pointer{position:absolute;z-index:20;outline:0;top:50%;-webkit-transform:translateY(-50%);transform:translateY(-50%)}.pointer-shape{background:var(--pointer-bg,#fff);background-size:contain;box-shadow:var(--pointer-shadow);border:var(--pointer-border);border-radius:var(--pointer-border-radius,100%);-webkit-transform:translateX(-50%);transform:translateX(-50%);width:var(--pointer-width,15px);height:var(--pointer-height,15px);transition:.3s all ease}.pointer-shape:hover{background:var(--pointer-bg-hover,#fff);background-size:contain;border:var(--pointer-border-hover);box-shadow:var(--pointer-shadow-hover)}.disabled .pointer-shape:hover{background:var(--pointer-bg,#fff);background-size:contain;border:var(--pointer-border);box-shadow:var(--pointer-shadow)}.pointer:focus .pointer-shape{background:var(--pointer-bg-focus,#fff);background-size:contain;border:var(--pointer-border-focus);box-shadow:var(--pointer-shadow-focus)}.disabled .pointer:focus .pointer-shape{background:var(--pointer-bg,#fff);background-size:contain;border:var(--pointer-border);box-shadow:var(--pointer-shadow)}.type-vertical .range-slider{--width:.25rem;--height:300px;max-height:100%}.type-vertical .range-slider .pointer{left:50%}.type-vertical .range-slider .panel-fill{width:100%}.type-vertical.range-slider-box{flex-direction:row}.type-vertical .row{flex-direction:column}.animate-on-click .pointer,.animate-on-click .panel-fill{transition:all var(--animate-onclick)}.range-dragging .panel-fill{cursor:move}",o="pointers-overlap",l="pointers-min-distance",a="pointers-max-distance",h="range-dragging",p="data",g="min",b="max",m="step",_="round",k="type",z="theme",I="rtl",f="btt",y="disabled",w="keyboard-disabled",E="mousewheel-disabled",S="slider-width",M="slider-height",L="slider-radius",B="slider-bg",U="slider-bg-hover",T="slider-bg-fill",re="pointer-width",Z="pointer-height",C="pointer-radius",O="pointer-bg",A="pointer-bg-hover",N="pointer-bg-focus",P="pointer-shadow",K="pointer-shadow-hover",W="pointer-shadow-focus",oe="pointer-border",ie="pointer-border-hover",me="pointer-border-focus",ve="animate-onclick",Me="css-links",xe="vertical",Ae="horizontal",Ze=(c,d,x,v,R)=>{let Y=d-c;return Y===0?x:(v-x)*(R-c)/Y+x},$e=c=>!isNaN(parseFloat(c))&&isFinite(c),ne=(c,d)=>$e(c)?Number(c):d,Ie=(c,d)=>d===0?0:Math.round(c/d)*d,dt=(c,d=1/0)=>{if(d===1/0)return c;let x=e(10,d);return Math.round(c*x)/x},pe=c=>c==null?!1:typeof c=="boolean"?c:c.trim().toLowerCase()==="true",no=(c,d)=>{c.dispatchEvent(new CustomEvent("onPointerClicked",{detail:{$pointer:d}}))},so=(c,d)=>{c.dispatchEvent(new CustomEvent("onMouseDown",{detail:{nativeEvent:d}}))},oo=(c,d)=>{c.dispatchEvent(new CustomEvent("onMouseUp",{detail:{nativeEvent:d}}))},ao=(c,d)=>{c.dispatchEvent(new CustomEvent("onKeyDown",{detail:{nativeEvent:d}}))},lo=(c,d)=>{if(!d||d.length<=0)return;let x=d.map(R=>$e(R)?ne(R,R):R),v={values:x||[]};v.value=x[0],v.value0=x[0],v.value1=x[0];for(let R=1;R<x.length;R++)v[`value${R+1}`]=x[R];c.dispatchEvent(new CustomEvent("change",{detail:v}))},Ir=(c,d,x)=>{let v=0,R,Y,Q,j,D=!1,ee=(V,ue,we,be,fe,ge)=>{let ke=v;we!==void 0&&V>we&&(V=we),ue!==void 0&&V<ue&&(V=ue),v=V;let Oe=v;return(be===xe&&ge||be===Ae&&fe)&&(Oe=100-Oe),be===xe?d.style.top=`${Oe}%`:d.style.left=`${Oe}%`,ke!==v},se=V=>V===d||d.contains(V),H=(V,ue,we,be)=>{R=V,Y=ue,Q=we,j=be},ce=V=>{D=V,d.classList.toggle("disabled",D),D?d.setAttribute("aria-disabled","true"):d.hasAttribute("aria-disabled")&&d.removeAttribute("aria-disabled")},je=(V,ue)=>{ue==null?d.removeAttribute(V):d.setAttribute(V,ue)},Ee=V=>d.getAttribute(V),X=V=>{if(!D){switch(V.key){case"ArrowLeft":{V.preventDefault(),typeof R=="function"&&R(x);break}case"ArrowRight":{V.preventDefault(),typeof Y=="function"&&Y(x);break}case"ArrowUp":{V.preventDefault(),typeof Q=="function"&&Q(x);break}case"ArrowDown":{V.preventDefault(),typeof j=="function"&&j(x);break}}ao(c,V)}},te=()=>{D||no(c,d)};return d.className=`pointer pointer-${x}`,d.addEventListener("keydown",X),d.addEventListener("click",te),{$pointer:d,get percent(){return v},get disabled(){return D},set disabled(V){ce(V)},updatePosition:ee,isClicked:se,setCallbacks:H,setAttr:je,getAttr:Ee,destroy:()=>{d.removeEventListener("keydown",X),d.removeEventListener("click",te),d.remove()}}},co=c=>{if(c==null)return;if(Array.isArray(c))return c;if(c.trim()==="")return;let d=c.split(","),x=[],v=!0;for(let R=0;R<d.length;R++){let Y=d[R].trim();Y!==""&&(x.push(Y),$e(Y)||(v=!1))}return v?x.map(R=>Number(R)):x},ho=(c,d)=>d?d.findIndex(x=>x===c||x.toString().trim()===c.toString().trim()):-1,uo=c=>({updatePosition:(d,x,v,R)=>{if(x.length<=0)return;let Y=x.length===1,Q=x[0],j=x[x.length-1];d===xe?(c.style.removeProperty("width"),c.style.removeProperty("right"),c.style.removeProperty("left"),Y?c.style.height=`${Q}%`:c.style.height=`${Math.abs(Q-j)}%`,R?(c.style.bottom="0%",Y?c.style.top="auto":c.style.top=`${Math.min(100-j,100-Q)}%`):(c.style.bottom="auto",Y?c.style.top="0%":c.style.top=`${Math.min(Q,j)}%`)):(c.style.removeProperty("height"),c.style.removeProperty("top"),c.style.removeProperty("bottom"),Y?c.style.width=`${Q}%`:c.style.width=`${Math.abs(Q-j)}%`,v?(c.style.right="0%",Y?c.style.left="auto":c.style.left=`${Math.min(100-j,100-Q)}%`):(c.style.right="auto",Y?c.style.left="0%":c.style.left=`${Math.min(Q,j)}%`))}}),Ki="--animate-onclick",po="--width",fo="--height",go="--panel-bg-border-radius",yo="--panel-bg",mo="--panel-bg-hover",vo="--panel-bg-fill",bo="--pointer-width",xo="--pointer-height",wo="--pointer-border-radius",$o="--pointer-bg",_o="--pointer-bg-hover",Eo="--pointer-bg-focus",So="--pointer-shadow",Mo="--pointer-shadow-hover",Ao="--pointer-shadow-focus",ko="--pointer-border",Oo="--pointer-border-hover",Po="--pointer-border-focus",or=(c,d,x)=>{let v=new Map;for(let R of c.attributes){let Y=R.nodeName.trim().toLowerCase();if(!d.test(Y))continue;let Q=Y.replace(/\D/g,"").trim(),j=Q===""||Q==="0"||Q==="1"?0:ne(Q,0)-1,D=x&&typeof x=="function"?x(R.value):R.value;v.set(j,D)}return v},Lo=c=>{if(!c)return null;let d=c.getAttribute(Me);if(!d)return null;let x=d.split(";"),v=[];for(let R of x)R.trim()!==""&&v.push(R.trim());return v},Ji=[[po,S,"sliderWidth",null],[fo,M,"sliderHeight",null],[go,L,"sliderRadius",null],[yo,B,"sliderBg",null],[mo,U,"sliderBgHover",null],[vo,T,"sliderBgFill",null],[bo,re,"pointer#Width",/^pointer([0-9]*)-width$/],[xo,Z,"pointer#Height",/^pointer([0-9]*)-height$/],[wo,C,"pointer#Radius",/^pointer([0-9]*)-radius$/],[$o,O,"pointer#Bg",/^pointer([0-9]*)-bg$/],[_o,A,"pointer#BgHover",/^pointer([0-9]*)-bg-hover$/],[Eo,N,"pointer#BgFocus",/^pointer([0-9]*)-bg-focus$/],[So,P,"pointer#Shadow",/^pointer([0-9]*)-shadow$/],[Mo,K,"pointer#ShadowHover",/^pointer([0-9]*)-shadow-hover$/],[Ao,W,"pointer#ShadowFocus",/^pointer([0-9]*)-shadow-focus$/],[ko,oe,"pointer#Border",/^pointer([0-9]*)-border$/],[Oo,ie,"pointer#BorderHover",/^pointer([0-9]*)-border-hover$/],[Po,me,"pointer#BorderFocus",/^pointer([0-9]*)-border-focus$/]],Co=(c,d,x)=>{let v=null,R=[],Y=new Map,Q=(X,te=d)=>{let V=[...te.classList];for(let ue of V)ue.startsWith(X)&&d.classList.remove(ue)},j=()=>{Q("shape");let X=d.querySelectorAll(".pointer");for(let te of X)Q("shape",te)},D=X=>{v=X,Q("theme-"),typeof X=="string"&&d.classList.add(`theme-${X}`)},ee=()=>{if(j(),!(R.length<=0)){d.classList.add("shape",`shape-${R[0]}`);for(let X=1;X<R.length;X++){let te=R[X];if(!te)continue;let V=d.querySelector(`.pointer-${X}`);!V||V.classList.add("shape",`shape-${te}`)}}},se=(X,te)=>{R[X]=te,ee()},H=()=>{j();let X=or(c,/^pointer([0-9]*)-shape$/);if(!(X.size<=0)){for(let te of X){let V=te[0];R[V]=te[1]}ee()}},ce=(X,te)=>`${X}-${te}`,je=(X,te,V)=>{let ue=x[V];if(!ue)return;let we=V===0?d:ue.$pointer;if(te==null){Y.has(ce(X,V))&&Y.delete(ce(X,V)),we.style.removeProperty(X);return}Y.set(ce(X,V),te),we.style.setProperty(X,te)},Ee=(X,te)=>Y.get(ce(X,te));return(()=>{for(let X of Ji){let[te,V,ue,we]=X;if(we){let fe=or(c,we);for(let ge of fe){let ke=ge[0],Oe=ge[1];je(te,Oe,ke)}}else{let fe=c.getAttribute(V);je(te,fe,0)}let be=[];if(ue.indexOf("#")===-1)be.push([ue,0]);else{be.push([ue.replace("#",""),0]),be.push([ue.replace("#","0"),0]),be.push([ue.replace("#","1"),0]);for(let fe=1;fe<x.length;fe++)be.push([ue.replace("#",(fe+1).toString()),fe])}for(let fe of be)try{let ge=fe[0],ke=fe[1];Object.prototype.hasOwnProperty.call(c,ge)||Object.defineProperty(c,ge,{get(){return Ee(te,ke)},set:Oe=>{je(te,Oe,ke)}})}catch(ge){console.error(ge)}}D(c.getAttribute(z)),H()})(),{setStyle:je,getStyle:Ee,get theme(){return v},set theme(X){D(X)},get pointerShapes(){return R},setPointerShape:se}},Et="animate-on-click",Zi="range-dragging",Ro=(c,d,x,v)=>{let R=[],Y=se=>{for(let H of R)H.update&&typeof H.update=="function"&&H.update(se)},Q=()=>{for(let se of R)se.destroy&&typeof se.destroy=="function"&&se.destroy()},j=(se,H)=>{for(let ce of R)ce.onAttrChange&&typeof ce.onAttrChange=="function"&&ce.onAttrChange(se,H)},D=se=>{if(se.gettersAndSetters){for(let H of se.gettersAndSetters)if(!(!H.name||!H.attributes))try{Object.prototype.hasOwnProperty.call(c,H.name)||Object.defineProperty(c,H.name,H.attributes)}catch(ce){console.error("defineSettersGetters error:",ce)}}},ee=se=>{var H;if(!se.css)return;let ce=(H=c.shadowRoot)==null?void 0:H.querySelector("style");!ce||(ce.innerHTML+=se.css)};return{init:()=>{if(window.tcRangeSliderPlugins)for(let se of window.tcRangeSliderPlugins){let H=se();R.push(H),H.init&&typeof H.init=="function"&&(H.init(c,d,x,v),D(H),ee(H))}},update:Y,onAttrChange:j,destroy:Q}},jo=10,Gi=20,To=(c,d)=>{let x=new Map,v=/^value([0-9]*)$/;for(let j of c.attributes){let D=j.nodeName.trim().toLowerCase();if(!v.test(D))continue;let ee=D.replace("value","").trim(),se=ee===""||ee==="0"||ee==="1"?0:ne(ee,0)-1,H=$e(j.value)?ne(j.value,0):j.value;x.set(se,H)}let R=Math.max(...Array.from(x.keys())),Y=[];Y.push([Ir(c,d,0),x.get(0)]);let Q=d;for(let j=1;j<=R;j++){let D=d.cloneNode(!0);Q.after(D),Q=D,Y.push([Ir(c,D,j),x.get(j)])}return Y},Qi=(c,d,x,v,R,Y,Q)=>{try{Object.defineProperty(c,v,{configurable:!0,get(){if(!d)return;let j=d.pointers[x];if(!j)return;let D=d.getTextValue(j.percent);return $e(D)?ne(D,D):D},set:j=>{d.pointers[x]?d==null||d.setValue(j,x):d==null||d.addPointer(j)}}),Object.defineProperty(c,R,{configurable:!0,get(){var j,D;return(D=(j=d==null?void 0:d.pointers[x])==null?void 0:j.getAttr("aria-label"))!=null?D:void 0},set:j=>{!d||d.setAriaLabel(x,j)}}),Object.defineProperty(c,Y,{configurable:!0,get(){var j,D;return(D=(j=d==null?void 0:d.styles)==null?void 0:j.pointerShapes[x])!=null?D:null},set:j=>{!d||!d.styles||d.styles.setPointerShape(x,j)}}),Object.defineProperty(c,Q,{configurable:!0,get(){var j;return(j=d==null?void 0:d.pointers[x].disabled)!=null?j:!1},set:j=>{if(!d)return;let D=d==null?void 0:d.pointers[x];!D||(D.disabled=j)}})}catch(j){console.error(j)}},Do=(c,d)=>{let x=[["value","ariaLabel","pointerShape","pointerDisabled",0],["value0","ariaLabel0","pointerShape0","pointer0Disabled",0],["value1","ariaLabel1","pointerShape1","pointer1Disabled",0]];for(let v=2;v<jo;v++)x.push([`value${v}`,`ariaLabel${v}`,`pointer${v}Shape`,`pointer${v}Disabled`,v-1]);for(let v of x)Qi(c,d,v[4],v[0],v[1],v[2],v[3])},en=(c,d,x)=>{var v;let R=(v=x.shadowRoot)==null?void 0:v.querySelector(".container");if(R)for(let Y of c)d?R.prepend(Y.$pointer):R.append(Y.$pointer)},No=(c,d)=>{if(!(!d||c.length<=1)){for(let x of c)x.$pointer.style.zIndex=Gi.toString();d.$pointer.style.zIndex=(Gi*2).toString()}},qr=0,Ht=100,St=2,tn="0.3s",Io=(c,d,x)=>{let v=x.map(u=>u[0]),R=null,Y=null,Q=null,j=null,D=qr,ee=Ht,se,H,ce=Ae,je=St,Ee=!1,X=!1,te=!1,V=0,ue=1/0,we=!1,be,fe,ge=!1,ke=!1,Oe=!1,st=tn,rn=[],nn=u=>{ge||(u.preventDefault&&u.preventDefault(),pt(u),window.addEventListener("mousemove",pt),window.addEventListener("mouseup",ar),so(c,u))},ar=u=>{ge||(be=void 0,fe=void 0,window.removeEventListener("mousemove",pt),window.removeEventListener("mouseup",ar),st&&d.classList.add(Et),oo(c,u))},Uo=(u,$)=>{if(v.length<=0)return;if(v.length===1)return v[0].isClicked(u)&&st&&d.classList.remove(Et),v[0];let q=Fo(u);if(we){let le=$,qe=cr(le);qe!==void 0&&(le=Ie(le,qe)),q?(be=le,fe=0,st&&d.classList.remove(Et)):be!==void 0&&(fe=le-be,be=le)}if(!Ho(u)&&!q){for(let le of v)if(!(!le.isClicked(u)||le.disabled))return st&&d.classList.remove(Et),le;for(let le of v)if(R===le)return le}let he=1/0,ye=null;for(let le of v){if(le.disabled)continue;let qe=Math.abs($-le.percent);qe<he&&(he=qe,ye=le)}return ye},sn=()=>v.findIndex(u=>R===u&&!u.disabled),pt=u=>{let $;if(ce===xe){let{height:he,top:ye}=d.getBoundingClientRect(),le=u.type.indexOf("mouse")!==-1?u.clientY:u.touches[0].clientY;$=Math.min(Math.max(0,le-ye),he)*100/he}else{let{width:he,left:ye}=d.getBoundingClientRect(),le=u.type.indexOf("mouse")!==-1?u.clientX:u.touches[0].clientX;$=Math.min(Math.max(0,le-ye),he)*100/he}if((Ee||X)&&($=100-$),R=Uo(u.target,$),R&&No(v,R),we&&v.length>1&&fe!==void 0){let he=v[0],ye=v[v.length-1],le=he.percent+fe<0,qe=ye.percent+fe>100;if(le||qe)return;for(let mr=0;mr<v.length;mr++)Pe(mr,v[mr].percent+fe);return}let q=sn();q!==-1&&(Pe(q,$),R==null||R.$pointer.focus())},lr=u=>{if(ge||document.activeElement!==c||R!=null&&R.disabled)return;u.stopPropagation(),u.preventDefault();let $=u.deltaY<0,q=Ee||X,he=$?!q:q,ye=sn();ye!==-1&&(he?Ft(ye,v[ye].percent):zt(ye,v[ye].percent))},on=u=>{ge||ke||(ce===xe?X?Pe(u,100):Pe(u,0):Ee?zt(u,v[u].percent):Ft(u,v[u].percent))},an=u=>{ge||ke||(ce===xe?X?Pe(u,0):Pe(u,100):Ee?Ft(u,v[u].percent):zt(u,v[u].percent))},ln=u=>{ge||ke||(ce===xe?X?zt(u,v[u].percent):Ft(u,v[u].percent):Ee?Pe(u,100):Pe(u,0))},cn=u=>{ge||ke||(ce===xe?X?Ft(u,v[u].percent):zt(u,v[u].percent):Ee?Pe(u,0):Pe(u,100))},Ho=u=>u.classList.contains("panel"),Fo=u=>u.classList.contains("panel-fill"),Ft=(u,$)=>{if($===void 0)return;let q=cr($);q==null&&(q=1),$-=q,$<0&&($=0),Pe(u,$)},zt=(u,$)=>{if($===void 0)return;let q=cr($);q==null&&(q=1),$+=q,$>100&&($=100),Pe(u,$)},ft=()=>{!j||j.update({percents:hn(),values:un(),$pointers:dn(),min:pn(),max:fn(),data:Hr(),step:Ur(),round:zr(),type:Fr(),textMin:hr(),textMax:ur(),rightToLeft:Xr(),bottomToTop:Vr(),pointersOverlap:Gr(),pointersMinDistance:Wr(),pointersMaxDistance:Yr(),rangeDragging:Qr(),disabled:Kr(),keyboardDisabled:Jr(),mousewheelDisabled:Zr()})},zo=()=>{ft()},Wo=u=>{if(!(te||v.length<=1||ee===D))if(u===0){let $=ue*100/(ee-D);return Math.max(0,v[u+1].percent-$)}else{let $=V*100/(ee-D);return Math.min(v[u-1].percent+$,100)}},Yo=u=>{if(!(te||v.length<=1||ee===D))if(u===v.length-1){let $=ue*100/(ee-D);return Math.min(v[u-1].percent+$,100)}else{let $=V*100/(ee-D);return Math.max(0,v[u+1].percent-$)}},cr=u=>{let $;if(typeof se=="function"){let q=Ze(0,100,D,ee,u);$=se(q,u)}else $=se;if($e($)){let q=ee-D;return $=q===0?0:$*100/q,$}},Mt=u=>{if(u===void 0)return;let $=Ze(0,100,D,ee,u);return H!==void 0?H[Math.round($)]:dt($,je)},hr=()=>H!==void 0?H[D]:D,ur=()=>H!==void 0?H[ee]:ee,Ur=()=>se,Xo=u=>{var $;return u<=0||te?hr():($=Mt(v[u-1].percent))!=null?$:""},Vo=u=>{var $;return v.length<=1||u>=v.length-1||te?ur():($=Mt(v[u+1].percent))!=null?$:""},hn=()=>v.map(u=>u.percent),un=()=>v.map(u=>Mt(u.percent)),dn=()=>v.map(u=>u.$pointer),pn=()=>D,fn=()=>ee,Hr=()=>H,Fr=()=>ce,zr=()=>je,Wr=()=>V,Yr=()=>ue,Ko=u=>rn[u],Xr=()=>Ee,Vr=()=>X,Kr=()=>ge,Jr=()=>ke,Zr=()=>Oe,Gr=()=>te,Qr=()=>we,Pe=(u,$)=>{if($===void 0)return;let q=cr($);q!==void 0&&($=Ie($,q));let he=v[u];if(!he)return;let ye=he.updatePosition($,Wo(u),Yo(u),ce,Ee,X);Y==null||Y.updatePosition(ce,v.map(le=>le.percent),Ee,X),ft();for(let le of v){let qe=Mt(le.percent);qe!==void 0&&(le.setAttr("aria-valuenow",qe.toString()),le.setAttr("aria-valuetext",qe.toString()))}Zo(),ye&&lo(c,v.map(le=>Mt(le.percent)))},Fe=()=>{for(let u=0;u<v.length;u++)Pe(u,v[u].percent)},Jo=(u,$)=>{D=H!==void 0?0:ne(u,qr),ee=H!==void 0?H.length-1:ne($,Ht),dr(D),pr(ee)},Zo=()=>{var u,$;for(let q=0;q<v.length;q++){let he=v[q];he.setAttr("aria-valuemin",((u=Xo(q))!=null?u:"").toString()),he.setAttr("aria-valuemax",(($=Vo(q))!=null?$:"").toString())}},dr=u=>{D=ne(u,qr),D>ee&&(ee=D+Ht),Fe()},pr=u=>{ee=ne(u,Ht),ee<D&&(ee=D+Ht),Fe()},gn=u=>{te=!0;for(let $=0;$<u.length;$++)fr(u[$],$);te=!1;for(let $=0;$<u.length;$++)fr(u[$],$)},fr=(u,$)=>{let q;H!==void 0?(q=u==null?0:ho(u,H),q===-1&&(q=0)):(q=ne(u,D),q<D&&(q=D),q>ee&&(q=ee));let he=Ze(D,ee,0,100,q);Pe($,he)},gr=u=>{if(u==null){se=void 0;return}if(typeof u=="function"){se=u,Fe();return}if($e(u)){se=ne(u,1);let $=Math.abs(ee-D);se>$&&(se=void 0),Fe();return}se=void 0},ei=u=>{te=u,Fe()},ti=u=>{(!$e(u)||u<0)&&(u=0),V=u},ri=u=>{(!$e(u)||u<0)&&(u=1/0),ue=u},ii=u=>{ge=u,d.classList.toggle("disabled",ge),ge?d.setAttribute("aria-disabled","true"):d.hasAttribute("aria-disabled")&&d.removeAttribute("aria-disabled")},yn=u=>{ke=u},mn=u=>{Oe=u,Oe?document.removeEventListener("wheel",lr):document.addEventListener("wheel",lr,{passive:!1})},ni=u=>{if(u==null){H=void 0;return}if(H=co(u),H===void 0||H.length<=0){H=void 0;return}dr(0),pr(H.length-1),se===void 0&&gr(1)},si=u=>{var $;typeof u=="string"?ce=u.trim().toLowerCase()===xe?xe:Ae:ce=Ae;let q=($=c.shadowRoot)==null?void 0:$.querySelector(".range-slider-box");if(!q)return;q.className=`range-slider-box type-${ce}`,Fe();let he=ce===xe?"vertical":"horizontal";for(let ye of v)ye.setAttr("aria-orientation",he)},oi=u=>{Ee=u,v.length>1&&en(v,Ee,c),Fe(),ft()},ai=u=>{X=u,v.length>1&&en(v,X,c),Fe(),ft()},li=u=>{je=ne(u,St),je<0&&(je=St),ft()},vn=u=>{u==null||u.toString().trim().toLowerCase()==="false"?(st=void 0,d.style.removeProperty(Ki),d.classList.remove(Et)):(st=u.toString(),d.style.setProperty(Ki,st),d.classList.add(Et))},bn=(u,$)=>{let q=v[u];!q||(q.setAttr("aria-label",$),rn[u]=$)},yr=u=>{if(be=void 0,v.length<=1){we=!1,d.classList.remove(Zi);return}we=u,d.classList.toggle(Zi,we)},Go=()=>{ii(pe(c.getAttribute(y))),ke=pe(c.getAttribute(w)),Oe=pe(c.getAttribute(E));let u=or(c,/^pointer([0-9]*)-disabled$/,$=>pe($));for(let $ of u){let q=$[0];!v[q]||(v[q].disabled=$[1])}},Qo=()=>{let u=or(c,/^aria-label([0-9]*)$/);for(let $ of u){let q=$[0];bn(q,$[1])}},ea=u=>{let $=v.length,q=v[$-1].$pointer,he=q.cloneNode(!0);q.after(he);let ye=Ir(c,he,$);return ye.setCallbacks(on,an,ln,cn),v.push(ye),fr(u,$),Fe(),ft(),$},ta=()=>{let u=v.length,$=v[u-1];return $?($.destroy(),v.pop(),v.length<=1&&yr(!1),Fe(),ft(),u-1):-1};return(()=>{var u,$;for(let he of v)he.setCallbacks(on,an,ln,cn);let q=(u=c.shadowRoot)==null?void 0:u.querySelector(".panel-fill");q&&(Y=uo(q)),si(c.getAttribute(k)),oi(pe(c.getAttribute(I))),ai(pe(c.getAttribute(f))),Jo(c.getAttribute(g),c.getAttribute(b)),gr(c.getAttribute(m)),ni(c.getAttribute(p)),gn(x.map(he=>he[1])),ei(pe(c.getAttribute(o))),ti(ne(c.getAttribute(l),0)),ri(ne(c.getAttribute(a),1/0)),yr(pe(c.getAttribute(h))),li(ne(c.getAttribute(_),St)),Go(),Qo(),Q=Co(c,d,v),vn(($=c.getAttribute(ve))!=null?$:tn),d.addEventListener("mousedown",nn),d.addEventListener("mouseup",ar),d.addEventListener("touchmove",pt),d.addEventListener("touchstart",pt),Oe||document.addEventListener("wheel",lr,{passive:!1}),j=Ro(c,zo,{setValues:gn,setMin:dr,setMax:pr,setStep:gr,setPointersOverlap:ei,setPointersMinDistance:ti,setPointersMaxDistance:ri,setDisabled:ii,setType:si,setRightToLeft:oi,setBottomToTop:ai,setRound:li,setKeyboardDisabled:yn,setMousewheelDisabled:mn,setRangeDragging:yr,setData:ni},{getPercents:hn,getValues:un,getPointerElements:dn,getMin:pn,getMax:fn,getStep:Ur,getData:Hr,getType:Fr,getRound:zr,getTextMin:hr,getTextMax:ur,isRightToLeft:Xr,isBottomToTop:Vr,isDisabled:Kr,isKeyboardDisabled:Jr,isMousewheelDisabled:Zr,isPointersOverlap:Gr,isRangeDraggingEnabled:Qr,getPointersMinDistance:Wr,getPointersMaxDistance:Yr}),j.init()})(),{get pointers(){return v},get styles(){return Q},get pluginsManager(){return j},get min(){return hr()},get max(){return ur()},get step(){return Ur()},get pointersOverlap(){return Gr()},set pointersOverlap(u){ei(u)},get pointersMinDistance(){return Wr()},set pointersMinDistance(u){ti(u)},get pointersMaxDistance(){return Yr()},set pointersMaxDistance(u){ri(u)},get disabled(){return Kr()},set disabled(u){ii(u)},get data(){return Hr()},get type(){return Fr()},set type(u){si(u)},get rightToLeft(){return Xr()},set rightToLeft(u){oi(u)},get bottomToTop(){return Vr()},set bottomToTop(u){ai(u)},get round(){return zr()},set round(u){li(u)},get animateOnClick(){return st},set animateOnClick(u){vn(u)},get keyboardDisabled(){return Jr()},set keyboardDisabled(u){yn(u)},get mousewheelDisabled(){return Zr()},set mousewheelDisabled(u){mn(u)},get rangeDragging(){return Qr()},set rangeDragging(u){yr(u)},setMin:dr,setMax:pr,setValue:fr,setStep:gr,setData:ni,getTextValue:Mt,setAriaLabel:bn,getAriaLabel:Ko,addPointer:ea,removePointer:ta,destroy:()=>{d.removeEventListener("mousedown",nn),d.removeEventListener("mouseup",ar),d.removeEventListener("touchmove",pt),d.removeEventListener("touchstart",pt),document.removeEventListener("wheel",lr);for(let u of v)u.destroy();j==null||j.destroy()}}},qo=(c,d,x)=>{let v=Ji.find(([j,D,ee,se])=>D.replace("#","")===d.replace(/\d+/g,""));if(v&&c.styles){let[j,D,ee,se]=v,H=d.replace(/\D/g,"").trim(),ce=H===""||H==="0"||H==="1"?0:ne(H,0)-1;c.styles.setStyle(j,x,ce);return}switch(c&&c.pluginsManager&&c.pluginsManager.onAttrChange(d,x),d){case g:{c.setMin(x);break}case b:{c.setMax(x);break}case m:{c.setStep(x);break}case o:{c.pointersOverlap=pe(x);break}case l:{c.pointersMinDistance=ne(x,0);break}case h:{c.rangeDragging=pe(x);break}case a:{c.pointersMaxDistance=ne(x,1/0);break}case y:{c.disabled=pe(x);break}case w:{c.keyboardDisabled=pe(x);break}case E:{c.mousewheelDisabled=pe(x);break}case p:{c.setData(x);break}case k:{c.type=x;break}case I:{c.rightToLeft=pe(x);break}case f:{c.bottomToTop=pe(x);break}case _:{c.round=ne(x,St);break}case z:{c.styles&&(c.styles.theme=x);break}case ve:{c.animateOnClick=x;break}}let R=null;if(/^value([0-9]*)$/.test(d)&&(R="value"),/^pointer([0-9]*)-disabled$/.test(d)&&(R="pointer-disabled"),/^aria-label([0-9]*)$/.test(d)&&(R="aria-label"),/^pointer([0-9]*)-shape$/.test(d)&&(R="pointer-shape"),!R)return;let Y=d.replace(/\D/g,"").trim(),Q=Y===""||Y==="0"||Y==="1"?0:ne(Y,0)-1;switch(R){case"value":{c.setValue(x,Q);break}case"pointer-disabled":{let j=c==null?void 0:c.pointers[Q];if(!j)return;j.disabled=pe(x);break}case"aria-label":{c.setAriaLabel(Q,x);break}case"pointer-shape":{c.styles&&c.styles.setPointerShape(Q,x);break}}},Bo=class extends HTMLElement{constructor(){super(),i(this,"slider"),i(this,"_externalCSSList",[]),i(this,"_observer",null),this.attachShadow({mode:"open"})}set step(c){this.slider&&this.slider.setStep(c)}get step(){var c;return(c=this.slider)==null?void 0:c.step}set disabled(c){this.slider&&(this.slider.disabled=c)}get disabled(){var c,d;return(d=(c=this.slider)==null?void 0:c.disabled)!=null?d:!1}set data(c){var d;(d=this.slider)==null||d.setData(c)}get data(){var c;return(c=this.slider)==null?void 0:c.data}set min(c){var d;(d=this.slider)==null||d.setMin(c)}get min(){var c;return(c=this.slider)==null?void 0:c.min}set max(c){var d;(d=this.slider)==null||d.setMax(c)}get max(){var c;return(c=this.slider)==null?void 0:c.max}set round(c){!this.slider||(this.slider.round=c)}get round(){var c,d;return(d=(c=this.slider)==null?void 0:c.round)!=null?d:St}set type(c){!this.slider||(this.slider.type=c??Ae)}get type(){var c;return((c=this.slider)==null?void 0:c.type)||Ae}set pointersOverlap(c){!this.slider||(this.slider.pointersOverlap=c)}get pointersOverlap(){var c,d;return(d=(c=this.slider)==null?void 0:c.pointersOverlap)!=null?d:!1}set pointersMinDistance(c){!this.slider||(this.slider.pointersMinDistance=c)}get pointersMinDistance(){var c,d;return(d=(c=this.slider)==null?void 0:c.pointersMinDistance)!=null?d:0}set pointersMaxDistance(c){!this.slider||(this.slider.pointersMaxDistance=c)}get pointersMaxDistance(){var c,d;return(d=(c=this.slider)==null?void 0:c.pointersMaxDistance)!=null?d:1/0}set theme(c){!this.slider||!this.slider.styles||(this.slider.styles.theme=c)}get theme(){var c,d,x;return(x=(d=(c=this.slider)==null?void 0:c.styles)==null?void 0:d.theme)!=null?x:null}set rtl(c){!this.slider||(this.slider.rightToLeft=c)}get rtl(){var c,d;return(d=(c=this.slider)==null?void 0:c.rightToLeft)!=null?d:!1}set btt(c){!this.slider||(this.slider.bottomToTop=c)}get btt(){var c,d;return(d=(c=this.slider)==null?void 0:c.bottomToTop)!=null?d:!1}set keyboardDisabled(c){!this.slider||(this.slider.keyboardDisabled=c)}get keyboardDisabled(){var c,d;return(d=(c=this.slider)==null?void 0:c.keyboardDisabled)!=null?d:!1}set mousewheelDisabled(c){!this.slider||(this.slider.mousewheelDisabled=c)}get mousewheelDisabled(){var c,d;return(d=(c=this.slider)==null?void 0:c.mousewheelDisabled)!=null?d:!1}set animateOnClick(c){!this.slider||(this.slider.animateOnClick=c)}get animateOnClick(){var c;return(c=this.slider)==null?void 0:c.animateOnClick}get rangeDragging(){var c,d;return(d=(c=this.slider)==null?void 0:c.rangeDragging)!=null?d:!1}set rangeDragging(c){this.slider&&(this.slider.rangeDragging=pe(c))}get externalCSSList(){return this._externalCSSList}addPointer(c){var d,x;if(!this.slider)return;let v=(x=(d=this.slider)==null?void 0:d.addPointer(c))!=null?x:0;Qi(this,this.slider,v,`value${v+1}`,`ariaLabel${v+1}`,`pointerShape${v+1}`,`pointer${v+1}Disabled`)}removePointer(){var c;!this.slider||(c=this.slider)==null||c.removePointer()}addCSS(c){if(!this.shadowRoot)return;let d=document.createElement("style");d.textContent=c,this.shadowRoot.appendChild(d)}connectedCallback(){var c,d;if(!this.shadowRoot)return;this._externalCSSList=Lo(this),this.shadowRoot.innerHTML=n(s,this._externalCSSList);let x=(c=this.shadowRoot)==null?void 0:c.querySelector(".pointer");if(!x)return;let v=(d=this.shadowRoot)==null?void 0:d.getElementById("range-slider");if(!v)return;let R=To(this,x);this.slider=Io(this,v,R),Do(this,this.slider),this._observer=new MutationObserver(Y=>{Y.forEach(Q=>{var j;if(!this.slider||Q.type!=="attributes")return;let D=Q.attributeName;!D||qo(this.slider,D,(j=this.getAttribute(D))!=null?j:"")})}),this._observer.observe(this,{attributes:!0})}disconnectedCallback(){this._observer&&this._observer.disconnect(),this.slider&&this.slider.destroy()}},Br=Bo;window.tcRangeSlider=Br,customElements.get("toolcool-range-slider")||customElements.define("toolcool-range-slider",Br),customElements.get("tc-range-slider")||customElements.define("tc-range-slider",class extends Br{})})();var Pt=typeof globalThis<"u"?globalThis:typeof window<"u"?window:typeof global<"u"?global:typeof self<"u"?self:{};function Li(t){return t&&t.__esModule&&Object.prototype.hasOwnProperty.call(t,"default")?t.default:t}function Ci(t){if(t.__esModule)return t;var e=t.default;if(typeof e=="function"){var r=function i(){return this instanceof i?Reflect.construct(e,arguments,this.constructor):e.apply(this,arguments)};r.prototype=e.prototype}else r={};return Object.defineProperty(r,"__esModule",{value:!0}),Object.keys(t).forEach(function(i){var n=Object.getOwnPropertyDescriptor(t,i);Object.defineProperty(r,i,n.get?n:{enumerable:!0,get:function(){return t[i]}})}),r}var vs={exports:{}};(function(t,e){(function(r,i){t.exports=i()})(Pt,function(){var r=1e3,i=6e4,n=36e5,s="millisecond",o="second",l="minute",a="hour",h="day",p="week",g="month",b="quarter",m="year",_="date",k="Invalid Date",z=/^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/,I=/\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g,f={name:"en",weekdays:"Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"),months:"January_February_March_April_May_June_July_August_September_October_November_December".split("_"),ordinal:function(C){var O=["th","st","nd","rd"],A=C%100;return"["+C+(O[(A-20)%10]||O[A]||O[0])+"]"}},y=function(C,O,A){var N=String(C);return!N||N.length>=O?C:""+Array(O+1-N.length).join(A)+C},w={s:y,z:function(C){var O=-C.utcOffset(),A=Math.abs(O),N=Math.floor(A/60),P=A%60;return(O<=0?"+":"-")+y(N,2,"0")+":"+y(P,2,"0")},m:function C(O,A){if(O.date()<A.date())return-C(A,O);var N=12*(A.year()-O.year())+(A.month()-O.month()),P=O.clone().add(N,g),K=A-P<0,W=O.clone().add(N+(K?-1:1),g);return+(-(N+(A-P)/(K?P-W:W-P))||0)},a:function(C){return C<0?Math.ceil(C)||0:Math.floor(C)},p:function(C){return{M:g,y:m,w:p,d:h,D:_,h:a,m:l,s:o,ms:s,Q:b}[C]||String(C||"").toLowerCase().replace(/s$/,"")},u:function(C){return C===void 0}},E="en",S={};S[E]=f;var M="$isDayjsObject",L=function(C){return C instanceof re||!(!C||!C[M])},B=function C(O,A,N){var P;if(!O)return E;if(typeof O=="string"){var K=O.toLowerCase();S[K]&&(P=K),A&&(S[K]=A,P=K);var W=O.split("-");if(!P&&W.length>1)return C(W[0])}else{var oe=O.name;S[oe]=O,P=oe}return!N&&P&&(E=P),P||!N&&E},U=function(C,O){if(L(C))return C.clone();var A=typeof O=="object"?O:{};return A.date=C,A.args=arguments,new re(A)},T=w;T.l=B,T.i=L,T.w=function(C,O){return U(C,{locale:O.$L,utc:O.$u,x:O.$x,$offset:O.$offset})};var re=function(){function C(A){this.$L=B(A.locale,null,!0),this.parse(A),this.$x=this.$x||A.x||{},this[M]=!0}var O=C.prototype;return O.parse=function(A){this.$d=function(N){var P=N.date,K=N.utc;if(P===null)return new Date(NaN);if(T.u(P))return new Date;if(P instanceof Date)return new Date(P);if(typeof P=="string"&&!/Z$/i.test(P)){var W=P.match(z);if(W){var oe=W[2]-1||0,ie=(W[7]||"0").substring(0,3);return K?new Date(Date.UTC(W[1],oe,W[3]||1,W[4]||0,W[5]||0,W[6]||0,ie)):new Date(W[1],oe,W[3]||1,W[4]||0,W[5]||0,W[6]||0,ie)}}return new Date(P)}(A),this.init()},O.init=function(){var A=this.$d;this.$y=A.getFullYear(),this.$M=A.getMonth(),this.$D=A.getDate(),this.$W=A.getDay(),this.$H=A.getHours(),this.$m=A.getMinutes(),this.$s=A.getSeconds(),this.$ms=A.getMilliseconds()},O.$utils=function(){return T},O.isValid=function(){return this.$d.toString()!==k},O.isSame=function(A,N){var P=U(A);return this.startOf(N)<=P&&P<=this.endOf(N)},O.isAfter=function(A,N){return U(A)<this.startOf(N)},O.isBefore=function(A,N){return this.endOf(N)<U(A)},O.$g=function(A,N,P){return T.u(A)?this[N]:this.set(P,A)},O.unix=function(){return Math.floor(this.valueOf()/1e3)},O.valueOf=function(){return this.$d.getTime()},O.startOf=function(A,N){var P=this,K=!!T.u(N)||N,W=T.p(A),oe=function($e,ne){var Ie=T.w(P.$u?Date.UTC(P.$y,ne,$e):new Date(P.$y,ne,$e),P);return K?Ie:Ie.endOf(h)},ie=function($e,ne){return T.w(P.toDate()[$e].apply(P.toDate("s"),(K?[0,0,0,0]:[23,59,59,999]).slice(ne)),P)},me=this.$W,ve=this.$M,Me=this.$D,xe="set"+(this.$u?"UTC":"");switch(W){case m:return K?oe(1,0):oe(31,11);case g:return K?oe(1,ve):oe(0,ve+1);case p:var Ae=this.$locale().weekStart||0,Ze=(me<Ae?me+7:me)-Ae;return oe(K?Me-Ze:Me+(6-Ze),ve);case h:case _:return ie(xe+"Hours",0);case a:return ie(xe+"Minutes",1);case l:return ie(xe+"Seconds",2);case o:return ie(xe+"Milliseconds",3);default:return this.clone()}},O.endOf=function(A){return this.startOf(A,!1)},O.$set=function(A,N){var P,K=T.p(A),W="set"+(this.$u?"UTC":""),oe=(P={},P[h]=W+"Date",P[_]=W+"Date",P[g]=W+"Month",P[m]=W+"FullYear",P[a]=W+"Hours",P[l]=W+"Minutes",P[o]=W+"Seconds",P[s]=W+"Milliseconds",P)[K],ie=K===h?this.$D+(N-this.$W):N;if(K===g||K===m){var me=this.clone().set(_,1);me.$d[oe](ie),me.init(),this.$d=me.set(_,Math.min(this.$D,me.daysInMonth())).$d}else oe&&this.$d[oe](ie);return this.init(),this},O.set=function(A,N){return this.clone().$set(A,N)},O.get=function(A){return this[T.p(A)]()},O.add=function(A,N){var P,K=this;A=Number(A);var W=T.p(N),oe=function(ve){var Me=U(K);return T.w(Me.date(Me.date()+Math.round(ve*A)),K)};if(W===g)return this.set(g,this.$M+A);if(W===m)return this.set(m,this.$y+A);if(W===h)return oe(1);if(W===p)return oe(7);var ie=(P={},P[l]=i,P[a]=n,P[o]=r,P)[W]||1,me=this.$d.getTime()+A*ie;return T.w(me,this)},O.subtract=function(A,N){return this.add(-1*A,N)},O.format=function(A){var N=this,P=this.$locale();if(!this.isValid())return P.invalidDate||k;var K=A||"YYYY-MM-DDTHH:mm:ssZ",W=T.z(this),oe=this.$H,ie=this.$m,me=this.$M,ve=P.weekdays,Me=P.months,xe=P.meridiem,Ae=function(ne,Ie,dt,pe){return ne&&(ne[Ie]||ne(N,K))||dt[Ie].slice(0,pe)},Ze=function(ne){return T.s(oe%12||12,ne,"0")},$e=xe||function(ne,Ie,dt){var pe=ne<12?"AM":"PM";return dt?pe.toLowerCase():pe};return K.replace(I,function(ne,Ie){return Ie||function(dt){switch(dt){case"YY":return String(N.$y).slice(-2);case"YYYY":return T.s(N.$y,4,"0");case"M":return me+1;case"MM":return T.s(me+1,2,"0");case"MMM":return Ae(P.monthsShort,me,Me,3);case"MMMM":return Ae(Me,me);case"D":return N.$D;case"DD":return T.s(N.$D,2,"0");case"d":return String(N.$W);case"dd":return Ae(P.weekdaysMin,N.$W,ve,2);case"ddd":return Ae(P.weekdaysShort,N.$W,ve,3);case"dddd":return ve[N.$W];case"H":return String(oe);case"HH":return T.s(oe,2,"0");case"h":return Ze(1);case"hh":return Ze(2);case"a":return $e(oe,ie,!0);case"A":return $e(oe,ie,!1);case"m":return String(ie);case"mm":return T.s(ie,2,"0");case"s":return String(N.$s);case"ss":return T.s(N.$s,2,"0");case"SSS":return T.s(N.$ms,3,"0");case"Z":return W}return null}(ne)||W.replace(":","")})},O.utcOffset=function(){return 15*-Math.round(this.$d.getTimezoneOffset()/15)},O.diff=function(A,N,P){var K,W=this,oe=T.p(N),ie=U(A),me=(ie.utcOffset()-this.utcOffset())*i,ve=this-ie,Me=function(){return T.m(W,ie)};switch(oe){case m:K=Me()/12;break;case g:K=Me();break;case b:K=Me()/3;break;case p:K=(ve-me)/6048e5;break;case h:K=(ve-me)/864e5;break;case a:K=ve/n;break;case l:K=ve/i;break;case o:K=ve/r;break;default:K=ve}return P?K:T.a(K)},O.daysInMonth=function(){return this.endOf(g).$D},O.$locale=function(){return S[this.$L]},O.locale=function(A,N){if(!A)return this.$L;var P=this.clone(),K=B(A,N,!0);return K&&(P.$L=K),P},O.clone=function(){return T.w(this.$d,this)},O.toDate=function(){return new Date(this.valueOf())},O.toJSON=function(){return this.isValid()?this.toISOString():null},O.toISOString=function(){return this.$d.toISOString()},O.toString=function(){return this.$d.toUTCString()},C}(),Z=re.prototype;return U.prototype=Z,[["$ms",s],["$s",o],["$m",l],["$H",a],["$W",h],["$M",g],["$y",m],["$D",_]].forEach(function(C){Z[C[1]]=function(O){return this.$g(O,C[0],C[1])}}),U.extend=function(C,O){return C.$i||(C(O,re,U),C.$i=!0),U},U.locale=B,U.isDayjs=L,U.unix=function(C){return U(1e3*C)},U.en=S[E],U.Ls=S,U.p={},U})})(vs);var Ea=vs.exports;const Lt=Li(Ea);class Sa extends _e{constructor(){super(...arguments),this.templates={},this._renderedTemplates={}}setBindingSyntax(e,r){this._startExpression=e,this._endExpression=r;const i=this.escapeRegex(this._startExpression),n=this.escapeRegex(this._endExpression);this._expression=new RegExp(`${i}\\s*([$\\w\\.,'"\\s()\\[\\]]+)\\s*${n}`,"g")}hasTemplate(e){return this.templates&&!!this.templates[e]}renderTemplate(e,r,i){if(!this.hasTemplate(e))return null;i=i||e;const n=F` <slot name=${i}></slot> `,s={[e]:{...r}};if(this._renderedTemplates.hasOwnProperty(i)){const{slot:l}=this._renderedTemplates[i];this.contains(l)&&this.removeChild(l)}const o=document.createElement("div");return o.slot=i,o.dataset.generated="template",this._renderTemplate(o,this.templates[e],s),this.appendChild(o),this._renderedTemplates[i]={context:s,slot:o},n}getTemplates(){const e={};for(let r=0;r<this.children.length;r++){const i=this.children[r];if(i.nodeName==="RENDER-TEMPLATE"){const n=i;n.dataset.type?e[n.dataset.type]=n:e.default=n,n.templateOrder=r}}return e}_renderTemplate(e,r,i){let n;if(r&&r.childNodes.length){const s=r.cloneNode(!0);n=this.renderNode(s,e,i)}n&&e.appendChild(n)}expandExpressionsAsString(e,r){return e.replace(this.expression,(i,n)=>{const s=this.evalInContext(n||this.trimExpression(i),r);return s?typeof s=="object"?JSON.stringify(s):s.toString():""})}get expression(){return this._expression||this.setBindingSyntax("{{","}}"),this._expression}escapeRegex(e){return e.replace(/[-\/\\^$*+?.()|[\]{}]/g,"\\$&")}evalInContext(e,r){r={...r};const i=new Function("with(this) { return "+e+";}");let n;try{n=i.call(r)}catch{}return n}trimExpression(e){return e=e.trim(),e.startsWith(this._startExpression)&&e.endsWith(this._endExpression)&&(e=e.substr(this._startExpression.length,e.length-this._startExpression.length-this._endExpression.length),e=e.trim()),e}renderNode(e,r,i){if(e.nodeName==="#text")return e.textContent=this.expandExpressionsAsString(e.textContent,i),e;if(e.nodeName==="TEMPLATE")return e.$parentTemplateContext=i,e;for(let n=0;n<e.childNodes.length;n++){const s=e.childNodes[n];this.renderNode(s,r,i)}return e}firstUpdated(){this.templates=this.getTemplates()}}const Ri=`
:host {
  display: flex;
  box-sizing: border-box;
  height: 100%;
  line-height: 1;
}
*,
*:before,
*:after {
  box-sizing: inherit;
}
form#itemfilter {
  height: 100%;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
}
details {
  width: 100%;
}
`,ji=`
button,
.button {
  /* TODO: why does this only work here and not from :root? */
  --primary-color: #004170;
  --primary-color-hover: #004170CC;
  --error-color: #FF5252;

  display: inline-flex;
  position: relative;
  align-items: center;
  color: #fff;
  border-width: 0;
  outline: none;
  border-radius: 4px;
  padding: 16px;
  height: 36px;
  cursor: pointer;
  font-family: inherit;
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 1.25px;                           
  font-weight: 500;
  box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
  transition-property: box-shadow, transform, opacity, background;
  transition-duration: 0.28s;
  transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}

button:hover:not([disabled]):not(.icon),
.button:hover:not([disabled]):not(.icon) {
  box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12);
  background: var(--primary-color-hover);
}

button, button:active,
.button, .button:active {
  background: var(--primary-color);
}

button[disabled],
.button[disabled] {
  opacity: 0.5;
  cursor: not-allowed;
}

button.outline,
.button.outline {
  background: transparent;
  box-shadow: none;
  color: var(--primary-color);
  outline: 1px solid var(--primary-color);
}

button.outline:hover,
.button.outline:hover {
  background: transparent;
}

button.icon,
.button.icon {
  background: transparent;
  border: none;
  box-shadow: none;
  padding: 0;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  text-indent: -9999px;
}

button.icon-text,
.button.icon-text {
  text-indent: 26px;
}

button.icon:before, button.icon-text:before,
.button.icon:before, .button.icon-text:before {
  position: absolute;
  text-indent: 0;
  line-height: initial;
}

button.icon:before,
.button.icon:before {
  width: 24px;
  height: 24px;
  margin-right: 0;
}

button.icon-text:before,
.button.icon-text:before {
  width: 18px;
  height: 18px;
}

button.small,
.button.small {
  height: 28px;
  padding: 12.4px;
  font-size: .75rem;
}

button.smallest.icon, 
button.smallest.icon::before {
  height: 16px;
  width: 16px;
  padding: 0px;
}
`,Ma=`
input[type=checkbox] {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 24px;
  height: 24px;
}
input[type=checkbox]:after {
  display: block;
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Echeckbox-blank-outline%3C/title%3E%3Cpath d='M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z' /%3E%3C/svg%3E");
  width: 20px;
  height: 20px;
  margin-right: 4px;
}
input[type=checkbox]:checked:after {
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Echeckbox-marked%3C/title%3E%3Cpath d='M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z' /%3E%3C/svg%3E");

}
`,Aa=`
input[type=radio] {
  appearance: none;
  -webkit-appearance: none;
  margin: 0;
  cursor: pointer;
  display: flex;
  flex-direction: row;
  align-items: center;
  width: 24px;
  height: 24px;
}

label span {
  font-size: small;
}

input[type=radio]:after {
  display: block;
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Eradiobox-blank%3C/title%3E%3Cpath d='M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' /%3E%3C/svg%3E");
  width: 20px;
  height: 20px;
  margin-right: 4px;
}
input[type=radio]:checked:after {
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Eradiobox-marked%3C/title%3E%3Cpath d='M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7Z' /%3E%3C/svg%3E");

}
`,ka=`
input[type="range"] {
  -webkit-appearance: none;
  width: 90%;
  margin-left: 5%;
  height: 6px;
  border-radius: 5px;
  background: #d7dcdf;
  outline: none;
  padding: 0;
}
input[type="range"]::-webkit-slider-thumb {
  appearance: none;
  width: 15px;
  height: 15px;
  border-radius: 50%;
  background: #2c3e50;
  cursor: pointer;
  transition: background 0.15s ease-in-out;
}
.range-slider {
  margin: 60px 0 0 0;
}
.range-slider {
  width: 100%;
}
input[type="range"]::-webkit-slider-thumb:hover {
  background: #00416F;
}
input[type="range"]:active::-webkit-slider-thumb {
  background: #00416F;
}
input[type="range"]::-moz-range-thumb {
  width: 15px;
  height: 15px;
  border: 0;
  border-radius: 50%;
  background: #2c3e50;
  cursor: pointer;
  transition: background 0.15s ease-in-out;
}
input[type="range"]::-moz-range-thumb:hover {
  background: #00416F;
}
input[type="range"]:active::-moz-range-thumb {
  background: #00416F;
}
input[type="range"]:focus::-webkit-slider-thumb {
  box-shadow: 0 0 0 3px #fff0, 0 0 0 6px #00416F00;
}
.range-slider__value {
  display: inline-block;
  position: relative;
  width: 60px;
  color: #fff;
  line-height: 20px;
  text-align: center;
  border-radius: 3px;
  background: #2c3e50;
  padding: 5px 10px;
  margin-left: 8px;
}
.range-slider__value:after {
  position: absolute;
  top: 8px;
  left: -7px;
  width: 0;
  height: 0;
  border-top: 7px solid transparent;
  border-right: 7px solid #2c3e50;
  border-bottom: 7px solid transparent;
  content: '';
}

input::-moz-focus-inner, input::-moz-focus-outer {
  border: 0;
}
`,Ti=`
* {
  font-family: Roboto, sans-serif;
}

${ji}
${Ma}
${Aa}
${ka}

ul {
  padding-left: 0;
  margin-top: 0;
}
li {
  list-style: none;
}
li span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
li label {
  display: flex;
  align-items: center;
}
details summary > * {
  display: inline;
}
details summary {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #0002;
  padding: .5rem 0;
}

details > summary::-webkit-details-marker {
  display: none;
}

.title {
  font-size: small;
  align-items: center;
}
details summary .title {
  display: flex;
  font-weight: 500;
}
details.details-filter summary::after,
details.details-results summary::before {
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%230009' viewBox='0 0 24 24'%3E%3Ctitle%3Echevron-right%3C/title%3E%3Cpath d='M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z' /%3E%3C/svg%3E");
  height: 24px;
  width: 24px;
}
details.details-filter summary::after {
  position: absolute;
  right: 8px;
  transform: rotate(90deg);
}
details[open] summary::before {
  transform: rotate(90deg);
}
details[open] summary::after {
  transform: rotate(270deg);
}
eox-itemfilter-expandcontainer {
  max-height: 200px;
}
eox-itemfilter-expandcontainer > [data-type=filter] {
  display: block;
  height: calc(100% - 32px);
  overflow-y: auto;
}
[data-type=filter] .title,
details summary {
  text-transform: capitalize;
}
li,
label,
details,
input[type="checkbox"],
input[type="radio"] {
  cursor: pointer;
}
input[type="checkbox"],
input[type="radio"] {
  margin: 0;
}
input[type="text"] {
  box-sizing: border-box;
  width: 100%;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 5px 7px;
  border-radius: 4px;
  border: 1px solid #0004;
}
section:not(section:last-of-type) {
  margin-bottom: 1rem;
}
#section-results {
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}
ul li {
  padding: 5px 10px;
}
li.highlighted {
  background: #00417011;
}
section {
  position: relative;
}
button#filter-reset {
  position: absolute;
  top: 4px;
  right: 0;
}
.scroll {
  max-height: calc(100% - 30px);
  overflow-x: hidden;
  overflow-y: auto;
}
.count {
  display: flex;
  justify-content: center;
  align-items: center;
  background: #00417044;
  padding: 0 12px;
  height: 20px;
  border-radius: 10px;
  color: #004170;
  font-weight: 500;
  margin-left: 9px;
}
eox-itemfilter-range {
  display: flex;
  align-items: center;
  padding: .5rem 0;
}
.range-before,
.range-after {
  font-size: small;
}
.range-before {
  margin-right: .5rem;
}
.range-after {
  margin-left: .5rem;
}

button.reset-icon:before {
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Eclose%3C/title%3E%3Cpath d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' /%3E%3C/svg%3E");
}
eox-itemfilter-expandcontainer button.reset-icon {
  margin-left: 4px;
  margin-top: 1px;
}
eox-itemfilter-expandcontainer button.reset-icon:before {
  height: 16px;
  width: 16px;
}
  `;var Oa=Object.defineProperty,Pa=Object.getOwnPropertyDescriptor,Di=(t,e,r,i)=>{for(var n=i>1?void 0:i?Pa(e,r):e,s=t.length-1,o;s>=0;s--)(o=t[s])&&(n=(i?o(e,r,n):o(n))||n);return i&&n&&Oa(e,r,n),n};let Sr=class extends _e{handleDetailsToggle(t){this.dispatchEvent(new CustomEvent("details-toggled",{detail:t,bubbles:!0,composed:!0}))}_resetFilter(){this.querySelector("[slot='filter']").reset()}render(){return F`
      <style>
        ${Ri}
        ${!this.unstyled&&Ti}
      </style>
      <details
        @toggle="${this.handleDetailsToggle}"
        class="details-filter"
        part="details-filter"
        ?open=${this.filterObject.expanded||ae}
      >
        <summary>
          <span
            class="title"
            style="${!this.filterObject.title&&"text-transform: capitalize"}"
          >
            ${this.filterObject.title||this.filterObject.key||"Filter"}
            <slot name="reset-button"></slot>
          </span>
        </summary>
        <div class="scroll">
          <slot name="filter"></slot>
        </div>
      </details>
    `}};Di([G({attribute:!1})],Sr.prototype,"filterObject",2);Di([G()],Sr.prototype,"unstyled",2);Sr=Di([Re("eox-itemfilter-expandcontainer")],Sr);const qt=t=>{if(!t.dirty)return null;switch(t.type){case"multiselect":for(const e in t.state)t.state[e]=!1;break;case"range":t.state.min=t.min,t.state.max=t.max;break;case"select":for(const e in t.state)t.state[e]=!1;break;case"spatial":t.state.geometry=void 0;break;case"text":t.keys.forEach(e=>{t.state[e]=void 0});break}return delete t.stringifiedState,delete t.dirty,t},fi=Math.min,Ct=Math.max,Mr=Math.round,vr=Math.floor,at=t=>({x:t,y:t});function bs(t){return t.split("-")[0]}function La(t){return t.split("-")[1]}function Ca(t){return t==="x"?"y":"x"}function Ra(t){return t==="y"?"height":"width"}function xs(t){return["top","bottom"].includes(bs(t))?"y":"x"}function ja(t){return Ca(xs(t))}function ws(t){return{...t,top:t.y,left:t.x,right:t.x+t.width,bottom:t.y+t.height}}function In(t,e,r){let{reference:i,floating:n}=t;const s=xs(e),o=ja(e),l=Ra(o),a=bs(e),h=s==="y",p=i.x+i.width/2-n.width/2,g=i.y+i.height/2-n.height/2,b=i[l]/2-n[l]/2;let m;switch(a){case"top":m={x:p,y:i.y-n.height};break;case"bottom":m={x:p,y:i.y+i.height};break;case"right":m={x:i.x+i.width,y:g};break;case"left":m={x:i.x-n.width,y:g};break;default:m={x:i.x,y:i.y}}switch(La(e)){case"start":m[o]-=b*(r&&h?-1:1);break;case"end":m[o]+=b*(r&&h?-1:1);break}return m}const Ta=async(t,e,r)=>{const{placement:i="bottom",strategy:n="absolute",middleware:s=[],platform:o}=r,l=s.filter(Boolean),a=await(o.isRTL==null?void 0:o.isRTL(e));let h=await o.getElementRects({reference:t,floating:e,strategy:n}),{x:p,y:g}=In(h,i,a),b=i,m={},_=0;for(let k=0;k<l.length;k++){const{name:z,fn:I}=l[k],{x:f,y,data:w,reset:E}=await I({x:p,y:g,initialPlacement:i,placement:b,strategy:n,middlewareData:m,rects:h,platform:o,elements:{reference:t,floating:e}});p=f??p,g=y??g,m={...m,[z]:{...m[z],...w}},E&&_<=50&&(_++,typeof E=="object"&&(E.placement&&(b=E.placement),E.rects&&(h=E.rects===!0?await o.getElementRects({reference:t,floating:e,strategy:n}):E.rects),{x:p,y:g}=In(h,b,a)),k=-1)}return{x:p,y:g,placement:b,strategy:n,middlewareData:m}};function lt(t){return $s(t)?(t.nodeName||"").toLowerCase():"#document"}function Ce(t){var e;return(t==null||(e=t.ownerDocument)==null?void 0:e.defaultView)||window}function it(t){var e;return(e=($s(t)?t.ownerDocument:t.document)||window.document)==null?void 0:e.documentElement}function $s(t){return t instanceof Node||t instanceof Ce(t).Node}function Qe(t){return t instanceof Element||t instanceof Ce(t).Element}function Xe(t){return t instanceof HTMLElement||t instanceof Ce(t).HTMLElement}function qn(t){return typeof ShadowRoot>"u"?!1:t instanceof ShadowRoot||t instanceof Ce(t).ShadowRoot}function nr(t){const{overflow:e,overflowX:r,overflowY:i,display:n}=De(t);return/auto|scroll|overlay|hidden|clip/.test(e+i+r)&&!["inline","contents"].includes(n)}function Da(t){return["table","td","th"].includes(lt(t))}function Ni(t){const e=Ii(),r=De(t);return r.transform!=="none"||r.perspective!=="none"||(r.containerType?r.containerType!=="normal":!1)||!e&&(r.backdropFilter?r.backdropFilter!=="none":!1)||!e&&(r.filter?r.filter!=="none":!1)||["transform","perspective","filter"].some(i=>(r.willChange||"").includes(i))||["paint","layout","strict","content"].some(i=>(r.contain||"").includes(i))}function Na(t){let e=Tt(t);for(;Xe(e)&&!Cr(e);){if(Ni(e))return e;e=Tt(e)}return null}function Ii(){return typeof CSS>"u"||!CSS.supports?!1:CSS.supports("-webkit-backdrop-filter","none")}function Cr(t){return["html","body","#document"].includes(lt(t))}function De(t){return Ce(t).getComputedStyle(t)}function Rr(t){return Qe(t)?{scrollLeft:t.scrollLeft,scrollTop:t.scrollTop}:{scrollLeft:t.pageXOffset,scrollTop:t.pageYOffset}}function Tt(t){if(lt(t)==="html")return t;const e=t.assignedSlot||t.parentNode||qn(t)&&t.host||it(t);return qn(e)?e.host:e}function _s(t){const e=Tt(t);return Cr(e)?t.ownerDocument?t.ownerDocument.body:t.body:Xe(e)&&nr(e)?e:_s(e)}function Gt(t,e,r){var i;e===void 0&&(e=[]),r===void 0&&(r=!0);const n=_s(t),s=n===((i=t.ownerDocument)==null?void 0:i.body),o=Ce(n);return s?e.concat(o,o.visualViewport||[],nr(n)?n:[],o.frameElement&&r?Gt(o.frameElement):[]):e.concat(n,Gt(n,[],r))}function Es(t){const e=De(t);let r=parseFloat(e.width)||0,i=parseFloat(e.height)||0;const n=Xe(t),s=n?t.offsetWidth:r,o=n?t.offsetHeight:i,l=Mr(r)!==s||Mr(i)!==o;return l&&(r=s,i=o),{width:r,height:i,$:l}}function qi(t){return Qe(t)?t:t.contextElement}function Rt(t){const e=qi(t);if(!Xe(e))return at(1);const r=e.getBoundingClientRect(),{width:i,height:n,$:s}=Es(e);let o=(s?Mr(r.width):r.width)/i,l=(s?Mr(r.height):r.height)/n;return(!o||!Number.isFinite(o))&&(o=1),(!l||!Number.isFinite(l))&&(l=1),{x:o,y:l}}const Ia=at(0);function Ss(t){const e=Ce(t);return!Ii()||!e.visualViewport?Ia:{x:e.visualViewport.offsetLeft,y:e.visualViewport.offsetTop}}function qa(t,e,r){return e===void 0&&(e=!1),!r||e&&r!==Ce(t)?!1:e}function wt(t,e,r,i){e===void 0&&(e=!1),r===void 0&&(r=!1);const n=t.getBoundingClientRect(),s=qi(t);let o=at(1);e&&(i?Qe(i)&&(o=Rt(i)):o=Rt(t));const l=qa(s,r,i)?Ss(s):at(0);let a=(n.left+l.x)/o.x,h=(n.top+l.y)/o.y,p=n.width/o.x,g=n.height/o.y;if(s){const b=Ce(s),m=i&&Qe(i)?Ce(i):i;let _=b,k=_.frameElement;for(;k&&i&&m!==_;){const z=Rt(k),I=k.getBoundingClientRect(),f=De(k),y=I.left+(k.clientLeft+parseFloat(f.paddingLeft))*z.x,w=I.top+(k.clientTop+parseFloat(f.paddingTop))*z.y;a*=z.x,h*=z.y,p*=z.x,g*=z.y,a+=y,h+=w,_=Ce(k),k=_.frameElement}}return ws({width:p,height:g,x:a,y:h})}const Ba=[":popover-open",":modal"];function Ms(t){return Ba.some(e=>{try{return t.matches(e)}catch{return!1}})}function Ua(t){let{elements:e,rect:r,offsetParent:i,strategy:n}=t;const s=n==="fixed",o=it(i),l=e?Ms(e.floating):!1;if(i===o||l&&s)return r;let a={scrollLeft:0,scrollTop:0},h=at(1);const p=at(0),g=Xe(i);if((g||!g&&!s)&&((lt(i)!=="body"||nr(o))&&(a=Rr(i)),Xe(i))){const b=wt(i);h=Rt(i),p.x=b.x+i.clientLeft,p.y=b.y+i.clientTop}return{width:r.width*h.x,height:r.height*h.y,x:r.x*h.x-a.scrollLeft*h.x+p.x,y:r.y*h.y-a.scrollTop*h.y+p.y}}function Ha(t){return Array.from(t.getClientRects())}function As(t){return wt(it(t)).left+Rr(t).scrollLeft}function Fa(t){const e=it(t),r=Rr(t),i=t.ownerDocument.body,n=Ct(e.scrollWidth,e.clientWidth,i.scrollWidth,i.clientWidth),s=Ct(e.scrollHeight,e.clientHeight,i.scrollHeight,i.clientHeight);let o=-r.scrollLeft+As(t);const l=-r.scrollTop;return De(i).direction==="rtl"&&(o+=Ct(e.clientWidth,i.clientWidth)-n),{width:n,height:s,x:o,y:l}}function za(t,e){const r=Ce(t),i=it(t),n=r.visualViewport;let s=i.clientWidth,o=i.clientHeight,l=0,a=0;if(n){s=n.width,o=n.height;const h=Ii();(!h||h&&e==="fixed")&&(l=n.offsetLeft,a=n.offsetTop)}return{width:s,height:o,x:l,y:a}}function Wa(t,e){const r=wt(t,!0,e==="fixed"),i=r.top+t.clientTop,n=r.left+t.clientLeft,s=Xe(t)?Rt(t):at(1),o=t.clientWidth*s.x,l=t.clientHeight*s.y,a=n*s.x,h=i*s.y;return{width:o,height:l,x:a,y:h}}function Bn(t,e,r){let i;if(e==="viewport")i=za(t,r);else if(e==="document")i=Fa(it(t));else if(Qe(e))i=Wa(e,r);else{const n=Ss(t);i={...e,x:e.x-n.x,y:e.y-n.y}}return ws(i)}function ks(t,e){const r=Tt(t);return r===e||!Qe(r)||Cr(r)?!1:De(r).position==="fixed"||ks(r,e)}function Ya(t,e){const r=e.get(t);if(r)return r;let i=Gt(t,[],!1).filter(l=>Qe(l)&&lt(l)!=="body"),n=null;const s=De(t).position==="fixed";let o=s?Tt(t):t;for(;Qe(o)&&!Cr(o);){const l=De(o),a=Ni(o);!a&&l.position==="fixed"&&(n=null),(s?!a&&!n:!a&&l.position==="static"&&n&&["absolute","fixed"].includes(n.position)||nr(o)&&!a&&ks(t,o))?i=i.filter(h=>h!==o):n=l,o=Tt(o)}return e.set(t,i),i}function Xa(t){let{element:e,boundary:r,rootBoundary:i,strategy:n}=t;const s=[...r==="clippingAncestors"?Ya(e,this._c):[].concat(r),i],o=s[0],l=s.reduce((a,h)=>{const p=Bn(e,h,n);return a.top=Ct(p.top,a.top),a.right=fi(p.right,a.right),a.bottom=fi(p.bottom,a.bottom),a.left=Ct(p.left,a.left),a},Bn(e,o,n));return{width:l.right-l.left,height:l.bottom-l.top,x:l.left,y:l.top}}function Va(t){const{width:e,height:r}=Es(t);return{width:e,height:r}}function Ka(t,e,r){const i=Xe(e),n=it(e),s=r==="fixed",o=wt(t,!0,s,e);let l={scrollLeft:0,scrollTop:0};const a=at(0);if(i||!i&&!s)if((lt(e)!=="body"||nr(n))&&(l=Rr(e)),i){const g=wt(e,!0,s,e);a.x=g.x+e.clientLeft,a.y=g.y+e.clientTop}else n&&(a.x=As(n));const h=o.left+l.scrollLeft-a.x,p=o.top+l.scrollTop-a.y;return{x:h,y:p,width:o.width,height:o.height}}function Un(t,e){return!Xe(t)||De(t).position==="fixed"?null:e?e(t):t.offsetParent}function Os(t,e){const r=Ce(t);if(!Xe(t)||Ms(t))return r;let i=Un(t,e);for(;i&&Da(i)&&De(i).position==="static";)i=Un(i,e);return i&&(lt(i)==="html"||lt(i)==="body"&&De(i).position==="static"&&!Ni(i))?r:i||Na(t)||r}const Ja=async function(t){const e=this.getOffsetParent||Os,r=this.getDimensions;return{reference:Ka(t.reference,await e(t.floating),t.strategy),floating:{x:0,y:0,...await r(t.floating)}}};function Za(t){return De(t).direction==="rtl"}const Ga={convertOffsetParentRelativeRectToViewportRelativeRect:Ua,getDocumentElement:it,getClippingRect:Xa,getOffsetParent:Os,getElementRects:Ja,getClientRects:Ha,getDimensions:Va,getScale:Rt,isElement:Qe,isRTL:Za};function Qa(t,e){let r=null,i;const n=it(t);function s(){var l;clearTimeout(i),(l=r)==null||l.disconnect(),r=null}function o(l,a){l===void 0&&(l=!1),a===void 0&&(a=1),s();const{left:h,top:p,width:g,height:b}=t.getBoundingClientRect();if(l||e(),!g||!b)return;const m=vr(p),_=vr(n.clientWidth-(h+g)),k=vr(n.clientHeight-(p+b)),z=vr(h),I={rootMargin:-m+"px "+-_+"px "+-k+"px "+-z+"px",threshold:Ct(0,fi(1,a))||1};let f=!0;function y(w){const E=w[0].intersectionRatio;if(E!==a){if(!f)return o();E?o(!1,E):i=setTimeout(()=>{o(!1,1e-7)},100)}f=!1}try{r=new IntersectionObserver(y,{...I,root:n.ownerDocument})}catch{r=new IntersectionObserver(y,I)}r.observe(t)}return o(!0),s}function el(t,e,r,i){i===void 0&&(i={});const{ancestorScroll:n=!0,ancestorResize:s=!0,elementResize:o=typeof ResizeObserver=="function",layoutShift:l=typeof IntersectionObserver=="function",animationFrame:a=!1}=i,h=qi(t),p=n||s?[...h?Gt(h):[],...Gt(e)]:[];p.forEach(I=>{n&&I.addEventListener("scroll",r,{passive:!0}),s&&I.addEventListener("resize",r)});const g=h&&l?Qa(h,r):null;let b=-1,m=null;o&&(m=new ResizeObserver(I=>{let[f]=I;f&&f.target===h&&m&&(m.unobserve(e),cancelAnimationFrame(b),b=requestAnimationFrame(()=>{var y;(y=m)==null||y.observe(e)})),r()}),h&&!a&&m.observe(h),m.observe(e));let _,k=a?wt(t):null;a&&z();function z(){const I=wt(t);k&&(I.x!==k.x||I.y!==k.y||I.width!==k.width||I.height!==k.height)&&r(),k=I,_=requestAnimationFrame(z)}return r(),()=>{var I;p.forEach(f=>{n&&f.removeEventListener("scroll",r),s&&f.removeEventListener("resize",r)}),g==null||g(),(I=m)==null||I.disconnect(),m=null,a&&cancelAnimationFrame(_)}}const tl=(t,e,r)=>{const i=new Map,n={platform:Ga,...r},s={...n.platform,_c:i};return Ta(t,e,{...n,platform:s})};var rl=Object.defineProperty,il=Object.getOwnPropertyDescriptor,jr=(t,e,r,i)=>{for(var n=i>1?void 0:i?il(e,r):e,s=t.length-1,o;s>=0;s--)(o=t[s])&&(n=(i?o(e,r,n):o(n))||n);return i&&n&&rl(e,r,n),n};let Qt=class extends _e{constructor(){super(...arguments),this.open=!1,this.parent=null,this.unstyled=!1,this._clickEventListener=()=>{this.open=!1},this._keyboardEventListener=t=>{const{code:e}=t;["Escape"].includes(e)&&this._handleKeyboard(e)}}_handleKeyboard(t){this.clientHeight}_overlayCleanup(){}connectedCallback(){super.connectedCallback(),this.unstyled||setTimeout(()=>{const t=this.parent||this.renderRoot.querySelector("[name=trigger]").assignedNodes()[0],e=this.renderRoot.querySelector("#dropdown"),r=()=>{e.classList.contains("open")&&tl(t,e,{strategy:"fixed"}).then(({x:i,y:n})=>{Object.assign(e.style,{left:`${i}px`,top:`${n}px`,width:`${t.getBoundingClientRect().width}px`})})};this._overlayCleanup=el(t,e,r)})}disconnectedCallback(){super.disconnectedCallback(),this._overlayCleanup(),this.getRootNode().removeEventListener("keydown",this._keyboardEventListener),window.removeEventListener("click",this._clickEventListener)}render(){return F`
      <style>
        #dropdown {
          display: none;
        }
        #dropdown.open {
          display: block;
        }
        ${this.unstyled?ae:F`
              eox-dropdown { height: 100%;} #dropdown { position: fixed; top:
              0px; left: 0; width: 100%; margin: 0; padding: 0; background:
              white; border-bottom-left-radius: 4px; border-bottom-right-radius:
              4px; box-shadow: 0 4px 4px #0007; cursor: default; max-height:
              200px; overflow-y: auto; z-index: 99;}
            `}
      </style>
      <slot name="trigger"></slot>
      <div id="dropdown">
        <slot name="content"></slot>
      </div>
    `}updated(t){if(t.has("open")){const e=this.renderRoot.querySelector("#dropdown");this.open?e.classList.add("open"):e.classList.remove("open"),this.requestUpdate()}}firstUpdated(){window.addEventListener("click",this._clickEventListener),this.getRootNode().addEventListener("keydown",this._keyboardEventListener),this.renderRoot.querySelector("[name=trigger]").assignedNodes()[0].addEventListener("focus",()=>{this.open=!0})}};jr([G({type:Boolean})],Qt.prototype,"open",2);jr([G()],Qt.prototype,"parent",2);jr([G({type:Boolean})],Qt.prototype,"unstyled",2);Qt=jr([Re("eox-dropdown")],Qt);var nl=Object.defineProperty,sl=Object.getOwnPropertyDescriptor,Tr=(t,e,r,i)=>{for(var n=i>1?void 0:i?sl(e,r):e,s=t.length-1,o;s>=0;s--)(o=t[s])&&(n=(i?o(e,r,n):o(n))||n);return i&&n&&nl(e,r,n),n};let er=class extends _e{constructor(){super(...arguments),this.items=[],this.titleProperty="title",this.unstyled=!1,this._keyboardEventListener=t=>{const{code:e}=t;this.parentElement.classList.contains("hidden")&&["ArrowLeft","ArrowRight","Backspace"].includes(e)||(e==="Space"&&t.preventDefault(),["Escape","Space","Enter"].includes(e)||t.stopPropagation(),["ArrowLeft","ArrowRight","Escape","Backspace"].includes(e)&&this._handleKeyboard(e,t.target.value??""))}}_dispatchEvent(){this.dispatchEvent(new CustomEvent("items-selected",{detail:this.items}))}_handleKeyboard(t,e){const r=this.renderRoot.querySelector(".chip.highlighted");if((t==="Escape"||e)&&r&&r.classList.remove("highlighted"),t==="Backspace"&&!e){if(this.items.length){r&&this.items.splice(Array.from(this.renderRoot.querySelectorAll(".chip")).indexOf(r),1);const i=this.renderRoot.querySelectorAll(".chip")[this.renderRoot.querySelectorAll(".chip").length-1];i.classList.contains("highlighted")||i.classList.add("highlighted"),this.requestUpdate()}this._dispatchEvent()}if((t==="ArrowLeft"||t==="ArrowRight")&&!e){if(this.renderRoot.querySelectorAll(".chip").length<1)return;let i=0;const n=this.renderRoot.querySelector(".chip.highlighted");n&&(i=Array.from(this.renderRoot.querySelectorAll(".chip")).indexOf(n),n.classList.remove("highlighted")),i=i+(t==="ArrowLeft"?-1:1),t==="ArrowLeft"&&i<0&&(i=this.renderRoot.querySelectorAll(".chip").length-1),t==="ArrowRight"&&i>this.renderRoot.querySelectorAll(".chip").length-1&&(i=0),Array.from(this.renderRoot.querySelectorAll(".chip"))[i].classList.add("highlighted")}}connectedCallback(){super.connectedCallback(),this.getRootNode().addEventListener("keydown",this._keyboardEventListener)}disconnectedCallback(){super.disconnectedCallback(),this.getRootNode().removeEventListener("keydown",this._keyboardEventListener)}render(){return F`
      <style>
        .chip.highlighted {
          background: lightgrey;
        }
        .chip-title {
          pointer-events: none;
        }
        ${this.unstyled?ae:F`
              .chip-container { display: flex; flex: 0; } .chip { display: flex;
              align-items: center; background: #00417022; border-radius: 4px;
              margin-right: 4px; padding: 5px 10px; font-size: small; cursor:
              default; white-space: nowrap; } .chip.highlighted { background:
              #004170; color: white; } .chip-close { cursor: pointer;
              margin-left: 4px; }
            `}
      </style>
      <span class="chip-container">
        ${Vt(this.items,t=>F`
            <span
              class="chip"
              @click=${e=>{this.renderRoot.querySelectorAll(".chip").forEach(r=>{r.classList.remove("highlighted")}),e.target.classList.add("highlighted"),this.requestUpdate()}}
            >
              <span class="chip-title"
                >${t[this.titleProperty]}</span
              >
              ${de(t._inProgress,()=>t.stringifiedState?"":F` ... `)}
              ${de(t.stringifiedState,()=>F`: ${t.stringifiedState}`)}
              <span
                class="chip-close"
                @click=${e=>{e.stopPropagation(),this.items.splice(this.items.indexOf(t),1),this._dispatchEvent(),this.requestUpdate()}}
                >✕</span
              >
            </span>
          `)}
      </span>
    `}};Tr([G({type:Array})],er.prototype,"items",2);Tr([G()],er.prototype,"titleProperty",2);Tr([G({type:Boolean})],er.prototype,"unstyled",2);er=Tr([Re("eox-itemfilter-chips")],er);var ol=Object.defineProperty,al=Object.getOwnPropertyDescriptor,Ke=(t,e,r,i)=>{for(var n=i>1?void 0:i?al(e,r):e,s=t.length-1,o;s>=0;s--)(o=t[s])&&(n=(i?o(e,r,n):o(n))||n);return i&&n&&ol(e,r,n),n};let Ue=class extends _e{constructor(){super(...arguments),this.idProperty="id",this.items=[],this.titleProperty="title",this.itemTitleProperty=this.titleProperty,this.multiple=!1,this.unstyled=!1,this.multiStep=!1,this.inputText="",this.selectedItems=[],this._keyboardEventListener=t=>{const{code:e}=t;["ArrowUp","ArrowDown","Escape","Backspace"].includes(e)&&this._handleKeyboard(e)}}_handleKeyboard(t){var e,r,i,n;if(this.clientHeight!==0){if(t==="Escape"){if(this.selectedItems.length<1||this.multiple){this.renderRoot.querySelector("input").value!==""?this.renderRoot.querySelector("input").value="":this.renderRoot.querySelector("eox-dropdown").open=!1;return}this.multiple||(this.renderRoot.querySelector("input").value!==this.selectedItems[0][this.titleProperty]?this.renderRoot.querySelector("input").value=this.selectedItems[0][this.titleProperty]:this.renderRoot.querySelector("eox-dropdown").open=!1);return}(t==="ArrowDown"||t==="ArrowUp")&&(this.renderRoot.querySelector("eox-dropdown").open=!0,(e=this.parentElement)!=null&&e.inline&&this.renderRoot.querySelector("eox-selectionlist")._handleKeyboard(t)),this.renderRoot.querySelector("input").select(),(r=this.parentElement)!=null&&r.inline&&(["ArrowUp","ArrowDown"].includes(t)||((n=(i=this.parentElement.parentElement)==null?void 0:i.parentElement)==null?void 0:n.querySelector("#inline-input")).focus())}}_handleHighlight(t){t[0]._inProgress||(this.renderRoot.querySelector("input").value=t[0][this.titleProperty]||"",this.renderRoot.querySelector("input").select())}_handleSelect(t){var e;t.length>0&&this.multiStep&&t.forEach(r=>{this.selectedItems.includes(r)||(r._inProgress=!0)}),this.selectedItems=t,t.length>0?this.multiple?(this.renderRoot.querySelector("input").value="",this.renderRoot.querySelector("input").focus()):(this.renderRoot.querySelector("input").value=t[0][this.titleProperty],t[0]._inProgress||(this.renderRoot.querySelector("eox-dropdown").open=!1)):(this.renderRoot.querySelector("input").select(),this.renderRoot.querySelector("input").focus()),this._dispatchEvent(),this.requestUpdate(),(e=this.renderRoot.querySelector("eox-itemfilter-chips"))==null||e.requestUpdate()}_dispatchEvent(){this.dispatchEvent(new CustomEvent("items-selected",{detail:this.selectedItems}))}disconnectedCallback(){super.disconnectedCallback(),this.getRootNode().removeEventListener("keydown",this._keyboardEventListener)}firstUpdated(){this.getRootNode().addEventListener("keydown",this._keyboardEventListener)}updated(t){t.has("selectedItems")&&this._handleSelect(this.selectedItems)}render(){return F`
      <style>
        :host,
        .container {
          display: flex;
        }
        #dropdown {
          display: none;
        }
        ${this.unstyled?ae:F`
              ${ji} :host { position: relative; } .container { width: 100%;
              position: relative; border: 1px solid #00417066; border-radius:
              4px; height: 24px; padding: 5px; flex: 1; justify-content:
              space-between; cursor: text; overflow-x: auto; } .container:hover
              { border: 1px solid #004170; } .input-container { display: flex;
              flex: 1; align-items: center; } input, input:focus { height: 100%;
              border: none; outline: none; } .button-container { display: flex;
              align-items: center; justify-content: center; position: absolute;
              right: 1px; top: 5px; height: calc(100% - 10px); width: 34px;
              background: white; } button.icon { color: #004170; height: 24px;
              font-size: large; width: unset; } .container::-webkit-scrollbar {
              height: 2px; } .container::-webkit-scrollbar-thumb { background:
              lightgrey; border-radius: 2px;} .hidden {height: 1px; padding: 0;
              border: none;} .hidden:hover {border: none} .hidden input {
              opacity: 0% }
            `}
      </style>
      <div
        class="container"
        part="container"
        @click=${t=>{t.stopPropagation(),this.renderRoot.querySelector("input[type=text]").focus()}}
      >
        ${de(this.multiple,()=>F`
            <eox-itemfilter-chips
              .items=${this.selectedItems}
              .titleProperty=${this.titleProperty}
              .unstyled=${this.unstyled}
            ></eox-itemfilter-chips>
          `)}
        <div class="input-container">
          <eox-dropdown
            .parent=${this.parentNode.parentNode}
            .unstyled=${this.unstyled}
          >
            <input
              slot="trigger"
              type="text"
              @focus=${()=>{this.inputText="",this.requestUpdate()}}
              @input=${t=>{this.inputText=t.target.value.toLowerCase()}}
            />
            ${de(this.items.length>0,()=>F`
                <eox-selectionlist
                  slot="content"
                  .filter=${this.inputText}
                  .idProperty=${this.idProperty}
                  .titleProperty=${this.titleProperty}
                  .items=${this.items.filter(t=>this.multiStep?!t.stringifiedState:!0).filter(t=>this.inputText?t[this.titleProperty].toLowerCase().includes(this.inputText.toLowerCase()):!0)}
                  .multiple=${this.multiStep?!0:this.multiple}
                  .disableKeyboardEvents=${this.multiStep}
                  .selectedItems=${this.multiStep?this.selectedItems.filter(t=>t.stringifiedState):this.selectedItems}
                  .unstyled=${this.unstyled}
                  @items-highlighted=${t=>{this._handleHighlight(t.detail)}}
                  @items-selected=${t=>{this._handleSelect(t.detail)}}
                >
                </eox-selectionlist>
              `)}
          </eox-dropdown>
        </div>
      </div>
      ${de(this.selectedItems.length>0,()=>F`
          <div class="button-container">
            <button
              class="icon"
              @click=${()=>{this._handleSelect([])}}
            >
              ✕
            </button>
          </div>
        `)}
    `}};Ke([G()],Ue.prototype,"idProperty",2);Ke([G()],Ue.prototype,"items",2);Ke([G()],Ue.prototype,"titleProperty",2);Ke([G()],Ue.prototype,"itemTitleProperty",2);Ke([G({type:Boolean})],Ue.prototype,"multiple",2);Ke([G({type:Boolean})],Ue.prototype,"unstyled",2);Ke([G({type:Boolean})],Ue.prototype,"multiStep",2);Ke([rt()],Ue.prototype,"inputText",2);Ke([rt()],Ue.prototype,"selectedItems",2);Ue=Ke([Re("eox-autocomplete")],Ue);var ll=Object.defineProperty,cl=Object.getOwnPropertyDescriptor,Je=(t,e,r,i)=>{for(var n=i>1?void 0:i?cl(e,r):e,s=t.length-1,o;s>=0;s--)(o=t[s])&&(n=(i?o(e,r,n):o(n))||n);return i&&n&&ll(e,r,n),n};let He=class extends _e{constructor(){super(...arguments),this.filter="",this.idProperty="id",this.items=[],this.titleProperty="title",this.multiple=!1,this.selectedItems=[],this.unstyled=!1,this.noShadow=!1,this._currentHighlight=null,this._keyboardEventListener=t=>{["ArrowDown","ArrowUp","Enter","Escape"].includes(t.code)&&this._handleKeyboard(t.code)}}_handleKeyboard(t){if(this.clientHeight===0)return;const e=this.renderRoot.querySelector("li.highlighted");if(t==="Escape"){this._currentHighlight&&(this._currentHighlight=null);return}if(t==="Enter"){if(e){const s=this.items.find(o=>o[this.idProperty]===e.dataset.identifier);this._handleSelect(s),this.requestUpdate()}return}const r=this.renderRoot.querySelectorAll("li");let i=-1;e&&(delete e.dataset.highlighted,i=Array.from(r).indexOf(e)),t==="ArrowDown"&&(i++,i>r.length-1&&(i=0)),t==="ArrowUp"&&(i--,i<0&&(i=r.length-1));const n=Array.from(r)[i];n&&(this._currentHighlight=this.items.find(s=>s[this.idProperty]===n.dataset.identifier)),this.dispatchEvent(new CustomEvent("items-highlighted",{detail:[this._currentHighlight]}))}_handleSelect(t){if(t)if(this.multiple){const e=this.selectedItems.find(r=>r[this.idProperty]===t[this.idProperty]);e?this.selectedItems.splice(this.selectedItems.indexOf(e),1):this.selectedItems.push(t)}else this.selectedItems=[t];else this.selectedItems=[],this._currentHighlight=null;this._dispatchEvent()}_dispatchEvent(){this.dispatchEvent(new CustomEvent("items-selected",{detail:this.selectedItems}))}disconnectedCallback(){super.disconnectedCallback(),this.getRootNode().removeEventListener("keydown",this._keyboardEventListener)}firstUpdated(){this.getRootNode().addEventListener("keydown",this._keyboardEventListener)}updated(t){t.has("filter")&&(this.filter.length>0?setTimeout(()=>{const e=this.renderRoot.querySelectorAll("li")[0];e&&(this._currentHighlight=this.items.find(r=>r[this.idProperty]===e.dataset.identifier))}):this._currentHighlight=null)}createRenderRoot(){return this.noShadow?this:super.createRenderRoot()}render(){return F`
      <style>
        ${Ri}
        :host {
          height: auto;
        }
        ul {
          width: 100%;
        }
        li.highlighted {
          background: lightgrey;
        }
        ${!this.unstyled&&Ti}
      </style>
      <ul>
        ${ys(this.items.filter(t=>this.filter?t[this.titleProperty].toLowerCase().includes(this.filter.toLowerCase()):!0),t=>t[this.idProperty],t=>F`
            <li
              class=${this._currentHighlight===t?"highlighted":ae}
              data-identifier=${t[this.idProperty]}
              data-title=${t[this.titleProperty]}
              @mouseenter=${()=>{this._currentHighlight=t}}
              @mouseleave=${()=>{this._currentHighlight=null}}
            >
              <label>
                <input
                  type="${this.multiple?"checkbox":"radio"}"
                  .checked=${!!this.selectedItems.find(e=>e[this.idProperty]===t[this.idProperty])||ae}
                  @change=${()=>this._handleSelect(t)}
                />
                <span class="title"
                  >${t[this.titleProperty]}</span
                >
              </label>
            </li>
          `)}
      </ul>
    `}};Je([G()],He.prototype,"filter",2);Je([G()],He.prototype,"idProperty",2);Je([G()],He.prototype,"items",2);Je([G()],He.prototype,"titleProperty",2);Je([G({type:Boolean})],He.prototype,"multiple",2);Je([G()],He.prototype,"selectedItems",2);Je([G({type:Boolean})],He.prototype,"unstyled",2);Je([G({type:Boolean})],He.prototype,"noShadow",2);Je([rt()],He.prototype,"_currentHighlight",2);He=Je([Re("eox-selectionlist")],He);var hl=Object.defineProperty,ul=Object.getOwnPropertyDescriptor,Dr=(t,e,r,i)=>{for(var n=i>1?void 0:i?ul(e,r):e,s=t.length-1,o;s>=0;s--)(o=t[s])&&(n=(i?o(e,r,n):o(n))||n);return i&&n&&hl(e,r,n),n};let tr=class extends _e{constructor(){super(...arguments),this.inline=!1,this.unstyled=!1}reset(){this.renderRoot.querySelectorAll("input[type='checkbox']").forEach(t=>{t instanceof HTMLInputElement&&(t.checked=!1)}),qt(this.filterObject),this.requestUpdate()}createRenderRoot(){return this}_getItems(){const t="sort"in this.filterObject?this.filterObject.sort:(e,r)=>e.localeCompare(r);return Object.keys(this.filterObject.state).sort(t).map(e=>({id:e,title:e.replace(/^./,e[0].toUpperCase())}))}_getSelectedItems(){return Object.keys(this.filterObject.state).filter(t=>this.filterObject.state[t]).map(t=>({id:t,title:t.replace(/^./,t[0].toUpperCase())}))}_handleSelected(t){var e;Object.keys(this.filterObject.state).forEach(r=>{this.filterObject.state[r]=t.map(i=>i.id).includes(r)}),this.filterObject.stringifiedState=Object.keys(this.filterObject.state).filter(r=>this.filterObject.state[r]).join(", "),((e=this.filterObject.stringifiedState)==null?void 0:e.length)>0&&(this.filterObject.dirty=!0),this.dispatchEvent(new CustomEvent("filter"))}render(){return de(this.filterObject,()=>F`
        ${de(this.inline||Object.keys(this.filterObject.state).length>10,()=>F`
            <eox-autocomplete
              multiple
              .items=${this._getItems()}
              .selectedItems=${this._getSelectedItems()}
              .unstyled=${this.unstyled}
              @items-selected=${t=>this._handleSelected(t.detail)}
            >
            </eox-autocomplete>
          `,()=>F`
            <eox-selectionlist
              .noShadow=${!this.inline}
              multiple
              .items=${this._getItems()}
              .selectedItems=${this._getSelectedItems()}
              .unstyled=${this.unstyled}
              @items-selected=${t=>this._handleSelected(t.detail)}
            ></eox-selectionlist>
          `)}
      `)}};Dr([G()],tr.prototype,"filterObject",2);Dr([G({type:Boolean})],tr.prototype,"inline",2);Dr([G({type:Boolean})],tr.prototype,"unstyled",2);tr=Dr([Re("eox-itemfilter-multiselect")],tr);var dl="Expected a function",Hn=NaN,pl="[object Symbol]",fl=/^\s+|\s+$/g,gl=/^[-+]0x[0-9a-f]+$/i,yl=/^0b[01]+$/i,ml=/^0o[0-7]+$/i,vl=parseInt,bl=typeof Pt=="object"&&Pt&&Pt.Object===Object&&Pt,xl=typeof self=="object"&&self&&self.Object===Object&&self,wl=bl||xl||Function("return this")(),$l=Object.prototype,_l=$l.toString,El=Math.max,Sl=Math.min,ui=function(){return wl.Date.now()};function Ml(t,e,r){var i,n,s,o,l,a,h=0,p=!1,g=!1,b=!0;if(typeof t!="function")throw new TypeError(dl);e=Fn(e)||0,gi(r)&&(p=!!r.leading,g="maxWait"in r,s=g?El(Fn(r.maxWait)||0,e):s,b="trailing"in r?!!r.trailing:b);function m(S){var M=i,L=n;return i=n=void 0,h=S,o=t.apply(L,M),o}function _(S){return h=S,l=setTimeout(I,e),p?m(S):o}function k(S){var M=S-a,L=S-h,B=e-M;return g?Sl(B,s-L):B}function z(S){var M=S-a,L=S-h;return a===void 0||M>=e||M<0||g&&L>=s}function I(){var S=ui();if(z(S))return f(S);l=setTimeout(I,k(S))}function f(S){return l=void 0,b&&i?m(S):(i=n=void 0,o)}function y(){l!==void 0&&clearTimeout(l),h=0,i=a=n=l=void 0}function w(){return l===void 0?o:f(ui())}function E(){var S=ui(),M=z(S);if(i=arguments,n=this,a=S,M){if(l===void 0)return _(a);if(g)return l=setTimeout(I,e),m(a)}return l===void 0&&(l=setTimeout(I,e)),o}return E.cancel=y,E.flush=w,E}function gi(t){var e=typeof t;return!!t&&(e=="object"||e=="function")}function Al(t){return!!t&&typeof t=="object"}function kl(t){return typeof t=="symbol"||Al(t)&&_l.call(t)==pl}function Fn(t){if(typeof t=="number")return t;if(kl(t))return Hn;if(gi(t)){var e=typeof t.valueOf=="function"?t.valueOf():t;t=gi(e)?e+"":e}if(typeof t!="string")return t===0?t:+t;t=t.replace(fl,"");var r=yl.test(t);return r||ml.test(t)?vl(t.slice(2),r?2:8):gl.test(t)?Hn:+t}var Ol=Ml;const Ps=Li(Ol);var Pl=Object.defineProperty,Ll=Object.getOwnPropertyDescriptor,Ls=(t,e,r,i)=>{for(var n=i>1?void 0:i?Ll(e,r):e,s=t.length-1,o;s>=0;s--)(o=t[s])&&(n=(i?o(e,r,n):o(n))||n);return i&&n&&Pl(e,r,n),n};let yi=class extends _e{constructor(){super(...arguments),this.inputHandler=t=>{const[e,r]=t.detail.values;(e!==this.filterObject.state.min||r!=this.filterObject.state.max)&&([this.filterObject.state.min,this.filterObject.state.max]=[e,r],this.filterObject.dirty=!0),this.filterObject.dirty&&(this.filterObject.stringifiedState=`${Lt(e)} - ${Lt(r)}`),this.dispatchEvent(new CustomEvent("filter")),this.requestUpdate()},this.debouncedInputHandler=Ps(this.inputHandler,0,{leading:!0})}reset(){qt(this.filterObject),this.requestUpdate()}createRenderRoot(){return this}render(){return de(this.filterObject,()=>F`
        <div class="range-before">
          ${this.filterObject.format==="date"?Lt.unix(this.filterObject.state.min):this.filterObject.state.min}
        </div>
        <tc-range-slider
          min="${this.filterObject.min}"
          max="${this.filterObject.max}"
          value1="${this.filterObject.state.min}"
          value2="${this.filterObject.state.max}"
          step="1"
          @change=${this.debouncedInputHandler}
        ></tc-range-slider>
        <div class="range-after">
          ${this.filterObject.format==="date"?Lt.unix(this.filterObject.state.max):this.filterObject.state.max}
        </div>
      `)}};Ls([G()],yi.prototype,"filterObject",2);yi=Ls([Re("eox-itemfilter-range")],yi);var Cl=Object.defineProperty,Rl=Object.getOwnPropertyDescriptor,Nr=(t,e,r,i)=>{for(var n=i>1?void 0:i?Rl(e,r):e,s=t.length-1,o;s>=0;s--)(o=t[s])&&(n=(i?o(e,r,n):o(n))||n);return i&&n&&Cl(e,r,n),n};let rr=class extends _e{constructor(){super(...arguments),this.inline=!1,this.unstyled=!1}reset(){this.renderRoot.querySelectorAll("input[type='radio']").forEach(t=>{t instanceof HTMLInputElement&&(t.checked=!1)}),qt(this.filterObject),this.requestUpdate()}createRenderRoot(){return this}_getItems(){const t="sort"in this.filterObject?this.filterObject.sort:(e,r)=>e.localeCompare(r);return Object.keys(this.filterObject.state).sort(t).map(e=>({id:e,title:e.replace(/^./,e[0].toUpperCase())}))}_getSelectedItems(){return Object.keys(this.filterObject.state).filter(t=>this.filterObject.state[t]).map(t=>({id:t,title:t.replace(/^./,t[0].toUpperCase())}))}_handleSelected(t){var e;Object.keys(this.filterObject.state).forEach(r=>{this.filterObject.state[r]=t.detail.map(i=>i.id).includes(r)}),this.filterObject.stringifiedState=Object.keys(this.filterObject.state).filter(r=>this.filterObject.state[r])[0],((e=this.filterObject.stringifiedState)==null?void 0:e.length)>0&&(this.filterObject.dirty=!0),this.dispatchEvent(new CustomEvent("filter"))}render(){return de(this.filterObject,()=>F`
        ${de(this.inline||Object.keys(this.filterObject.state).length>10,()=>F`
            <eox-autocomplete
              .items=${this._getItems()}
              .selectedItems=${this._getSelectedItems()}
              .unstyled=${this.unstyled}
              @items-selected=${t=>this._handleSelected(t)}
            >
            </eox-autocomplete>
          `,()=>F`
            <eox-selectionlist
              .noShadow=${!this.inline}
              .items=${this._getItems()}
              .selectedItems=${this._getSelectedItems()}
              .unstyled=${this.unstyled}
              @items-selected=${t=>this._handleSelected(t)}
            ></eox-selectionlist>
          `)}
      `)}};Nr([G()],rr.prototype,"filterObject",2);Nr([G({type:Boolean})],rr.prototype,"inline",2);Nr([G({type:Boolean})],rr.prototype,"unstyled",2);rr=Nr([Re("eox-itemfilter-select")],rr);var Se=63710088e-1,Bi={centimeters:Se*100,centimetres:Se*100,degrees:Se/111325,feet:Se*3.28084,inches:Se*39.37,kilometers:Se/1e3,kilometres:Se/1e3,meters:Se,metres:Se,miles:Se/1609.344,millimeters:Se*1e3,millimetres:Se*1e3,nauticalmiles:Se/1852,radians:1,yards:Se*1.0936},jl={centimeters:100,centimetres:100,degrees:1/111325,feet:3.28084,inches:39.37,kilometers:1/1e3,kilometres:1/1e3,meters:1,metres:1,miles:1/1609.344,millimeters:1e3,millimetres:1e3,nauticalmiles:1/1852,radians:1/Se,yards:1.0936133},mi={acres:247105e-9,centimeters:1e4,centimetres:1e4,feet:10.763910417,hectares:1e-4,inches:1550.003100006,kilometers:1e-6,kilometres:1e-6,meters:1,metres:1,miles:386e-9,millimeters:1e6,millimetres:1e6,yards:1.195990046};function Ne(t,e,r){r===void 0&&(r={});var i={type:"Feature"};return(r.id===0||r.id)&&(i.id=r.id),r.bbox&&(i.bbox=r.bbox),i.properties=e||{},i.geometry=t,i}function Tl(t,e,r){switch(t){case"Point":return We(e).geometry;case"LineString":return Be(e).geometry;case"Polygon":return Ui(e).geometry;case"MultiPoint":return Cs(e).geometry;case"MultiLineString":return Hi(e).geometry;case"MultiPolygon":return Rs(e).geometry;default:throw new Error(t+" is invalid")}}function We(t,e,r){if(r===void 0&&(r={}),!t)throw new Error("coordinates is required");if(!Array.isArray(t))throw new Error("coordinates must be an Array");if(t.length<2)throw new Error("coordinates must be at least 2 numbers long");if(!Ar(t[0])||!Ar(t[1]))throw new Error("coordinates must contain numbers");var i={type:"Point",coordinates:t};return Ne(i,e,r)}function Dl(t,e,r){return r===void 0&&(r={}),ct(t.map(function(i){return We(i,e)}),r)}function Ui(t,e,r){r===void 0&&(r={});for(var i=0,n=t;i<n.length;i++){var s=n[i];if(s.length<4)throw new Error("Each LinearRing of a Polygon must have 4 or more Positions.");for(var o=0;o<s[s.length-1].length;o++)if(s[s.length-1][o]!==s[0][o])throw new Error("First and last Position are not equivalent.")}var l={type:"Polygon",coordinates:t};return Ne(l,e,r)}function Nl(t,e,r){return r===void 0&&(r={}),ct(t.map(function(i){return Ui(i,e)}),r)}function Be(t,e,r){if(r===void 0&&(r={}),t.length<2)throw new Error("coordinates must be an array of two or more positions");var i={type:"LineString",coordinates:t};return Ne(i,e,r)}function Il(t,e,r){return r===void 0&&(r={}),ct(t.map(function(i){return Be(i,e)}),r)}function ct(t,e){e===void 0&&(e={});var r={type:"FeatureCollection"};return e.id&&(r.id=e.id),e.bbox&&(r.bbox=e.bbox),r.features=t,r}function Hi(t,e,r){r===void 0&&(r={});var i={type:"MultiLineString",coordinates:t};return Ne(i,e,r)}function Cs(t,e,r){r===void 0&&(r={});var i={type:"MultiPoint",coordinates:t};return Ne(i,e,r)}function Rs(t,e,r){r===void 0&&(r={});var i={type:"MultiPolygon",coordinates:t};return Ne(i,e,r)}function ql(t,e,r){r===void 0&&(r={});var i={type:"GeometryCollection",geometries:t};return Ne(i,e,r)}function Bl(t,e){if(e===void 0&&(e=0),e&&!(e>=0))throw new Error("precision must be a positive number");var r=Math.pow(10,e||0);return Math.round(t*r)/r}function js(t,e){e===void 0&&(e="kilometers");var r=Bi[e];if(!r)throw new Error(e+" units is invalid");return t*r}function Fi(t,e){e===void 0&&(e="kilometers");var r=Bi[e];if(!r)throw new Error(e+" units is invalid");return t/r}function Ul(t,e){return Ts(Fi(t,e))}function Hl(t){var e=t%360;return e<0&&(e+=360),e}function Ts(t){var e=t%(2*Math.PI);return e*180/Math.PI}function Fl(t){var e=t%360;return e*Math.PI/180}function zl(t,e,r){if(e===void 0&&(e="kilometers"),r===void 0&&(r="kilometers"),!(t>=0))throw new Error("length must be a positive number");return js(Fi(t,e),r)}function Wl(t,e,r){if(e===void 0&&(e="meters"),r===void 0&&(r="kilometers"),!(t>=0))throw new Error("area must be a positive number");var i=mi[e];if(!i)throw new Error("invalid original units");var n=mi[r];if(!n)throw new Error("invalid final units");return t/i*n}function Ar(t){return!isNaN(t)&&t!==null&&!Array.isArray(t)}function zi(t){return!!t&&t.constructor===Object}function Yl(t){if(!t)throw new Error("bbox is required");if(!Array.isArray(t))throw new Error("bbox must be an Array");if(t.length!==4&&t.length!==6)throw new Error("bbox must be an Array of 4 or 6 numbers");t.forEach(function(e){if(!Ar(e))throw new Error("bbox must only contain numbers")})}function Xl(t){if(!t)throw new Error("id is required");if(["string","number"].indexOf(typeof t)===-1)throw new Error("id must be a number or a string")}const Vl=Object.freeze(Object.defineProperty({__proto__:null,areaFactors:mi,bearingToAzimuth:Hl,convertArea:Wl,convertLength:zl,degreesToRadians:Fl,earthRadius:Se,factors:Bi,feature:Ne,featureCollection:ct,geometry:Tl,geometryCollection:ql,isNumber:Ar,isObject:zi,lengthToDegrees:Ul,lengthToRadians:Fi,lineString:Be,lineStrings:Il,multiLineString:Hi,multiPoint:Cs,multiPolygon:Rs,point:We,points:Dl,polygon:Ui,polygons:Nl,radiansToDegrees:Ts,radiansToLength:js,round:Bl,unitsFactors:jl,validateBBox:Yl,validateId:Xl},Symbol.toStringTag,{value:"Module"}));function Ds(t){if(!t)throw new Error("coord is required");if(!Array.isArray(t)){if(t.type==="Feature"&&t.geometry!==null&&t.geometry.type==="Point")return t.geometry.coordinates;if(t.type==="Point")return t.coordinates}if(Array.isArray(t)&&t.length>=2&&!Array.isArray(t[0])&&!Array.isArray(t[1]))return t;throw new Error("coord must be GeoJSON Point or an Array of numbers")}function Dt(t){if(Array.isArray(t))return t;if(t.type==="Feature"){if(t.geometry!==null)return t.geometry.coordinates}else if(t.coordinates)return t.coordinates;throw new Error("coords must be GeoJSON Feature, Geometry Object or an Array")}function Nt(t){return t.type==="Feature"?t.geometry:t}function Te(t,e,r){if(r===void 0&&(r={}),!t)throw new Error("point is required");if(!e)throw new Error("polygon is required");var i=Ds(t),n=Nt(e),s=n.type,o=e.bbox,l=n.coordinates;if(o&&Kl(i,o)===!1)return!1;s==="Polygon"&&(l=[l]);for(var a=!1,h=0;h<l.length&&!a;h++)if(zn(i,l[h][0],r.ignoreBoundary)){for(var p=!1,g=1;g<l[h].length&&!p;)zn(i,l[h][g],!r.ignoreBoundary)&&(p=!0),g++;p||(a=!0)}return a}function zn(t,e,r){var i=!1;e[0][0]===e[e.length-1][0]&&e[0][1]===e[e.length-1][1]&&(e=e.slice(0,e.length-1));for(var n=0,s=e.length-1;n<e.length;s=n++){var o=e[n][0],l=e[n][1],a=e[s][0],h=e[s][1],p=t[1]*(o-a)+l*(a-t[0])+h*(t[0]-o)===0&&(o-t[0])*(a-t[0])<=0&&(l-t[1])*(h-t[1])<=0;if(p)return!r;var g=l>t[1]!=h>t[1]&&t[0]<(a-o)*(t[1]-l)/(h-l)+o;g&&(i=!i)}return i}function Kl(t,e){return e[0]<=t[0]&&e[1]<=t[1]&&e[2]>=t[0]&&e[3]>=t[1]}function Bt(t,e,r){if(t!==null)for(var i,n,s,o,l,a,h,p=0,g=0,b,m=t.type,_=m==="FeatureCollection",k=m==="Feature",z=_?t.features.length:1,I=0;I<z;I++){h=_?t.features[I].geometry:k?t.geometry:t,b=h?h.type==="GeometryCollection":!1,l=b?h.geometries.length:1;for(var f=0;f<l;f++){var y=0,w=0;if(o=b?h.geometries[f]:h,o!==null){a=o.coordinates;var E=o.type;switch(p=r&&(E==="Polygon"||E==="MultiPolygon")?1:0,E){case null:break;case"Point":if(e(a,g,I,y,w)===!1)return!1;g++,y++;break;case"LineString":case"MultiPoint":for(i=0;i<a.length;i++){if(e(a[i],g,I,y,w)===!1)return!1;g++,E==="MultiPoint"&&y++}E==="LineString"&&y++;break;case"Polygon":case"MultiLineString":for(i=0;i<a.length;i++){for(n=0;n<a[i].length-p;n++){if(e(a[i][n],g,I,y,w)===!1)return!1;g++}E==="MultiLineString"&&y++,E==="Polygon"&&w++}E==="Polygon"&&y++;break;case"MultiPolygon":for(i=0;i<a.length;i++){for(w=0,n=0;n<a[i].length;n++){for(s=0;s<a[i][n].length-p;s++){if(e(a[i][n][s],g,I,y,w)===!1)return!1;g++}w++}y++}break;case"GeometryCollection":for(i=0;i<o.geometries.length;i++)if(Bt(o.geometries[i],e,r)===!1)return!1;break;default:throw new Error("Unknown Geometry Type")}}}}}function Jl(t,e,r,i){var n=r;return Bt(t,function(s,o,l,a,h){o===0&&r===void 0?n=s:n=e(n,s,o,l,a,h)},i),n}function Ns(t,e){var r;switch(t.type){case"FeatureCollection":for(r=0;r<t.features.length&&e(t.features[r].properties,r)!==!1;r++);break;case"Feature":e(t.properties,0);break}}function Zl(t,e,r){var i=r;return Ns(t,function(n,s){s===0&&r===void 0?i=n:i=e(i,n,s)}),i}function kr(t,e){if(t.type==="Feature")e(t,0);else if(t.type==="FeatureCollection")for(var r=0;r<t.features.length&&e(t.features[r],r)!==!1;r++);}function Gl(t,e,r){var i=r;return kr(t,function(n,s){s===0&&r===void 0?i=n:i=e(i,n,s)}),i}function Ql(t){var e=[];return Bt(t,function(r){e.push(r)}),e}function Wi(t,e){var r,i,n,s,o,l,a,h,p,g,b=0,m=t.type==="FeatureCollection",_=t.type==="Feature",k=m?t.features.length:1;for(r=0;r<k;r++){for(l=m?t.features[r].geometry:_?t.geometry:t,h=m?t.features[r].properties:_?t.properties:{},p=m?t.features[r].bbox:_?t.bbox:void 0,g=m?t.features[r].id:_?t.id:void 0,a=l?l.type==="GeometryCollection":!1,o=a?l.geometries.length:1,n=0;n<o;n++){if(s=a?l.geometries[n]:l,s===null){if(e(null,b,h,p,g)===!1)return!1;continue}switch(s.type){case"Point":case"LineString":case"MultiPoint":case"Polygon":case"MultiLineString":case"MultiPolygon":{if(e(s,b,h,p,g)===!1)return!1;break}case"GeometryCollection":{for(i=0;i<s.geometries.length;i++)if(e(s.geometries[i],b,h,p,g)===!1)return!1;break}default:throw new Error("Unknown Geometry Type")}}b++}}function ec(t,e,r){var i=r;return Wi(t,function(n,s,o,l,a){s===0&&r===void 0?i=n:i=e(i,n,s,o,l,a)}),i}function et(t,e){Wi(t,function(r,i,n,s,o){var l=r===null?null:r.type;switch(l){case null:case"Point":case"LineString":case"Polygon":return e(Ne(r,n,{bbox:s,id:o}),i,0)===!1?!1:void 0}var a;switch(l){case"MultiPoint":a="Point";break;case"MultiLineString":a="LineString";break;case"MultiPolygon":a="Polygon";break}for(var h=0;h<r.coordinates.length;h++){var p=r.coordinates[h],g={type:a,coordinates:p};if(e(Ne(g,n),i,h)===!1)return!1}})}function tc(t,e,r){var i=r;return et(t,function(n,s,o){s===0&&o===0&&r===void 0?i=n:i=e(i,n,s,o)}),i}function Is(t,e){et(t,function(r,i,n){var s=0;if(r.geometry){var o=r.geometry.type;if(!(o==="Point"||o==="MultiPoint")){var l,a=0,h=0,p=0;if(Bt(r,function(g,b,m,_,k){if(l===void 0||i>a||_>h||k>p){l=g,a=i,h=_,p=k,s=0;return}var z=Be([l,g],r.properties);if(e(z,i,n,k,s)===!1)return!1;s++,l=g})===!1)return!1}}})}function rc(t,e,r){var i=r,n=!1;return Is(t,function(s,o,l,a,h){n===!1&&r===void 0?i=s:i=e(i,s,o,l,a,h),n=!0}),i}function qs(t,e){if(!t)throw new Error("geojson is required");et(t,function(r,i,n){if(r.geometry!==null){var s=r.geometry.type,o=r.geometry.coordinates;switch(s){case"LineString":if(e(r,i,n,0,0)===!1)return!1;break;case"Polygon":for(var l=0;l<o.length;l++)if(e(Be(o[l],r.properties),i,n,l)===!1)return!1;break}}})}function ic(t,e,r){var i=r;return qs(t,function(n,s,o,l){s===0&&r===void 0?i=n:i=e(i,n,s,o,l)}),i}function nc(t,e){if(e=e||{},!zi(e))throw new Error("options is invalid");var r=e.featureIndex||0,i=e.multiFeatureIndex||0,n=e.geometryIndex||0,s=e.segmentIndex||0,o=e.properties,l;switch(t.type){case"FeatureCollection":r<0&&(r=t.features.length+r),o=o||t.features[r].properties,l=t.features[r].geometry;break;case"Feature":o=o||t.properties,l=t.geometry;break;case"Point":case"MultiPoint":return null;case"LineString":case"Polygon":case"MultiLineString":case"MultiPolygon":l=t;break;default:throw new Error("geojson is invalid")}if(l===null)return null;var a=l.coordinates;switch(l.type){case"Point":case"MultiPoint":return null;case"LineString":return s<0&&(s=a.length+s-1),Be([a[s],a[s+1]],o,e);case"Polygon":return n<0&&(n=a.length+n),s<0&&(s=a[n].length+s-1),Be([a[n][s],a[n][s+1]],o,e);case"MultiLineString":return i<0&&(i=a.length+i),s<0&&(s=a[i].length+s-1),Be([a[i][s],a[i][s+1]],o,e);case"MultiPolygon":return i<0&&(i=a.length+i),n<0&&(n=a[i].length+n),s<0&&(s=a[i][n].length-s-1),Be([a[i][n][s],a[i][n][s+1]],o,e)}throw new Error("geojson is invalid")}function sc(t,e){if(e=e||{},!zi(e))throw new Error("options is invalid");var r=e.featureIndex||0,i=e.multiFeatureIndex||0,n=e.geometryIndex||0,s=e.coordIndex||0,o=e.properties,l;switch(t.type){case"FeatureCollection":r<0&&(r=t.features.length+r),o=o||t.features[r].properties,l=t.features[r].geometry;break;case"Feature":o=o||t.properties,l=t.geometry;break;case"Point":case"MultiPoint":return null;case"LineString":case"Polygon":case"MultiLineString":case"MultiPolygon":l=t;break;default:throw new Error("geojson is invalid")}if(l===null)return null;var a=l.coordinates;switch(l.type){case"Point":return We(a,o,e);case"MultiPoint":return i<0&&(i=a.length+i),We(a[i],o,e);case"LineString":return s<0&&(s=a.length+s),We(a[s],o,e);case"Polygon":return n<0&&(n=a.length+n),s<0&&(s=a[n].length+s),We(a[n][s],o,e);case"MultiLineString":return i<0&&(i=a.length+i),s<0&&(s=a[i].length+s),We(a[i][s],o,e);case"MultiPolygon":return i<0&&(i=a.length+i),n<0&&(n=a[i].length+n),s<0&&(s=a[i][n].length-s),We(a[i][n][s],o,e)}throw new Error("geojson is invalid")}const oc=Object.freeze(Object.defineProperty({__proto__:null,coordAll:Ql,coordEach:Bt,coordReduce:Jl,featureEach:kr,featureReduce:Gl,findPoint:sc,findSegment:nc,flattenEach:et,flattenReduce:tc,geomEach:Wi,geomReduce:ec,lineEach:qs,lineReduce:ic,propEach:Ns,propReduce:Zl,segmentEach:Is,segmentReduce:rc},Symbol.toStringTag,{value:"Module"}));function Wn(t){if(!t)throw new Error("geojson is required");var e=[];return et(t,function(r){ac(r,e)}),ct(e)}function ac(t,e){var r=[],i=t.geometry;if(i!==null){switch(i.type){case"Polygon":r=Dt(i);break;case"LineString":r=[Dt(i)]}r.forEach(function(n){var s=lc(n,t.properties);s.forEach(function(o){o.id=e.length,e.push(o)})})}}function lc(t,e){var r=[];return t.reduce(function(i,n){var s=Be([i,n],e);return s.bbox=cc(i,n),r.push(s),n}),r}function cc(t,e){var r=t[0],i=t[1],n=e[0],s=e[1],o=r<n?r:n,l=i<s?i:s,a=r>n?r:n,h=i>s?i:s;return[o,l,a,h]}var Yi={exports:{}},Bs={exports:{}};(function(t,e){(function(r,i){t.exports=i()})(Pt,function(){function r(f,y,w,E,S){(function M(L,B,U,T,re){for(;T>U;){if(T-U>600){var Z=T-U+1,C=B-U+1,O=Math.log(Z),A=.5*Math.exp(2*O/3),N=.5*Math.sqrt(O*A*(Z-A)/Z)*(C-Z/2<0?-1:1),P=Math.max(U,Math.floor(B-C*A/Z+N)),K=Math.min(T,Math.floor(B+(Z-C)*A/Z+N));M(L,B,P,K,re)}var W=L[B],oe=U,ie=T;for(i(L,U,B),re(L[T],W)>0&&i(L,U,T);oe<ie;){for(i(L,oe,ie),oe++,ie--;re(L[oe],W)<0;)oe++;for(;re(L[ie],W)>0;)ie--}re(L[U],W)===0?i(L,U,ie):i(L,++ie,T),ie<=B&&(U=ie+1),B<=ie&&(T=ie-1)}})(f,y,w||0,E||f.length-1,S||n)}function i(f,y,w){var E=f[y];f[y]=f[w],f[w]=E}function n(f,y){return f<y?-1:f>y?1:0}var s=function(f){f===void 0&&(f=9),this._maxEntries=Math.max(4,f),this._minEntries=Math.max(2,Math.ceil(.4*this._maxEntries)),this.clear()};function o(f,y,w){if(!w)return y.indexOf(f);for(var E=0;E<y.length;E++)if(w(f,y[E]))return E;return-1}function l(f,y){a(f,0,f.children.length,y,f)}function a(f,y,w,E,S){S||(S=z(null)),S.minX=1/0,S.minY=1/0,S.maxX=-1/0,S.maxY=-1/0;for(var M=y;M<w;M++){var L=f.children[M];h(S,f.leaf?E(L):L)}return S}function h(f,y){return f.minX=Math.min(f.minX,y.minX),f.minY=Math.min(f.minY,y.minY),f.maxX=Math.max(f.maxX,y.maxX),f.maxY=Math.max(f.maxY,y.maxY),f}function p(f,y){return f.minX-y.minX}function g(f,y){return f.minY-y.minY}function b(f){return(f.maxX-f.minX)*(f.maxY-f.minY)}function m(f){return f.maxX-f.minX+(f.maxY-f.minY)}function _(f,y){return f.minX<=y.minX&&f.minY<=y.minY&&y.maxX<=f.maxX&&y.maxY<=f.maxY}function k(f,y){return y.minX<=f.maxX&&y.minY<=f.maxY&&y.maxX>=f.minX&&y.maxY>=f.minY}function z(f){return{children:f,height:1,leaf:!0,minX:1/0,minY:1/0,maxX:-1/0,maxY:-1/0}}function I(f,y,w,E,S){for(var M=[y,w];M.length;)if(!((w=M.pop())-(y=M.pop())<=E)){var L=y+Math.ceil((w-y)/E/2)*E;r(f,L,y,w,S),M.push(y,L,L,w)}}return s.prototype.all=function(){return this._all(this.data,[])},s.prototype.search=function(f){var y=this.data,w=[];if(!k(f,y))return w;for(var E=this.toBBox,S=[];y;){for(var M=0;M<y.children.length;M++){var L=y.children[M],B=y.leaf?E(L):L;k(f,B)&&(y.leaf?w.push(L):_(f,B)?this._all(L,w):S.push(L))}y=S.pop()}return w},s.prototype.collides=function(f){var y=this.data;if(!k(f,y))return!1;for(var w=[];y;){for(var E=0;E<y.children.length;E++){var S=y.children[E],M=y.leaf?this.toBBox(S):S;if(k(f,M)){if(y.leaf||_(f,M))return!0;w.push(S)}}y=w.pop()}return!1},s.prototype.load=function(f){if(!f||!f.length)return this;if(f.length<this._minEntries){for(var y=0;y<f.length;y++)this.insert(f[y]);return this}var w=this._build(f.slice(),0,f.length-1,0);if(this.data.children.length)if(this.data.height===w.height)this._splitRoot(this.data,w);else{if(this.data.height<w.height){var E=this.data;this.data=w,w=E}this._insert(w,this.data.height-w.height-1,!0)}else this.data=w;return this},s.prototype.insert=function(f){return f&&this._insert(f,this.data.height-1),this},s.prototype.clear=function(){return this.data=z([]),this},s.prototype.remove=function(f,y){if(!f)return this;for(var w,E,S,M=this.data,L=this.toBBox(f),B=[],U=[];M||B.length;){if(M||(M=B.pop(),E=B[B.length-1],w=U.pop(),S=!0),M.leaf){var T=o(f,M.children,y);if(T!==-1)return M.children.splice(T,1),B.push(M),this._condense(B),this}S||M.leaf||!_(M,L)?E?(w++,M=E.children[w],S=!1):M=null:(B.push(M),U.push(w),w=0,E=M,M=M.children[0])}return this},s.prototype.toBBox=function(f){return f},s.prototype.compareMinX=function(f,y){return f.minX-y.minX},s.prototype.compareMinY=function(f,y){return f.minY-y.minY},s.prototype.toJSON=function(){return this.data},s.prototype.fromJSON=function(f){return this.data=f,this},s.prototype._all=function(f,y){for(var w=[];f;)f.leaf?y.push.apply(y,f.children):w.push.apply(w,f.children),f=w.pop();return y},s.prototype._build=function(f,y,w,E){var S,M=w-y+1,L=this._maxEntries;if(M<=L)return l(S=z(f.slice(y,w+1)),this.toBBox),S;E||(E=Math.ceil(Math.log(M)/Math.log(L)),L=Math.ceil(M/Math.pow(L,E-1))),(S=z([])).leaf=!1,S.height=E;var B=Math.ceil(M/L),U=B*Math.ceil(Math.sqrt(L));I(f,y,w,U,this.compareMinX);for(var T=y;T<=w;T+=U){var re=Math.min(T+U-1,w);I(f,T,re,B,this.compareMinY);for(var Z=T;Z<=re;Z+=B){var C=Math.min(Z+B-1,re);S.children.push(this._build(f,Z,C,E-1))}}return l(S,this.toBBox),S},s.prototype._chooseSubtree=function(f,y,w,E){for(;E.push(y),!y.leaf&&E.length-1!==w;){for(var S=1/0,M=1/0,L=void 0,B=0;B<y.children.length;B++){var U=y.children[B],T=b(U),re=(Z=f,C=U,(Math.max(C.maxX,Z.maxX)-Math.min(C.minX,Z.minX))*(Math.max(C.maxY,Z.maxY)-Math.min(C.minY,Z.minY))-T);re<M?(M=re,S=T<S?T:S,L=U):re===M&&T<S&&(S=T,L=U)}y=L||y.children[0]}var Z,C;return y},s.prototype._insert=function(f,y,w){var E=w?f:this.toBBox(f),S=[],M=this._chooseSubtree(E,this.data,y,S);for(M.children.push(f),h(M,E);y>=0&&S[y].children.length>this._maxEntries;)this._split(S,y),y--;this._adjustParentBBoxes(E,S,y)},s.prototype._split=function(f,y){var w=f[y],E=w.children.length,S=this._minEntries;this._chooseSplitAxis(w,S,E);var M=this._chooseSplitIndex(w,S,E),L=z(w.children.splice(M,w.children.length-M));L.height=w.height,L.leaf=w.leaf,l(w,this.toBBox),l(L,this.toBBox),y?f[y-1].children.push(L):this._splitRoot(w,L)},s.prototype._splitRoot=function(f,y){this.data=z([f,y]),this.data.height=f.height+1,this.data.leaf=!1,l(this.data,this.toBBox)},s.prototype._chooseSplitIndex=function(f,y,w){for(var E,S,M,L,B,U,T,re=1/0,Z=1/0,C=y;C<=w-y;C++){var O=a(f,0,C,this.toBBox),A=a(f,C,w,this.toBBox),N=(S=O,M=A,L=void 0,B=void 0,U=void 0,T=void 0,L=Math.max(S.minX,M.minX),B=Math.max(S.minY,M.minY),U=Math.min(S.maxX,M.maxX),T=Math.min(S.maxY,M.maxY),Math.max(0,U-L)*Math.max(0,T-B)),P=b(O)+b(A);N<re?(re=N,E=C,Z=P<Z?P:Z):N===re&&P<Z&&(Z=P,E=C)}return E||w-y},s.prototype._chooseSplitAxis=function(f,y,w){var E=f.leaf?this.compareMinX:p,S=f.leaf?this.compareMinY:g;this._allDistMargin(f,y,w,E)<this._allDistMargin(f,y,w,S)&&f.children.sort(E)},s.prototype._allDistMargin=function(f,y,w,E){f.children.sort(E);for(var S=this.toBBox,M=a(f,0,y,S),L=a(f,w-y,w,S),B=m(M)+m(L),U=y;U<w-y;U++){var T=f.children[U];h(M,f.leaf?S(T):T),B+=m(M)}for(var re=w-y-1;re>=y;re--){var Z=f.children[re];h(L,f.leaf?S(Z):Z),B+=m(L)}return B},s.prototype._adjustParentBBoxes=function(f,y,w){for(var E=w;E>=0;E--)h(y[E],f)},s.prototype._condense=function(f){for(var y=f.length-1,w=void 0;y>=0;y--)f[y].children.length===0?y>0?(w=f[y-1].children).splice(w.indexOf(f[y]),1):this.clear():l(f[y],this.toBBox)},s})})(Bs);var hc=Bs.exports;const uc=Ci(Vl),dc=Ci(oc);function $t(t){var e=[1/0,1/0,-1/0,-1/0];return Bt(t,function(r){e[0]>r[0]&&(e[0]=r[0]),e[1]>r[1]&&(e[1]=r[1]),e[2]<r[0]&&(e[2]=r[0]),e[3]<r[1]&&(e[3]=r[1])}),e}$t.default=$t;const pc=Object.freeze(Object.defineProperty({__proto__:null,default:$t},Symbol.toStringTag,{value:"Module"})),fc=Ci(pc);var ze=hc,Us=uc,Hs=dc,At=fc.default,gc=Hs.featureEach;Hs.coordEach;Us.polygon;var Yn=Us.featureCollection;function Fs(t){var e=new ze(t);return e.insert=function(r){if(r.type!=="Feature")throw new Error("invalid feature");return r.bbox=r.bbox?r.bbox:At(r),ze.prototype.insert.call(this,r)},e.load=function(r){var i=[];return Array.isArray(r)?r.forEach(function(n){if(n.type!=="Feature")throw new Error("invalid features");n.bbox=n.bbox?n.bbox:At(n),i.push(n)}):gc(r,function(n){if(n.type!=="Feature")throw new Error("invalid features");n.bbox=n.bbox?n.bbox:At(n),i.push(n)}),ze.prototype.load.call(this,i)},e.remove=function(r,i){if(r.type!=="Feature")throw new Error("invalid feature");return r.bbox=r.bbox?r.bbox:At(r),ze.prototype.remove.call(this,r,i)},e.clear=function(){return ze.prototype.clear.call(this)},e.search=function(r){var i=ze.prototype.search.call(this,this.toBBox(r));return Yn(i)},e.collides=function(r){return ze.prototype.collides.call(this,this.toBBox(r))},e.all=function(){var r=ze.prototype.all.call(this);return Yn(r)},e.toJSON=function(){return ze.prototype.toJSON.call(this)},e.fromJSON=function(r){return ze.prototype.fromJSON.call(this,r)},e.toBBox=function(r){var i;if(r.bbox)i=r.bbox;else if(Array.isArray(r)&&r.length===4)i=r;else if(Array.isArray(r)&&r.length===6)i=[r[0],r[1],r[3],r[4]];else if(r.type==="Feature")i=At(r);else if(r.type==="FeatureCollection")i=At(r);else throw new Error("invalid geojson");return{minX:i[0],minY:i[1],maxX:i[2],maxY:i[3]}},e}Yi.exports=Fs;Yi.exports.default=Fs;var yc=Yi.exports;const mc=Li(yc);function Xi(t,e){var r={},i=[];if(t.type==="LineString"&&(t=Ne(t)),e.type==="LineString"&&(e=Ne(e)),t.type==="Feature"&&e.type==="Feature"&&t.geometry!==null&&e.geometry!==null&&t.geometry.type==="LineString"&&e.geometry.type==="LineString"&&t.geometry.coordinates.length===2&&e.geometry.coordinates.length===2){var n=Xn(t,e);return n&&i.push(n),ct(i)}var s=mc();return s.load(Wn(e)),kr(Wn(t),function(o){kr(s.search(o),function(l){var a=Xn(o,l);if(a){var h=Dt(a).join(",");r[h]||(r[h]=!0,i.push(a))}})}),ct(i)}function Xn(t,e){var r=Dt(t),i=Dt(e);if(r.length!==2)throw new Error("<intersects> line1 must only contain 2 coordinates");if(i.length!==2)throw new Error("<intersects> line2 must only contain 2 coordinates");var n=r[0][0],s=r[0][1],o=r[1][0],l=r[1][1],a=i[0][0],h=i[0][1],p=i[1][0],g=i[1][1],b=(g-h)*(o-n)-(p-a)*(l-s),m=(p-a)*(s-h)-(g-h)*(n-a),_=(o-n)*(s-h)-(l-s)*(n-a);if(b===0)return null;var k=m/b,z=_/b;if(k>=0&&k<=1&&z>=0&&z<=1){var I=n+k*(o-n),f=s+k*(l-s);return We([I,f])}return null}function vi(t,e){e===void 0&&(e={});var r=Nt(t);switch(!e.properties&&t.type==="Feature"&&(e.properties=t.properties),r.type){case"Polygon":return vc(r,e);case"MultiPolygon":return bc(r,e);default:throw new Error("invalid poly")}}function vc(t,e){e===void 0&&(e={});var r=Nt(t),i=r.coordinates,n=e.properties?e.properties:t.type==="Feature"?t.properties:{};return zs(i,n)}function bc(t,e){e===void 0&&(e={});var r=Nt(t),i=r.coordinates,n=e.properties?e.properties:t.type==="Feature"?t.properties:{},s=[];return i.forEach(function(o){s.push(zs(o,n))}),ct(s)}function zs(t,e){return t.length>1?Hi(t,e):Be(t[0],e)}function xc(t,e){var r=!0;return et(t,function(i){et(e,function(n){if(r===!1)return!1;r=wc(i.geometry,n.geometry)})}),r}function wc(t,e){switch(t.type){case"Point":switch(e.type){case"Point":return!Sc(t.coordinates,e.coordinates);case"LineString":return!Vn(e,t);case"Polygon":return!Te(t,e)}break;case"LineString":switch(e.type){case"Point":return!Vn(t,e);case"LineString":return!$c(t,e);case"Polygon":return!Kn(e,t)}break;case"Polygon":switch(e.type){case"Point":return!Te(e,t);case"LineString":return!Kn(t,e);case"Polygon":return!_c(e,t)}}return!1}function Vn(t,e){for(var r=0;r<t.coordinates.length-1;r++)if(Ec(t.coordinates[r],t.coordinates[r+1],e.coordinates))return!0;return!1}function $c(t,e){var r=Xi(t,e);return r.features.length>0}function Kn(t,e){for(var r=0,i=e.coordinates;r<i.length;r++){var n=i[r];if(Te(n,t))return!0}var s=Xi(e,vi(t));return s.features.length>0}function _c(t,e){for(var r=0,i=t.coordinates[0];r<i.length;r++){var n=i[r];if(Te(n,e))return!0}for(var s=0,o=e.coordinates[0];s<o.length;s++){var l=o[s];if(Te(l,t))return!0}var a=Xi(vi(t),vi(e));return a.features.length>0}function Ec(t,e,r){var i=r[0]-t[0],n=r[1]-t[1],s=e[0]-t[0],o=e[1]-t[1],l=i*o-n*s;return l!==0?!1:Math.abs(s)>=Math.abs(o)?s>0?t[0]<=r[0]&&r[0]<=e[0]:e[0]<=r[0]&&r[0]<=t[0]:o>0?t[1]<=r[1]&&r[1]<=e[1]:e[1]<=r[1]&&r[1]<=t[1]}function Sc(t,e){return t[0]===e[0]&&t[1]===e[1]}function Mc(t,e){var r=!1;return et(t,function(i){et(e,function(n){if(r===!0)return!0;r=!xc(i.geometry,n.geometry)})}),r}function Or(t,e,r){r===void 0&&(r={});for(var i=Ds(t),n=Dt(e),s=0;s<n.length-1;s++){var o=!1;if(r.ignoreEndVertices&&(s===0&&(o="start"),s===n.length-2&&(o="end"),s===0&&s+1===n.length-1&&(o="both")),Ac(n[s],n[s+1],i,o,typeof r.epsilon>"u"?null:r.epsilon))return!0}return!1}function Ac(t,e,r,i,n){var s=r[0],o=r[1],l=t[0],a=t[1],h=e[0],p=e[1],g=r[0]-l,b=r[1]-a,m=h-l,_=p-a,k=g*_-b*m;if(n!==null){if(Math.abs(k)>n)return!1}else if(k!==0)return!1;if(i){if(i==="start")return Math.abs(m)>=Math.abs(_)?m>0?l<s&&s<=h:h<=s&&s<l:_>0?a<o&&o<=p:p<=o&&o<a;if(i==="end")return Math.abs(m)>=Math.abs(_)?m>0?l<=s&&s<h:h<s&&s<=l:_>0?a<=o&&o<p:p<o&&o<=a;if(i==="both")return Math.abs(m)>=Math.abs(_)?m>0?l<s&&s<h:h<s&&s<l:_>0?a<o&&o<p:p<o&&o<a}else return Math.abs(m)>=Math.abs(_)?m>0?l<=s&&s<=h:h<=s&&s<=l:_>0?a<=o&&o<=p:p<=o&&o<=a;return!1}function kc(t,e){var r=Nt(t),i=Nt(e),n=r.type,s=i.type;switch(n){case"Point":switch(s){case"MultiPoint":return Oc(r,i);case"LineString":return Or(r,i,{ignoreEndVertices:!0});case"Polygon":case"MultiPolygon":return Te(r,i,{ignoreBoundary:!0});default:throw new Error("feature2 "+s+" geometry not supported")}case"MultiPoint":switch(s){case"MultiPoint":return Pc(r,i);case"LineString":return Lc(r,i);case"Polygon":case"MultiPolygon":return Cc(r,i);default:throw new Error("feature2 "+s+" geometry not supported")}case"LineString":switch(s){case"LineString":return Rc(r,i);case"Polygon":case"MultiPolygon":return jc(r,i);default:throw new Error("feature2 "+s+" geometry not supported")}case"Polygon":switch(s){case"Polygon":case"MultiPolygon":return Tc(r,i);default:throw new Error("feature2 "+s+" geometry not supported")}default:throw new Error("feature1 "+n+" geometry not supported")}}function Oc(t,e){var r,i=!1;for(r=0;r<e.coordinates.length;r++)if(Ys(e.coordinates[r],t.coordinates)){i=!0;break}return i}function Pc(t,e){for(var r=0;r<t.coordinates.length;r++){for(var i=!1,n=0;n<e.coordinates.length;n++)Ys(t.coordinates[r],e.coordinates[n])&&(i=!0);if(!i)return!1}return!0}function Lc(t,e){for(var r=!1,i=0;i<t.coordinates.length;i++){if(!Or(t.coordinates[i],e))return!1;r||(r=Or(t.coordinates[i],e,{ignoreEndVertices:!0}))}return r}function Cc(t,e){for(var r=!0,i=!1,n=0;n<t.coordinates.length;n++){if(i=Te(t.coordinates[1],e),!i){r=!1;break}i=Te(t.coordinates[1],e,{ignoreBoundary:!0})}return r&&i}function Rc(t,e){for(var r=0;r<t.coordinates.length;r++)if(!Or(t.coordinates[r],e))return!1;return!0}function jc(t,e){var r=$t(e),i=$t(t);if(!Ws(r,i))return!1;for(var n=!1,s=0;s<t.coordinates.length-1;s++){if(!Te(t.coordinates[s],e))return!1;if(n||(n=Te(t.coordinates[s],e,{ignoreBoundary:!0})),!n){var o=Dc(t.coordinates[s],t.coordinates[s+1]);n=Te(o,e,{ignoreBoundary:!0})}}return n}function Tc(t,e){var r=$t(t),i=$t(e);if(!Ws(i,r))return!1;for(var n=0;n<t.coordinates[0].length;n++)if(!Te(t.coordinates[0][n],e))return!1;return!0}function Ws(t,e){return!(t[0]>e[0]||t[2]<e[2]||t[1]>e[1]||t[3]<e[3])}function Ys(t,e){return t[0]===e[0]&&t[1]===e[1]}function Dc(t,e){return[(t[0]+e[0])/2,(t[1]+e[1])/2]}var Nc=Object.defineProperty,Ic=Object.getOwnPropertyDescriptor,sr=(t,e,r,i)=>{for(var n=i>1?void 0:i?Ic(e,r):e,s=t.length-1,o;s>=0;s--)(o=t[s])&&(n=(i?o(e,r,n):o(n))||n);return i&&n&&Nc(e,r,n),n};const qc=(t,e)=>e?Mc(t,e):!0,Bc=(t,e)=>e?kc(t,e):!0;let bi=class extends _e{reset(){qt(this.filterObject),this.renderRoot.querySelector("eox-itemfilter-spatial-filter").reset(),this.requestUpdate()}createRenderRoot(){return this}render(){return de(this.filterObject,()=>{var t;return F`
      <form style="display: inline">
      ${Vt(["intersects","within"],e=>F`
          <label>
            <input
              type="radio"
              name="mode"
              .checked="${this.filterObject.state.mode===e||ae}
              "
              value="${e}"
              @click="${()=>{this.filterObject.state.mode=e;const r=new CustomEvent("filter",{detail:{[this.filterObject.key]:{}}});this.dispatchEvent(r)}}"
            />
            <small>${e} filter geometry</small>
          </label>
        `)}
      </form>
      <eox-itemfilter-spatial-filter
        exportparts="map: spatial-filter-map"
        .geometry=${(t=this.filterObject.state)==null?void 0:t.geometry}
        @filter="${e=>{this.filterObject.state.geometry=e.detail.geometry,this.filterObject.dirty=!0,this.filterObject.stringifiedState="Polygon",this.dispatchEvent(new CustomEvent("filter"))}}"
      ></eox-itemfilter-spatial>
    `})}};sr([G()],bi.prototype,"filterObject",2);bi=sr([Re("eox-itemfilter-spatial")],bi);let Pr=class extends _e{render(){return F`<eox-map part="map" style="height: 400px"></eox-map>`}firstUpdated(){this.setup()}setup(){const t=[{type:"Vector",properties:{id:"draw"},source:{type:"Vector",...this.geometry&&{format:"GeoJSON"},...this.geometry&&{url:this.createFeatureUrl(this.geometry)}},zIndex:1,interactions:[{type:"draw",options:{id:"drawInteraction",type:"Box",modify:!0}}]},{type:"Tile",source:{type:"XYZ",url:"https://s2maps-tiles.eu/wmts/1.0.0/osm_3857/default/g/{z}/{y}/{x}.jpg",attribution:"{ OSM: Data &copy; OpenStreetMap contributors and others, Rendering &copy; EOX }"}}];this.eoxMap=this.renderRoot.querySelector("eox-map"),setTimeout(()=>{this.eoxMap.layers=t;const e=r=>{const i=new CustomEvent("filter",{detail:{geometry:{type:"Polygon",coordinates:r.getGeometry().clone().transform("EPSG:3857","EPSG:4326").getCoordinates()}}});this.dispatchEvent(i)};this.eoxMap.interactions.drawInteraction.on("drawend",r=>{e(r.feature),this.eoxMap.removeInteraction("drawInteraction")}),this.eoxMap.interactions.drawInteraction_modify.on("modifyend",r=>{e(r.features.getArray()[0])})},1e3)}createFeatureUrl(t){return`data:text/json,${encodeURIComponent(JSON.stringify({type:"FeatureCollection",features:[{type:"Feature",properties:null,geometry:t}]}))}`}reset(){var t;const e=this.eoxMap.getLayerById("draw").getSource();((t=e.getFeatures())==null?void 0:t.length)>0&&(e.clear(),this.eoxMap.removeInteraction("drawInteraction_modify"),this.setup())}};sr([G()],Pr.prototype,"geometry",2);sr([rt()],Pr.prototype,"eoxMap",2);Pr=sr([Re("eox-itemfilter-spatial-filter")],Pr);var Uc=Object.defineProperty,Hc=Object.getOwnPropertyDescriptor,Xs=(t,e,r,i)=>{for(var n=i>1?void 0:i?Hc(e,r):e,s=t.length-1,o;s>=0;s--)(o=t[s])&&(n=(i?o(e,r,n):o(n))||n);return i&&n&&Uc(e,r,n),n};let xi=class extends _e{constructor(){super(...arguments),this.inputHandler=()=>{const t=this.renderRoot.querySelector("input[type='text']");this.filterObject.keys.forEach(e=>{this.filterObject.state[e]=t.value}),this.filterObject.dirty=!0,this.filterObject.stringifiedState=t.value,this.dispatchEvent(new CustomEvent("filter"))},this.debouncedInputHandler=Ps(this.inputHandler,500,{leading:!0})}reset(){const t=this.renderRoot.querySelector("input[type='text']");t.value="",qt(this.filterObject),this.filterObject.dirty=!1,this.requestUpdate()}createRenderRoot(){return this}render(){return de(this.filterObject,()=>F`
        <style>
          input {
            max-height: 100%;
          }
        </style>
        <input
          type="text"
          placeholder="Type something..."
          data-cy="search"
          part="input-search"
          value="${Object.values(this.filterObject.state)[0]}"
          @input="${this.debouncedInputHandler}"
          @click=${t=>{t.stopPropagation()}}
        />
      `)}};Xs([G()],xi.prototype,"filterObject",2);xi=Xs([Re("eox-itemfilter-text")],xi);var Fc=Object.defineProperty,zc=Object.getOwnPropertyDescriptor,_t=(t,e,r,i)=>{for(var n=i>1?void 0:i?zc(e,r):e,s=t.length-1,o;s>=0;s--)(o=t[s])&&(n=(i?o(e,r,n):o(n))||n);return i&&n&&Fc(e,r,n),n};let ht=class extends _e{constructor(){super(...arguments),this.idProperty="id",this.items=[],this.titleProperty="title",this.unstyled=!1,this.inputText="",this.replaceInput=null,this._clickOutsideListener=()=>{this.items.forEach(t=>{delete t._inProgress}),this.requestUpdate()},this._keyboardEventListener=t=>{["Enter","Escape","Space"].includes(t.code)&&this._handleKeyboard(t.code)}}_handleKeyboard(t){var e,r,i,n,s,o;if(this.clientHeight===0)return;const l=this.items.find(g=>g._inProgress),a=(l==null?void 0:l.type)==="text"&&(l==null?void 0:l.dirty),h=this.renderRoot.querySelector("#inline-input"),p=(o=(s=(n=(i=(r=(e=this.renderRoot)==null?void 0:e.querySelector("[data-filter]"))==null?void 0:r.querySelector("eox-autocomplete"))==null?void 0:i.renderRoot)==null?void 0:n.querySelector("eox-selectionlist"))==null?void 0:s.renderRoot)==null?void 0:o.querySelector("li.highlighted");if(t=="Enter"&&p&&h.selectionStart&&(p.querySelector("input[type=checkbox]").dispatchEvent(new Event("change")),h.selectionStart=0,h.value="",h.focus()),["Escape","Space"].includes(t)||t=="Enter"&&a){l&&(delete l._inProgress,this.requestUpdate(),this.inputText="",this.renderRoot.querySelector("input").value="",this.renderRoot.querySelector("input").focus()),this.renderRoot.querySelector("[slot=content]").classList.remove("hidden");return}}_handleReset(t){t.forEach(e=>{qt(e),delete e._inProgress,delete e.stringifiedState}),this.renderRoot.querySelector("[slot=content]").classList.remove("hidden"),this.requestUpdate(),this.dispatchEvent(new CustomEvent("filter"))}connectedCallback(){super.connectedCallback(),this.getRootNode().addEventListener("keydown",this._keyboardEventListener),window.addEventListener("click",this._clickOutsideListener)}disconnectedCallback(){super.disconnectedCallback(),this.getRootNode().removeEventListener("keydown",this._keyboardEventListener),window.removeEventListener("click",this._clickOutsideListener)}render(){return F`
      <style>
        :host,
        .container {
          display: flex;
        }
        ${this.unstyled?ae:F`
              ${ji} :host { position: relative; } .container { width: 100%;
              position: relative; border: 1px solid #00417066; border-radius:
              4px; height: 24px; padding: 5px; flex: 1; justify-content:
              space-between; cursor: text; transition: all 0.2s ease-in-out;
              overflow-x: auto; } .container:hover { border: 1px solid #004170;
              } .input-container { display: flex; flex: 1; align-items: center;
              } input, input:focus { height: 100%; border: none; outline: none;
              } .button-container { display: flex; align-items: center;
              justify-content: center; position: absolute; right: 1px; top: 5px;
              height: calc(100% - 10px); width: 34px; background: white; }
              button.icon { color: #004170; height: 24px; font-size: large;
              width: unset; } .container::-webkit-scrollbar { height: 2px; }
              .container::-webkit-scrollbar-thumb { background: lightgrey;
              border-radius: 2px; } .hidden {height: 0; padding: 0; border:
              none;} .hidden:hover {border: none}
            `}
      </style>
      <div
        class="container"
        part="container"
        @click=${t=>{var e;t.stopPropagation(),(e=this.renderRoot.querySelector("input[type=text]"))==null||e.focus()}}
      >
        <eox-itemfilter-chips
          .items=${this.items.filter(t=>t._inProgress||t.stringifiedState)}
          .titleProperty=${this.titleProperty}
          .unstyled=${this.unstyled}
          @items-selected=${t=>{this.items.forEach(e=>{t.detail.find(r=>r.id===e.id)||this._handleReset([e])})}}
          @click=${t=>{t.stopPropagation()}}
        ></eox-itemfilter-chips>
        <div class="input-container">
          <eox-dropdown .parent=${this} .unstyled=${this.unstyled}>
            <input
              id="inline-input"
              slot="trigger"
              type="text"
              placeholder="Type something..."
              @focus=${()=>{this.inputText="",this.requestUpdate()}}
              @input=${t=>{if(this.inputText=t.target.value.toLowerCase(),this.replaceInput){const e=this.renderRoot.querySelector("[data-filter]").renderRoot.querySelector("input")||this.renderRoot.querySelector("[data-filter]").renderRoot.querySelector("eox-autocomplete").renderRoot.querySelector("input");e&&(e.value=this.inputText,e.dispatchEvent(new Event("input")))}}}
            />
            <div slot="content">
              ${de(!this.items.find(t=>t._inProgress),()=>F`
                  <eox-selectionlist
                    .filter=${this.inputText}
                    .idProperty=${this.idProperty}
                    .titleProperty=${this.titleProperty}
                    .items=${this.items.filter(t=>!t.stringifiedState)}
                    .multiple=${!1}
                    .selectedItems=${this.items.filter(t=>t.stringifiedState)}
                    .unstyled=${this.unstyled}
                    @click=${t=>{t.stopPropagation()}}
                    @items-highlighted=${()=>{}}
                    @items-selected=${t=>{const e=t.detail;e.length>0&&(e[e.length-1]._inProgress=!0,this.renderRoot.querySelector("input[slot=trigger]").value="",this.inputText="",this.requestUpdate());const r=this.items.find(i=>i._inProgress);(r&&r.type==="text"||r.type==="multiselect"||r.type==="select")&&(this.replaceInput=!0),this.replaceInput&&(setTimeout(()=>{if(r.type==="text")this.renderRoot.querySelector("[slot=content]").classList.add("hidden");else if(r.type==="multiselect"||r.type==="select"){const i=this.renderRoot.querySelector("[data-filter]").renderRoot.querySelector("eox-autocomplete");i.renderRoot.querySelector("eox-dropdown").open=!0,i.renderRoot.querySelector(".container").classList.add("hidden")}}),this.renderRoot.querySelector("input").select(),this.renderRoot.querySelector("input").focus())}}
                  >
                  </eox-selectionlist>
                `)}
              ${de(this.items.find(t=>t._inProgress),()=>wr`
            <eox-itemfilter-${Ot(this.items.find(t=>t._inProgress).type)}
              data-filter=${this.items.find(t=>t._inProgress).id}
              slot="dropdown"
              .filterObject=${this.items.find(t=>t._inProgress)}
              .unstyled=${this.unstyled}
              .inline=${!0}
              @filter=${()=>{this.dispatchEvent(new CustomEvent("filter"))}}
              @click=${t=>{t.stopPropagation()}}
            ></eox-itemfilter-${Ot(this.items.find(t=>t._inProgress).type)}>
  `)}
            </div>
          </eox-dropdown>
        </div>
      </div>
      ${de(this.items.filter(t=>t.stringifiedState||t._inProgress).length>0,()=>F`
          <div class="button-container">
            <button
              class="icon"
              @click=${()=>{this._handleReset(this.items.filter(t=>t.stringifiedState||t._inProgress))}}
            >
              ✕
            </button>
          </div>
        `)}
    `}};_t([G()],ht.prototype,"idProperty",2);_t([G()],ht.prototype,"items",2);_t([G()],ht.prototype,"titleProperty",2);_t([G()],ht.prototype,"unstyled",2);_t([rt()],ht.prototype,"inputText",2);_t([rt()],ht.prototype,"replaceInput",2);ht=_t([Re("eox-itemfilter-inline")],ht);function tt(t){return Array.isArray?Array.isArray(t):Js(t)==="[object Array]"}const Wc=1/0;function Yc(t){if(typeof t=="string")return t;let e=t+"";return e=="0"&&1/t==-Wc?"-0":e}function Xc(t){return t==null?"":Yc(t)}function Ye(t){return typeof t=="string"}function Vs(t){return typeof t=="number"}function Vc(t){return t===!0||t===!1||Kc(t)&&Js(t)=="[object Boolean]"}function Ks(t){return typeof t=="object"}function Kc(t){return Ks(t)&&t!==null}function Le(t){return t!=null}function di(t){return!t.trim().length}function Js(t){return t==null?t===void 0?"[object Undefined]":"[object Null]":Object.prototype.toString.call(t)}const Jc="Incorrect 'index' type",Zc=t=>`Invalid value for key ${t}`,Gc=t=>`Pattern length exceeds max of ${t}.`,Qc=t=>`Missing ${t} property in key`,eh=t=>`Property 'weight' in key '${t}' must be a positive integer`,Jn=Object.prototype.hasOwnProperty;class th{constructor(e){this._keys=[],this._keyMap={};let r=0;e.forEach(i=>{let n=Zs(i);this._keys.push(n),this._keyMap[n.id]=n,r+=n.weight}),this._keys.forEach(i=>{i.weight/=r})}get(e){return this._keyMap[e]}keys(){return this._keys}toJSON(){return JSON.stringify(this._keys)}}function Zs(t){let e=null,r=null,i=null,n=1,s=null;if(Ye(t)||tt(t))i=t,e=Zn(t),r=wi(t);else{if(!Jn.call(t,"name"))throw new Error(Qc("name"));const o=t.name;if(i=o,Jn.call(t,"weight")&&(n=t.weight,n<=0))throw new Error(eh(o));e=Zn(o),r=wi(o),s=t.getFn}return{path:e,id:r,weight:n,src:i,getFn:s}}function Zn(t){return tt(t)?t:t.split(".")}function wi(t){return tt(t)?t.join("."):t}function rh(t,e){let r=[],i=!1;const n=(s,o,l)=>{if(Le(s))if(!o[l])r.push(s);else{let a=o[l];const h=s[a];if(!Le(h))return;if(l===o.length-1&&(Ye(h)||Vs(h)||Vc(h)))r.push(Xc(h));else if(tt(h)){i=!0;for(let p=0,g=h.length;p<g;p+=1)n(h[p],o,l+1)}else o.length&&n(h,o,l+1)}};return n(t,Ye(e)?e.split("."):e,0),i?r:r[0]}const ih={includeMatches:!1,findAllMatches:!1,minMatchCharLength:1},nh={isCaseSensitive:!1,includeScore:!1,keys:[],shouldSort:!0,sortFn:(t,e)=>t.score===e.score?t.idx<e.idx?-1:1:t.score<e.score?-1:1},sh={location:0,threshold:.6,distance:100},oh={useExtendedSearch:!1,getFn:rh,ignoreLocation:!1,ignoreFieldNorm:!1,fieldNormWeight:1};var J={...nh,...ih,...sh,...oh};const ah=/[^ ]+/g;function lh(t=1,e=3){const r=new Map,i=Math.pow(10,e);return{get(n){const s=n.match(ah).length;if(r.has(s))return r.get(s);const o=1/Math.pow(s,.5*t),l=parseFloat(Math.round(o*i)/i);return r.set(s,l),l},clear(){r.clear()}}}class Vi{constructor({getFn:e=J.getFn,fieldNormWeight:r=J.fieldNormWeight}={}){this.norm=lh(r,3),this.getFn=e,this.isCreated=!1,this.setIndexRecords()}setSources(e=[]){this.docs=e}setIndexRecords(e=[]){this.records=e}setKeys(e=[]){this.keys=e,this._keysMap={},e.forEach((r,i)=>{this._keysMap[r.id]=i})}create(){this.isCreated||!this.docs.length||(this.isCreated=!0,Ye(this.docs[0])?this.docs.forEach((e,r)=>{this._addString(e,r)}):this.docs.forEach((e,r)=>{this._addObject(e,r)}),this.norm.clear())}add(e){const r=this.size();Ye(e)?this._addString(e,r):this._addObject(e,r)}removeAt(e){this.records.splice(e,1);for(let r=e,i=this.size();r<i;r+=1)this.records[r].i-=1}getValueForItemAtKeyId(e,r){return e[this._keysMap[r]]}size(){return this.records.length}_addString(e,r){if(!Le(e)||di(e))return;let i={v:e,i:r,n:this.norm.get(e)};this.records.push(i)}_addObject(e,r){let i={i:r,$:{}};this.keys.forEach((n,s)=>{let o=n.getFn?n.getFn(e):this.getFn(e,n.path);if(Le(o)){if(tt(o)){let l=[];const a=[{nestedArrIndex:-1,value:o}];for(;a.length;){const{nestedArrIndex:h,value:p}=a.pop();if(Le(p))if(Ye(p)&&!di(p)){let g={v:p,i:h,n:this.norm.get(p)};l.push(g)}else tt(p)&&p.forEach((g,b)=>{a.push({nestedArrIndex:b,value:g})})}i.$[s]=l}else if(Ye(o)&&!di(o)){let l={v:o,n:this.norm.get(o)};i.$[s]=l}}}),this.records.push(i)}toJSON(){return{keys:this.keys,records:this.records}}}function Gs(t,e,{getFn:r=J.getFn,fieldNormWeight:i=J.fieldNormWeight}={}){const n=new Vi({getFn:r,fieldNormWeight:i});return n.setKeys(t.map(Zs)),n.setSources(e),n.create(),n}function ch(t,{getFn:e=J.getFn,fieldNormWeight:r=J.fieldNormWeight}={}){const{keys:i,records:n}=t,s=new Vi({getFn:e,fieldNormWeight:r});return s.setKeys(i),s.setIndexRecords(n),s}function br(t,{errors:e=0,currentLocation:r=0,expectedLocation:i=0,distance:n=J.distance,ignoreLocation:s=J.ignoreLocation}={}){const o=e/t.length;if(s)return o;const l=Math.abs(i-r);return n?o+l/n:l?1:o}function hh(t=[],e=J.minMatchCharLength){let r=[],i=-1,n=-1,s=0;for(let o=t.length;s<o;s+=1){let l=t[s];l&&i===-1?i=s:!l&&i!==-1&&(n=s-1,n-i+1>=e&&r.push([i,n]),i=-1)}return t[s-1]&&s-i>=e&&r.push([i,s-1]),r}const mt=32;function uh(t,e,r,{location:i=J.location,distance:n=J.distance,threshold:s=J.threshold,findAllMatches:o=J.findAllMatches,minMatchCharLength:l=J.minMatchCharLength,includeMatches:a=J.includeMatches,ignoreLocation:h=J.ignoreLocation}={}){if(e.length>mt)throw new Error(Gc(mt));const p=e.length,g=t.length,b=Math.max(0,Math.min(i,g));let m=s,_=b;const k=l>1||a,z=k?Array(g):[];let I;for(;(I=t.indexOf(e,_))>-1;){let M=br(e,{currentLocation:I,expectedLocation:b,distance:n,ignoreLocation:h});if(m=Math.min(M,m),_=I+p,k){let L=0;for(;L<p;)z[I+L]=1,L+=1}}_=-1;let f=[],y=1,w=p+g;const E=1<<p-1;for(let M=0;M<p;M+=1){let L=0,B=w;for(;L<B;)br(e,{errors:M,currentLocation:b+B,expectedLocation:b,distance:n,ignoreLocation:h})<=m?L=B:w=B,B=Math.floor((w-L)/2+L);w=B;let U=Math.max(1,b-B+1),T=o?g:Math.min(b+B,g)+p,re=Array(T+2);re[T+1]=(1<<M)-1;for(let Z=T;Z>=U;Z-=1){let C=Z-1,O=r[t.charAt(C)];if(k&&(z[C]=+!!O),re[Z]=(re[Z+1]<<1|1)&O,M&&(re[Z]|=(f[Z+1]|f[Z])<<1|1|f[Z+1]),re[Z]&E&&(y=br(e,{errors:M,currentLocation:C,expectedLocation:b,distance:n,ignoreLocation:h}),y<=m)){if(m=y,_=C,_<=b)break;U=Math.max(1,2*b-_)}}if(br(e,{errors:M+1,currentLocation:b,expectedLocation:b,distance:n,ignoreLocation:h})>m)break;f=re}const S={isMatch:_>=0,score:Math.max(.001,y)};if(k){const M=hh(z,l);M.length?a&&(S.indices=M):S.isMatch=!1}return S}function dh(t){let e={};for(let r=0,i=t.length;r<i;r+=1){const n=t.charAt(r);e[n]=(e[n]||0)|1<<i-r-1}return e}class Qs{constructor(e,{location:r=J.location,threshold:i=J.threshold,distance:n=J.distance,includeMatches:s=J.includeMatches,findAllMatches:o=J.findAllMatches,minMatchCharLength:l=J.minMatchCharLength,isCaseSensitive:a=J.isCaseSensitive,ignoreLocation:h=J.ignoreLocation}={}){if(this.options={location:r,threshold:i,distance:n,includeMatches:s,findAllMatches:o,minMatchCharLength:l,isCaseSensitive:a,ignoreLocation:h},this.pattern=a?e:e.toLowerCase(),this.chunks=[],!this.pattern.length)return;const p=(b,m)=>{this.chunks.push({pattern:b,alphabet:dh(b),startIndex:m})},g=this.pattern.length;if(g>mt){let b=0;const m=g%mt,_=g-m;for(;b<_;)p(this.pattern.substr(b,mt),b),b+=mt;if(m){const k=g-mt;p(this.pattern.substr(k),k)}}else p(this.pattern,0)}searchIn(e){const{isCaseSensitive:r,includeMatches:i}=this.options;if(r||(e=e.toLowerCase()),this.pattern===e){let _={isMatch:!0,score:0};return i&&(_.indices=[[0,e.length-1]]),_}const{location:n,distance:s,threshold:o,findAllMatches:l,minMatchCharLength:a,ignoreLocation:h}=this.options;let p=[],g=0,b=!1;this.chunks.forEach(({pattern:_,alphabet:k,startIndex:z})=>{const{isMatch:I,score:f,indices:y}=uh(e,_,k,{location:n+z,distance:s,threshold:o,findAllMatches:l,minMatchCharLength:a,includeMatches:i,ignoreLocation:h});I&&(b=!0),g+=f,I&&y&&(p=[...p,...y])});let m={isMatch:b,score:b?g/this.chunks.length:1};return b&&i&&(m.indices=p),m}}class ut{constructor(e){this.pattern=e}static isMultiMatch(e){return Gn(e,this.multiRegex)}static isSingleMatch(e){return Gn(e,this.singleRegex)}search(){}}function Gn(t,e){const r=t.match(e);return r?r[1]:null}class ph extends ut{constructor(e){super(e)}static get type(){return"exact"}static get multiRegex(){return/^="(.*)"$/}static get singleRegex(){return/^=(.*)$/}search(e){const r=e===this.pattern;return{isMatch:r,score:r?0:1,indices:[0,this.pattern.length-1]}}}class fh extends ut{constructor(e){super(e)}static get type(){return"inverse-exact"}static get multiRegex(){return/^!"(.*)"$/}static get singleRegex(){return/^!(.*)$/}search(e){const r=e.indexOf(this.pattern)===-1;return{isMatch:r,score:r?0:1,indices:[0,e.length-1]}}}class gh extends ut{constructor(e){super(e)}static get type(){return"prefix-exact"}static get multiRegex(){return/^\^"(.*)"$/}static get singleRegex(){return/^\^(.*)$/}search(e){const r=e.startsWith(this.pattern);return{isMatch:r,score:r?0:1,indices:[0,this.pattern.length-1]}}}class yh extends ut{constructor(e){super(e)}static get type(){return"inverse-prefix-exact"}static get multiRegex(){return/^!\^"(.*)"$/}static get singleRegex(){return/^!\^(.*)$/}search(e){const r=!e.startsWith(this.pattern);return{isMatch:r,score:r?0:1,indices:[0,e.length-1]}}}class mh extends ut{constructor(e){super(e)}static get type(){return"suffix-exact"}static get multiRegex(){return/^"(.*)"\$$/}static get singleRegex(){return/^(.*)\$$/}search(e){const r=e.endsWith(this.pattern);return{isMatch:r,score:r?0:1,indices:[e.length-this.pattern.length,e.length-1]}}}class vh extends ut{constructor(e){super(e)}static get type(){return"inverse-suffix-exact"}static get multiRegex(){return/^!"(.*)"\$$/}static get singleRegex(){return/^!(.*)\$$/}search(e){const r=!e.endsWith(this.pattern);return{isMatch:r,score:r?0:1,indices:[0,e.length-1]}}}class eo extends ut{constructor(e,{location:r=J.location,threshold:i=J.threshold,distance:n=J.distance,includeMatches:s=J.includeMatches,findAllMatches:o=J.findAllMatches,minMatchCharLength:l=J.minMatchCharLength,isCaseSensitive:a=J.isCaseSensitive,ignoreLocation:h=J.ignoreLocation}={}){super(e),this._bitapSearch=new Qs(e,{location:r,threshold:i,distance:n,includeMatches:s,findAllMatches:o,minMatchCharLength:l,isCaseSensitive:a,ignoreLocation:h})}static get type(){return"fuzzy"}static get multiRegex(){return/^"(.*)"$/}static get singleRegex(){return/^(.*)$/}search(e){return this._bitapSearch.searchIn(e)}}class to extends ut{constructor(e){super(e)}static get type(){return"include"}static get multiRegex(){return/^'"(.*)"$/}static get singleRegex(){return/^'(.*)$/}search(e){let r=0,i;const n=[],s=this.pattern.length;for(;(i=e.indexOf(this.pattern,r))>-1;)r=i+s,n.push([i,r-1]);const o=!!n.length;return{isMatch:o,score:o?0:1,indices:n}}}const $i=[ph,to,gh,yh,vh,mh,fh,eo],Qn=$i.length,bh=/ +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/,xh="|";function wh(t,e={}){return t.split(xh).map(r=>{let i=r.trim().split(bh).filter(s=>s&&!!s.trim()),n=[];for(let s=0,o=i.length;s<o;s+=1){const l=i[s];let a=!1,h=-1;for(;!a&&++h<Qn;){const p=$i[h];let g=p.isMultiMatch(l);g&&(n.push(new p(g,e)),a=!0)}if(!a)for(h=-1;++h<Qn;){const p=$i[h];let g=p.isSingleMatch(l);if(g){n.push(new p(g,e));break}}}return n})}const $h=new Set([eo.type,to.type]);class _h{constructor(e,{isCaseSensitive:r=J.isCaseSensitive,includeMatches:i=J.includeMatches,minMatchCharLength:n=J.minMatchCharLength,ignoreLocation:s=J.ignoreLocation,findAllMatches:o=J.findAllMatches,location:l=J.location,threshold:a=J.threshold,distance:h=J.distance}={}){this.query=null,this.options={isCaseSensitive:r,includeMatches:i,minMatchCharLength:n,findAllMatches:o,ignoreLocation:s,location:l,threshold:a,distance:h},this.pattern=r?e:e.toLowerCase(),this.query=wh(this.pattern,this.options)}static condition(e,r){return r.useExtendedSearch}searchIn(e){const r=this.query;if(!r)return{isMatch:!1,score:1};const{includeMatches:i,isCaseSensitive:n}=this.options;e=n?e:e.toLowerCase();let s=0,o=[],l=0;for(let a=0,h=r.length;a<h;a+=1){const p=r[a];o.length=0,s=0;for(let g=0,b=p.length;g<b;g+=1){const m=p[g],{isMatch:_,indices:k,score:z}=m.search(e);if(_){if(s+=1,l+=z,i){const I=m.constructor.type;$h.has(I)?o=[...o,...k]:o.push(k)}}else{l=0,s=0,o.length=0;break}}if(s){let g={isMatch:!0,score:l/s};return i&&(g.indices=o),g}}return{isMatch:!1,score:1}}}const _i=[];function Eh(...t){_i.push(...t)}function Ei(t,e){for(let r=0,i=_i.length;r<i;r+=1){let n=_i[r];if(n.condition(t,e))return new n(t,e)}return new Qs(t,e)}const Lr={AND:"$and",OR:"$or"},Si={PATH:"$path",PATTERN:"$val"},Mi=t=>!!(t[Lr.AND]||t[Lr.OR]),Sh=t=>!!t[Si.PATH],Mh=t=>!tt(t)&&Ks(t)&&!Mi(t),es=t=>({[Lr.AND]:Object.keys(t).map(e=>({[e]:t[e]}))});function ro(t,e,{auto:r=!0}={}){const i=n=>{let s=Object.keys(n);const o=Sh(n);if(!o&&s.length>1&&!Mi(n))return i(es(n));if(Mh(n)){const a=o?n[Si.PATH]:s[0],h=o?n[Si.PATTERN]:n[a];if(!Ye(h))throw new Error(Zc(a));const p={keyId:wi(a),pattern:h};return r&&(p.searcher=Ei(h,e)),p}let l={children:[],operator:s[0]};return s.forEach(a=>{const h=n[a];tt(h)&&h.forEach(p=>{l.children.push(i(p))})}),l};return Mi(t)||(t=es(t)),i(t)}function Ah(t,{ignoreFieldNorm:e=J.ignoreFieldNorm}){t.forEach(r=>{let i=1;r.matches.forEach(({key:n,norm:s,score:o})=>{const l=n?n.weight:null;i*=Math.pow(o===0&&l?Number.EPSILON:o,(l||1)*(e?1:s))}),r.score=i})}function kh(t,e){const r=t.matches;e.matches=[],Le(r)&&r.forEach(i=>{if(!Le(i.indices)||!i.indices.length)return;const{indices:n,value:s}=i;let o={indices:n,value:s};i.key&&(o.key=i.key.src),i.idx>-1&&(o.refIndex=i.idx),e.matches.push(o)})}function Oh(t,e){e.score=t.score}function Ph(t,e,{includeMatches:r=J.includeMatches,includeScore:i=J.includeScore}={}){const n=[];return r&&n.push(kh),i&&n.push(Oh),t.map(s=>{const{idx:o}=s,l={item:e[o],refIndex:o};return n.length&&n.forEach(a=>{a(s,l)}),l})}class Ut{constructor(e,r={},i){this.options={...J,...r},this.options.useExtendedSearch,this._keyStore=new th(this.options.keys),this.setCollection(e,i)}setCollection(e,r){if(this._docs=e,r&&!(r instanceof Vi))throw new Error(Jc);this._myIndex=r||Gs(this.options.keys,this._docs,{getFn:this.options.getFn,fieldNormWeight:this.options.fieldNormWeight})}add(e){Le(e)&&(this._docs.push(e),this._myIndex.add(e))}remove(e=()=>!1){const r=[];for(let i=0,n=this._docs.length;i<n;i+=1){const s=this._docs[i];e(s,i)&&(this.removeAt(i),i-=1,n-=1,r.push(s))}return r}removeAt(e){this._docs.splice(e,1),this._myIndex.removeAt(e)}getIndex(){return this._myIndex}search(e,{limit:r=-1}={}){const{includeMatches:i,includeScore:n,shouldSort:s,sortFn:o,ignoreFieldNorm:l}=this.options;let a=Ye(e)?Ye(this._docs[0])?this._searchStringList(e):this._searchObjectList(e):this._searchLogical(e);return Ah(a,{ignoreFieldNorm:l}),s&&a.sort(o),Vs(r)&&r>-1&&(a=a.slice(0,r)),Ph(a,this._docs,{includeMatches:i,includeScore:n})}_searchStringList(e){const r=Ei(e,this.options),{records:i}=this._myIndex,n=[];return i.forEach(({v:s,i:o,n:l})=>{if(!Le(s))return;const{isMatch:a,score:h,indices:p}=r.searchIn(s);a&&n.push({item:s,idx:o,matches:[{score:h,value:s,norm:l,indices:p}]})}),n}_searchLogical(e){const r=ro(e,this.options),i=(l,a,h)=>{if(!l.children){const{keyId:g,searcher:b}=l,m=this._findMatches({key:this._keyStore.get(g),value:this._myIndex.getValueForItemAtKeyId(a,g),searcher:b});return m&&m.length?[{idx:h,item:a,matches:m}]:[]}const p=[];for(let g=0,b=l.children.length;g<b;g+=1){const m=l.children[g],_=i(m,a,h);if(_.length)p.push(..._);else if(l.operator===Lr.AND)return[]}return p},n=this._myIndex.records,s={},o=[];return n.forEach(({$:l,i:a})=>{if(Le(l)){let h=i(r,l,a);h.length&&(s[a]||(s[a]={idx:a,item:l,matches:[]},o.push(s[a])),h.forEach(({matches:p})=>{s[a].matches.push(...p)}))}}),o}_searchObjectList(e){const r=Ei(e,this.options),{keys:i,records:n}=this._myIndex,s=[];return n.forEach(({$:o,i:l})=>{if(!Le(o))return;let a=[];i.forEach((h,p)=>{a.push(...this._findMatches({key:h,value:o[p],searcher:r}))}),a.length&&s.push({idx:l,item:o,matches:a})}),s}_findMatches({key:e,value:r,searcher:i}){if(!Le(r))return[];let n=[];if(tt(r))r.forEach(({v:s,i:o,n:l})=>{if(!Le(s))return;const{isMatch:a,score:h,indices:p}=i.searchIn(s);a&&n.push({score:h,key:e,value:s,idx:o,norm:l,indices:p})});else{const{v:s,n:o}=r,{isMatch:l,score:a,indices:h}=i.searchIn(s);l&&n.push({score:a,key:e,value:s,norm:o,indices:h})}return n}}Ut.version="7.0.0";Ut.createIndex=Gs;Ut.parseIndex=ch;Ut.config=J;Ut.parseQuery=ro;Eh(_h);const Lh=(t,e="highlight",r="title")=>{const i=(s,o,l)=>{const a=o.split(".");let h;for(h=0;h<a.length-1;h++)s=s[a[h]];s[a[h]]=l},n=(s,o=[])=>{let l="",a=0;return o.forEach(h=>{const p=h[1]+1;l+=[s.substring(a,h[0]),`<mark class="${e}">`,s.substring(h[0],p),"</mark>"].join(""),a=p}),l+=s.substring(a),l};return t.filter(({matches:s})=>s&&s.length).map(({item:s,matches:o})=>{const l={};for(const[a,h]of Object.entries(s))l[a]=h;return o.forEach(a=>{a.key===r&&i(l,a.key,n(a.value,a.indices))}),l})};let io;const Ch=(t,e)=>{io=new Ut(t,{threshold:.4,distance:50,includeMatches:!0,useExtendedSearch:!0,...e})},Rh=async(t,e,r)=>{const i=Object.entries(e).filter(([,l])=>l.type==="text"||l.type==="select"||l.type==="multiselect").reduce((l,[a,h])=>{const p="$or",g=[],b=(m,_)=>{const k={};h.type==="text"?k[m]=`${_}`:k[a]=`="${m}"`,g.push(k)};return Object.entries(h.state).filter(([,m])=>m).forEach(([m,_])=>b(m,_)),g.length>0&&l.push({[p]:g}),l},[]);let n;if(!(i.length>0)&&r.matchAllWhenEmpty!==!1)n=t;else{const l={$and:[...i]},a=io.search(l);n=r.enableHighlighting?Lh(a,"highlight",r.titleProperty):a.map(h=>h.item)}const s=Object.entries(e).filter(([,l])=>l.type==="range").reduce((l,[a,h])=>(l[a]={min:h.state.min,max:h.state.max,format:h.format},l),{});if(Object.keys(s).length>0){const l=[];for(let a=0;a<n.length;a++){const h={};for(const[p,g]of Object.entries(s)){const b=m=>g.format==="date"?Lt(m).unix():m;Object.prototype.hasOwnProperty.call(n[a],p)?Array.isArray(n[a][p])?h[p]=s[p].min<=b(n[a][p][1])&&b(n[a][p][0])<=s[p].max:b(n[a][p])>=s[p].min&&b(n[a][p])<=s[p].max?h[p]=!0:h[p]=!1:h[p]=!0}Object.values(h).every(p=>!!p)&&l.push(n[a])}n=[...l]}const o=Object.entries(e).filter(([,l])=>l.type==="spatial").reduce((l,[a,h])=>(l[a]={geometry:h.state.geometry,mode:h.state.mode},l),{});if(Object.values(o).map(l=>l.geometry).filter(l=>!!l).length>0){const l=[];for(let a=0;a<n.length;a++){const h={};for(const p of Object.keys(o)){const g=o[p].mode||"within";Object.prototype.hasOwnProperty.call(n[a],p)&&(g==="within"?Bc(n[a][p],o[p].geometry):qc(n[a][p],o[p].geometry))?h[p]=!0:h[p]=!1}Object.values(h).every(p=>!!p)&&l.push(n[a])}n=[...l]}return n},jh=async(t,e,r)=>(await(await fetch(`${r.externalFilter(t,e)}`)).json()).features;var Th=Object.defineProperty,Dh=Object.getOwnPropertyDescriptor,nt=(t,e,r,i)=>{for(var n=i>1?void 0:i?Dh(e,r):e,s=t.length-1,o;s>=0;s--)(o=t[s])&&(n=(i?o(e,r,n):o(n))||n);return i&&n&&Th(e,r,n),n};class ts{constructor(){this.aggregateResults=void 0,this.autoSpreadSingle=!1,this.enableHighlighting=!1,this.filterProperties=[],this.inlineMode=!1,this.matchAllWhenEmpty=!0,this.onFilter=()=>{},this.onSelect=()=>{},this.showResults=!0,this.titleProperty="title",this.expandMultipleFilters=!0,this.expandResults=!0,this.expandMultipleResults=!0}}let Ve=class extends Sa{constructor(){super(...arguments),this._resultAggregation=[],this._items=[],this.filters={},this._config=new ts,this.apply=t=>{this._items=t.map((r,i)=>({id:`item-${i}`,...r})),this._config.filterProperties.length&&this._config.filterProperties.forEach(r=>{const i={},n=s=>r.format==="date"?Lt(s).unix():parseInt(s);this._items.forEach(s=>{if(r.type==="range"){if(Array.isArray(s[r.key])){const o=[n(s[r.key][0]),n(s[r.key][1])];i.min=i.min!==void 0?Math.min(i.min,o[0]):o[0],i.max=i.max!==void 0?Math.max(i.max,o[1]):o[1]}else{const o=n(s[r.key]);i.min=i.min!==void 0?Math.min(i.min,o):o,i.max=i.max!==void 0?Math.max(i.max,o):o}return}Array.isArray(s[r.key])?s[r.key].forEach(o=>{i[o]=void 0}):r.type==="spatial"?(i.geometry=void 0,i.mode=r.mode||"intersects"):i[s[r.key]]=void 0}),this.filters[r.key||r.keys.join("|")]={...r,type:r.type||"multiselect",state:{...i,...r.state},...r.state&&{dirty:!1},...r.type==="range"&&{min:i.min,max:i.max,format:r.format}}}),this._config.matchAllWhenEmpty!==!1&&(this.results=this.sortResults(this._items),this.requestUpdate()),this._config.aggregateResults&&(this._resultAggregation=[...new Set(this._items.reduce((r,i)=>r.concat(i[this._config.aggregateResults]),[]))].sort((r,i)=>r.localeCompare(i)));const e=[];Object.values(this.filters).forEach(r=>{r.type==="text"?r.keys.forEach(i=>{e.includes(i)||e.push(i)}):(r.type==="select"||r.type==="multiselect")&&(e.includes(r.key)||e.push(r.key))}),Ch(this._items,{keys:e,...this._config.fuseConfig}),this.search()}}set items(t){this.apply(t)}get items(){return this._items}set config(t){const e=this._config;this._config={...new ts,...t},this.requestUpdate("config",e)}get config(){return this._config}async search(){let t;this.config.externalFilter?t=await jh(this._items,this.filters,this._config):t=await Rh(this._items,this.filters,this._config),this.results=this.sortResults(t),this._config.onFilter(this.results,this.filters)}aggregateResults(t,e){return t.filter(r=>{const i=r[this._config.aggregateResults];let n;return this.filters[this._config.aggregateResults]&&(n=Object.keys(this.filters[this._config.aggregateResults]).filter(s=>this.filters[this._config.aggregateResults].state[s])),(!(n!=null&&n.length)||n.includes(e))&&Array.isArray(i)?i.includes(e):i===e})}createItemList(t){return F`
      <ul>
        ${ys(this.aggregateResults(this.results,t),e=>e.id,e=>{var r,i;return F`
            <li
              class=${((r=this.selectedResult)==null?void 0:r[this._config.titleProperty])===e[this._config.titleProperty]?"highlighted":ae}
            >
              <label>
                <input
                  data-cy="result-radio"
                  type="radio"
                  class="result-radio"
                  name="result"
                  id="${e.id}"
                  ?checked=${((i=this.selectedResult)==null?void 0:i[this._config.titleProperty])===e[this._config.titleProperty]||ae}
                  @click=${()=>{this.selectedResult=e,this._config.onSelect(e)}}
                />
                ${de(this.hasTemplate("result"),()=>this.renderTemplate("result",e,`result-${e.id}`),()=>F`
                    <span class="title"
                      >${Dn(e[this._config.titleProperty])}</span
                    >
                  `)}
              </label>
            </li>
          `})}
      </ul>
    `}sortResults(t){return[...t].sort((e,r)=>e[this._config.titleProperty].localeCompare(r[this._config.titleProperty]))}resetFilters(){this.renderRoot.querySelectorAll("[data-type='filter']").forEach(t=>{t.reset()}),this.search()}toggleAccordion(t){let e;if(t.detail?e=t.detail.target:e=t.target,e.classList.contains("details-filter")){if(!e.open||this.config.expandMultipleFilters)return;this.shadowRoot.querySelectorAll("eox-itemfilter-expandcontainer").forEach(r=>{const i=r.shadowRoot.querySelector(".details-filter");i&&i!==e&&i.removeAttribute("open")})}else{if(!e.open||this.config.expandMultipleResults)return;this.shadowRoot.querySelectorAll("details").forEach(r=>{r!==e&&r.removeAttribute("open")})}}render(){return F`
      <style>
        ${Ri}
        ${!this.unstyled&&Ti}
        ${this.styleOverride}
      </style>
      <form
        id="itemfilter"
        @submit="${t=>t.preventDefault()}"
      >
        ${de(this._config.inlineMode,()=>F`
            <eox-itemfilter-inline
              .items=${Object.values(this.filters)}
              .unstyled=${this.unstyled}
              @filter=${()=>this.search()}
            >
            </eox-itemfilter-inline>
          `,()=>F`
            ${de(this._config.filterProperties.length,()=>F`
                <section
                  class="${this.config.inlineMode?"inline":ae}"
                >
                  ${de(!this.config.inlineMode,()=>F`
                        <slot name="filterstitle"
                          ><h4 style="margin-top: 8px">Filters</h4></slot
                        >
                      `)}
                  <ul id="filters">
                    ${Vt(Object.values(this.filters),t=>wr`
                    <li>
                      ${t.featured?wr`
                            <eox-itemfilter-${Ot(t.type)}
                              slot="filter"
                              data-type="filter"
                              .filterObject=${t}
                              .unstyled=${this.unstyled}
                              @filter="${()=>this.search()}"
                            ></eox-itemfilter-${Ot(t.type)}>
                          `:wr`
                            <eox-itemfilter-expandcontainer
                              .filterObject=${t}
                              .unstyled=${this.unstyled}
                              @details-toggled=${this.toggleAccordion}
                            >
                            ${de(t.dirty,()=>F`
                                <button
                                  slot="reset-button"
                                  class="reset-icon icon"
                                  @click=${e=>{e.target.parentElement.querySelector("[slot=filter]").reset(),this.search(),this.requestUpdate()}}
                                >
                                  ${this.unstyled?"Reset":ae}
                                </button>
                              `)}
                              <eox-itemfilter-${Ot(t.type)}
                                slot="filter"
                                data-type="filter"
                                data-filter="${t.key}"
                                .filterObject=${t}
                                .unstyled=${this.unstyled}
                                @filter="${()=>this.search()}"
                              ></eox-itemfilter-${Ot(t.type)}>
                            </eox-itemfilter-expandcontainer>
                        `}
                    </li>
                  `)}
                  </ul>
                  ${de(this._config.filterProperties&&Object.values(this.filters).map(t=>t.dirty).filter(t=>t).length>0,()=>F`
                    <button
                      id="filter-reset"
                      class="outline small icon-text reset-icon"
                      data-cy="filter-reset"
                      @click=${()=>this.resetFilters()}
                    >
                      Reset all
                    </a>
                  `)}
                </section>
              `)}
            ${de(this.config.showResults&&this.results,()=>F`
                <section id="section-results">
                  <div>
                    <slot name="resultstitle"
                      ><h4 style="margin-top: 8px">Results</h4></slot
                    >
                  </div>
                  <div id="container-results" class="scroll">
                    ${this.results.length<1?F`
                          <small class="no-results">No matching items</small>
                        `:ae}
                    <ul id="results" part="results">
                      ${this._config.aggregateResults?Vt(this._resultAggregation.filter(t=>this.aggregateResults(this.results,t).length),t=>F` ${de(this.aggregateResults(this.results,t).length===1&&this.config.autoSpreadSingle,()=>F` <div style="margin-left: -8px">
                                  ${this.createItemList(t)}
                                </div>`,()=>F`
                                  <details
                                    class="details-results"
                                    @toggle=${this.toggleAccordion}
                                    ?open=${this._config.expandResults||ae}
                                  >
                                    <summary>
                                      <span class="title">
                                        ${t}
                                        <span class="count"
                                          >${this.aggregateResults(this.results,t).length}</span
                                        >
                                      </span>
                                    </summary>
                                    <div>
                                      ${this.createItemList(t)}
                                    </div>
                                  </details>
                                `)}`):Vt(this.results,t=>F`<li part="result">
                                <label>
                                  <input
                                    type="radio"
                                    name="result"
                                    id="${t.id}"
                                    @click=${()=>{this.selectedResult=t,this._config.onSelect(t)}}
                                  />
                                  ${de(this.hasTemplate("result"),()=>this.renderTemplate("result",t,`result-${t.id}`),()=>F`
                                      <span class="title"
                                        >${Dn(t[this._config.titleProperty])}</span
                                      >
                                    `)}
                                </label>
                              </li>`)}
                    </ul>
                  </div>
                </section>
              `)}
          `)}
      </form>
    `}};nt([rt()],Ve.prototype,"filters",2);nt([rt()],Ve.prototype,"results",2);nt([rt()],Ve.prototype,"selectedResult",2);nt([G({attribute:!1})],Ve.prototype,"items",1);nt([G({attribute:!1})],Ve.prototype,"config",1);nt([G()],Ve.prototype,"apply",2);nt([G({attribute:!1})],Ve.prototype,"styleOverride",2);nt([G({type:Boolean})],Ve.prototype,"unstyled",2);Ve=nt([Re("eox-itemfilter")],Ve);export{Ve as EOxItemFilter,ts as ElementConfig};
