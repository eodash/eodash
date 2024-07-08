import{o as d,b as m,X as u}from"./framework.Cbb1ymJ-.js";import h from"@/components/DynamicWebComponent.vue";const y={__name:"EodashItemFilter",setup(f){const a=()=>u(()=>import("./eox-itemfilter.CWy23chl.js"),[]),p={config:{titleProperty:"title",filterProperties:[{keys:["title","themes"],title:"Search",type:"text"},{key:"themes",title:"Theme Filter",type:"multiselect"}],aggregateResults:"themes",enableHighlighting:!0,expandMultipleFilters:!1,expandMultipleResults:!1}},c=(t,i)=>{var r,l;t.style.height="100%";const o=document.createElement("style");o.innerHTML=`
    section {
      margin: 0 !important;
    }
    section button#filter-reset {
      padding: 0 8px;
      top: 8px;
      right: 8px;
    }
  `,(r=t==null?void 0:t.shadowRoot)==null||r.appendChild(o);const n=document.createElement("div");n.setAttribute("slot","filterstitle"),n.innerHTML='<h4 style="margin: 14px 8px">Indicators</h4>',t.appendChild(n);const s=document.createElement("div");s.setAttribute("slot","resultstitle"),t.appendChild(s),t.apply((l=i.stac)==null?void 0:l.filter(e=>e.rel==="child")),t.config.onSelect=async e=>{console.log(e),await i.loadSelectedSTAC(e.href)}};return(t,i)=>(d(),m(h,{link:a,"tag-name":"eox-itemfilter",properties:p,"on-mounted":c}))}};export{y as default};
