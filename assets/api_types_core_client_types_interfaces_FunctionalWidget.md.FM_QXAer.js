import{_ as t,c as a,o,ag as i}from"./chunks/framework.DpxBzJw_.js";const u=JSON.parse('{"title":"Interface: FunctionalWidget<T>","description":"","frontmatter":{},"headers":[],"relativePath":"api/types/core/client/types/interfaces/FunctionalWidget.md","filePath":"api/types/core/client/types/interfaces/FunctionalWidget.md"}'),d={name:"api/types/core/client/types/interfaces/FunctionalWidget.md"};function r(c,e,n,s,l,p){return o(),a("div",null,e[0]||(e[0]=[i('<p><a href="./../../../../../">@eodash/eodash</a> / <a href="./../">types/core/client/types</a> / FunctionalWidget</p><h1 id="interface-functionalwidget-t" tabindex="-1">Interface: FunctionalWidget&lt;T&gt; <a class="header-anchor" href="#interface-functionalwidget-t" aria-label="Permalink to &quot;Interface: FunctionalWidget\\&lt;T\\&gt;&quot;">​</a></h1><p>Defined in: dist/types/core/client/types.d.ts:169</p><h2 id="type-parameters" tabindex="-1">Type Parameters <a class="header-anchor" href="#type-parameters" aria-label="Permalink to &quot;Type Parameters&quot;">​</a></h2><p>• <strong>T</strong> <em>extends</em> <code>ExecutionTime</code> = <code>&quot;compiletime&quot;</code></p><h2 id="properties" tabindex="-1">Properties <a class="header-anchor" href="#properties" aria-label="Permalink to &quot;Properties&quot;">​</a></h2><h3 id="definewidget" tabindex="-1">defineWidget() <a class="header-anchor" href="#definewidget" aria-label="Permalink to &quot;defineWidget()&quot;">​</a></h3><blockquote><p><strong>defineWidget</strong>: (<code>selectedSTAC</code>) =&gt; <code>undefined</code> | <code>null</code> | <a href="./../type-aliases/StaticWidget.html"><code>StaticWidget</code></a>&lt;<code>T</code>&gt;</p></blockquote><p>Defined in: dist/types/core/client/types.d.ts:177</p><p>Provides a functional definition of widgets, gets triggered whenever a STAC object is selected, and only renders the returned configuration if the <code>id</code> doesn&#39;t match the currently rendered <code>id</code></p><h4 id="parameters" tabindex="-1">Parameters <a class="header-anchor" href="#parameters" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><h5 id="selectedstac" tabindex="-1">selectedSTAC <a class="header-anchor" href="#selectedstac" aria-label="Permalink to &quot;selectedSTAC&quot;">​</a></h5><p>Currently selected STAC object</p><p><code>null</code> | <code>StacCatalog</code> | <code>StacCollection</code> | <code>StacItem</code></p><h4 id="returns" tabindex="-1">Returns <a class="header-anchor" href="#returns" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>undefined</code> | <code>null</code> | <a href="./../type-aliases/StaticWidget.html"><code>StaticWidget</code></a>&lt;<code>T</code>&gt;</p>',16)]))}const f=t(d,[["render",r]]);export{u as __pageData,f as default};
