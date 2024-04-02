import{_ as e,c as a,o as t,a2 as o}from"./chunks/framework.Dl6Ui02Z.js";const g=JSON.parse('{"title":"Interface: Template<T>","description":"","frontmatter":{},"headers":[],"relativePath":"api/interfaces/Template.md","filePath":"api/interfaces/Template.md"}'),r={name:"api/interfaces/Template.md"},d=o('<p><a href="./../">@eodash/eodash</a> / Template</p><h1 id="interface-template-t" tabindex="-1">Interface: Template&lt;T&gt; <a class="header-anchor" href="#interface-template-t" aria-label="Permalink to &quot;Interface: Template\\&lt;T\\&gt;&quot;">​</a></h1><p>Dashboard rendered widgets specification. 3 types of widgets are supported: <code>&quot;iframe&quot;</code>, <code>&quot;internal&quot;</code>, and <code>&quot;web-component&quot;</code>. A specific object should be provided based on the type of the widget.</p><h2 id="type-parameters" tabindex="-1">Type parameters <a class="header-anchor" href="#type-parameters" aria-label="Permalink to &quot;Type parameters&quot;">​</a></h2><p>• <strong>T</strong> extends <code>ExecutionTime</code> = <code>&quot;compiletime&quot;</code></p><h2 id="properties" tabindex="-1">Properties <a class="header-anchor" href="#properties" aria-label="Permalink to &quot;Properties&quot;">​</a></h2><h3 id="background" tabindex="-1">background? <a class="header-anchor" href="#background" aria-label="Permalink to &quot;background?&quot;">​</a></h3><blockquote><p><strong><code>optional</code></strong> <strong>background</strong>: <a href="./../type-aliases/BackgroundWidget.html"><code>BackgroundWidget</code></a>&lt;<code>T</code>&gt;</p></blockquote><p>Widget rendered as the dashboard background. Has the same specifications of <code>Widget</code> without the <code>title</code> and <code>layout</code> properties</p><h4 id="see" tabindex="-1">See <a class="header-anchor" href="#see" aria-label="Permalink to &quot;See&quot;">​</a></h4><p><a href="./../type-aliases/Widget.html">Widget</a></p><h4 id="source" tabindex="-1">Source <a class="header-anchor" href="#source" aria-label="Permalink to &quot;Source&quot;">​</a></h4><p><a href="https://github.com/eodash/eodash/blob/a29115d/core/types.d.ts#L244" target="_blank" rel="noreferrer">core/types.d.ts:244</a></p><hr><h3 id="gap" tabindex="-1">gap? <a class="header-anchor" href="#gap" aria-label="Permalink to &quot;gap?&quot;">​</a></h3><blockquote><p><strong><code>optional</code></strong> <strong>gap</strong>: <code>number</code></p></blockquote><p>Gap between widgets</p><h4 id="source-1" tabindex="-1">Source <a class="header-anchor" href="#source-1" aria-label="Permalink to &quot;Source&quot;">​</a></h4><p><a href="https://github.com/eodash/eodash/blob/a29115d/core/types.d.ts#L238" target="_blank" rel="noreferrer">core/types.d.ts:238</a></p><hr><h3 id="widgets" tabindex="-1">widgets <a class="header-anchor" href="#widgets" aria-label="Permalink to &quot;widgets&quot;">​</a></h3><blockquote><p><strong>widgets</strong>: <a href="./../type-aliases/Widget.html"><code>Widget</code></a>&lt;<code>T</code>&gt;[]</p></blockquote><p>Array of widgets that will be rendered as dashboard panels.</p><h4 id="source-2" tabindex="-1">Source <a class="header-anchor" href="#source-2" aria-label="Permalink to &quot;Source&quot;">​</a></h4><p><a href="https://github.com/eodash/eodash/blob/a29115d/core/types.d.ts#L248" target="_blank" rel="noreferrer">core/types.d.ts:248</a></p>',25),s=[d];function c(i,n,p,l,h,u){return t(),a("div",null,s)}const m=e(r,[["render",c]]);export{g as __pageData,m as default};
