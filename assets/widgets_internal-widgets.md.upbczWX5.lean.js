const __vite__mapDeps=(i,m=__vite__mapDeps,d=(m.f||(m.f=["assets/chunks/EodashDatePicker.ah6K8kYe.js","assets/chunks/framework.DpxBzJw_.js","assets/chunks/mdi.kE_7Cs-6.js","assets/chunks/display.OQLV8dnA.js","assets/chunks/EodashItemFilter.CcMwkcoY.js","assets/chunks/EodashLayerControl.CQDNMiVY.js","assets/chunks/pinia.BvumBC0B.js","assets/chunks/EodashLayoutSwitcher.C90tyQ2e.js","assets/chunks/EodashMap.C-eO87O-.js","assets/chunks/EodashMapBtns.CaRJ_eSh.js","assets/chunks/PopUp.CyQg7KWr.js","assets/chunks/EodashProcess.BfhM0DJz.js","assets/chunks/EodashStacInfo.CczU_WRk.js","assets/chunks/EodashTools.C6NdqrCo.js","assets/chunks/ExportState.DjXiU5RU.js","assets/chunks/WidgetsContainer.DZ3NVUI1.js"])))=>i.map(i=>d[i]);
import{c as t,o as e,ag as l,j as a,F as r,B as d,t as p,k as h,V as s}from"./chunks/framework.DpxBzJw_.js";const c="@eodash/eodash",y="5.0.0-rc.2",u="module",F="./dist/types/core/client/types.d.ts",m=["core/client","widgets","dist"],v={"*":{".":["./dist/types/core/client/types.d.ts"],webcomponent:["./dist/types/core/client/asWebComponent.d.ts"],config:["./dist/node/types.d.ts"]}},_={".":{default:"./core/client/main.js"},"./webcomponent":{default:"./dist/client/eo-dash.js"},"./webcomponent.css":"./dist/client/eo-dash.css","./config":{default:"./dist/node/main.js"}},C="./core/client/main.js",w={start:"npx eodash dev --entryPoint core/client/eodash.js",prepare:"rollup -c",prepack:"npm run build:lib && npm run build:types",dev:"npx eodash dev --entryPoint core/client/eodash.js","dev:lib":"npx eodash dev --entryPoint core/client/eodash.js --lib",build:"npx eodash build --entryPoint core/client/eodash.js","build:lib":"npx eodash build --entryPoint core/client/eodash.js --lib --outDir dist/client","build:cli":"rollup -c","build:types":"vue-tsc --declaration  --emitDeclarationOnly && tsc-alias",check:"vue-tsc --noEmit --skipLibCheck && eslint .",format:"prettier . --write --ignore-unknown",preview:"npx eodash preview",lint:"eslint . --fix",cypress:"cypress open --component ",vitest:"vitest --isolate --ui",test:"npm run test:client && npm run test:cli","test:cli":"vitest run tests/cli --isolate","test:client":"cypress run --component","docs:dev":"vitepress dev docs --port 3333","docs:build":"npm run docs:generate && vitepress build docs","docs:preview":"vitepress preview docs","docs:generate":"npm run build:cli && npm run build:types && typedoc --options typedoc.config.json"},b={"@eox/chart":"^0.4.0","@eox/drawtools":"^0.14.2","@eox/itemfilter":"^1.7.1","@eox/jsonform":"^0.16.0","@eox/layercontrol":"^0.29.1","@eox/layout":"^0.3.0","@eox/map":"^1.20.0","@eox/stacinfo":"^0.6.2","@eox/timecontrol":"^0.12.3","@mdi/js":"^7.4.47","@vitejs/plugin-vue":"^5.2.1","@vueuse/core":"^12.0.0","animated-details":"gist:2912bb049fa906671807415eb0e87188",axios:"^1.8.2","axios-cache-interceptor":"^1.6.2","color-legend-element":"^1.3.0",commander:"^12.1.0","core-js":"^3.41.0",loglevel:"^1.9.2",mustache:"^4.2.0",pinia:"^2.3.1",sass:"^1.85.1","stac-js":"^0.0.9","stac-ts":"^1.0.4","v-calendar":"3.0.0",vega:"^5.32.0","vega-embed":"^6.29.0","vega-lite":"^5.23.0",vite:"^6.2.1","vite-plugin-vuetify":"^2.1.0",vue:"^3.5.0",vuetify:"^3.7.15",webfontloader:"^1.6.28"},f={"@babel/types":"^7.26.9","@eox/eslint-config":"^2.0.0","@pinia/testing":"^0.1.7","@types/json-schema":"^7.0.15","@types/mustache":"^4.2.5","@types/node":"^22.13.9","@types/openlayers":"^4.6.23","@types/webfontloader":"^1.6.38",cypress:"^13.17.0",eslint:"^9.21.0","eslint-plugin-vue":"^9.33.0","pkg-pr-new":"^0.0.39",prettier:"^3.5.3",rollup:"^4.34.9",terminate:"^2.8.0","tsc-alias":"^1.8.11",typedoc:"^0.27.9","typedoc-plugin-markdown":"^4.4.2","typedoc-plugin-vue":"^1.5.0","typedoc-vitepress-theme":"^1.1.2",typescript:"^5.8.2","unplugin-fonts":"^1.3.1",vitepress:"^1.6.3",vitest:"^1.6.1","vue-tsc":"2.2.0"},A={node:">=20.15.1"},D={eodash:"./dist/node/cli.js"},E={name:c,version:y,type:u,types:F,files:m,typesVersions:v,exports:_,browser:C,scripts:w,dependencies:b,devDependencies:f,engines:A,bin:D},B=["href"],x=Object.keys(E.dependencies).filter(k=>!["commander","vite-plugin-vuetify","@vitejs/plugin-vue"].includes(k)),T=JSON.parse('{"title":"What are Internal Widgets","description":"","frontmatter":{},"headers":[],"relativePath":"widgets/internal-widgets.md","filePath":"widgets/internal-widgets.md"}'),q={name:"widgets/internal-widgets.md"},I=Object.assign(q,{setup(k){const o=Object.keys(Object.assign({"../../widgets/EodashDatePicker.vue":()=>s(()=>import("./chunks/EodashDatePicker.ah6K8kYe.js"),__vite__mapDeps([0,1,2,3])),"../../widgets/EodashItemFilter.vue":()=>s(()=>import("./chunks/EodashItemFilter.CcMwkcoY.js"),__vite__mapDeps([4,3,1])),"../../widgets/EodashLayerControl.vue":()=>s(()=>import("./chunks/EodashLayerControl.CQDNMiVY.js"),__vite__mapDeps([5,6,1])),"../../widgets/EodashLayoutSwitcher.vue":()=>s(()=>import("./chunks/EodashLayoutSwitcher.C90tyQ2e.js"),__vite__mapDeps([7,2,1])),"../../widgets/EodashMap.vue":()=>s(()=>import("./chunks/EodashMap.C-eO87O-.js"),__vite__mapDeps([8,6,1])),"../../widgets/EodashMapBtns.vue":()=>s(()=>import("./chunks/EodashMapBtns.CaRJ_eSh.js"),__vite__mapDeps([9,2,10,1,4,3,6])),"../../widgets/EodashProcess.vue":()=>s(()=>import("./chunks/EodashProcess.BfhM0DJz.js"),__vite__mapDeps([11,6,1])),"../../widgets/EodashStacInfo.vue":()=>s(()=>import("./chunks/EodashStacInfo.CczU_WRk.js"),__vite__mapDeps([12,1])),"../../widgets/EodashTools.vue":()=>s(()=>import("./chunks/EodashTools.C6NdqrCo.js"),__vite__mapDeps([13,2,1,3])),"../../widgets/ExportState.vue":()=>s(()=>import("./chunks/ExportState.DjXiU5RU.js"),__vite__mapDeps([14,2,10,1])),"../../widgets/PopUp.vue":()=>s(()=>import("./chunks/PopUp.CyQg7KWr.js"),__vite__mapDeps([10,1])),"../../widgets/WidgetsContainer.vue":()=>s(()=>import("./chunks/WidgetsContainer.DZ3NVUI1.js"),__vite__mapDeps([15,1]))})).map(i=>i.split("/").at(-1).slice(0,-4));return(g,i)=>(e(),t("div",null,[i[1]||(i[1]=l("",4)),a("ul",null,[(e(!0),t(r,null,d(h(o),n=>(e(),t("li",null,p(n),1))),256))]),i[2]||(i[2]=l("",7)),a("table",null,[a("tbody",null,[i[0]||(i[0]=a("tr",null,[a("th",null,"Package"),a("th",null,"Version")],-1)),(e(!0),t(r,null,d(h(x),n=>(e(),t("tr",null,[a("td",null,[a("a",{target:"_blank",href:`https://www.npmjs.com/package/${n}`},p(n),9,B)]),a("td",null,p(h(E).dependencies[n]),1)]))),256))])]),i[3]||(i[3]=l("",3))]))}});export{T as __pageData,I as default};
