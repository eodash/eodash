const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/EodashDatePicker.7b0ne8F3.js","assets/chunks/framework.BYFNpNrI.js","assets/chunks/pinia.tPQcNfz9.js","assets/chunks/mdi.BUDpP7ob.js","assets/chunks/EodashItemFilter.xpteEzL9.js","assets/chunks/EodashLayerControl.B8EQfPF6.js","assets/chunks/EodashMap.BtwVKCLS.js","assets/chunks/EodashMapBtns.CVXHBWvx.js","assets/chunks/ExportState.B4rZ9TNd.js","assets/chunks/PopUp.dhe1llxp.js","assets/chunks/WidgetsContainer.MxBOgKP7.js"])))=>i.map(i=>d[i]);
import{c as n,j as i,F as d,E as r,k as l,a4 as h,X as s,o as t,t as p}from"./chunks/framework.BYFNpNrI.js";const c="@eodash/eodash",y="5.0.0-alpha.2.15",u="module",F="./core/client/types.d.ts",m=["core/client","widgets","dist"],_={".":{types:"./core/client/types.d.ts",default:"./core/client/main.js"},"./webcomponent":{types:"./core/client/asWebComponent.d.ts",default:"./dist/client/eo-dash.js"},"./webcomponent.css":"./dist/client/style.css","./config":{types:"./dist/node/types.d.ts",default:"./dist/node/main.js"}},v="./core/client/main.js",C={start:"npx eodash dev --entryPoint core/client/eodash.js",prepare:"rollup -c",prepack:"npm run build:lib",dev:"npx eodash dev --entryPoint core/client/eodash.js",build:"npx eodash build --entryPoint core/client/eodash.js","build:lib":"npx eodash build --entryPoint core/client/eodash.js --lib --outDir dist/client","build:cli":"rollup -c",check:"vue-tsc --noEmit --skipLibCheck && eslint .",format:"prettier . --write --ignore-unknown",preview:"npx eodash preview",lint:"eslint . --fix",cypress:"cypress open --component ",vitest:"vitest --isolate --ui",test:"npm run test:client && npm run test:cli","test:cli":"vitest run tests/cli --isolate","test:client":"cypress run --component","docs:dev":"vitepress dev docs --port 3333","docs:build":"npm run docs:generate && vitepress build docs","docs:preview":"vitepress preview docs","docs:generate":"typedoc --options typedoc.config.json"},f={"@eox/itemfilter":"^1.0.1","@eox/jsonform":"^0.8.2","@eox/layercontrol":"^0.18.2-dev.1722439716.0","@eox/layout":"^0.1.0","@eox/map":"1.12.1-dev.1723130201.0","@eox/stacinfo":"^0.3.3","@eox/timecontrol":"^0.6.1","@mdi/js":"^7.4.47","@vitejs/plugin-vue":"^5.0.5","animated-details":"gist:2912bb049fa906671807415eb0e87188",axios:"^1.7.2",commander:"^12.1.0","core-js":"^3.37.1",pinia:"^2.1.7",sass:"^1.77.7","stac-js":"^0.0.9","stac-ts":"^1.0.3","v-calendar":"^3.1.2",vite:"^5.3.3","vite-plugin-vuetify":"^2.0.3",vue:"^3.2.0",vuetify:"^3.6.12",webfontloader:"^1.6.28"},w={"@babel/types":"^7.24.7","@eox/eslint-config":"^2.0.0","@pinia/testing":"^0.1.3","@types/node":"latest","@types/openlayers":"^4.6.23","@types/webfontloader":"^1.6.38",cypress:"^13.13.0",eslint:"^9.6.0","eslint-plugin-vue":"^9.27.0",prettier:"^3.3.2",terminate:"^2.8.0",typedoc:"^0.26.4","typedoc-plugin-markdown":"^4.2.0","typedoc-plugin-vue":"^1.2.0","typedoc-vitepress-theme":"^1.0.1",typescript:"^5.5.3","unplugin-fonts":"^1.1.1",vitepress:"^1.3.0",vitest:"^1.6.0","vue-tsc":"2.0.22"},b={node:">=20.15.1"},A={eodash:"./dist/node/cli.js"},E={name:c,version:y,type:u,types:F,files:m,exports:_,browser:v,scripts:C,dependencies:f,devDependencies:w,engines:b,bin:A},B=h("",4),D=h("",7),x=i("tr",null,[i("th",null,"Package"),i("th",null,"Version")],-1),q=["href"],T=h("",3),P=Object.keys(E.dependencies).filter(k=>!["commander","vite-plugin-vuetify","@vitejs/plugin-vue"].includes(k)),S=JSON.parse('{"title":"What are Internal Widgets","description":"","frontmatter":{},"headers":[],"relativePath":"widgets/internal-widgets.md","filePath":"widgets/internal-widgets.md"}'),j={name:"widgets/internal-widgets.md"},V=Object.assign(j,{setup(k){const o=Object.keys(Object.assign({"../../widgets/EodashDatePicker.vue":()=>s(()=>import("./chunks/EodashDatePicker.7b0ne8F3.js"),__vite__mapDeps([0,1,2,3])),"../../widgets/EodashItemFilter.vue":()=>s(()=>import("./chunks/EodashItemFilter.xpteEzL9.js"),__vite__mapDeps([4,1])),"../../widgets/EodashLayerControl.vue":()=>s(()=>import("./chunks/EodashLayerControl.B8EQfPF6.js"),__vite__mapDeps([5,1])),"../../widgets/EodashMap.vue":()=>s(()=>import("./chunks/EodashMap.BtwVKCLS.js").then(e=>e.E),__vite__mapDeps([6,2,1])),"../../widgets/EodashMapBtns.vue":()=>s(()=>import("./chunks/EodashMapBtns.CVXHBWvx.js"),__vite__mapDeps([7,3,1])),"../../widgets/ExportState.vue":()=>s(()=>import("./chunks/ExportState.B4rZ9TNd.js"),__vite__mapDeps([8,3,9,1])),"../../widgets/PopUp.vue":()=>s(()=>import("./chunks/PopUp.dhe1llxp.js"),__vite__mapDeps([9,1])),"../../widgets/WidgetsContainer.vue":()=>s(()=>import("./chunks/WidgetsContainer.MxBOgKP7.js"),__vite__mapDeps([10,1]))})).map(e=>e.split("/").at(-1).slice(0,-4));return(g,e)=>(t(),n("div",null,[B,i("ul",null,[(t(!0),n(d,null,r(l(o),a=>(t(),n("li",null,p(a),1))),256))]),D,i("table",null,[x,(t(!0),n(d,null,r(l(P),a=>(t(),n("tr",null,[i("td",null,[i("a",{target:"_blank",href:`https://www.npmjs.com/package/${a}`},p(a),9,q)]),i("td",null,p(l(E).dependencies[a]),1)]))),256))]),T]))}});export{S as __pageData,V as default};
