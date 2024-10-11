import{_ as t,c as a,a2 as o,o as d}from"./chunks/framework.BsmD132R.js";const f=JSON.parse('{"title":"Interface: FunctionalWidget<T>","description":"","frontmatter":{},"headers":[],"relativePath":"api/client/types/interfaces/FunctionalWidget.md","filePath":"api/client/types/interfaces/FunctionalWidget.md"}'),i={name:"api/client/types/interfaces/FunctionalWidget.md"};function r(n,e,c,l,s,h){return d(),a("div",null,e[0]||(e[0]=[o('<p><a href="./../../../">@eodash/eodash</a> / <a href="./../">client/types</a> / FunctionalWidget</p><h1 id="interface-functionalwidget-t" tabindex="-1">Interface: FunctionalWidget&lt;T&gt; <a class="header-anchor" href="#interface-functionalwidget-t" aria-label="Permalink to &quot;Interface: FunctionalWidget\\&lt;T\\&gt;&quot;">​</a></h1><h2 id="type-parameters" tabindex="-1">Type Parameters <a class="header-anchor" href="#type-parameters" aria-label="Permalink to &quot;Type Parameters&quot;">​</a></h2><p>• <strong>T</strong> <em>extends</em> <code>ExecutionTime</code> = <code>&quot;compiletime&quot;</code></p><h2 id="properties" tabindex="-1">Properties <a class="header-anchor" href="#properties" aria-label="Permalink to &quot;Properties&quot;">​</a></h2><h3 id="definewidget" tabindex="-1">defineWidget() <a class="header-anchor" href="#definewidget" aria-label="Permalink to &quot;defineWidget()&quot;">​</a></h3><blockquote><p><strong>defineWidget</strong>: (<code>selectedSTAC</code>) =&gt; <code>undefined</code> | <code>null</code> | <a href="./../type-aliases/StaticWidget.html"><code>StaticWidget</code></a>&lt;<code>T</code>&gt;</p></blockquote><p>Provides a functional definition of widgets, gets triggered whenever a STAC object is selected, and only renders the returned configuration if the <code>id</code> doesn&#39;t match the currently rendered <code>id</code></p><h4 id="parameters" tabindex="-1">Parameters <a class="header-anchor" href="#parameters" aria-label="Permalink to &quot;Parameters&quot;">​</a></h4><p>• <strong>selectedSTAC</strong>: <code>null</code> | <code>StacCatalog</code> | <code>StacCollection</code> | <code>StacItem</code></p><p>Currently selected STAC object</p><h4 id="returns" tabindex="-1">Returns <a class="header-anchor" href="#returns" aria-label="Permalink to &quot;Returns&quot;">​</a></h4><p><code>undefined</code> | <code>null</code> | <a href="./../type-aliases/StaticWidget.html"><code>StaticWidget</code></a>&lt;<code>T</code>&gt;</p><h4 id="defined-in" tabindex="-1">Defined in <a class="header-anchor" href="#defined-in" aria-label="Permalink to &quot;Defined in&quot;">​</a></h4><p><a href="https://github.com/eodash/eodash/blob/a6cbfd5a344289965d3abd0f739ef5cb775b0985/core/client/types.d.ts#L127" target="_blank" rel="noreferrer">core/client/types.d.ts:127</a></p>',15)]))}const u=t(i,[["render",r]]);export{f as __pageData,u as default};
