const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/EodashDatePicker.C2XQTcgV.js","assets/chunks/framework.Q5n-9psv.js","assets/chunks/pinia.DC5KoY76.js","assets/chunks/mdi.BUDpP7ob.js","assets/chunks/EodashItemFilter.CkX09Are.js","assets/chunks/EodashMap.DTuBdnuy.js","assets/chunks/EodashMapBtns.C-JiL39D.js","assets/chunks/ExportState.CDmD5Tn5.js","assets/chunks/PopUp.DlgFUJ3L.js","assets/chunks/WidgetsContainer.DeMRi4XI.js"])))=>i.map(i=>d[i]);
import{c as n,j as s,F as d,E as r,k as l,a4 as h,X as i,o as t,t as p}from"./chunks/framework.Q5n-9psv.js";const c="@eodash/eodash",y="5.0.0-alpha.2.10",u="module",F="./core/client/types.d.ts",m=["core/client","widgets","dist"],_={".":{types:"./core/client/types.d.ts",default:"./core/client/main.js"},"./webcomponent":{types:"./core/client/asWebComponent.d.ts",default:"./dist/client/eo-dash.js"},"./webcomponent.css":"./dist/client/style.css","./config":{types:"./dist/node/types.d.ts",default:"./dist/node/main.js"}},v="./core/client/main.js",C={prepare:"rollup -c",prepack:"npm run build:lib",dev:"npx eodash dev --entryPoint core/client/eodash.js",build:"npx eodash build --entryPoint core/client/eodash.js","build:lib":"npx eodash build --entryPoint core/client/eodash.js --lib --outDir dist/client","build:cli":"rollup -c",check:"vue-tsc --noEmit --skipLibCheck && eslint .",format:"prettier . --write --ignore-unknown",preview:"npx eodash preview",lint:"eslint . --fix",cypress:"cypress open --component ",vitest:"vitest --isolate --ui",test:"npm run test:client && npm run test:cli","test:cli":"vitest run tests/cli --isolate","test:client":"cypress run --component","docs:dev":"vitepress dev docs --port 3333","docs:build":"npm run docs:generate && vitepress build docs","docs:preview":"vitepress preview docs","docs:generate":"typedoc --options typedoc.config.json"},f={"@eox/itemfilter":"^0.14.1","@eox/jsonform":"^0.8.1","@eox/layercontrol":"0.17.6-dev.2.0","@eox/layout":"^0.1.0","@eox/map":"1.9.3-ol-9.2.5-dev.1719634408469.0","@eox/stacinfo":"^0.3.3","@mdi/js":"^7.4.47","@vitejs/plugin-vue":"^5.0.5","animated-details":"gist:2912bb049fa906671807415eb0e87188",axios:"^1.7.2",commander:"^12.1.0","core-js":"^3.37.1",pinia:"^2.1.7",sass:"^1.77.7","stac-js":"^0.0.9","stac-ts":"^1.0.3","v-calendar":"^3.1.2",vite:"^5.3.3","vite-plugin-vuetify":"^2.0.3",vue:"^3.2.0",vuetify:"^3.6.12",webfontloader:"^1.6.28"},b={"@babel/types":"^7.24.7","@eox/eslint-config":"^2.0.0","@pinia/testing":"^0.1.3","@types/node":"latest","@types/openlayers":"^4.6.23","@types/webfontloader":"^1.6.38",cypress:"^13.13.0",eslint:"^9.6.0","eslint-plugin-vue":"^9.27.0",prettier:"^3.3.2",terminate:"^2.8.0",typedoc:"^0.26.4","typedoc-plugin-markdown":"^4.2.0","typedoc-plugin-vue":"^1.2.0","typedoc-vitepress-theme":"^1.0.1",typescript:"^5.5.3","unplugin-fonts":"^1.1.1",vitepress:"^1.3.0",vitest:"^1.6.0","vue-tsc":"2.0.22"},w={eodash:"./dist/node/cli.js"},E={name:c,version:y,type:u,types:F,files:m,exports:_,browser:v,scripts:C,dependencies:f,devDependencies:b,bin:w},A=h("",4),B=h("",7),D=s("tr",null,[s("th",null,"Package"),s("th",null,"Version")],-1),x=["href"],q=h("",3),T=Object.keys(E.dependencies).filter(k=>!["commander","vite-plugin-vuetify","@vitejs/plugin-vue"].includes(k)),I=JSON.parse('{"title":"What are Internal Widgets","description":"","frontmatter":{},"headers":[],"relativePath":"widgets/internal-widgets.md","filePath":"widgets/internal-widgets.md"}'),P={name:"widgets/internal-widgets.md"},S=Object.assign(P,{setup(k){const o=Object.keys(Object.assign({"../../widgets/EodashDatePicker.vue":()=>i(()=>import("./chunks/EodashDatePicker.C2XQTcgV.js"),__vite__mapDeps([0,1,2,3])),"../../widgets/EodashItemFilter.vue":()=>i(()=>import("./chunks/EodashItemFilter.CkX09Are.js"),__vite__mapDeps([4,1])),"../../widgets/EodashMap.vue":()=>i(()=>import("./chunks/EodashMap.DTuBdnuy.js").then(e=>e.E),__vite__mapDeps([5,2,1])),"../../widgets/EodashMapBtns.vue":()=>i(()=>import("./chunks/EodashMapBtns.C-JiL39D.js"),__vite__mapDeps([6,3,1])),"../../widgets/ExportState.vue":()=>i(()=>import("./chunks/ExportState.CDmD5Tn5.js"),__vite__mapDeps([7,3,8,1])),"../../widgets/PopUp.vue":()=>i(()=>import("./chunks/PopUp.DlgFUJ3L.js"),__vite__mapDeps([8,1])),"../../widgets/WidgetsContainer.vue":()=>i(()=>import("./chunks/WidgetsContainer.DeMRi4XI.js"),__vite__mapDeps([9,1]))})).map(e=>e.split("/").at(-1).slice(0,-4));return(g,e)=>(t(),n("div",null,[A,s("ul",null,[(t(!0),n(d,null,r(l(o),a=>(t(),n("li",null,p(a),1))),256))]),B,s("table",null,[D,(t(!0),n(d,null,r(l(T),a=>(t(),n("tr",null,[s("td",null,[s("a",{target:"_blank",href:`https://www.npmjs.com/package/${a}`},p(a),9,x)]),s("td",null,p(l(E).dependencies[a]),1)]))),256))]),q]))}});export{I as __pageData,S as default};
