import"@eox/map";import"@eox/map/src/plugins/advancedLayersAndSources";import{mapPosition as A,mapEl as X,mapCompareEl as Y,datetime as q}from"@/store/states";import{s as V}from"./pinia.BvumBC0B.js";import{useSTAcStore as J}from"@/store/stac";import{eodashCompareCollections as ee,eodashCollections as I,layerControlFormValue as te,layerControlFormValueCompare as re}from"@/utils/states";import{useHandleMapMoveEnd as ne,useInitMap as H,useUpdateTooltipProperties as K}from"@/composables/EodashMap";import{p as _,aK as L,h as z,v as ae,c as oe,o as se,j,N as $,k as D}from"./framework.DpxBzJw_.js";function ie(r){return 3*r*r-2*r*r*r}/*!
 * mustache.js - Logic-less {{mustache}} templates with JavaScript
 * http://github.com/janl/mustache.js
 */var le=Object.prototype.toString,R=Array.isArray||function(e){return le.call(e)==="[object Array]"};function W(r){return typeof r=="function"}function ue(r){return R(r)?"array":typeof r}function F(r){return r.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")}function Z(r,e){return r!=null&&typeof r=="object"&&e in r}function ce(r,e){return r!=null&&typeof r!="object"&&r.hasOwnProperty&&r.hasOwnProperty(e)}var pe=RegExp.prototype.test;function fe(r,e){return pe.call(r,e)}var he=/\S/;function de(r){return!fe(he,r)}var ve={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;","/":"&#x2F;","`":"&#x60;","=":"&#x3D;"};function ye(r){return String(r).replace(/[&<>"'`=\/]/g,function(t){return ve[t]})}var ge=/\s*/,me=/\s+/,G=/\s*=/,we=/\s*\}/,be=/#|\^|\/|>|\{|&|=|!/;function Ce(r,e){if(!r)return[];var t=!1,n=[],a=[],o=[],s=!1,i=!1,l="",u=0;function c(){if(s&&!i)for(;o.length;)delete a[o.pop()];else o=[];s=!1,i=!1}var v,b,O;function U(m){if(typeof m=="string"&&(m=m.split(me,2)),!R(m)||m.length!==2)throw new Error("Invalid tags: "+m);v=new RegExp(F(m[0])+"\\s*"),b=new RegExp("\\s*"+F(m[1])),O=new RegExp("\\s*"+F("}"+m[1]))}U(e||y.tags);for(var p=new M(r),g,f,h,S,k,w;!p.eos();){if(g=p.pos,h=p.scanUntil(v),h)for(var C=0,E=h.length;C<E;++C)S=h.charAt(C),de(S)?(o.push(a.length),l+=S):(i=!0,t=!0,l+=" "),a.push(["text",S,g,g+1]),g+=1,S===`
`&&(c(),l="",u=0,t=!1);if(!p.scan(v))break;if(s=!0,f=p.scan(be)||"name",p.scan(ge),f==="="?(h=p.scanUntil(G),p.scan(G),p.scanUntil(b)):f==="{"?(h=p.scanUntil(O),p.scan(we),p.scanUntil(b),f="&"):h=p.scanUntil(b),!p.scan(b))throw new Error("Unclosed tag at "+p.pos);if(f==">"?k=[f,h,g,p.pos,l,u,t]:k=[f,h,g,p.pos],u++,a.push(k),f==="#"||f==="^")n.push(k);else if(f==="/"){if(w=n.pop(),!w)throw new Error('Unopened section "'+h+'" at '+g);if(w[1]!==h)throw new Error('Unclosed section "'+w[1]+'" at '+g)}else f==="name"||f==="{"||f==="&"?i=!0:f==="="&&U(h)}if(c(),w=n.pop(),w)throw new Error('Unclosed section "'+w[1]+'" at '+p.pos);return Te(Se(a))}function Se(r){for(var e=[],t,n,a=0,o=r.length;a<o;++a)t=r[a],t&&(t[0]==="text"&&n&&n[0]==="text"?(n[1]+=t[1],n[3]=t[3]):(e.push(t),n=t));return e}function Te(r){for(var e=[],t=e,n=[],a,o,s=0,i=r.length;s<i;++s)switch(a=r[s],a[0]){case"#":case"^":t.push(a),n.push(a),t=a[4]=[];break;case"/":o=n.pop(),o[5]=a[2],t=n.length>0?n[n.length-1][4]:e;break;default:t.push(a)}return e}function M(r){this.string=r,this.tail=r,this.pos=0}M.prototype.eos=function(){return this.tail===""};M.prototype.scan=function(e){var t=this.tail.match(e);if(!t||t.index!==0)return"";var n=t[0];return this.tail=this.tail.substring(n.length),this.pos+=n.length,n};M.prototype.scanUntil=function(e){var t=this.tail.search(e),n;switch(t){case-1:n=this.tail,this.tail="";break;case 0:n="";break;default:n=this.tail.substring(0,t),this.tail=this.tail.substring(t)}return this.pos+=n.length,n};function P(r,e){this.view=r,this.cache={".":this.view},this.parent=e}P.prototype.push=function(e){return new P(e,this)};P.prototype.lookup=function(e){var t=this.cache,n;if(t.hasOwnProperty(e))n=t[e];else{for(var a=this,o,s,i,l=!1;a;){if(e.indexOf(".")>0)for(o=a.view,s=e.split("."),i=0;o!=null&&i<s.length;)i===s.length-1&&(l=Z(o,s[i])||ce(o,s[i])),o=o[s[i++]];else o=a.view[e],l=Z(a.view,e);if(l){n=o;break}a=a.parent}t[e]=n}return W(n)&&(n=n.call(this.view)),n};function d(){this.templateCache={_cache:{},set:function(e,t){this._cache[e]=t},get:function(e){return this._cache[e]},clear:function(){this._cache={}}}}d.prototype.clearCache=function(){typeof this.templateCache<"u"&&this.templateCache.clear()};d.prototype.parse=function(e,t){var n=this.templateCache,a=e+":"+(t||y.tags).join(":"),o=typeof n<"u",s=o?n.get(a):void 0;return s==null&&(s=Ce(e,t),o&&n.set(a,s)),s};d.prototype.render=function(e,t,n,a){var o=this.getConfigTags(a),s=this.parse(e,o),i=t instanceof P?t:new P(t,void 0);return this.renderTokens(s,i,n,e,a)};d.prototype.renderTokens=function(e,t,n,a,o){for(var s="",i,l,u,c=0,v=e.length;c<v;++c)u=void 0,i=e[c],l=i[0],l==="#"?u=this.renderSection(i,t,n,a,o):l==="^"?u=this.renderInverted(i,t,n,a,o):l===">"?u=this.renderPartial(i,t,n,o):l==="&"?u=this.unescapedValue(i,t):l==="name"?u=this.escapedValue(i,t,o):l==="text"&&(u=this.rawValue(i)),u!==void 0&&(s+=u);return s};d.prototype.renderSection=function(e,t,n,a,o){var s=this,i="",l=t.lookup(e[1]);function u(b){return s.render(b,t,n,o)}if(l){if(R(l))for(var c=0,v=l.length;c<v;++c)i+=this.renderTokens(e[4],t.push(l[c]),n,a,o);else if(typeof l=="object"||typeof l=="string"||typeof l=="number")i+=this.renderTokens(e[4],t.push(l),n,a,o);else if(W(l)){if(typeof a!="string")throw new Error("Cannot use higher-order sections without the original template");l=l.call(t.view,a.slice(e[3],e[5]),u),l!=null&&(i+=l)}else i+=this.renderTokens(e[4],t,n,a,o);return i}};d.prototype.renderInverted=function(e,t,n,a,o){var s=t.lookup(e[1]);if(!s||R(s)&&s.length===0)return this.renderTokens(e[4],t,n,a,o)};d.prototype.indentPartial=function(e,t,n){for(var a=t.replace(/[^ \t]/g,""),o=e.split(`
`),s=0;s<o.length;s++)o[s].length&&(s>0||!n)&&(o[s]=a+o[s]);return o.join(`
`)};d.prototype.renderPartial=function(e,t,n,a){if(n){var o=this.getConfigTags(a),s=W(n)?n(e[1]):n[e[1]];if(s!=null){var i=e[6],l=e[5],u=e[4],c=s;l==0&&u&&(c=this.indentPartial(s,u,i));var v=this.parse(c,o);return this.renderTokens(v,t,n,c,a)}}};d.prototype.unescapedValue=function(e,t){var n=t.lookup(e[1]);if(n!=null)return n};d.prototype.escapedValue=function(e,t,n){var a=this.getConfigEscape(n)||y.escape,o=t.lookup(e[1]);if(o!=null)return typeof o=="number"&&a===y.escape?String(o):a(o)};d.prototype.rawValue=function(e){return e[1]};d.prototype.getConfigTags=function(e){return R(e)?e:e&&typeof e=="object"?e.tags:void 0};d.prototype.getConfigEscape=function(e){if(e&&typeof e=="object"&&!R(e))return e.escape};var y={name:"mustache.js",version:"4.2.0",tags:["{{","}}"],clearCache:void 0,escape:void 0,parse:void 0,render:void 0,Scanner:void 0,Context:void 0,Writer:void 0,set templateCache(r){x.templateCache=r},get templateCache(){return x.templateCache}},x=new d;y.clearCache=function(){return x.clearCache()};y.parse=function(e,t){return x.parse(e,t)};y.render=function(e,t,n,a){if(typeof e!="string")throw new TypeError('Invalid template! Template should be a "string" but "'+ue(e)+'" was given as the first argument for mustache#render(template, view, partials)');return x.render(e,t,n,a)};y.escape=ye;y.Scanner=M;y.Context=P;y.Writer=d;const ke=[".enabled"],Ee=[".center",".zoom",".layers"],_e=[".propertyTransform"],Pe=[".layers"],Re=[".propertyTransform"],Ie={__name:"EodashMap",props:{enableCompare:{type:Boolean,default:!1},center:{type:Array,default:()=>[15,48]},zoom:{type:Number,default:4},zoomToExtent:{type:Boolean,default:!0}},setup(r){var f,h,S,k,w;const e=r,t=_([]),n=_([]),a={Attribution:{collapsible:!0}},o=L([((f=A.value)==null?void 0:f[0])??((h=e.center)==null?void 0:h[0]),((S=A.value)==null?void 0:S[1])??((k=e.center)==null?void 0:k[1])]),s=L(((w=A.value)==null?void 0:w[2])??e.zoom),i=_([{type:"Tile",source:{type:"OSM"},properties:{id:"osm",title:"Background"}}]),l=_([{type:"Tile",source:{type:"OSM"},properties:{id:"osm",title:"Background"}}]),u={duration:1200,easing:ie},c=_(null),v=_(null),{selectedCompareStac:b}=V(J()),O=z(()=>e.enableCompare&&b.value?"":"first");ne(c,A),ae(()=>{const{selectedCompareStac:C,selectedStac:E}=V(J());X.value=c.value,e.enableCompare&&(Y.value=v.value),e.enableCompare&&(H(v,C,ee,q,l,c,!1),K(I,n)),H(c,E,I,q,i,v,e.zoomToExtent)}),K(I,t);const U=z(()=>({visibility:t.value.length?"visible":"hidden"})),p=z(()=>({visibility:n.value.length?"visible":"hidden"})),g=C=>{const E=C==="main"?t:n,m=C=="main"?te:re;return T=>{const B=JSON.parse(y.render(JSON.stringify(E.value),{...m.value??{}})),N=B==null?void 0:B.find(Q=>Q.id===T.key);if(N)return typeof T.value=="object"&&(T.value=JSON.stringify(T.value)),isNaN(Number(T.value))||(T.value=Number(T.value).toFixed(4).toString()),{key:N.title||N.id,value:T.value+" "+(N.appendix||"")}}};return(C,E)=>(se(),oe("eox-map-compare",{class:"fill-height fill-width overflow-none",".enabled":O.value},[j("eox-map",{class:"fill-height fill-width overflow-none",slot:"first",ref_key:"eoxMap",ref:c,id:"main",".animationOptions":u,".center":D(o),".zoom":D(s),".layers":i.value,".controls":a},[j("eox-map-tooltip",{style:$(U.value),".propertyTransform":g("main")},null,44,_e)],40,Ee),j("eox-map",{class:"fill-height fill-width overflow-none",id:"compare",slot:"second",ref_key:"compareMap",ref:v,".layers":l.value},[j("eox-map-tooltip",{style:$(p.value),".propertyTransform":g("compare")},null,44,Re)],40,Pe)],40,ke))}};export{Ie as default};
