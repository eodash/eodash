import{_ as e,c as o,o as t,a4 as a}from"./chunks/framework.Q5n-9psv.js";const m=JSON.parse('{"title":"Interface: WebComponentProps<T>","description":"","frontmatter":{},"headers":[],"relativePath":"api/client/types/interfaces/WebComponentProps.md","filePath":"api/client/types/interfaces/WebComponentProps.md"}'),d={name:"api/client/types/interfaces/WebComponentProps.md"},r=a('<p><a href="./../../../">@eodash/eodash</a> / <a href="./../">client/types</a> / WebComponentProps</p><h1 id="interface-webcomponentprops-t" tabindex="-1">Interface: WebComponentProps&lt;T&gt; <a class="header-anchor" href="#interface-webcomponentprops-t" aria-label="Permalink to &quot;Interface: WebComponentProps\\&lt;T\\&gt;&quot;">​</a></h1><h2 id="type-parameters" tabindex="-1">Type Parameters <a class="header-anchor" href="#type-parameters" aria-label="Permalink to &quot;Type Parameters&quot;">​</a></h2><p>• <strong>T</strong> <em>extends</em> <a href="./../type-aliases/ExecutionTime.html"><code>ExecutionTime</code></a> = <code>&quot;compiletime&quot;</code></p><h2 id="properties" tabindex="-1">Properties <a class="header-anchor" href="#properties" aria-label="Permalink to &quot;Properties&quot;">​</a></h2><h3 id="constructorprop" tabindex="-1">constructorProp? <a class="header-anchor" href="#constructorprop" aria-label="Permalink to &quot;constructorProp?&quot;">​</a></h3><blockquote><p><code>optional</code> <strong>constructorProp</strong>: <code>string</code></p></blockquote><p>Exported Constructor, needs to be provided if the web component is not registered in by the <a href="#link">link</a> provided</p><h4 id="defined-in" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/eodash/eodash/blob/dd4115a92f2db870d8436b75adde91a2d242e315/core/client/types.d.ts#L22" target="_blank" rel="noreferrer">core/client/types.d.ts:22</a></p><hr><h3 id="link" tabindex="-1">link <a class="header-anchor" href="#link" aria-label="Permalink to &quot;link&quot;">​</a></h3><blockquote><p><strong>link</strong>: <code>T</code> <em>extends</em> <code>&quot;runtime&quot;</code> ? <code>string</code> : <code>string</code> | () =&gt; <code>Promise</code>&lt;<code>unknown</code>&gt;</p></blockquote><p>Imports web component file, either using a URL or an import function.</p><h4 id="example" tabindex="-1">Example <a class="header-anchor" href="#example" aria-label="Permalink to &quot;Example&quot;">​</a></h4><p>importing <code>eox-itemfilter</code> web component, after installing <code>@eox/itemfilter</code> it can be referenced:</p><div class="language-js vp-adaptive-theme"><button title="Copy Code" class="copy"></button><span class="lang">js</span><pre class="shiki shiki-themes github-light github-dark vp-code" tabindex="0"><code><span class="line"><span style="--shiki-light:#6F42C1;--shiki-dark:#B392F0;">link</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">: </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">async</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">() </span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;">=&gt;</span><span style="--shiki-light:#D73A49;--shiki-dark:#F97583;"> import</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">(</span><span style="--shiki-light:#032F62;--shiki-dark:#9ECBFF;">&quot;@eox/itemfilter&quot;</span><span style="--shiki-light:#24292E;--shiki-dark:#E1E4E8;">)</span></span></code></pre></div><div class="warning custom-block"><p class="custom-block-title">WARNING</p><p>import maps are not available in runtime config</p></div><h4 id="defined-in-1" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-1" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/eodash/eodash/blob/dd4115a92f2db870d8436b75adde91a2d242e315/core/client/types.d.ts#L17" target="_blank" rel="noreferrer">core/client/types.d.ts:17</a></p><hr><h3 id="onmounted" tabindex="-1">onMounted()? <a class="header-anchor" href="#onmounted" aria-label="Permalink to &quot;onMounted()?&quot;">​</a></h3><blockquote><p><code>optional</code> <strong>onMounted</strong>: (<code>el</code>, <code>store</code>) =&gt; <code>void</code> | <code>Promise</code>&lt;<code>void</code>&gt;</p></blockquote><p>Triggered when the web component is mounted in the DOM.</p><h4 id="parameters" tabindex="-1">Parameters <a class="header-anchor" href="#parameters" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><p>• <strong>el</strong>: <code>null</code> | <code>Element</code></p><p>Web component</p><p>• <strong>store</strong>: <code>Store</code>&lt;<code>&quot;stac&quot;</code>, <code>_UnwrapAll</code>&lt;<code>Pick</code>&lt;<code>object</code>, <code>&quot;stac&quot;</code> | <code>&quot;selectedStac&quot;</code> | <code>&quot;selectedCompareStac&quot;</code>&gt;&gt;, <code>Pick</code>&lt;<code>object</code>, <code>never</code>&gt;, <code>Pick</code>&lt;<code>object</code>, <code>&quot;loadSTAC&quot;</code> | <code>&quot;loadSelectedSTAC&quot;</code> | <code>&quot;loadSelectedCompareSTAC&quot;</code>&gt;&gt;</p><p>Return value of the core STAC pinia store in <code>/core/client/store/stac.ts</code></p><h4 id="returns" tabindex="-1">Returns <a class="header-anchor" href="#returns" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>void</code> | <code>Promise</code>&lt;<code>void</code>&gt;</p><h4 id="defined-in-2" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-2" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/eodash/eodash/blob/dd4115a92f2db870d8436b75adde91a2d242e315/core/client/types.d.ts#L33" target="_blank" rel="noreferrer">core/client/types.d.ts:33</a></p><hr><h3 id="onunmounted" tabindex="-1">onUnmounted()? <a class="header-anchor" href="#onunmounted" aria-label="Permalink to &quot;onUnmounted()?&quot;">​</a></h3><blockquote><p><code>optional</code> <strong>onUnmounted</strong>: (<code>el</code>, <code>store</code>) =&gt; <code>void</code> | <code>Promise</code>&lt;<code>void</code>&gt;</p></blockquote><p>Triggered when the web component is unmounted from the DOM.</p><h4 id="parameters-1" tabindex="-1">Parameters <a class="header-anchor" href="#parameters-1" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><p>• <strong>el</strong>: <code>null</code> | <code>Element</code></p><p>Web component</p><p>• <strong>store</strong>: <code>Store</code>&lt;<code>&quot;stac&quot;</code>, <code>_UnwrapAll</code>&lt;<code>Pick</code>&lt;<code>object</code>, <code>&quot;stac&quot;</code> | <code>&quot;selectedStac&quot;</code> | <code>&quot;selectedCompareStac&quot;</code>&gt;&gt;, <code>Pick</code>&lt;<code>object</code>, <code>never</code>&gt;, <code>Pick</code>&lt;<code>object</code>, <code>&quot;loadSTAC&quot;</code> | <code>&quot;loadSelectedSTAC&quot;</code> | <code>&quot;loadSelectedCompareSTAC&quot;</code>&gt;&gt;</p><p>Return value of the core STAC pinia store in <code>/core/client/store/stac.ts</code></p><h4 id="returns-1" tabindex="-1">Returns <a class="header-anchor" href="#returns-1" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>void</code> | <code>Promise</code>&lt;<code>void</code>&gt;</p><h4 id="defined-in-3" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-3" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/eodash/eodash/blob/dd4115a92f2db870d8436b75adde91a2d242e315/core/client/types.d.ts#L44" target="_blank" rel="noreferrer">core/client/types.d.ts:44</a></p><hr><h3 id="properties-1" tabindex="-1">properties? <a class="header-anchor" href="#properties-1" aria-label="Permalink to &quot;properties?&quot;">​</a></h3><blockquote><p><code>optional</code> <strong>properties</strong>: <code>Record</code>&lt;<code>string</code>, <code>unknown</code>&gt;</p></blockquote><p>Object defining all the properties and attributes of the web component</p><h4 id="defined-in-4" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-4" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/eodash/eodash/blob/dd4115a92f2db870d8436b75adde91a2d242e315/core/client/types.d.ts#L25" target="_blank" rel="noreferrer">core/client/types.d.ts:25</a></p><hr><h3 id="tagname" tabindex="-1">tagName <a class="header-anchor" href="#tagname" aria-label="Permalink to &quot;tagName&quot;">​</a></h3><blockquote><p><strong>tagName</strong>: `${string}-${string}`</p></blockquote><h4 id="defined-in-5" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in-5" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/eodash/eodash/blob/dd4115a92f2db870d8436b75adde91a2d242e315/core/client/types.d.ts#L23" target="_blank" rel="noreferrer">core/client/types.d.ts:23</a></p>',57),n=[r];function c(i,s,l,p,h,u){return t(),o("div",null,n)}const f=e(d,[["render",c]]);export{m as __pageData,f as default};
