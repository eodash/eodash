import"@eox/stacinfo";import{currentUrl as t}from"@/store/states";import{o as r,c as o,j as a,k as l}from"./framework.D4GKtWrb.js";const i={class:"flex-grow-1 fill-height overflow-auto"},n=[".for",".allowHtml",".body",".featured",".footer",".styleOverride",".header",".subheader",".tags"],y={__name:"EodashStacInfo",props:{allowHtml:{type:Boolean,default:!0},styleOverride:{type:String,default:`
.single-property {columns: 1!important;}
h1 {margin:0px!important;font-size:16px!important;}
header h1:after {
content:' ';
display:block;
border:1px solid #d0d0d0;
}
h2 {font-size:15px}
h3 {font-size:14px}
summary {cursor: pointer;}
#properties li > .value { font-weight: normal !important;}
main {padding-bottom: 10px;}
.footer-container {line-height:1;}
.footer-container button {margin-top: -10px;}
.footer-container small {font-size:10px;line-height:1;}`},header:{type:Array,default:()=>["title"]},tags:{type:Array,default:()=>["themes"]},subheader:{type:Array,default:()=>[]},body:{type:Array,default:()=>["satellite","sensor","agency","extent"]},featured:{type:Array,default:()=>["description","providers","assets","links"]},footer:{type:Array,default:()=>["sci:citation"]}},setup(e){return(s,d)=>(r(),o("div",i,[a("eox-stacinfo",{".for":l(t),".allowHtml":e.allowHtml,".body":e.body,".featured":e.featured,".footer":e.footer,".styleOverride":e.styleOverride,".header":e.header,".subheader":e.subheader,".tags":e.tags,style:{"--color-primary-lighter":"none"}},null,40,n)]))}};export{y as default};
