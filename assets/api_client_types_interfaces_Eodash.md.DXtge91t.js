import{_ as e,c as t,o,a4 as a}from"./chunks/framework.Q5n-9psv.js";const u=JSON.parse('{"title":"Interface: Eodash<T>","description":"","frontmatter":{},"headers":[],"relativePath":"api/client/types/interfaces/Eodash.md","filePath":"api/client/types/interfaces/Eodash.md"}'),r={name:"api/client/types/interfaces/Eodash.md"},n=a('<p><a href="./../../../">@eodash/eodash</a> / <a href="./../">client/types</a> / Eodash</p><h1 id="interface-eodash-t" tabindex="-1">Interface: Eodash&lt;T&gt; <a class="header-anchor" href="#interface-eodash-t" aria-label="Permalink to &quot;Interface: Eodash\\&lt;T\\&gt;&quot;">​</a></h1><p>Eodash instance API</p><h2 id="type-parameters" tabindex="-1">Type Parameters <a class="header-anchor" href="#type-parameters" aria-label="Permalink to &quot;Type Parameters&quot;">​</a></h2><p>• <strong>T</strong> <em>extends</em> <a href="./../type-aliases/ExecutionTime.html"><code>ExecutionTime</code></a> = <code>&quot;compiletime&quot;</code></p><h2 id="properties" tabindex="-1">Properties <a class="header-anchor" href="#properties" aria-label="Permalink to &quot;Properties&quot;">​</a></h2><h3 id="brand" tabindex="-1">brand <a class="header-anchor" href="#brand" aria-label="Permalink to &quot;brand&quot;">​</a></h3><blockquote><p><strong>brand</strong>: <code>object</code></p></blockquote><p>Brand specifications.</p><h4 id="errormessage" tabindex="-1">errorMessage? <a class="header-anchor" href="#errormessage" aria-label="Permalink to &quot;errorMessage?&quot;">​</a></h4><blockquote><p><code>optional</code> <strong>errorMessage</strong>: <code>string</code></p></blockquote><p>Custom error message to alert the users if something crashes</p><h4 id="font" tabindex="-1">font? <a class="header-anchor" href="#font" aria-label="Permalink to &quot;font?&quot;">​</a></h4><blockquote><p><code>optional</code> <strong>font</strong>: <code>object</code></p></blockquote><p>Fetches the specified font family from the specified <code>link</code> property.</p><h4 id="font-family" tabindex="-1">font.family <a class="header-anchor" href="#font-family" aria-label="Permalink to &quot;font.family&quot;">​</a></h4><blockquote><p><strong>family</strong>: <code>string</code></p></blockquote><p>Font family name.</p><h4 id="font-link" tabindex="-1">font.link <a class="header-anchor" href="#font-link" aria-label="Permalink to &quot;font.link&quot;">​</a></h4><blockquote><p><strong>link</strong>: <code>string</code></p></blockquote><p>Link to stylesheet that defines font-face. Could be either a relative or absolute URL.</p><h4 id="footertext" tabindex="-1">footerText? <a class="header-anchor" href="#footertext" aria-label="Permalink to &quot;footerText?&quot;">​</a></h4><blockquote><p><code>optional</code> <strong>footerText</strong>: <code>string</code></p></blockquote><p>Text applied to the footer.</p><h4 id="logo" tabindex="-1">logo? <a class="header-anchor" href="#logo" aria-label="Permalink to &quot;logo?&quot;">​</a></h4><blockquote><p><code>optional</code> <strong>logo</strong>: <code>string</code></p></blockquote><p>Brand logo</p><h4 id="name" tabindex="-1">name <a class="header-anchor" href="#name" aria-label="Permalink to &quot;name&quot;">​</a></h4><blockquote><p><strong>name</strong>: <code>string</code></p></blockquote><p>Title that will be shown in the app header</p><h4 id="nolayout" tabindex="-1">noLayout? <a class="header-anchor" href="#nolayout" aria-label="Permalink to &quot;noLayout?&quot;">​</a></h4><blockquote><p><code>optional</code> <strong>noLayout</strong>: <code>boolean</code></p></blockquote><p>Removes the dashboard layout</p><h4 id="theme" tabindex="-1">theme? <a class="header-anchor" href="#theme" aria-label="Permalink to &quot;theme?&quot;">​</a></h4><blockquote><p><code>optional</code> <strong>theme</strong>: <code>object</code></p></blockquote><p>Dashboard theme as a custom <a href="https://vuetifyjs.com/en/features/theme/" target="_blank" rel="noreferrer">vuetifyJs theme</a>.</p><h4 id="defined-in" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/eodash/eodash/blob/9373b772f294d1507487b3ca32cd49cd17b14945/core/client/types.d.ts#L204" target="_blank" rel="noreferrer">core/client/types.d.ts:204</a></p><hr><h3 id="id" tabindex="-1">id? <a class="header-anchor" href="#id" aria-label="Permalink to &quot;id?&quot;">​</a></h3><blockquote><p><code>optional</code> <strong>id</strong>: <code>string</code></p></blockquote><p>Instance ID.</p><h4 id="defined-in-1" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-1" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/eodash/eodash/blob/9373b772f294d1507487b3ca32cd49cd17b14945/core/client/types.d.ts#L200" target="_blank" rel="noreferrer">core/client/types.d.ts:200</a></p><hr><h3 id="stacendpoint" tabindex="-1">stacEndpoint <a class="header-anchor" href="#stacendpoint" aria-label="Permalink to &quot;stacEndpoint&quot;">​</a></h3><blockquote><p><strong>stacEndpoint</strong>: `<a href="https://$" target="_blank" rel="noreferrer">https://$</a>{string}/catalog.json` | `<a href="http://$" target="_blank" rel="noreferrer">http://$</a>{string}/catalog.json`</p></blockquote><p>Root STAC catalog endpoint</p><h4 id="defined-in-2" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-2" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/eodash/eodash/blob/9373b772f294d1507487b3ca32cd49cd17b14945/core/client/types.d.ts#L202" target="_blank" rel="noreferrer">core/client/types.d.ts:202</a></p><hr><h3 id="template" tabindex="-1">template <a class="header-anchor" href="#template" aria-label="Permalink to &quot;template&quot;">​</a></h3><blockquote><p><strong>template</strong>: <a href="./Template.html"><code>Template</code></a>&lt;<code>T</code>&gt;</p></blockquote><p>Template configuration</p><h4 id="defined-in-3" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-3" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/eodash/eodash/blob/9373b772f294d1507487b3ca32cd49cd17b14945/core/client/types.d.ts#L232" target="_blank" rel="noreferrer">core/client/types.d.ts:232</a></p>',56),i=[n];function d(s,l,c,h,p,f){return o(),t("div",null,i)}const m=e(r,[["render",d]]);export{u as __pageData,m as default};
