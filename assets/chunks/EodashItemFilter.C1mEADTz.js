var xo=Object.defineProperty;var lr=t=>{throw TypeError(t)};var wo=(t,e,n)=>e in t?xo(t,e,{enumerable:!0,configurable:!0,writable:!0,value:n}):t[e]=n;var Ft=(t,e,n)=>wo(t,typeof e!="symbol"?e+"":e,n),nn=(t,e,n)=>e.has(t)||lr("Cannot "+n);var V=(t,e,n)=>(nn(t,e,"read from private field"),n?n.call(t):e.get(t)),q=(t,e,n)=>e.has(t)?lr("Cannot add the same private member more than once"):e instanceof WeakSet?e.add(t):e.set(t,n),xe=(t,e,n,r)=>(nn(t,e,"write to private field"),r?r.call(t,n):e.set(t,n),n),L=(t,e,n)=>(nn(t,e,"access private method"),n);import{useSTAcStore as vo}from"@/store/stac";import{h as it,k as C,D as ht}from"./lit-element.Dq2G5o1p.js";import{d as Zt,_ as Ne,Q as _o,a as rn,o as Be}from"./unsafe-html.Bw5O75VD.js";import{n as H}from"./toolcool-range-slider.min.BJFXFSTk.js";import{c as bt,g as $r}from"./commonjsHelpers.Cpj98o6Y.js";import{p as Mo,v as Ao,o as Co,c as So,j as cr,t as ur,K as Eo}from"./framework.DiowTioX.js";const $o=`
:host {
  display: flex;
  box-sizing: border-box;
  height: 100%;
  line-height: 1;
}
*,
*:before,
*:after {
  box-sizing: inherit;
}
form#itemfilter {
  height: 100%;
  width: 100%;
  max-width: 100%;
  display: flex;
  flex-direction: column;
}
form#itemfilter:not(.inline) {
  overflow-y: auto;
}
details {
  width: 100%;
}
`,ne=`
:host, :root {
  --item-color: color-mix(
    in srgb,
    var(--primary-color) 10%,
    transparent
  );
  --item-hover-color: color-mix(
    in srgb,
    var(--secondary-color) 30%,
    transparent
  );
  --item-select-color: var(--primary-color);
  --inline-bg-color: color-mix(
    in srgb,
    var(--secondary-color) 10%,
    transparent
  );
  --border-color: color-mix(
    in srgb,
    #000000 20%,
    transparent
  );
  --background-color: #fff;
  --padding: 0.5rem;
  --text-transform: capitalize;
  --form-flex-direction: column;
  --filter-display: block;
}
* {
  font-family: Roboto, sans-serif;
}
form#itemfilter {
  flex-direction: var(--form-flex-direction);
}
eox-itemfilter-container {
  min-width: 200px;
  display: var(--filter-display);
}
eox-itemfilter-results {
  flex-grow: 1;
}
ul {
  padding-left: 0;
  margin-top: 0;
}
li {
  list-style: none;
}
li span {
  text-overflow: ellipsis;
  white-space: nowrap;
  display: flex;
  align-items: center;
}
.cards li span {
  display: block;
}
li label {
  display: flex;
  align-items: center;
}
details summary > * {
  display: inline;
}
details summary {
  display: flex;
  align-items: center;
  border-bottom: 1px solid #0002;
  padding: .5rem var(--padding);
}

details > summary::-webkit-details-marker {
  display: none;
}

.title {
  font-size: 13px;
  align-items: center;
  text-transform: var(--text-transform);
}
.cards .title {
  font-size: 16px;
  font-weight: 600;
  text-wrap: auto;
  line-height: 19px;
}
.subtitle {
  font-size: 11px;
  opacity: .7;
  margin-top: 6px;
}
.cards .subtitle {
  font-size: 14px;
  color: #757575;
  text-wrap: auto;
  line-height: 19px;
}
.image {
  width: 24px;
  height: 24px;
  object-fit: cover;
  overflow: hidden;
  margin-right: 8px;
}
.cards .image {
  width: 100%;
  height: 190px;
  margin-bottom: 8px;
}
.title-container {
  display: flex;
  flex-direction: column;
}
h6.main-heading {
  font-size: 1rem;
  margin-block-start: 1.33em;
  margin-block-end: 1.33em;
  margin-top: var(--padding);
  padding: 0 var(--padding);
}
details summary .title {
  display: flex;
  font-weight: 500;
}
details.details-filter summary::after,
details.details-results summary::before {
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%230009' viewBox='0 0 24 24'%3E%3Ctitle%3Echevron-right%3C/title%3E%3Cpath d='M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z' /%3E%3C/svg%3E");
  height: 24px;
  width: 24px;
}
details.details-filter summary::after {
  margin-left: auto;
  transform: rotate(90deg);
}
details[open] summary::before {
  transform: rotate(90deg);
}
details[open] summary::after {
  transform: rotate(270deg);
}
eox-itemfilter-expandcontainer {
  max-height: 200px;
}
eox-itemfilter-expandcontainer > [data-type=filter] {
  display: block;
  height: calc(100% - 32px);
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 var(--padding);
}
[data-type=filter] .title,
details summary {
  text-transform: var(--text-transform);
}
li,
label,
details,
input[type="checkbox"],
input[type="radio"] {
  cursor: pointer;
}
input[type="checkbox"],
input[type="radio"] {
  margin: 0;
}
input[type="text"] {
  box-sizing: border-box;
  width: 100%;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  padding: 5px 7px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}
section:not(section:last-of-type) {
  margin-bottom: 1rem;
}
#section-results {
  overflow: hidden;
  flex: 1;
  display: flex;
  flex-direction: column;
}
ul:not(#filters) > li {
  padding: 5px 0;
}
ul#results li {
  padding: 5px var(--padding);
}
ul#results ul.cards {
  display: flex;
  flex-wrap: wrap;
  width: 100%;
  gap: 40px;
  margin: 20px 0;
  cursor: initial;
}
ul#results ul.cards li {
  flex-basis: calc(33.3% - 77px);
  min-width: 0;
  align-self: flex-start;
}
@media screen and (max-width: 768px) {
  ul#results ul.cards li {
    flex-basis: calc(50% - 70px);
  }
}
@media screen and (max-width: 480px) {
  ul#results ul.cards li {
    flex-basis: 100%;
  }
}
section {
  position: relative;
  background-color: var(--background-color);
}
button#filter-reset {
  position: absolute;
  top: 0;
  right: var(--padding);
  padding: 2px 10px;
}
.count {
  display: flex;
  justify-content: center;
  align-items: center;
  background: var(--secondary-color);
  padding: 0 12px;
  height: 20px;
  border-radius: 10px;
  color: var(--primary-color);
  font-weight: 500;
  margin-left: 9px;
}
eox-itemfilter-range,
tc-range-slider {
  align-items: center;
  display: block;
}
tc-range-slider {
  width: calc(100% - 16px);
  margin-left: 8px;
  margin-right: 8px;
  --width: 100%;
}
.range-before,
.range-after {
  font-size: small;
}
.range-before,
.range-after {
  margin: 1rem 0px;
}

button.reset-icon:before {
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Eclose%3C/title%3E%3Cpath d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' /%3E%3C/svg%3E");
}
eox-itemfilter-expandcontainer button.reset-icon {
  margin-left: 4px;
  margin-top: -5px;
  height: 14px;
  width: 14px;
}
eox-itemfilter-expandcontainer button.reset-icon:before {
  height: 14px;
  width: 14px;
}
.inline-content {
  border: 1.5px solid var(--secondary-color);
  border-radius: 4px;
  max-height: 300px;
  overflow-y: auto;
  background: var(--inline-bg-color);
  margin-top: 4px;
  padding: 8px;
}
.inline-container {
  position: relative;
  align-items: center;
}
.inline-container-wrapper {
  width: 100%;
  position: relative;
}
.inline-container {
  position: relative;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  height: 24px;
  padding: 8px;
  flex: 1;
  justify-content: space-between;
  cursor: text;
  transition: all 0.2s ease-in-out;
  display: flex;
}
.inline-container:hover {
  border: 1px solid var(--primary-color);
}
[popover] {
  position: fixed;
  top: 0;
  left: 0;
  margin: 0;
  padding: 0;
  background-color: var(--background-color);
  border: none;
}
.input-container {
  display: flex;
  flex: 1;
  align-items: center;
}
.input-container input,
.input-container input:focus {
  height: 100%;
  border: none;
  outline: none;
  border: 0;
  min-width: 25%;
}
.button-container {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  right: 1px;
  top: 5px;
  height: calc(100% - 10px);
  width: 34px;
  background: white;
}
button.icon {
  color: #004170;
  height: 24px;
  font-size: large;
  width: unset;
}
.inline-container::-webkit-scrollbar {
  height: 2px;
}
.inline-container::-webkit-scrollbar-thumb {
  background: lightgrey;
  border-radius: 2px;
}
.hidden {
  height: 0;
  padding: 0;
  border: none;
}
.hidden:hover {
  border: none;
}
.chip-title {
  pointer-events: none;
  text-transform: var(--text-transform);
}
.chip {
  display: flex;
  align-items: center;
  background: var(--item-color);
  border-radius: 30px;
  margin-right: 4px;
  padding: 5px 10px;
  font-size: small;
  cursor: default;
  white-space: nowrap;
}
.chip.highlighted {
  background: var(--primary-color);
  color: white;
}
.chip-close {
  cursor: pointer;
  font-weight: 600;
  position: absolute;
  right: -25px;
  background: white;
  top: 0;
  height: 100%;
  display: flex;
  align-items: center;
  height: 24px;
  width: 24px;
}
.chip-close:before {
  position: absolute;
  text-indent: 0;
  line-height: initial;
  height: 24px;
  width: 24px;
  content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Eclose%3C/title%3E%3Cpath d='M19,6.41L17.59,5L12,10.59L6.41,5L5,6.41L10.59,12L5,17.59L6.41,19L12,13.41L17.59,19L19,17.59L13.41,12L19,6.41Z' /%3E%3C/svg%3E");
}
.chip-container {
  position: relative;
  max-width: 75%;
}
.autocomplete-container,
.text-container {
  position: relative;
  align-items: center;
  width: 100%;
  box-sizing: border-box;
  justify-content: space-between;
  cursor: text;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
  background: white;
}
.autocomplete-container-wrapper,
.text-container-wrapper {
  position: relative;
  display: flex;
  align-items: center;
  flex: 1;
  overflow-x: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.autocomplete-container-wrapper::-webkit-scrollbar {
  display: none;
}
.chip-wrapper {
  -ms-overflow-style: none;
  scrollbar-width: none;
}
.chip-wrapper::-webkit-scrollbar {
  display: none;
  width: 0;
  background: transparent;
}
.autocomplete-input,
.text-input {
  flex: 1;
  border: 1px solid var(--border-color);
  outline: none;
  box-sizing: border-box;
  margin-top: 0 !important;
  margin-bottom: 0 !important;
  min-width: 150px;
}
input[type="text"].text-input,
input[type="text"].autocomplete-input {
  padding: 9px 6px !important;
  border-radius: 4px;
}
.text-input:hover,
.autocomplete-input:hover {
  border: 1px solid var(--primary-color);
}
.text-input:invalid {
  border: 1px solid red;
}
.selected-items {
  display: flex;
  flex-wrap: nowrap;
  gap: 4px;
}
.select li:hover,
.multiselect li:hover,
eox-itemfilter-results li:hover {
  background: var(--item-hover-color);
}
eox-itemfilter-results li.highlighted {
  color: var(--background-color);
  background: var(--item-select-color);
}
.selected-item span {
  margin-right: 8px;
}
.selected-item button {
  background: none;
  border: none;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  line-height: 1;
}
.multiselect-container,
.select-container {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.multiselect-container label,
.select-container label {
  display: flex;
  align-items: center;
  cursor: pointer;
}
.multiselect-container input,
.select-container input {
  margin-right: 8px;
}
.select-overflow {
  max-height: 185px;
  overflow-y: auto;
}
.chip-title strong {
  font-weight: 500;
}
.chip-wrapper {
  max-width: 100%;
  overflow-x: scroll;
}
.chip-container {
  display: flex;
  flex: 0;
}
.input-container.dirty-filter-input {
  margin-left: 25px;
}
.error-validation {
  position: relative;
  color: red;
  font-size: x-small;
  top: -8px;
}
`,Lo=`:root,:host { --spacing: 1rem; --block-spacing-vertical: calc(var(--spacing) * 2); --block-spacing-horizontal: var(--spacing); --background-color: var(--eox-background-color, white); --color: var(--eox-color, #2c3d49); --h-color: var(--eox-h-color, var(--color)); --hover-transparency: var(--eox-hover-transparency, 20%); --bg-hover-transparency: var(--eox-bg-hover-transparency, 40%); --btn-hover-transparency: var(--eox-btn-hover-transparency, 80%); --primary-color: var(--eox-primary-color, #004170); --primary-color-hover: color-mix( in srgb, var(--primary-color) var(--hover-transparency), transparent ); --primary-bg-color-hover: color-mix( in srgb, var(--primary-color) var(--bg-hover-transparency), transparent ); --primary-btn-color-hover: color-mix( in srgb, var(--primary-color) var(--btn-hover-transparency), transparent ); --secondary-color: var(--eox-secondary-color, #c6d4df); --secondary-color-hover: color-mix( in srgb, var(--secondary-color) var(--hover-transparency), transparent ); --secondary-bg-color-hover: color-mix( in srgb, var(--secondary-color) var(--bg-hover-transparency), transparent ); --secondary-btn-color-hover: color-mix( in srgb, var(--secondary-color) var(--btn-hover-transparency), transparent ); --success: var(--eox-success, #26cc0f); --warning: var(--eox-warning, #f18e32); --error: var(--eox-error, #ff5252); --header-font-family: var(--eox-header-font-family, "Roboto", sans-serif); --body-font-family: var(--eox-body-font-family, "Roboto", sans-serif);}* { font-size: normal; font-family: var(--body-font-family); color: var(--eox-color);}h1,h2,h3,h4,h5,h6 { font-family: var(--header-font-family);}span,p,div,main,label { font-family: var(--body-font-family);}@media (min-width: 576px) { .container { max-width: 510px; padding-right: 0; padding-left: 0; --block-spacing-vertical: calc(var(--spacing) * 2.5); }}@media (min-width: 768px) { .container { max-width: 700px; --block-spacing-vertical: calc(var(--spacing) * 3); }}@media (min-width: 992px) { .container { max-width: 920px; --block-spacing-vertical: calc(var(--spacing) * 3.5); }}@media (min-width: 1200px) { .container { max-width: 1130px; --block-spacing-vertical: calc(var(--spacing) * 4); }}.container { width: 100%; margin-right: auto; margin-left: auto; display: block; padding: var(--block-spacing-vertical) var(--block-spacing-horizontal);}h1,h2,h3 { line-height: 120%; margin-top: 0.8rem; margin-bottom: 0.8rem;}p { --font-size: 1rem; font-weight: 400; line-height: 170%; margin-top: 0.8rem; margin-bottom: 1.6rem; font-size: var(--font-size);}body { padding: 0; margin: 0;}.sb-show-main.sb-main-padded { padding: 0;}h1,h2,h3,h4,h5,h6 { --font-weight: 700;}h1 { --font-size: 3rem; --typography-spacing-vertical: 0.5rem;}h2 { --font-size: 2rem; --typography-spacing-vertical: 0.5rem;}h3 { --font-size: 1.75rem; --typography-spacing-vertical: 0.5rem;}h4 { --font-size: 1.5rem; --typography-spacing-vertical: 0.5rem;}h5 { --font-size: 1.25rem; --typography-spacing-vertical: 0.5rem;}h1,h2,h3,h4,h5,h6 { margin-top: 0; margin-bottom: var(--typography-spacing-vertical); color: var(--h-color); font-weight: var(--font-weight); font-size: var(--font-size); font-family: var(--header-font-family);}pre { position: relative; border-radius: 4px; z-index: 1; margin: 0; padding: 20px 0; background: transparent; background: var(--code-bg-color, #8e96aa24); overflow: auto;}code { display: block; padding: 0 24px; width: fit-content; min-width: 100%; line-height: var(--code-line-height, 1.7); font-family: var(--code-font-family, monospace); font-size: var(--code-font-size, var(--font-size)); color: var(--code-color, #004170);}:not(pre) > code { display: inline; border-radius: 4px; background: var(--code-bg-color, #8e96aa24); padding: var(--code-padding, 3px 6px);}button,.button { display: inline-flex; position: relative; align-items: center; color: #fff; border-width: 0; outline: none; border-radius: 4px; padding: 16px; height: 36px; cursor: pointer; font-family: inherit; font-size: 0.875rem; text-transform: uppercase; letter-spacing: 1.25px; font-weight: 500; box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12); transition-property: box-shadow, transform, opacity, background; transition-duration: 0.28s; transition-timing-function: cubic-bezier(0.4, 0, 0.2, 1);}button:hover:not([disabled]):not(.icon):not(.json-editor-btntype-*),.button:hover:not([disabled]):not(.icon) { box-shadow: 0px 2px 4px -1px rgba(0, 0, 0, 0.2), 0px 4px 5px 0px rgba(0, 0, 0, 0.14), 0px 1px 10px 0px rgba(0, 0, 0, 0.12); background: var(--primary-btn-color-hover);}button,button:active,.button,.button:active { background: var(--primary-color);}button[disabled],.button[disabled] { opacity: 0.5; cursor: not-allowed;}button.block,.button.block { display: block;}button.outline,.button.outline { background: transparent; box-shadow: none; color: var(--primary-color); outline: 1px solid var(--primary-color);}button.outline:hover,.button.outline:hover { background: transparent;}button.icon,.button.icon,button[class*="json-editor-btntype-"] { background: transparent; border: none; box-shadow: none; padding: 0; border-radius: 50%; width: 24px; height: 24px; text-indent: -9999px;}button.icon-text,.button.icon-text { text-indent: 26px;}button.icon-text.block,.button.icon-text.block { text-indent: 20px;}button.icon:before,button.icon-text:before,.button.icon:before,.button.icon-text:before { position: absolute; text-indent: 0; line-height: initial;}button.icon-text.block:before,.button.icon-text.block:before { text-indent: -54px;}button.icon:before,.button.icon:before,button[class*="json-editor-btntype-"]::before { width: 24px; height: 24px; margin-right: 0;}button.icon-text:before,.button.icon-text:before { width: 18px; height: 18px;}button.small,.button.small { height: 28px; padding: 12.4px; font-size: 0.75rem;}button.smallest.icon,button.smallest.icon::before { height: 16px; width: 16px; padding: 0;}input[type="checkbox"] { appearance: none; -webkit-appearance: none; margin: 0; cursor: pointer; display: flex; flex-direction: row; align-items: center; width: 24px; height: 24px;}input[type="checkbox"]:after { display: block; content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Echeckbox-blank-outline%3C/title%3E%3Cpath d='M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z' /%3E%3C/svg%3E"); width: 20px; height: 20px; margin-right: 4px;}input[type="checkbox"]:checked:after { content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Echeckbox-marked%3C/title%3E%3Cpath d='M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z' /%3E%3C/svg%3E");}textarea { height: 90px; resize: none; border-radius: 4px; box-sizing: border-box !important; width: 100%; padding: 5px 7px; border: 1px solid var(--secondary-color); font-size: smaller; background: var(--background-color);}input[type="text"],input[type="url"],input[type="email"],input[type="password"],input[type="text"],input[type="number"],input[type="search"],input[type="tel"],select { box-sizing: border-box; width: 100%; margin-top: 0.5rem; margin-bottom: 0.5rem; padding: 5px 7px; border-radius: 4px; border: 1px solid #0004;}ul.list-wrap { padding: 0;}ul.list-wrap li:hover,ul.list-wrap li.selected { background: var(--secondary-bg-color-hover);}ul.list-wrap li { list-style: none; padding: 4px;}ul.list-wrap li { border-bottom: 1.2px solid var(--secondary-color);}ul.list-wrap li:first-child { border-top: 1.2px solid var(--secondary-color);}ul.list-wrap li .list { width: 100%; align-items: center; justify-content: space-between; display: flex; align-items: center; cursor: pointer; font-size: small; gap: 10px;}ul.list-wrap li .list span { display: flex; align-items: center; cursor: pointer; font-size: small; flex-grow: 1;}input[type="radio"] { appearance: none; -webkit-appearance: none; margin: 0; cursor: pointer; display: flex; flex-direction: row; align-items: center; width: 24px; height: 24px;}label span { font-size: small;}input[type="radio"]:after { display: block; content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Eradiobox-blank%3C/title%3E%3Cpath d='M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' /%3E%3C/svg%3E"); width: 20px; height: 20px; margin-right: 4px;}input[type="radio"]:checked:after { content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Eradiobox-marked%3C/title%3E%3Cpath d='M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7Z' /%3E%3C/svg%3E");}input[type="range"] { -webkit-appearance: none; width: 90%; margin-left: 5%; height: 6px; border-radius: 5px; background: #d7dcdf; outline: none; padding: 0;}input[type="range"]::-webkit-slider-thumb { appearance: none; width: 15px; height: 15px; border-radius: 50%; background: #2c3e50; cursor: pointer; transition: background 0.15s ease-in-out;}.range-slider { margin: 60px 0 0 0;}.range-slider { width: 100%;}input[type="range"]::-webkit-slider-thumb:hover { background: #00416f;}input[type="range"]:active::-webkit-slider-thumb { background: #00416f;}input[type="range"]::-moz-range-thumb { width: 15px; height: 15px; border: 0; border-radius: 50%; background: #2c3e50; cursor: pointer; transition: background 0.15s ease-in-out;}input[type="range"]::-moz-range-thumb:hover { background: #00416f;}input[type="range"]:active::-moz-range-thumb { background: #00416f;}input[type="range"]:focus::-webkit-slider-thumb { box-shadow: 0 0 0 3px #fff0, 0 0 0 6px #00416f00;}.range-slider__value { display: inline-block; position: relative; width: 60px; color: #fff; line-height: 20px; text-align: center; border-radius: 3px; background: #2c3e50; padding: 5px 10px; margin-left: 8px;}.range-slider__value:after { position: absolute; top: 8px; left: -7px; width: 0; height: 0; border-top: 7px solid transparent; border-right: 7px solid #2c3e50; border-bottom: 7px solid transparent; content: "";}input::-moz-focus-inner,input::-moz-focus-outer { border: 0;}`;var Pe,Lr;class ko extends it{constructor(){super();q(this,Pe);this.filterObject={},this.unstyled=!1}static get properties(){return{filterObject:{attribute:!1,type:Object},unstyled:{type:Boolean}}}render(){return C`
      <style>
        ${!this.unstyled&&ne}
      </style>

      ${H(this.filterObject.featured,()=>C`<slot name="filter"></slot>`,()=>C`<details
            @toggle="${L(this,Pe,Lr)}"
            class="details-filter"
            ?open=${this.filterObject.expanded||ht}
          >
            <summary>
              <span
                class="title"
                style="${!this.filterObject.title&&"text-transform: var(--text-transform)"}"
              >
                ${this.filterObject.title||this.filterObject.key||"Filter"}
                <slot name="reset-button"></slot>
              </span>
            </summary>
            <div>
              <slot name="filter"></slot>
            </div>
          </details>`)}
    `}}Pe=new WeakSet,Lr=function(n){this.dispatchEvent(new CustomEvent("details-toggled",{detail:n,bubbles:!0,composed:!0}))};customElements.define("eox-itemfilter-expandcontainer",ko);function dt(t){return Array.isArray?Array.isArray(t):Pr(t)==="[object Array]"}const Ro=1/0;function Po(t){if(typeof t=="string")return t;let e=t+"";return e=="0"&&1/t==-Ro?"-0":e}function To(t){return t==null?"":Po(t)}function nt(t){return typeof t=="string"}function kr(t){return typeof t=="number"}function jo(t){return t===!0||t===!1||Oo(t)&&Pr(t)=="[object Boolean]"}function Rr(t){return typeof t=="object"}function Oo(t){return Rr(t)&&t!==null}function W(t){return t!=null}function sn(t){return!t.trim().length}function Pr(t){return t==null?t===void 0?"[object Undefined]":"[object Null]":Object.prototype.toString.call(t)}const No="Incorrect 'index' type",Bo=t=>`Invalid value for key ${t}`,Do=t=>`Pattern length exceeds max of ${t}.`,Ho=t=>`Missing ${t} property in key`,Io=t=>`Property 'weight' in key '${t}' must be a positive integer`,fr=Object.prototype.hasOwnProperty;class zo{constructor(e){this._keys=[],this._keyMap={};let n=0;e.forEach(r=>{let i=Tr(r);this._keys.push(i),this._keyMap[i.id]=i,n+=i.weight}),this._keys.forEach(r=>{r.weight/=n})}get(e){return this._keyMap[e]}keys(){return this._keys}toJSON(){return JSON.stringify(this._keys)}}function Tr(t){let e=null,n=null,r=null,i=1,o=null;if(nt(t)||dt(t))r=t,e=hr(t),n=un(t);else{if(!fr.call(t,"name"))throw new Error(Ho("name"));const a=t.name;if(r=a,fr.call(t,"weight")&&(i=t.weight,i<=0))throw new Error(Io(a));e=hr(a),n=un(a),o=t.getFn}return{path:e,id:n,weight:i,src:r,getFn:o}}function hr(t){return dt(t)?t:t.split(".")}function un(t){return dt(t)?t.join("."):t}function qo(t,e){let n=[],r=!1;const i=(o,a,l)=>{if(W(o))if(!a[l])n.push(o);else{let u=a[l];const f=o[u];if(!W(f))return;if(l===a.length-1&&(nt(f)||kr(f)||jo(f)))n.push(To(f));else if(dt(f)){r=!0;for(let h=0,p=f.length;h<p;h+=1)i(f[h],a,l+1)}else a.length&&i(f,a,l+1)}};return i(t,nt(e)?e.split("."):e,0),r?n:n[0]}const Uo={includeMatches:!1,findAllMatches:!1,minMatchCharLength:1},Vo={isCaseSensitive:!1,includeScore:!1,keys:[],shouldSort:!0,sortFn:(t,e)=>t.score===e.score?t.idx<e.idx?-1:1:t.score<e.score?-1:1},Wo={location:0,threshold:.6,distance:100},Go={useExtendedSearch:!1,getFn:qo,ignoreLocation:!1,ignoreFieldNorm:!1,fieldNormWeight:1};var _={...Vo,...Uo,...Wo,...Go};const Ko=/[^ ]+/g;function Yo(t=1,e=3){const n=new Map,r=Math.pow(10,e);return{get(i){const o=i.match(Ko).length;if(n.has(o))return n.get(o);const a=1/Math.pow(o,.5*t),l=parseFloat(Math.round(a*r)/r);return n.set(o,l),l},clear(){n.clear()}}}class Rn{constructor({getFn:e=_.getFn,fieldNormWeight:n=_.fieldNormWeight}={}){this.norm=Yo(n,3),this.getFn=e,this.isCreated=!1,this.setIndexRecords()}setSources(e=[]){this.docs=e}setIndexRecords(e=[]){this.records=e}setKeys(e=[]){this.keys=e,this._keysMap={},e.forEach((n,r)=>{this._keysMap[n.id]=r})}create(){this.isCreated||!this.docs.length||(this.isCreated=!0,nt(this.docs[0])?this.docs.forEach((e,n)=>{this._addString(e,n)}):this.docs.forEach((e,n)=>{this._addObject(e,n)}),this.norm.clear())}add(e){const n=this.size();nt(e)?this._addString(e,n):this._addObject(e,n)}removeAt(e){this.records.splice(e,1);for(let n=e,r=this.size();n<r;n+=1)this.records[n].i-=1}getValueForItemAtKeyId(e,n){return e[this._keysMap[n]]}size(){return this.records.length}_addString(e,n){if(!W(e)||sn(e))return;let r={v:e,i:n,n:this.norm.get(e)};this.records.push(r)}_addObject(e,n){let r={i:n,$:{}};this.keys.forEach((i,o)=>{let a=i.getFn?i.getFn(e):this.getFn(e,i.path);if(W(a)){if(dt(a)){let l=[];const u=[{nestedArrIndex:-1,value:a}];for(;u.length;){const{nestedArrIndex:f,value:h}=u.pop();if(W(h))if(nt(h)&&!sn(h)){let p={v:h,i:f,n:this.norm.get(h)};l.push(p)}else dt(h)&&h.forEach((p,y)=>{u.push({nestedArrIndex:y,value:p})})}r.$[o]=l}else if(nt(a)&&!sn(a)){let l={v:a,n:this.norm.get(a)};r.$[o]=l}}}),this.records.push(r)}toJSON(){return{keys:this.keys,records:this.records}}}function jr(t,e,{getFn:n=_.getFn,fieldNormWeight:r=_.fieldNormWeight}={}){const i=new Rn({getFn:n,fieldNormWeight:r});return i.setKeys(t.map(Tr)),i.setSources(e),i.create(),i}function Xo(t,{getFn:e=_.getFn,fieldNormWeight:n=_.fieldNormWeight}={}){const{keys:r,records:i}=t,o=new Rn({getFn:e,fieldNormWeight:n});return o.setKeys(r),o.setIndexRecords(i),o}function we(t,{errors:e=0,currentLocation:n=0,expectedLocation:r=0,distance:i=_.distance,ignoreLocation:o=_.ignoreLocation}={}){const a=e/t.length;if(o)return a;const l=Math.abs(r-n);return i?a+l/i:l?1:a}function Fo(t=[],e=_.minMatchCharLength){let n=[],r=-1,i=-1,o=0;for(let a=t.length;o<a;o+=1){let l=t[o];l&&r===-1?r=o:!l&&r!==-1&&(i=o-1,i-r+1>=e&&n.push([r,i]),r=-1)}return t[o-1]&&o-r>=e&&n.push([r,o-1]),n}const $t=32;function Zo(t,e,n,{location:r=_.location,distance:i=_.distance,threshold:o=_.threshold,findAllMatches:a=_.findAllMatches,minMatchCharLength:l=_.minMatchCharLength,includeMatches:u=_.includeMatches,ignoreLocation:f=_.ignoreLocation}={}){if(e.length>$t)throw new Error(Do($t));const h=e.length,p=t.length,y=Math.max(0,Math.min(r,p));let g=o,b=y;const w=l>1||u,S=w?Array(p):[];let M;for(;(M=t.indexOf(e,b))>-1;){let B=we(e,{currentLocation:M,expectedLocation:y,distance:i,ignoreLocation:f});if(g=Math.min(B,g),b=M+h,w){let K=0;for(;K<h;)S[M+K]=1,K+=1}}b=-1;let $=[],E=1,j=h+p;const P=1<<h-1;for(let B=0;B<h;B+=1){let K=0,J=j;for(;K<J;)we(e,{errors:B,currentLocation:y+J,expectedLocation:y,distance:i,ignoreLocation:f})<=g?K=J:j=J,J=Math.floor((j-K)/2+K);j=J;let At=Math.max(1,y-J+1),Kt=a?p:Math.min(y+J,p)+h,pt=Array(Kt+2);pt[Kt+1]=(1<<B)-1;for(let U=Kt;U>=At;U-=1){let Ot=U-1,ie=n[t.charAt(Ot)];if(w&&(S[Ot]=+!!ie),pt[U]=(pt[U+1]<<1|1)&ie,B&&(pt[U]|=($[U+1]|$[U])<<1|1|$[U+1]),pt[U]&P&&(E=we(e,{errors:B,currentLocation:Ot,expectedLocation:y,distance:i,ignoreLocation:f}),E<=g)){if(g=E,b=Ot,b<=y)break;At=Math.max(1,2*y-b)}}if(we(e,{errors:B+1,currentLocation:y,expectedLocation:y,distance:i,ignoreLocation:f})>g)break;$=pt}const et={isMatch:b>=0,score:Math.max(.001,E)};if(w){const B=Fo(S,l);B.length?u&&(et.indices=B):et.isMatch=!1}return et}function Jo(t){let e={};for(let n=0,r=t.length;n<r;n+=1){const i=t.charAt(n);e[i]=(e[i]||0)|1<<r-n-1}return e}class Or{constructor(e,{location:n=_.location,threshold:r=_.threshold,distance:i=_.distance,includeMatches:o=_.includeMatches,findAllMatches:a=_.findAllMatches,minMatchCharLength:l=_.minMatchCharLength,isCaseSensitive:u=_.isCaseSensitive,ignoreLocation:f=_.ignoreLocation}={}){if(this.options={location:n,threshold:r,distance:i,includeMatches:o,findAllMatches:a,minMatchCharLength:l,isCaseSensitive:u,ignoreLocation:f},this.pattern=u?e:e.toLowerCase(),this.chunks=[],!this.pattern.length)return;const h=(y,g)=>{this.chunks.push({pattern:y,alphabet:Jo(y),startIndex:g})},p=this.pattern.length;if(p>$t){let y=0;const g=p%$t,b=p-g;for(;y<b;)h(this.pattern.substr(y,$t),y),y+=$t;if(g){const w=p-$t;h(this.pattern.substr(w),w)}}else h(this.pattern,0)}searchIn(e){const{isCaseSensitive:n,includeMatches:r}=this.options;if(n||(e=e.toLowerCase()),this.pattern===e){let b={isMatch:!0,score:0};return r&&(b.indices=[[0,e.length-1]]),b}const{location:i,distance:o,threshold:a,findAllMatches:l,minMatchCharLength:u,ignoreLocation:f}=this.options;let h=[],p=0,y=!1;this.chunks.forEach(({pattern:b,alphabet:w,startIndex:S})=>{const{isMatch:M,score:$,indices:E}=Zo(e,b,w,{location:i+S,distance:o,threshold:a,findAllMatches:l,minMatchCharLength:u,includeMatches:r,ignoreLocation:f});M&&(y=!0),p+=$,M&&E&&(h=[...h,...E])});let g={isMatch:y,score:y?p/this.chunks.length:1};return y&&r&&(g.indices=h),g}}class _t{constructor(e){this.pattern=e}static isMultiMatch(e){return dr(e,this.multiRegex)}static isSingleMatch(e){return dr(e,this.singleRegex)}search(){}}function dr(t,e){const n=t.match(e);return n?n[1]:null}class Qo extends _t{constructor(e){super(e)}static get type(){return"exact"}static get multiRegex(){return/^="(.*)"$/}static get singleRegex(){return/^=(.*)$/}search(e){const n=e===this.pattern;return{isMatch:n,score:n?0:1,indices:[0,this.pattern.length-1]}}}class ta extends _t{constructor(e){super(e)}static get type(){return"inverse-exact"}static get multiRegex(){return/^!"(.*)"$/}static get singleRegex(){return/^!(.*)$/}search(e){const r=e.indexOf(this.pattern)===-1;return{isMatch:r,score:r?0:1,indices:[0,e.length-1]}}}class ea extends _t{constructor(e){super(e)}static get type(){return"prefix-exact"}static get multiRegex(){return/^\^"(.*)"$/}static get singleRegex(){return/^\^(.*)$/}search(e){const n=e.startsWith(this.pattern);return{isMatch:n,score:n?0:1,indices:[0,this.pattern.length-1]}}}class na extends _t{constructor(e){super(e)}static get type(){return"inverse-prefix-exact"}static get multiRegex(){return/^!\^"(.*)"$/}static get singleRegex(){return/^!\^(.*)$/}search(e){const n=!e.startsWith(this.pattern);return{isMatch:n,score:n?0:1,indices:[0,e.length-1]}}}class ra extends _t{constructor(e){super(e)}static get type(){return"suffix-exact"}static get multiRegex(){return/^"(.*)"\$$/}static get singleRegex(){return/^(.*)\$$/}search(e){const n=e.endsWith(this.pattern);return{isMatch:n,score:n?0:1,indices:[e.length-this.pattern.length,e.length-1]}}}class ia extends _t{constructor(e){super(e)}static get type(){return"inverse-suffix-exact"}static get multiRegex(){return/^!"(.*)"\$$/}static get singleRegex(){return/^!(.*)\$$/}search(e){const n=!e.endsWith(this.pattern);return{isMatch:n,score:n?0:1,indices:[0,e.length-1]}}}class Nr extends _t{constructor(e,{location:n=_.location,threshold:r=_.threshold,distance:i=_.distance,includeMatches:o=_.includeMatches,findAllMatches:a=_.findAllMatches,minMatchCharLength:l=_.minMatchCharLength,isCaseSensitive:u=_.isCaseSensitive,ignoreLocation:f=_.ignoreLocation}={}){super(e),this._bitapSearch=new Or(e,{location:n,threshold:r,distance:i,includeMatches:o,findAllMatches:a,minMatchCharLength:l,isCaseSensitive:u,ignoreLocation:f})}static get type(){return"fuzzy"}static get multiRegex(){return/^"(.*)"$/}static get singleRegex(){return/^(.*)$/}search(e){return this._bitapSearch.searchIn(e)}}class Br extends _t{constructor(e){super(e)}static get type(){return"include"}static get multiRegex(){return/^'"(.*)"$/}static get singleRegex(){return/^'(.*)$/}search(e){let n=0,r;const i=[],o=this.pattern.length;for(;(r=e.indexOf(this.pattern,n))>-1;)n=r+o,i.push([r,n-1]);const a=!!i.length;return{isMatch:a,score:a?0:1,indices:i}}}const fn=[Qo,Br,ea,na,ia,ra,ta,Nr],pr=fn.length,sa=/ +(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)/,oa="|";function aa(t,e={}){return t.split(oa).map(n=>{let r=n.trim().split(sa).filter(o=>o&&!!o.trim()),i=[];for(let o=0,a=r.length;o<a;o+=1){const l=r[o];let u=!1,f=-1;for(;!u&&++f<pr;){const h=fn[f];let p=h.isMultiMatch(l);p&&(i.push(new h(p,e)),u=!0)}if(!u)for(f=-1;++f<pr;){const h=fn[f];let p=h.isSingleMatch(l);if(p){i.push(new h(p,e));break}}}return i})}const la=new Set([Nr.type,Br.type]);class ca{constructor(e,{isCaseSensitive:n=_.isCaseSensitive,includeMatches:r=_.includeMatches,minMatchCharLength:i=_.minMatchCharLength,ignoreLocation:o=_.ignoreLocation,findAllMatches:a=_.findAllMatches,location:l=_.location,threshold:u=_.threshold,distance:f=_.distance}={}){this.query=null,this.options={isCaseSensitive:n,includeMatches:r,minMatchCharLength:i,findAllMatches:a,ignoreLocation:o,location:l,threshold:u,distance:f},this.pattern=n?e:e.toLowerCase(),this.query=aa(this.pattern,this.options)}static condition(e,n){return n.useExtendedSearch}searchIn(e){const n=this.query;if(!n)return{isMatch:!1,score:1};const{includeMatches:r,isCaseSensitive:i}=this.options;e=i?e:e.toLowerCase();let o=0,a=[],l=0;for(let u=0,f=n.length;u<f;u+=1){const h=n[u];a.length=0,o=0;for(let p=0,y=h.length;p<y;p+=1){const g=h[p],{isMatch:b,indices:w,score:S}=g.search(e);if(b){if(o+=1,l+=S,r){const M=g.constructor.type;la.has(M)?a=[...a,...w]:a.push(w)}}else{l=0,o=0,a.length=0;break}}if(o){let p={isMatch:!0,score:l/o};return r&&(p.indices=a),p}}return{isMatch:!1,score:1}}}const hn=[];function ua(...t){hn.push(...t)}function dn(t,e){for(let n=0,r=hn.length;n<r;n+=1){let i=hn[n];if(i.condition(t,e))return new i(t,e)}return new Or(t,e)}const Ce={AND:"$and",OR:"$or"},pn={PATH:"$path",PATTERN:"$val"},gn=t=>!!(t[Ce.AND]||t[Ce.OR]),fa=t=>!!t[pn.PATH],ha=t=>!dt(t)&&Rr(t)&&!gn(t),gr=t=>({[Ce.AND]:Object.keys(t).map(e=>({[e]:t[e]}))});function Dr(t,e,{auto:n=!0}={}){const r=i=>{let o=Object.keys(i);const a=fa(i);if(!a&&o.length>1&&!gn(i))return r(gr(i));if(ha(i)){const u=a?i[pn.PATH]:o[0],f=a?i[pn.PATTERN]:i[u];if(!nt(f))throw new Error(Bo(u));const h={keyId:un(u),pattern:f};return n&&(h.searcher=dn(f,e)),h}let l={children:[],operator:o[0]};return o.forEach(u=>{const f=i[u];dt(f)&&f.forEach(h=>{l.children.push(r(h))})}),l};return gn(t)||(t=gr(t)),r(t)}function da(t,{ignoreFieldNorm:e=_.ignoreFieldNorm}){t.forEach(n=>{let r=1;n.matches.forEach(({key:i,norm:o,score:a})=>{const l=i?i.weight:null;r*=Math.pow(a===0&&l?Number.EPSILON:a,(l||1)*(e?1:o))}),n.score=r})}function pa(t,e){const n=t.matches;e.matches=[],W(n)&&n.forEach(r=>{if(!W(r.indices)||!r.indices.length)return;const{indices:i,value:o}=r;let a={indices:i,value:o};r.key&&(a.key=r.key.src),r.idx>-1&&(a.refIndex=r.idx),e.matches.push(a)})}function ga(t,e){e.score=t.score}function ya(t,e,{includeMatches:n=_.includeMatches,includeScore:r=_.includeScore}={}){const i=[];return n&&i.push(pa),r&&i.push(ga),t.map(o=>{const{idx:a}=o,l={item:e[a],refIndex:a};return i.length&&i.forEach(u=>{u(o,l)}),l})}class Mt{constructor(e,n={},r){this.options={..._,...n},this.options.useExtendedSearch,this._keyStore=new zo(this.options.keys),this.setCollection(e,r)}setCollection(e,n){if(this._docs=e,n&&!(n instanceof Rn))throw new Error(No);this._myIndex=n||jr(this.options.keys,this._docs,{getFn:this.options.getFn,fieldNormWeight:this.options.fieldNormWeight})}add(e){W(e)&&(this._docs.push(e),this._myIndex.add(e))}remove(e=()=>!1){const n=[];for(let r=0,i=this._docs.length;r<i;r+=1){const o=this._docs[r];e(o,r)&&(this.removeAt(r),r-=1,i-=1,n.push(o))}return n}removeAt(e){this._docs.splice(e,1),this._myIndex.removeAt(e)}getIndex(){return this._myIndex}search(e,{limit:n=-1}={}){const{includeMatches:r,includeScore:i,shouldSort:o,sortFn:a,ignoreFieldNorm:l}=this.options;let u=nt(e)?nt(this._docs[0])?this._searchStringList(e):this._searchObjectList(e):this._searchLogical(e);return da(u,{ignoreFieldNorm:l}),o&&u.sort(a),kr(n)&&n>-1&&(u=u.slice(0,n)),ya(u,this._docs,{includeMatches:r,includeScore:i})}_searchStringList(e){const n=dn(e,this.options),{records:r}=this._myIndex,i=[];return r.forEach(({v:o,i:a,n:l})=>{if(!W(o))return;const{isMatch:u,score:f,indices:h}=n.searchIn(o);u&&i.push({item:o,idx:a,matches:[{score:f,value:o,norm:l,indices:h}]})}),i}_searchLogical(e){const n=Dr(e,this.options),r=(l,u,f)=>{if(!l.children){const{keyId:p,searcher:y}=l,g=this._findMatches({key:this._keyStore.get(p),value:this._myIndex.getValueForItemAtKeyId(u,p),searcher:y});return g&&g.length?[{idx:f,item:u,matches:g}]:[]}const h=[];for(let p=0,y=l.children.length;p<y;p+=1){const g=l.children[p],b=r(g,u,f);if(b.length)h.push(...b);else if(l.operator===Ce.AND)return[]}return h},i=this._myIndex.records,o={},a=[];return i.forEach(({$:l,i:u})=>{if(W(l)){let f=r(n,l,u);f.length&&(o[u]||(o[u]={idx:u,item:l,matches:[]},a.push(o[u])),f.forEach(({matches:h})=>{o[u].matches.push(...h)}))}}),a}_searchObjectList(e){const n=dn(e,this.options),{keys:r,records:i}=this._myIndex,o=[];return i.forEach(({$:a,i:l})=>{if(!W(a))return;let u=[];r.forEach((f,h)=>{u.push(...this._findMatches({key:f,value:a[h],searcher:n}))}),u.length&&o.push({idx:l,item:a,matches:u})}),o}_findMatches({key:e,value:n,searcher:r}){if(!W(n))return[];let i=[];if(dt(n))n.forEach(({v:o,i:a,n:l})=>{if(!W(o))return;const{isMatch:u,score:f,indices:h}=r.searchIn(o);u&&i.push({score:f,key:e,value:o,idx:a,norm:l,indices:h})});else{const{v:o,n:a}=n,{isMatch:l,score:u,indices:f}=r.searchIn(o);l&&i.push({score:u,key:e,value:o,norm:a,indices:f})}return i}}Mt.version="7.0.0";Mt.createIndex=jr;Mt.parseIndex=Xo;Mt.config=_;Mt.parseQuery=Dr;ua(ca);function Hr(t,e){const n=new Mt(e.filterProperties,{keys:["title"]}),r=t.target.value,o=n.search(r).map(a=>a.item.key||a.item.keys.join("|"));Object.keys(e.filters).forEach(a=>{e.querySelector(`[data-details="${a}"]`).parentElement.style.display=o.includes(a)||!r?"":"none"})}function ma(t,e){const n=t.target.getAttribute("data-close").replace("|","-");e.querySelector(`#filter-${n}`).reset(),e.dispatchEvent(new CustomEvent("filter")),e.requestUpdate()}const yn=Math.min,Dt=Math.max,Se=Math.round,ve=Math.floor,xt=t=>({x:t,y:t});function Ir(t){return t.split("-")[0]}function ba(t){return t.split("-")[1]}function xa(t){return t==="x"?"y":"x"}function wa(t){return t==="y"?"height":"width"}function zr(t){return["top","bottom"].includes(Ir(t))?"y":"x"}function va(t){return xa(zr(t))}function qr(t){const{x:e,y:n,width:r,height:i}=t;return{width:r,height:i,top:n,left:e,right:e+r,bottom:n+i,x:e,y:n}}function yr(t,e,n){let{reference:r,floating:i}=t;const o=zr(e),a=va(e),l=wa(a),u=Ir(e),f=o==="y",h=r.x+r.width/2-i.width/2,p=r.y+r.height/2-i.height/2,y=r[l]/2-i[l]/2;let g;switch(u){case"top":g={x:h,y:r.y-i.height};break;case"bottom":g={x:h,y:r.y+r.height};break;case"right":g={x:r.x+r.width,y:p};break;case"left":g={x:r.x-i.width,y:p};break;default:g={x:r.x,y:r.y}}switch(ba(e)){case"start":g[a]-=y*(n&&f?-1:1);break;case"end":g[a]+=y*(n&&f?-1:1);break}return g}const _a=async(t,e,n)=>{const{placement:r="bottom",strategy:i="absolute",middleware:o=[],platform:a}=n,l=o.filter(Boolean),u=await(a.isRTL==null?void 0:a.isRTL(e));let f=await a.getElementRects({reference:t,floating:e,strategy:i}),{x:h,y:p}=yr(f,r,u),y=r,g={},b=0;for(let w=0;w<l.length;w++){const{name:S,fn:M}=l[w],{x:$,y:E,data:j,reset:P}=await M({x:h,y:p,initialPlacement:r,placement:y,strategy:i,middlewareData:g,rects:f,platform:a,elements:{reference:t,floating:e}});h=$??h,p=E??p,g={...g,[S]:{...g[S],...j}},P&&b<=50&&(b++,typeof P=="object"&&(P.placement&&(y=P.placement),P.rects&&(f=P.rects===!0?await a.getElementRects({reference:t,floating:e,strategy:i}):P.rects),{x:h,y:p}=yr(f,y,u)),w=-1)}return{x:h,y:p,placement:y,strategy:i,middlewareData:g}};function De(){return typeof window<"u"}function Vt(t){return Ur(t)?(t.nodeName||"").toLowerCase():"#document"}function G(t){var e;return(t==null||(e=t.ownerDocument)==null?void 0:e.defaultView)||window}function st(t){var e;return(e=(Ur(t)?t.ownerDocument:t.document)||window.document)==null?void 0:e.documentElement}function Ur(t){return De()?t instanceof Node||t instanceof G(t).Node:!1}function Q(t){return De()?t instanceof Element||t instanceof G(t).Element:!1}function rt(t){return De()?t instanceof HTMLElement||t instanceof G(t).HTMLElement:!1}function mr(t){return!De()||typeof ShadowRoot>"u"?!1:t instanceof ShadowRoot||t instanceof G(t).ShadowRoot}function re(t){const{overflow:e,overflowX:n,overflowY:r,display:i}=tt(t);return/auto|scroll|overlay|hidden|clip/.test(e+r+n)&&!["inline","contents"].includes(i)}function Ma(t){return["table","td","th"].includes(Vt(t))}function He(t){return[":popover-open",":modal"].some(e=>{try{return t.matches(e)}catch{return!1}})}function Pn(t){const e=Tn(),n=Q(t)?tt(t):t;return n.transform!=="none"||n.perspective!=="none"||(n.containerType?n.containerType!=="normal":!1)||!e&&(n.backdropFilter?n.backdropFilter!=="none":!1)||!e&&(n.filter?n.filter!=="none":!1)||["transform","perspective","filter"].some(r=>(n.willChange||"").includes(r))||["paint","layout","strict","content"].some(r=>(n.contain||"").includes(r))}function Aa(t){let e=wt(t);for(;rt(e)&&!zt(e);){if(Pn(e))return e;if(He(e))return null;e=wt(e)}return null}function Tn(){return typeof CSS>"u"||!CSS.supports?!1:CSS.supports("-webkit-backdrop-filter","none")}function zt(t){return["html","body","#document"].includes(Vt(t))}function tt(t){return G(t).getComputedStyle(t)}function Ie(t){return Q(t)?{scrollLeft:t.scrollLeft,scrollTop:t.scrollTop}:{scrollLeft:t.scrollX,scrollTop:t.scrollY}}function wt(t){if(Vt(t)==="html")return t;const e=t.assignedSlot||t.parentNode||mr(t)&&t.host||st(t);return mr(e)?e.host:e}function Vr(t){const e=wt(t);return zt(e)?t.ownerDocument?t.ownerDocument.body:t.body:rt(e)&&re(e)?e:Vr(e)}function Jt(t,e,n){var r;e===void 0&&(e=[]),n===void 0&&(n=!0);const i=Vr(t),o=i===((r=t.ownerDocument)==null?void 0:r.body),a=G(i);if(o){const l=mn(a);return e.concat(a,a.visualViewport||[],re(i)?i:[],l&&n?Jt(l):[])}return e.concat(i,Jt(i,[],n))}function mn(t){return t.parent&&Object.getPrototypeOf(t.parent)?t.frameElement:null}function Wr(t){const e=tt(t);let n=parseFloat(e.width)||0,r=parseFloat(e.height)||0;const i=rt(t),o=i?t.offsetWidth:n,a=i?t.offsetHeight:r,l=Se(n)!==o||Se(r)!==a;return l&&(n=o,r=a),{width:n,height:r,$:l}}function jn(t){return Q(t)?t:t.contextElement}function Ht(t){const e=jn(t);if(!rt(e))return xt(1);const n=e.getBoundingClientRect(),{width:r,height:i,$:o}=Wr(e);let a=(o?Se(n.width):n.width)/r,l=(o?Se(n.height):n.height)/i;return(!a||!Number.isFinite(a))&&(a=1),(!l||!Number.isFinite(l))&&(l=1),{x:a,y:l}}const Ca=xt(0);function Gr(t){const e=G(t);return!Tn()||!e.visualViewport?Ca:{x:e.visualViewport.offsetLeft,y:e.visualViewport.offsetTop}}function Sa(t,e,n){return e===void 0&&(e=!1),!n||e&&n!==G(t)?!1:e}function Lt(t,e,n,r){e===void 0&&(e=!1),n===void 0&&(n=!1);const i=t.getBoundingClientRect(),o=jn(t);let a=xt(1);e&&(r?Q(r)&&(a=Ht(r)):a=Ht(t));const l=Sa(o,n,r)?Gr(o):xt(0);let u=(i.left+l.x)/a.x,f=(i.top+l.y)/a.y,h=i.width/a.x,p=i.height/a.y;if(o){const y=G(o),g=r&&Q(r)?G(r):r;let b=y,w=mn(b);for(;w&&r&&g!==b;){const S=Ht(w),M=w.getBoundingClientRect(),$=tt(w),E=M.left+(w.clientLeft+parseFloat($.paddingLeft))*S.x,j=M.top+(w.clientTop+parseFloat($.paddingTop))*S.y;u*=S.x,f*=S.y,h*=S.x,p*=S.y,u+=E,f+=j,b=G(w),w=mn(b)}}return qr({width:h,height:p,x:u,y:f})}function Ea(t){let{elements:e,rect:n,offsetParent:r,strategy:i}=t;const o=i==="fixed",a=st(r),l=e?He(e.floating):!1;if(r===a||l&&o)return n;let u={scrollLeft:0,scrollTop:0},f=xt(1);const h=xt(0),p=rt(r);if((p||!p&&!o)&&((Vt(r)!=="body"||re(a))&&(u=Ie(r)),rt(r))){const y=Lt(r);f=Ht(r),h.x=y.x+r.clientLeft,h.y=y.y+r.clientTop}return{width:n.width*f.x,height:n.height*f.y,x:n.x*f.x-u.scrollLeft*f.x+h.x,y:n.y*f.y-u.scrollTop*f.y+h.y}}function $a(t){return Array.from(t.getClientRects())}function bn(t,e){const n=Ie(t).scrollLeft;return e?e.left+n:Lt(st(t)).left+n}function La(t){const e=st(t),n=Ie(t),r=t.ownerDocument.body,i=Dt(e.scrollWidth,e.clientWidth,r.scrollWidth,r.clientWidth),o=Dt(e.scrollHeight,e.clientHeight,r.scrollHeight,r.clientHeight);let a=-n.scrollLeft+bn(t);const l=-n.scrollTop;return tt(r).direction==="rtl"&&(a+=Dt(e.clientWidth,r.clientWidth)-i),{width:i,height:o,x:a,y:l}}function ka(t,e){const n=G(t),r=st(t),i=n.visualViewport;let o=r.clientWidth,a=r.clientHeight,l=0,u=0;if(i){o=i.width,a=i.height;const f=Tn();(!f||f&&e==="fixed")&&(l=i.offsetLeft,u=i.offsetTop)}return{width:o,height:a,x:l,y:u}}function Ra(t,e){const n=Lt(t,!0,e==="fixed"),r=n.top+t.clientTop,i=n.left+t.clientLeft,o=rt(t)?Ht(t):xt(1),a=t.clientWidth*o.x,l=t.clientHeight*o.y,u=i*o.x,f=r*o.y;return{width:a,height:l,x:u,y:f}}function br(t,e,n){let r;if(e==="viewport")r=ka(t,n);else if(e==="document")r=La(st(t));else if(Q(e))r=Ra(e,n);else{const i=Gr(t);r={...e,x:e.x-i.x,y:e.y-i.y}}return qr(r)}function Kr(t,e){const n=wt(t);return n===e||!Q(n)||zt(n)?!1:tt(n).position==="fixed"||Kr(n,e)}function Pa(t,e){const n=e.get(t);if(n)return n;let r=Jt(t,[],!1).filter(l=>Q(l)&&Vt(l)!=="body"),i=null;const o=tt(t).position==="fixed";let a=o?wt(t):t;for(;Q(a)&&!zt(a);){const l=tt(a),u=Pn(a);!u&&l.position==="fixed"&&(i=null),(o?!u&&!i:!u&&l.position==="static"&&!!i&&["absolute","fixed"].includes(i.position)||re(a)&&!u&&Kr(t,a))?r=r.filter(h=>h!==a):i=l,a=wt(a)}return e.set(t,r),r}function Ta(t){let{element:e,boundary:n,rootBoundary:r,strategy:i}=t;const a=[...n==="clippingAncestors"?He(e)?[]:Pa(e,this._c):[].concat(n),r],l=a[0],u=a.reduce((f,h)=>{const p=br(e,h,i);return f.top=Dt(p.top,f.top),f.right=yn(p.right,f.right),f.bottom=yn(p.bottom,f.bottom),f.left=Dt(p.left,f.left),f},br(e,l,i));return{width:u.right-u.left,height:u.bottom-u.top,x:u.left,y:u.top}}function ja(t){const{width:e,height:n}=Wr(t);return{width:e,height:n}}function Oa(t,e,n){const r=rt(e),i=st(e),o=n==="fixed",a=Lt(t,!0,o,e);let l={scrollLeft:0,scrollTop:0};const u=xt(0);if(r||!r&&!o)if((Vt(e)!=="body"||re(i))&&(l=Ie(e)),r){const g=Lt(e,!0,o,e);u.x=g.x+e.clientLeft,u.y=g.y+e.clientTop}else i&&(u.x=bn(i));let f=0,h=0;if(i&&!r&&!o){const g=i.getBoundingClientRect();h=g.top+l.scrollTop,f=g.left+l.scrollLeft-bn(i,g)}const p=a.left+l.scrollLeft-u.x-f,y=a.top+l.scrollTop-u.y-h;return{x:p,y,width:a.width,height:a.height}}function on(t){return tt(t).position==="static"}function xr(t,e){if(!rt(t)||tt(t).position==="fixed")return null;if(e)return e(t);let n=t.offsetParent;return st(t)===n&&(n=n.ownerDocument.body),n}function Yr(t,e){const n=G(t);if(He(t))return n;if(!rt(t)){let i=wt(t);for(;i&&!zt(i);){if(Q(i)&&!on(i))return i;i=wt(i)}return n}let r=xr(t,e);for(;r&&Ma(r)&&on(r);)r=xr(r,e);return r&&zt(r)&&on(r)&&!Pn(r)?n:r||Aa(t)||n}const Na=async function(t){const e=this.getOffsetParent||Yr,n=this.getDimensions,r=await n(t.floating);return{reference:Oa(t.reference,await e(t.floating),t.strategy),floating:{x:0,y:0,width:r.width,height:r.height}}};function Ba(t){return tt(t).direction==="rtl"}const Da={convertOffsetParentRelativeRectToViewportRelativeRect:Ea,getDocumentElement:st,getClippingRect:Ta,getOffsetParent:Yr,getElementRects:Na,getClientRects:$a,getDimensions:ja,getScale:Ht,isElement:Q,isRTL:Ba};function Ha(t,e){let n=null,r;const i=st(t);function o(){var l;clearTimeout(r),(l=n)==null||l.disconnect(),n=null}function a(l,u){l===void 0&&(l=!1),u===void 0&&(u=1),o();const{left:f,top:h,width:p,height:y}=t.getBoundingClientRect();if(l||e(),!p||!y)return;const g=ve(h),b=ve(i.clientWidth-(f+p)),w=ve(i.clientHeight-(h+y)),S=ve(f),$={rootMargin:-g+"px "+-b+"px "+-w+"px "+-S+"px",threshold:Dt(0,yn(1,u))||1};let E=!0;function j(P){const et=P[0].intersectionRatio;if(et!==u){if(!E)return a();et?a(!1,et):r=setTimeout(()=>{a(!1,1e-7)},1e3)}E=!1}try{n=new IntersectionObserver(j,{...$,root:i.ownerDocument})}catch{n=new IntersectionObserver(j,$)}n.observe(t)}return a(!0),o}function Ia(t,e,n,r){r===void 0&&(r={});const{ancestorScroll:i=!0,ancestorResize:o=!0,elementResize:a=typeof ResizeObserver=="function",layoutShift:l=typeof IntersectionObserver=="function",animationFrame:u=!1}=r,f=jn(t),h=i||o?[...f?Jt(f):[],...Jt(e)]:[];h.forEach(M=>{i&&M.addEventListener("scroll",n,{passive:!0}),o&&M.addEventListener("resize",n)});const p=f&&l?Ha(f,n):null;let y=-1,g=null;a&&(g=new ResizeObserver(M=>{let[$]=M;$&&$.target===f&&g&&(g.unobserve(e),cancelAnimationFrame(y),y=requestAnimationFrame(()=>{var E;(E=g)==null||E.observe(e)})),n()}),f&&!u&&g.observe(f),g.observe(e));let b,w=u?Lt(t):null;u&&S();function S(){const M=Lt(t);w&&(M.x!==w.x||M.y!==w.y||M.width!==w.width||M.height!==w.height)&&n(),w=M,b=requestAnimationFrame(S)}return n(),()=>{var M;h.forEach($=>{i&&$.removeEventListener("scroll",n),o&&$.removeEventListener("resize",n)}),p==null||p(),(M=g)==null||M.disconnect(),g=null,u&&cancelAnimationFrame(b)}}const za=(t,e,n)=>{const r=new Map,i={platform:Da,...n},o={...i.platform,_c:r};return _a(t,e,{...i,platform:o})};function qa(t){const e=t.renderRoot.querySelector(".inline-container-wrapper"),n=t.renderRoot.querySelector("[popover]");return Ia(e,n,()=>{n.matches(":popover-open")&&za(e,n,{strategy:"fixed"}).then(({x:i,y:o})=>{Object.assign(n.style,{left:`${i}px`,top:`${o}px`,width:`${e.getBoundingClientRect().width}px`})})},{animationFrame:!0})}function Xr(t){t.renderRoot.querySelector("#eox-itemfilter-input-search").value="",Hr({target:{value:""}},t)}function Ua(t,e){e.inlineMode&&t.stopPropagation()}function Va(t){t.inlineMode&&(t.showDropdown=!0)}function Wa(t,e){e.inlineMode&&(t.stopPropagation(),e.showDropdown=!0)}function Ga(t,e){e.inlineMode&&t.key==="Escape"&&e.showDropdown&&(Xr(e),e.showDropdown=!1)}function Ka(t,e){e.inlineMode&&t.target.tagName!=="DROPDOWN-FORM"&&t.target.tagName!=="EOX-ITEMFILTER"&&e.showDropdown&&(Xr(e),e.showDropdown=!1)}function Ya(t,e){var n=0,r=0,i=0,o=0,a=0,l=0,u=0,f=0,h=null,p=null,y=t[0],g=t[1],b=e.length;for(n;n<b;n++){r=0;var w=e[n].length-1,S=e[n];if(h=S[0],h[0]!==S[w][0]&&h[1]!==S[w][1])throw new Error("First and last coordinates in a ring must be the same");for(a=h[0]-y,l=h[1]-g,r;r<w;r++){if(p=S[r+1],f=p[1]-g,l<0&&f<0||l>0&&f>0){h=p,l=f,a=h[0]-y;continue}if(u=p[0]-t[0],f>0&&l<=0){if(o=a*f-u*l,o>0)i=i+1;else if(o===0)return 0}else if(l>0&&f<=0){if(o=a*f-u*l,o<0)i=i+1;else if(o===0)return 0}else if(f===0&&l<0){if(o=a*f-u*l,o===0)return 0}else if(l===0&&f<0){if(o=a*f-u*l,o===0)return 0}else if(l===0&&f===0){if(u<=0&&a>=0)return 0;if(a<=0&&u>=0)return 0}h=p,l=f,a=u}}return i%2!==0}function kt(t,e,n={}){const r={type:"Feature"};return(n.id===0||n.id)&&(r.id=n.id),n.bbox&&(r.bbox=n.bbox),r.properties=e||{},r.geometry=t,r}function Xa(t,e,n={}){if(!t)throw new Error("coordinates is required");if(!Array.isArray(t))throw new Error("coordinates must be an Array");if(t.length<2)throw new Error("coordinates must be at least 2 numbers long");if(!wr(t[0])||!wr(t[1]))throw new Error("coordinates must contain numbers");return kt({type:"Point",coordinates:t},e,n)}function Fa(t,e,n={}){if(t.length<2)throw new Error("coordinates must be an array of two or more positions");return kt({type:"LineString",coordinates:t},e,n)}function xn(t,e={}){const n={type:"FeatureCollection"};return e.id&&(n.id=e.id),e.bbox&&(n.bbox=e.bbox),n.features=t,n}function Za(t,e,n={}){return kt({type:"MultiLineString",coordinates:t},e,n)}function wr(t){return!isNaN(t)&&t!==null&&!Array.isArray(t)}function Fr(t){if(!t)throw new Error("coord is required");if(!Array.isArray(t)){if(t.type==="Feature"&&t.geometry!==null&&t.geometry.type==="Point")return[...t.geometry.coordinates];if(t.type==="Point")return[...t.coordinates]}if(Array.isArray(t)&&t.length>=2&&!Array.isArray(t[0])&&!Array.isArray(t[1]))return[...t];throw new Error("coord must be GeoJSON Point or an Array of numbers")}function Ja(t){if(Array.isArray(t))return t;if(t.type==="Feature"){if(t.geometry!==null)return t.geometry.coordinates}else if(t.coordinates)return t.coordinates;throw new Error("coords must be GeoJSON Feature, Geometry Object or an Array")}function qt(t){return t.type==="Feature"?t.geometry:t}function Z(t,e,n={}){if(!t)throw new Error("point is required");if(!e)throw new Error("polygon is required");const r=Fr(t),i=qt(e),o=i.type,a=e.bbox;let l=i.coordinates;if(a&&Qa(r,a)===!1)return!1;o==="Polygon"&&(l=[l]);let u=!1;for(var f=0;f<l.length;++f){const h=Ya(r,l[f]);if(h===0)return!n.ignoreBoundary;h&&(u=!0)}return u}function Qa(t,e){return e[0]<=t[0]&&e[1]<=t[1]&&e[2]>=t[0]&&e[3]>=t[1]}class Zr{constructor(e=[],n=tl){if(this.data=e,this.length=this.data.length,this.compare=n,this.length>0)for(let r=(this.length>>1)-1;r>=0;r--)this._down(r)}push(e){this.data.push(e),this.length++,this._up(this.length-1)}pop(){if(this.length===0)return;const e=this.data[0],n=this.data.pop();return this.length--,this.length>0&&(this.data[0]=n,this._down(0)),e}peek(){return this.data[0]}_up(e){const{data:n,compare:r}=this,i=n[e];for(;e>0;){const o=e-1>>1,a=n[o];if(r(i,a)>=0)break;n[e]=a,e=o}n[e]=i}_down(e){const{data:n,compare:r}=this,i=this.length>>1,o=n[e];for(;e<i;){let a=(e<<1)+1,l=n[a];const u=a+1;if(u<this.length&&r(n[u],l)<0&&(a=u,l=n[u]),r(l,o)>=0)break;n[e]=l,e=a}n[e]=o}}function tl(t,e){return t<e?-1:t>e?1:0}function Jr(t,e){return t.p.x>e.p.x?1:t.p.x<e.p.x?-1:t.p.y!==e.p.y?t.p.y>e.p.y?1:-1:1}function el(t,e){return t.rightSweepEvent.p.x>e.rightSweepEvent.p.x?1:t.rightSweepEvent.p.x<e.rightSweepEvent.p.x?-1:t.rightSweepEvent.p.y!==e.rightSweepEvent.p.y?t.rightSweepEvent.p.y<e.rightSweepEvent.p.y?1:-1:1}class vr{constructor(e,n,r,i){this.p={x:e[0],y:e[1]},this.featureId=n,this.ringId=r,this.eventId=i,this.otherEvent=null,this.isLeftEndpoint=null}isSamePoint(e){return this.p.x===e.p.x&&this.p.y===e.p.y}}function nl(t,e){if(t.type==="FeatureCollection"){const n=t.features;for(let r=0;r<n.length;r++)_r(n[r],e)}else _r(t,e)}let _e=0,Me=0,Ae=0;function _r(t,e){const n=t.type==="Feature"?t.geometry:t;let r=n.coordinates;(n.type==="Polygon"||n.type==="MultiLineString")&&(r=[r]),n.type==="LineString"&&(r=[[r]]);for(let i=0;i<r.length;i++)for(let o=0;o<r[i].length;o++){let a=r[i][o][0],l=null;Me=Me+1;for(let u=0;u<r[i][o].length-1;u++){l=r[i][o][u+1];const f=new vr(a,_e,Me,Ae),h=new vr(l,_e,Me,Ae+1);f.otherEvent=h,h.otherEvent=f,Jr(f,h)>0?(h.isLeftEndpoint=!0,f.isLeftEndpoint=!1):(f.isLeftEndpoint=!0,h.isLeftEndpoint=!1),e.push(f),e.push(h),a=l,Ae=Ae+1}}_e=_e+1}class rl{constructor(e){this.leftSweepEvent=e,this.rightSweepEvent=e.otherEvent}}function il(t,e){if(t===null||e===null||t.leftSweepEvent.ringId===e.leftSweepEvent.ringId&&(t.rightSweepEvent.isSamePoint(e.leftSweepEvent)||t.rightSweepEvent.isSamePoint(e.leftSweepEvent)||t.rightSweepEvent.isSamePoint(e.rightSweepEvent)||t.leftSweepEvent.isSamePoint(e.leftSweepEvent)||t.leftSweepEvent.isSamePoint(e.rightSweepEvent)))return!1;const n=t.leftSweepEvent.p.x,r=t.leftSweepEvent.p.y,i=t.rightSweepEvent.p.x,o=t.rightSweepEvent.p.y,a=e.leftSweepEvent.p.x,l=e.leftSweepEvent.p.y,u=e.rightSweepEvent.p.x,f=e.rightSweepEvent.p.y,h=(f-l)*(i-n)-(u-a)*(o-r),p=(u-a)*(r-l)-(f-l)*(n-a),y=(i-n)*(r-l)-(o-r)*(n-a);if(h===0)return!1;const g=p/h,b=y/h;if(g>=0&&g<=1&&b>=0&&b<=1){const w=n+g*(i-n),S=r+g*(o-r);return[w,S]}return!1}function sl(t,e){e=e||!1;const n=[],r=new Zr([],el);for(;t.length;){const i=t.pop();if(i.isLeftEndpoint){const o=new rl(i);for(let a=0;a<r.data.length;a++){const l=r.data[a];if(e&&l.leftSweepEvent.featureId===i.featureId)continue;const u=il(o,l);u!==!1&&n.push(u)}r.push(o)}else i.isLeftEndpoint===!1&&r.pop()}return n}function ol(t,e){const n=new Zr([],Jr);return nl(t,n),sl(n,e)}var al=ol;function On(t,e,n={}){const{removeDuplicates:r=!0,ignoreSelfIntersections:i=!1}=n;let o=[];t.type==="FeatureCollection"?o=o.concat(t.features):t.type==="Feature"?o.push(t):(t.type==="LineString"||t.type==="Polygon"||t.type==="MultiLineString"||t.type==="MultiPolygon")&&o.push(kt(t)),e.type==="FeatureCollection"?o=o.concat(e.features):e.type==="Feature"?o.push(e):(e.type==="LineString"||e.type==="Polygon"||e.type==="MultiLineString"||e.type==="MultiPolygon")&&o.push(kt(e));const a=al(xn(o),i);let l=[];if(r){const u={};a.forEach(f=>{const h=f.join(",");u[h]||(u[h]=!0,l.push(f))})}else l=a;return xn(l.map(u=>Xa(u)))}function Qr(t,e,n){if(t!==null)for(var r,i,o,a,l,u,f,h=0,p=0,y,g=t.type,b=g==="FeatureCollection",w=g==="Feature",S=b?t.features.length:1,M=0;M<S;M++){f=b?t.features[M].geometry:w?t.geometry:t,y=f?f.type==="GeometryCollection":!1,l=y?f.geometries.length:1;for(var $=0;$<l;$++){var E=0,j=0;if(a=y?f.geometries[$]:f,a!==null){u=a.coordinates;var P=a.type;switch(h=0,P){case null:break;case"Point":if(e(u,p,M,E,j)===!1)return!1;p++,E++;break;case"LineString":case"MultiPoint":for(r=0;r<u.length;r++){if(e(u[r],p,M,E,j)===!1)return!1;p++,P==="MultiPoint"&&E++}P==="LineString"&&E++;break;case"Polygon":case"MultiLineString":for(r=0;r<u.length;r++){for(i=0;i<u[r].length-h;i++){if(e(u[r][i],p,M,E,j)===!1)return!1;p++}P==="MultiLineString"&&E++,P==="Polygon"&&j++}P==="Polygon"&&E++;break;case"MultiPolygon":for(r=0;r<u.length;r++){for(j=0,i=0;i<u[r].length;i++){for(o=0;o<u[r][i].length-h;o++){if(e(u[r][i][o],p,M,E,j)===!1)return!1;p++}j++}E++}break;case"GeometryCollection":for(r=0;r<a.geometries.length;r++)if(Qr(a.geometries[r],e)===!1)return!1;break;default:throw new Error("Unknown Geometry Type")}}}}}function ll(t,e){var n,r,i,o,a,l,u,f,h,p,y=0,g=t.type==="FeatureCollection",b=t.type==="Feature",w=g?t.features.length:1;for(n=0;n<w;n++){for(l=g?t.features[n].geometry:b?t.geometry:t,f=g?t.features[n].properties:b?t.properties:{},h=g?t.features[n].bbox:b?t.bbox:void 0,p=g?t.features[n].id:b?t.id:void 0,u=l?l.type==="GeometryCollection":!1,a=u?l.geometries.length:1,i=0;i<a;i++){if(o=u?l.geometries[i]:l,o===null){if(e(null,y,f,h,p)===!1)return!1;continue}switch(o.type){case"Point":case"LineString":case"MultiPoint":case"Polygon":case"MultiLineString":case"MultiPolygon":{if(e(o,y,f,h,p)===!1)return!1;break}case"GeometryCollection":{for(r=0;r<o.geometries.length;r++)if(e(o.geometries[r],y,f,h,p)===!1)return!1;break}default:throw new Error("Unknown Geometry Type")}}y++}}function Ee(t,e){ll(t,function(n,r,i,o,a){var l=n===null?null:n.type;switch(l){case null:case"Point":case"LineString":case"Polygon":return e(kt(n,i,{bbox:o,id:a}),r,0)===!1?!1:void 0}var u;switch(l){case"MultiPoint":u="Point";break;case"MultiLineString":u="LineString";break;case"MultiPolygon":u="Polygon";break}for(var f=0;f<n.coordinates.length;f++){var h=n.coordinates[f],p={type:u,coordinates:h};if(e(kt(p,i),r,f)===!1)return!1}})}function wn(t,e={}){const n=qt(t);switch(!e.properties&&t.type==="Feature"&&(e.properties=t.properties),n.type){case"Polygon":return cl(n,e);case"MultiPolygon":return ul(n,e);default:throw new Error("invalid poly")}}function cl(t,e={}){const r=qt(t).coordinates,i=e.properties?e.properties:t.type==="Feature"?t.properties:{};return ti(r,i)}function ul(t,e={}){const r=qt(t).coordinates,i=e.properties?e.properties:t.type==="Feature"?t.properties:{},o=[];return r.forEach(a=>{o.push(ti(a,i))}),xn(o)}function ti(t,e){return t.length>1?Za(t,e):Fa(t[0],e)}function fl(t,e,n={}){var r;const i=(r=n.ignoreSelfIntersections)!=null?r:!1;let o=!0;return Ee(t,a=>{Ee(e,l=>{if(o===!1)return!1;o=hl(a.geometry,l.geometry,i)})}),o}function hl(t,e,n){switch(t.type){case"Point":switch(e.type){case"Point":return!yl(t.coordinates,e.coordinates);case"LineString":return!Mr(e,t);case"Polygon":return!Z(t,e)}break;case"LineString":switch(e.type){case"Point":return!Mr(t,e);case"LineString":return!dl(t,e,n);case"Polygon":return!Ar(e,t,n)}break;case"Polygon":switch(e.type){case"Point":return!Z(e,t);case"LineString":return!Ar(t,e,n);case"Polygon":return!pl(e,t,n)}}return!1}function Mr(t,e){for(let n=0;n<t.coordinates.length-1;n++)if(gl(t.coordinates[n],t.coordinates[n+1],e.coordinates))return!0;return!1}function dl(t,e,n){return On(t,e,{ignoreSelfIntersections:n}).features.length>0}function Ar(t,e,n){for(const i of e.coordinates)if(Z(i,t))return!0;return On(e,wn(t),{ignoreSelfIntersections:n}).features.length>0}function pl(t,e,n){for(const i of t.coordinates[0])if(Z(i,e))return!0;for(const i of e.coordinates[0])if(Z(i,t))return!0;return On(wn(t),wn(e),{ignoreSelfIntersections:n}).features.length>0}function gl(t,e,n){const r=n[0]-t[0],i=n[1]-t[1],o=e[0]-t[0],a=e[1]-t[1];return r*a-i*o!==0?!1:Math.abs(o)>=Math.abs(a)?o>0?t[0]<=n[0]&&n[0]<=e[0]:e[0]<=n[0]&&n[0]<=t[0]:a>0?t[1]<=n[1]&&n[1]<=e[1]:e[1]<=n[1]&&n[1]<=t[1]}function yl(t,e){return t[0]===e[0]&&t[1]===e[1]}function ml(t,e,n={}){var r;const i=(r=n.ignoreSelfIntersections)!=null?r:!1;let o=!1;return Ee(t,a=>{Ee(e,l=>{if(o===!0)return!0;o=!fl(a.geometry,l.geometry,{ignoreSelfIntersections:i})})}),o}var bl=ml;function $e(t,e={}){if(t.bbox!=null&&e.recompute!==!0)return t.bbox;const n=[1/0,1/0,-1/0,-1/0];return Qr(t,r=>{n[0]>r[0]&&(n[0]=r[0]),n[1]>r[1]&&(n[1]=r[1]),n[2]<r[0]&&(n[2]=r[0]),n[3]<r[1]&&(n[3]=r[1])}),n}function Le(t,e,n={}){const r=Fr(t),i=Ja(e);for(let o=0;o<i.length-1;o++){let a=!1;if(n.ignoreEndVertices&&(o===0&&(a="start"),o===i.length-2&&(a="end"),o===0&&o+1===i.length-1&&(a="both")),xl(i[o],i[o+1],r,a,typeof n.epsilon>"u"?null:n.epsilon))return!0}return!1}function xl(t,e,n,r,i){const o=n[0],a=n[1],l=t[0],u=t[1],f=e[0],h=e[1],p=n[0]-l,y=n[1]-u,g=f-l,b=h-u,w=p*b-y*g;if(i!==null){if(Math.abs(w)>i)return!1}else if(w!==0)return!1;if(r){if(r==="start")return Math.abs(g)>=Math.abs(b)?g>0?l<o&&o<=f:f<=o&&o<l:b>0?u<a&&a<=h:h<=a&&a<u;if(r==="end")return Math.abs(g)>=Math.abs(b)?g>0?l<=o&&o<f:f<o&&o<=l:b>0?u<=a&&a<h:h<a&&a<=u;if(r==="both")return Math.abs(g)>=Math.abs(b)?g>0?l<o&&o<f:f<o&&o<l:b>0?u<a&&a<h:h<a&&a<u}else return Math.abs(g)>=Math.abs(b)?g>0?l<=o&&o<=f:f<=o&&o<=l:b>0?u<=a&&a<=h:h<=a&&a<=u;return!1}function wl(t,e){var n=qt(t),r=qt(e),i=n.type,o=r.type;switch(i){case"Point":switch(o){case"MultiPoint":return vl(n,r);case"LineString":return Le(n,r,{ignoreEndVertices:!0});case"Polygon":case"MultiPolygon":return Z(n,r,{ignoreBoundary:!0});default:throw new Error("feature2 "+o+" geometry not supported")}case"MultiPoint":switch(o){case"MultiPoint":return _l(n,r);case"LineString":return Ml(n,r);case"Polygon":case"MultiPolygon":return Al(n,r);default:throw new Error("feature2 "+o+" geometry not supported")}case"LineString":switch(o){case"LineString":return Cl(n,r);case"Polygon":case"MultiPolygon":return Sl(n,r);default:throw new Error("feature2 "+o+" geometry not supported")}case"Polygon":switch(o){case"Polygon":case"MultiPolygon":return El(n,r);default:throw new Error("feature2 "+o+" geometry not supported")}default:throw new Error("feature1 "+i+" geometry not supported")}}function vl(t,e){var n,r=!1;for(n=0;n<e.coordinates.length;n++)if(ni(e.coordinates[n],t.coordinates)){r=!0;break}return r}function _l(t,e){for(var n=0;n<t.coordinates.length;n++){for(var r=!1,i=0;i<e.coordinates.length;i++)ni(t.coordinates[n],e.coordinates[i])&&(r=!0);if(!r)return!1}return!0}function Ml(t,e){for(var n=!1,r=0;r<t.coordinates.length;r++){if(!Le(t.coordinates[r],e))return!1;n||(n=Le(t.coordinates[r],e,{ignoreEndVertices:!0}))}return n}function Al(t,e){for(var n=!0,r=!1,i=0;i<t.coordinates.length;i++){if(r=Z(t.coordinates[i],e),!r){n=!1;break}r=Z(t.coordinates[i],e,{ignoreBoundary:!0})}return n&&r}function Cl(t,e){for(var n=0;n<t.coordinates.length;n++)if(!Le(t.coordinates[n],e))return!1;return!0}function Sl(t,e){var n=$e(e),r=$e(t);if(!ei(n,r))return!1;for(var i=!1,o=0;o<t.coordinates.length;o++){if(!Z(t.coordinates[o],e))return!1;if(i||(i=Z(t.coordinates[o],e,{ignoreBoundary:!0})),!i&&o<t.coordinates.length-1){var a=$l(t.coordinates[o],t.coordinates[o+1]);i=Z(a,e,{ignoreBoundary:!0})}}return i}function El(t,e){var n=$e(t),r=$e(e);if(!ei(r,n))return!1;for(var i=0;i<t.coordinates[0].length;i++)if(!Z(t.coordinates[0][i],e))return!1;return!0}function ei(t,e){return!(t[0]>e[0]||t[2]<e[2]||t[1]>e[1]||t[3]<e[3])}function ni(t,e){return t[0]===e[0]&&t[1]===e[1]}function $l(t,e){return[(t[0]+e[0])/2,(t[1]+e[1])/2]}var Ll=wl;const kl=(t,e)=>e?bl(t,e):!0,Rl=(t,e)=>e?Ll(t,e):!0;function Pl(t,e="highlight",n="title"){const r=(o,a,l)=>{const u=a.split(".");let f;for(f=0;f<u.length-1;f++)o=o[u[f]];o[u[f]]=l},i=(o,a=[])=>{let l="",u=0;return a.forEach(f=>{const h=f[1]+1;l+=[o.substring(u,f[0]),`<mark class="${e}">`,o.substring(f[0],h),"</mark>"].join(""),u=h}),l+=o.substring(u),l};return t.filter(({matches:o})=>o&&o.length).map(({item:o,matches:a})=>{const l={...o};return a.forEach(u=>{u.key===n&&r(l,u.key,i(u.value,u.indices))}),l})}let ri;const Tl=(t,e)=>{ri=new Mt(t,{threshold:.4,distance:50,includeMatches:!0,useExtendedSearch:!0,...e})},jl=async(t,e,n)=>{const r=Object.entries(e).filter(([,l])=>l.type==="text"||l.type==="select"||l.type==="multiselect").reduce((l,[u,f])=>{const h="$or",p=[],y=(g,b)=>{const w={};f.type==="text"?w[g]=`${b}`:w[u]=`="${g}"`,p.push(w)};return Object.entries(f.state).filter(([,g])=>g).forEach(([g,b])=>y(g,b)),p.length>0&&l.push({[h]:p}),l},[]);let i;if(!(r.length>0)&&n.matchAllWhenEmpty!==!1)i=t;else{const l={$and:[...r]},u=ri.search(l);i=n.enableHighlighting?Pl(u,"highlight",n.titleProperty):u.map(f=>f.item)}const o=Object.entries(e).filter(([,l])=>l.type==="range").reduce((l,[u,f])=>(l[u]={min:f.state.min,max:f.state.max,format:f.format},l),{});if(Object.keys(o).length>0){const l=[];for(let u=0;u<i.length;u++){const f={};for(const[h,p]of Object.entries(o)){const y=b=>p.format==="date"?Zt(b).unix():b,g=Qt(h,i[u]);g?Array.isArray(g)?f[h]=o[h].min<=y(g[1])&&y(g[0])<=o[h].max:y(g)>=o[h].min&&y(g)<=o[h].max?f[h]=!0:f[h]=!1:f[h]=!0}Object.values(f).every(h=>!!h)&&l.push(i[u])}i=[...l]}const a=Object.entries(e).filter(([,l])=>l.type==="spatial").reduce((l,[u,f])=>(l[u]={geometry:f.state.geometry,mode:f.state.mode},l),{});if(Object.values(a).map(l=>l.geometry).filter(l=>!!l).length>0){const l=[];for(let u=0;u<i.length;u++){const f={};for(const h of Object.keys(a)){const p=Qt(h,i[u]),y=a[h].mode||"within";p&&(y==="within"?Rl(p,a[h].geometry):kl(p,a[h].geometry))?f[h]=!0:f[h]=!1}Object.values(f).every(h=>!!h)&&l.push(i[u])}i=[...l]}return i};function Ol(t,e){return[{type:"Vector",properties:{id:"draw"},source:{type:"Vector",...t&&{format:"GeoJSON"},...t&&{url:e}},zIndex:1,interactions:[{type:"draw",options:{id:"drawInteraction",type:"Box",modify:!0}}]},{type:"Tile",source:{type:"XYZ",url:"https://tiles.maps.eox.at/wmts/1.0.0/osm_3857/default/g/{z}/{y}/{x}.jpg",attribution:"{ OSM: Data &copy; OpenStreetMap contributors and others, Rendering &copy; EOX }"}}]}function ze(t){if(!t.dirty)return null;switch(t.type){case"multiselect":for(const n in t.state)t.state.hasOwnProperty(n)&&(t.state[n]=!1);break;case"range":t.state.min=t.min,t.state.max=t.max;break;case"select":for(const n in t.state)t.state.hasOwnProperty(n)&&(t.state[n]=!1);break;case"spatial":t.state.geometry=void 0;break;case"text":t.keys.forEach(n=>{t.state[n]=void 0});break}return delete t.stringifiedState,delete t.dirty,t}function Cr(t,e){return t*2+e}function Nl(t){return Object.keys(t).map(e=>({title:C`${t[e].title||t[e].key}:
        <strong>${t[e].stringifiedState}</strong>`,key:e})).filter(e=>t[e.key].dirty)}function vn(t){return Object.values(t).map(e=>e.dirty).filter(e=>e).length>0}async function Bl(t,e,n){return await(await fetch(`${n.externalFilter(t,e)}`)).json()}function ii(t,e,n){let r;if(t.detail?r=t.detail.target:r=t.target,r!=null&&r.classList.contains("details-filter")){if(!r.open||e!=null&&e.expandMultipleFilters)return;n.shadowRoot.querySelectorAll("eox-itemfilter-expandcontainer").forEach(i=>{const o=i.shadowRoot.querySelector(".details-filter");o&&o!==r&&o.removeAttribute("open")})}else{if(!(r!=null&&r.open)||e!=null&&e.expandMultipleResults)return;n.querySelectorAll("details").forEach(i=>{i!==r&&i.removeAttribute("open")})}}function Qt(t,e){return t!=null&&t.includes(".")?t.split(".").reduce((n,r)=>n&&n[r],e):e[t]}var k,si,_n,Mn,oi,An,Cn,ai,Sn,li,ci;class Dl extends it{constructor(){super();q(this,k);this.filterProperties={},this.unstyled=!1,this.inlineMode=!1,this.filters={},this._handleClickOutside=L(this,k,oi).bind(this),this._handleKeyDown=L(this,k,An).bind(this)}static get properties(){return{filterProperties:{attribute:!1,type:Object},inlineMode:{attribute:"inline-mode",type:Boolean},unstyled:{type:Boolean},filters:{state:!0,type:Object}}}set showDropdown(n){this.renderRoot.querySelector("[popover]").togglePopover(n)}get showDropdown(){var n;return(n=this.renderRoot.querySelector("[popover]"))==null?void 0:n.matches(":popover-open")}connectedCallback(){super.connectedCallback(),this.inlineMode&&L(this,k,_n).call(this)}disconnectedCallback(){this.inlineMode&&L(this,k,Mn).call(this),super.disconnectedCallback()}_overlayCleanup(){}updateInline(){this.inlineMode&&this.requestUpdate()}updated(n){n.has("inlineMode")&&(this.inlineMode?L(this,k,_n).call(this):L(this,k,Mn).call(this))}render(){return C`
      <style>
        ${!this.unstyled&&ne}
      </style>
      ${this.inlineMode?C`
            <div
              class="inline-container-wrapper"
              @click="${L(this,k,Cn)}"
            >
              <div class="inline-container" part="container">
                <div class="chip-container">
                  <div class="chip-wrapper">
                    <eox-itemfilter-chips
                      .items=${Nl(this.filters)}
                      .controller=${{remove:n=>L(this,k,li).call(this,n)}}
                    >
                    </eox-itemfilter-chips>
                  </div>

                  ${H(vn(this.filters),()=>C`
                      <span
                        class="chip-close"
                        @click=${()=>this.dispatchEvent(new CustomEvent("reset"))}
                      ></span>
                    `)}
                </div>
                <div
                  class="input-container ${vn(this.filters)?"dirty-filter-input":""}"
                >
                  <input
                    autocomplete="off"
                    id="eox-itemfilter-input-search"
                    type="text"
                    @click="${L(this,k,Cn)}"
                    @focus="${L(this,k,ai)}"
                    @input="${L(this,k,ci)}"
                    placeholder="Search and add filter"
                    aria-haspopup="true"
                    aria-expanded="${this.showDropdown}"
                  />
                </div>
              </div>
              <div popover="manual">
                <div
                  class="inline-content"
                  slot="content"
                  @keydown="${L(this,k,An)}"
                  @click="${L(this,k,Sn)}"
                  @focus="${L(this,k,Sn)}"
                >
                  <slot name="section"></slot>
                </div>
              </div>
            </div>
          `:C`<slot name="section"></slot>`}
    `}}k=new WeakSet,si=function(){setTimeout(()=>this._overlayCleanup=qa(this))},_n=function(){document.addEventListener("click",this._handleClickOutside),document.addEventListener("focusout",this._handleClickOutside),document.addEventListener("keydown",this._handleKeyDown),L(this,k,si).call(this)},Mn=function(){document.removeEventListener("click",this._handleClickOutside),document.removeEventListener("focusout",this._handleClickOutside),document.removeEventListener("keydown",this._handleKeyDown),this._overlayCleanup()},oi=function(n){Ka(n,this)},An=function(n){Ga(n,this)},Cn=function(n){Wa(n,this)},ai=function(){Va(this)},Sn=function(n){Ua(n,this)},li=function(n){ma(n,this)},ci=function(n){Hr(n,this)};customElements.define("eox-itemfilter-container",Dl);function Hl(t){const e=t.renderRoot.querySelector("input[type='text']");e.value="",ze(t.filterObject),t.requestUpdate()}function Il(t){const e=t.renderRoot.querySelector("input[type='text']");t.isValid=e.checkValidity(),t.filterObject.keys.forEach(n=>{t.filterObject.state[n]=e.value}),t.filterObject.dirty=!0,t.filterObject.stringifiedState=e.value,t.dispatchEvent(new CustomEvent("filter")),e.value===""&&t.reset()}const En="ddd, D MMM YYYY HH:mm:ss";function zl(t){if(t.filterObject=ze(t.filterObject),t.filterObject){const e=t.querySelector("tc-range-slider"),n=t.filterObject.min,r=t.filterObject.max;e.value1!==n&&(e.value1=n),e.value2!==r&&(e.value2=r)}t.requestUpdate()}function ql(t,e){const[n,r]=t.detail.values;(n!==e.filterObject.state.min||r!==e.filterObject.state.max)&&([e.filterObject.state.min,e.filterObject.state.max]=[n,r],e.filterObject.dirty=!0),e.filterObject.dirty&&(e.filterObject.stringifiedState=e.filterObject.format==="date"?`${Zt.unix(n).format(En)} - ${Zt.unix(r).format(En)}`:`${n} - ${r}`),e.dispatchEvent(new CustomEvent("filter")),n===e.filterObject.min&&r===e.filterObject.max?e.reset():e.requestUpdate()}function Ul(t,e,n){const r=n.filterObject.format==="date",i=n.filterObject.state[t],o=r?Zt.unix(i).format(En):i;return C`<div class="range-${e}">${o}</div>`}function Vl(t){Wl(-1,t),ze(t.filterObject),t.requestUpdate()}function Wl(t,e){e.selectedItems=[],Nn(e),fi(e)}function ui(t,e){const n=e.selectedItems.indexOf(t);n>=0?e.selectedItems=e.selectedItems.filter((r,i)=>i!==n):e.type==="multiselect"?e.selectedItems=[...e.selectedItems,t]:(e.selectedItems=[t],e.showSuggestions=!1),Nn(e),fi(e)}function Gl(t,e){e.query=t.target.value,e.showSuggestions=!0}function Kl(t,e){switch(t.key){case"ArrowDown":e.highlightedIndex=Math.min(e.highlightedIndex+1,e.filteredSuggestions.length-1);break;case"ArrowUp":e.highlightedIndex=Math.max(e.highlightedIndex-1,0);break;case"Enter":e.highlightedIndex>=0&&ui(e.filteredSuggestions[e.highlightedIndex],e);break;case"Escape":e.showSuggestions=!1;break}}function Yl(t,e){(t.has("suggestions")||t.has("query"))&&Nn(e)}function Xl(t,e){var r;const n=((r=t.filterObject)==null?void 0:r.sort)||((i,o)=>i.localeCompare(o));return e.sort(n).map(i=>i)}function Nn(t){var n,r,i;let e;t.query&&(e=new Mt(t.suggestions,{threshold:.4}).search(t.query).map(a=>a.item)),t.filteredSuggestions=Xl(t,e||t.suggestions),(n=t.filterObject)!=null&&n.filterKeys&&(t.filteredSuggestions=(r=t.filterObject)==null?void 0:r.filterKeys.map(o=>`${o}`),t.filterObject.state=(i=t.filterObject)==null?void 0:i.filterKeys.map(o=>`${o}`).reduce((o,a)=>(a in o||(o[a]=void 0),o),t.filterObject.state)),t.highlightedIndex=-1}function fi(t){Object.keys(t.filterObject.state).forEach(e=>{t.filterObject.state[e]=t.selectedItems.includes(e)}),t.filterObject.stringifiedState=Object.keys(t.filterObject.state).filter(e=>t.filterObject.state[e]).join(", ")||"",t.filterObject.dirty=t.filterObject.stringifiedState.length>0,t.dispatchEvent(new CustomEvent("filter")),t.requestUpdate()}function Fl(t){ze(t.filterObject),t.renderRoot.querySelector("eox-itemfilter-spatial-filter").reset(),t.requestUpdate()}function Zl(t){t.renderRoot.querySelector("#eox-map").innerHTML="",hi(t)}function Jl(t,e){e.filterObject.state.mode=t;const n=new CustomEvent("filter",{detail:{[e.filterObject.key]:{}}});e.dispatchEvent(n)}function hi(t){const e=t.renderRoot.querySelector("#eox-map");e.innerHTML===""&&(e.innerHTML='<eox-map part="map" style="height: 400px"></eox-map>');const n=t.geometry&&Ql(t.geometry),r=Ol(t.geometry,n);t.eoxMap=t.renderRoot.querySelector("eox-map"),setTimeout(()=>{t.eoxMap.layers=r;const i=o=>{const a=new CustomEvent("filter",{detail:{geometry:{type:"Polygon",coordinates:o.getGeometry().clone().transform("EPSG:3857","EPSG:4326").getCoordinates()}}});t.dispatchEvent(a)};t.eoxMap.interactions.drawInteraction.on("drawend",o=>{i(o.feature),t.eoxMap.removeInteraction("drawInteraction")}),t.eoxMap.interactions.drawInteraction_modify.on("modifyend",o=>{i(o.features.getArray()[0])})},1e3)}function Ql(t){return`data:text/json,${encodeURIComponent(JSON.stringify({type:"FeatureCollection",features:[{type:"Feature",properties:null,geometry:t}]}))}`}var Te;class tc extends it{constructor(){super();q(this,Te,()=>{Il(this)});Ft(this,"debouncedInputHandler",Ne(V(this,Te),500,{leading:!0}));this.filterObject={},this.unstyled=!1,this.tabIndex=0,this.unstyled=!1}static get properties(){return{filterObject:{attribute:!1,type:Object},tabIndex:{attribute:!1,type:Number},unstyled:{type:Boolean},isValid:{state:!0,type:Boolean}}}reset(){Hl(this)}createRenderRoot(){return this}render(){return H(this.filterObject,()=>{var n;return C`
        <style></style>
        <div class="text-container">
          <div class="text-container-wrapper">
            <input
              type="text"
              placeholder=${this.filterObject.placeholder}
              data-cy="search"
              class="text-input"
              part="input-search"
              value="${Object.values(this.filterObject.state)[0]}"
              tabindex=${this.tabIndex}
              pattern="${((n=this.filterObject.validation)==null?void 0:n.pattern)||".*"}"
              @input="${this.debouncedInputHandler}"
              @click=${r=>r.stopPropagation()}
            />
          </div>
        </div>
        <small class="error-validation"
          >${this.filterObject.validation&&this.isValid===!1?this.filterObject.validation.message:""}</small
        >
      `})}}Te=new WeakMap;customElements.define("eox-itemfilter-text",tc);function ec(t,e,n){return t.filter(r=>{const i=r[n.config.aggregateResults];let o;return n.filters[n.config.aggregateResults]&&(o=Object.keys(n.filters[n.config.aggregateResults]).filter(l=>n.filters[n.config.aggregateResults].state[l])),(o!=null&&o.length?o.includes(e):!0)&&Array.isArray(i)?i.includes(e):i===e})}function nc(t,e){return C`
    <details
      class="details-results"
      @toggle=${e.handleAccordion}
      ?open=${e.config.expandResults||ht}
    >
      <summary>
        <span class="title">
          ${t}
          <span class="count"
            >${e.aggregateResults(e.results,t).length}</span
          >
        </span>
      </summary>
      <div>
        ${di(t,e)}
      </div>
    </details>
  `}function di(t,e){const n=e.results,r=t?e.aggregateResults(n,t):n,i=e.config,o=a=>{var l;return((l=e.selectedResult)==null?void 0:l[i.idProperty])===a[i.idProperty]?"highlighted":ht};return C`
    <ul class=${e.resultType}>
      ${_o(r,a=>a.id,a=>C`
          <li
            class=${o(a)}
            @click=${()=>{e.selectedResult===a?e.selectedResult=null:e.selectedResult=a,e.dispatchEvent(new CustomEvent("result",{detail:e.selectedResult}))}}
          >
            <span id="${a.id}">
              ${H(i.subTitleProperty||i.imageProperty,()=>C`
                  ${Qt(i.imageProperty,a)?C`
                        <img
                          class="image"
                          src="${Qt(i.imageProperty,a)}"
                        />
                      `:ht}
                  <div class="title-container">
                    <span class="title"
                      >${rn(a[i.titleProperty])}</span
                    >
                    <span class="subtitle"
                      >${rn(a[i.subTitleProperty])}</span
                    >
                  </div>
                `,()=>C`
                  <span class="title"
                    >${rn(a[i.titleProperty])}</span
                  >
                `)}
            </span>
          </li>
        `)}
    </ul>
  `}var Pt,$n,pi;class rc extends it{constructor(){super();q(this,Pt);this.config=null,this.filters={},this.resultAggregation=[],this.selectedResult=null,this.resultType="list"}static get properties(){return{config:{attribute:!1,type:Object},results:{state:!0,type:Object},filters:{state:!0,type:Object},resultAggregation:{attribute:!1,type:Array},selectedResult:{state:!0,type:Object},resultType:{attribute:"result-type",type:String}}}aggregateResults(n,r){return ec(n,r,this)}createRenderRoot(){return this}handleAccordion(n){ii(n,this.config,this)}render(){return C`
      <section id="section-results">
        <div slot="resultstitle"></div>
        <div id="container-results" class="scroll">
          ${H(this.results.length<1,()=>C`<small class="no-results">No matching items</small>`,()=>ht)}
          <ul id="results" part="results">
            ${H(this.config.aggregateResults,()=>Be(this.resultAggregation.filter(n=>this.aggregateResults(this.results,n).length),n=>C`${H(this.aggregateResults(this.results,n).length===1&&this.config.autoSpreadSingle,()=>C`<div style="margin-left: -8px">
                          ${L(this,Pt,$n).call(this,n)}
                        </div>`,()=>L(this,Pt,pi).call(this,n))}`),()=>L(this,Pt,$n).call(this))}
          </ul>
        </div>
      </section>
    `}}Pt=new WeakSet,$n=function(n){return di(n,this)},pi=function(n){return nc(n,this)};customElements.define("eox-itemfilter-results",rc);const ic=`input[type="checkbox"] { appearance: none; -webkit-appearance: none; margin: 0; cursor: pointer; display: flex; flex-direction: row; align-items: center; width: 24px; height: 24px;}input[type="checkbox"]:after { display: block; content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Echeckbox-blank-outline%3C/title%3E%3Cpath d='M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M19,5V19H5V5H19Z' /%3E%3C/svg%3E"); width: 20px; height: 20px; margin-right: 4px;}input[type="checkbox"]:checked:after { content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Echeckbox-marked%3C/title%3E%3Cpath d='M10,17L5,12L6.41,10.58L10,14.17L17.59,6.58L19,8M19,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3Z' /%3E%3C/svg%3E");}`,sc=`input[type="radio"] { appearance: none; -webkit-appearance: none; margin: 0; cursor: pointer; display: flex; flex-direction: row; align-items: center; width: 24px; height: 24px;}label span { font-size: small;}input[type="radio"]:after { display: block; content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Eradiobox-blank%3C/title%3E%3Cpath d='M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2Z' /%3E%3C/svg%3E"); width: 20px; height: 20px; margin-right: 4px;}input[type="radio"]:checked:after { content: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='%23004170' viewBox='0 0 24 24'%3E%3Ctitle%3Eradiobox-marked%3C/title%3E%3Cpath d='M12,20A8,8 0 0,1 4,12A8,8 0 0,1 12,4A8,8 0 0,1 20,12A8,8 0 0,1 12,20M12,2A10,10 0 0,0 2,12A10,10 0 0,0 12,22A10,10 0 0,0 22,12A10,10 0 0,0 12,2M12,7A5,5 0 0,0 7,12A5,5 0 0,0 12,17A5,5 0 0,0 17,12A5,5 0 0,0 12,7Z' /%3E%3C/svg%3E");}`;var vt,yi,mi,bi;class gi extends it{constructor(){super();q(this,vt);Ft(this,"debouncedInputHandler",Ne(L(this,vt,bi),500,{leading:!0}));this.filterObject={},this.suggestions=[],this.selectedItems=[],this.query="",this.showSuggestions=!1,this.highlightedIndex=-1,this.filteredSuggestions=[],this.type="select",this.unstyled=!1,this.tabIndex=0,this.inlineMode=!1}updated(n){Yl(n,this)}reset(){Vl(this)}firstUpdated(){this.filterObject.state&&(this.selectedItems=Object.keys(this.filterObject.state).map(n=>this.filterObject.state[n]?n:null).filter(n=>!!n),this.filterObject.stringifiedState=this.selectedItems.join(", ")||"",this.requestUpdate())}render(){const n=this.type.includes("multi")?"checkbox":"radio",r=this.filteredSuggestions.length>5?"select-overflow":ht;return C`
      <style>
        ${!this.unstyled&&ne}
        ${!this.unstyled&&ic}
        ${!this.unstyled&&sc}
      </style>
      ${H(this.suggestions.length>10,()=>C`<div class="autocomplete-container">
            <div class="autocomplete-container-wrapper">
              <input
                autocomplete="off"
                tabindex=${this.tabIndex}
                class="autocomplete-input"
                type="text"
                .value=${this.query}
                placeholder="${this.filterObject.placeholder||""}"
                @input=${L(this,vt,yi)}
                @keydown=${L(this,vt,mi)}
                @blur=${()=>this.showSuggestions=!1}
                @focus=${()=>this.showSuggestions=!0}
              />
            </div>
          </div>`)}
      <div class="select-container ${r}">
        <ul class="${this.type}">
          ${this.filteredSuggestions.map(i=>C`
              <li
                data-identifier="${i.toString().toLowerCase()}"
                data-title="${i}"
              >
                <label>
                  <input
                    type="${n}"
                    name=${i}
                    .checked=${this.selectedItems.includes(i)}
                    @change=${()=>this.debouncedInputHandler(i)}
                    @keydown=${o=>{o.key===" "&&this.inlineMode&&this.debouncedInputHandler(i)}}
                    tabindex=${this.tabIndex+1}
                  />
                  <span class="title">${i}</span>
                </label>
              </li>
            `)}
        </ul>
      </div>
    `}}vt=new WeakSet,yi=function(n){Gl(n,this)},mi=function(n){Kl(n,this)},bi=function(n){ui(n,this)},Ft(gi,"properties",{filterObject:{attribute:!1,type:Object},suggestions:{attribute:!1,type:Array},selectedItems:{state:!0,type:Array},query:{state:!0,type:String},showSuggestions:{state:!0,type:Boolean},highlightedIndex:{state:!0,type:Number},filteredSuggestions:{state:!0,type:Array},type:{attribute:!0,type:String},unstyled:{type:Boolean},tabIndex:{attribute:!1,type:Number},inlineMode:{attribute:"inline-mode",type:Boolean}});customElements.define("eox-itemfilter-select",gi);var Tt,wi,Ln;class xi extends it{constructor(){super();q(this,Tt);this.filterObject={},this.tabIndex=0,this.inputHandler=L(this,Tt,wi).bind(this),this.debouncedInputHandler=Ne(this.inputHandler,500,{leading:!1})}reset(){zl(this)}createRenderRoot(){return this}render(){return H(this.filterObject,()=>C`
        ${L(this,Tt,Ln).call(this,"min","before")}
        <tc-range-slider
          min="${this.filterObject.min}"
          max="${this.filterObject.max}"
          value1="${this.filterObject.state.min||this.filterObject.min}"
          value2="${this.filterObject.state.max||this.filterObject.max}"
          step="${this.filterObject.step||1}"
          @change=${this.debouncedInputHandler}
        ></tc-range-slider>
        ${L(this,Tt,Ln).call(this,"max","after")}
      `)}}Tt=new WeakSet,wi=function(n){ql(n,this)},Ln=function(n,r){return Ul(n,r,this)},Ft(xi,"properties",{filterObject:{attribute:!1,type:Object},tabIndex:{attribute:!1,type:Number}});customElements.define("eox-itemfilter-range",xi);var je,vi;class oc extends it{constructor(){super();q(this,je);this.filterObject={},this.tabIndex=0}static get properties(){return{filterObject:{type:Object},tabIndex:{attribute:!1,type:Number}}}reset(){Fl(this)}createRenderRoot(){return this}render(){return H(this.filterObject,()=>{var n;return C`
        <form style="display: inline">
          ${Be(["intersects","within"],r=>C`
              <label>
                <input
                  tabindex=${this.tabIndex}
                  type="radio"
                  name="mode"
                  .checked="${(this.filterObject.state.mode||"")===r||ht}"
                  value="${r}"
                  @click=${()=>L(this,je,vi).call(this,r)}
                />
                <small>${r} filter geometry</small>
              </label>
            `)}
        </form>
        <eox-itemfilter-spatial-filter
          exportparts="map: spatial-filter-map"
          .geometry="${(n=this.filterObject.state)==null?void 0:n.geometry}"
          @filter="${r=>{this.filterObject.state.geometry=r.detail.geometry,this.filterObject.dirty=!0,this.filterObject.stringifiedState="Polygon",this.dispatchEvent(new CustomEvent("filter"))}}"
        ></eox-itemfilter-spatial>
      `})}}je=new WeakSet,vi=function(n){Jl(n,this)};customElements.define("eox-itemfilter-spatial",oc);var Oe,_i;class ac extends it{constructor(){super();q(this,Oe);this.geometry=null,this.eoxMap=null}static get properties(){return{geometry:{type:Object},eoxMap:{type:Object}}}firstUpdated(){L(this,Oe,_i).call(this)}reset(){Zl(this)}render(){return C`<div id="eox-map"></div>`}}Oe=new WeakSet,_i=function(){hi(this)};customElements.define("eox-itemfilter-spatial-filter",ac);function lc(t,e){e.renderRoot.querySelectorAll(".chip").forEach(n=>{n.classList.remove("highlighted")}),t.target.classList.add("highlighted"),e.requestUpdate()}function cc(t,e){const{code:n,target:r}=t;r.id==="eox-itemfilter-input-search"&&(e.parentElement.classList.contains("hidden")&&["ArrowLeft","ArrowRight","Backspace"].includes(n)||(n==="Space"&&t.preventDefault(),["Escape","Space","Enter"].includes(n)||t.stopPropagation(),["ArrowLeft","ArrowRight","Escape","Backspace"].includes(n)&&uc(n,t.target.value??"",e)))}function uc(t,e,n){const r=n.renderRoot.querySelector(".chip.highlighted");if((t==="Escape"||e)&&r&&r.classList.remove("highlighted"),t==="Backspace"&&!e){if(n.items.length){r&&(r.querySelector(".chip-item-close").click(),n.items.splice(Array.from(n.renderRoot.querySelectorAll(".chip")).indexOf(r),1));const i=n.renderRoot.querySelectorAll(".chip")[n.renderRoot.querySelectorAll(".chip").length-1];i.classList.contains("highlighted")||i.classList.add("highlighted"),n.requestUpdate()}n._dispatchEvent()}if((t==="ArrowLeft"||t==="ArrowRight")&&!e){if(n.renderRoot.querySelectorAll(".chip").length<1)return;let i=0;const o=n.renderRoot.querySelector(".chip.highlighted");o&&(i=Array.from(n.renderRoot.querySelectorAll(".chip")).indexOf(o),o.classList.remove("highlighted")),i=i+(t==="ArrowLeft"?-1:1),t==="ArrowLeft"&&i<0&&(i=n.renderRoot.querySelectorAll(".chip").length-1),t==="ArrowRight"&&i>n.renderRoot.querySelectorAll(".chip").length-1&&(i=0),Array.from(n.renderRoot.querySelectorAll(".chip"))[i].classList.add("highlighted")}}var jt,kn,Mi;class fc extends it{constructor(){super();q(this,jt);this.items={},this.controller={}}static get properties(){return{items:{attribute:!1,type:Object},controller:{attribute:!1,type:Object}}}connectedCallback(){super.connectedCallback(),this.getRootNode().addEventListener("keydown",L(this,jt,kn).bind(this))}disconnectedCallback(){super.disconnectedCallback(),this.getRootNode().removeEventListener("keydown",L(this,jt,kn).bind(this))}_dispatchEvent(){this.dispatchEvent(new CustomEvent("items-selected",{detail:this.items}))}render(){return C`
      <style>
        ${ne}
      </style>
      <span class="chip-container">
        ${Be(this.items,n=>C`
            <span class="chip" @click=${L(this,jt,Mi).bind(this)}>
              <span class="chip-title">${n.title}</span>
                <span
                  class="chip-item-close hidden"
                  data-close=${n.key}
                  @click=${r=>{r.stopPropagation(),this.controller.remove(r),this.requestUpdate()}}
                ></span>
            </span>
            </span>
          `)}
      </span>
    `}}jt=new WeakSet,kn=function(n){cc(n,this)},Mi=function(n){lc(n,this)};customElements.define("eox-itemfilter-chips",fc);const hc=Object.freeze({aggregateResults:void 0,autoSpreadSingle:!1,enableHighlighting:!1,externalFilter:()=>{},filterProperties:[],fuseConfig:{},inlineMode:!1,matchAllWhenEmpty:!0,showResults:!0,idProperty:"id",titleProperty:"title",subTitleProperty:void 0,imageProperty:void 0,expandMultipleFilters:!0,expandResults:!0,expandMultipleResults:!0}),Sr=["aggregateResults","autoSpreadSingle","enableHighlighting","externalFilter","filterProperties","fuseConfig","inlineMode","matchAllWhenEmpty","showResults","titleProperty","subTitleProperty","imageProperty","idProperty","expandMultipleFilters","expandResults","expandMultipleResults","items"];var dc=200,Bn="__lodash_hash_undefined__",pc=1/0,gc="[object Function]",yc="[object GeneratorFunction]",mc=/[\\^$.*+?()[\]{}|]/g,bc=/^\[object .+?Constructor\]$/,xc=typeof bt=="object"&&bt&&bt.Object===Object&&bt,wc=typeof self=="object"&&self&&self.Object===Object&&self,Dn=xc||wc||Function("return this")();function vc(t,e){var n=t?t.length:0;return!!n&&Mc(t,e,0)>-1}function _c(t,e,n,r){for(var i=t.length,o=n+-1;++o<i;)if(e(t[o],o,t))return o;return-1}function Mc(t,e,n){if(e!==e)return _c(t,Ac,n);for(var r=n-1,i=t.length;++r<i;)if(t[r]===e)return r;return-1}function Ac(t){return t!==t}function Cc(t,e){return t.has(e)}function Sc(t,e){return t==null?void 0:t[e]}function Ec(t){var e=!1;if(t!=null&&typeof t.toString!="function")try{e=!!(t+"")}catch{}return e}function Ai(t){var e=-1,n=Array(t.size);return t.forEach(function(r){n[++e]=r}),n}var $c=Array.prototype,Lc=Function.prototype,Ci=Object.prototype,an=Dn["__core-js_shared__"],Er=function(){var t=/[^.]+$/.exec(an&&an.keys&&an.keys.IE_PROTO||"");return t?"Symbol(src)_1."+t:""}(),Si=Lc.toString,Hn=Ci.hasOwnProperty,kc=Ci.toString,Rc=RegExp("^"+Si.call(Hn).replace(mc,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),Pc=$c.splice,Tc=In(Dn,"Map"),ln=In(Dn,"Set"),te=In(Object,"create");function Rt(t){var e=-1,n=t?t.length:0;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function jc(){this.__data__=te?te(null):{}}function Oc(t){return this.has(t)&&delete this.__data__[t]}function Nc(t){var e=this.__data__;if(te){var n=e[t];return n===Bn?void 0:n}return Hn.call(e,t)?e[t]:void 0}function Bc(t){var e=this.__data__;return te?e[t]!==void 0:Hn.call(e,t)}function Dc(t,e){var n=this.__data__;return n[t]=te&&e===void 0?Bn:e,this}Rt.prototype.clear=jc;Rt.prototype.delete=Oc;Rt.prototype.get=Nc;Rt.prototype.has=Bc;Rt.prototype.set=Dc;function Wt(t){var e=-1,n=t?t.length:0;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function Hc(){this.__data__=[]}function Ic(t){var e=this.__data__,n=qe(e,t);if(n<0)return!1;var r=e.length-1;return n==r?e.pop():Pc.call(e,n,1),!0}function zc(t){var e=this.__data__,n=qe(e,t);return n<0?void 0:e[n][1]}function qc(t){return qe(this.__data__,t)>-1}function Uc(t,e){var n=this.__data__,r=qe(n,t);return r<0?n.push([t,e]):n[r][1]=e,this}Wt.prototype.clear=Hc;Wt.prototype.delete=Ic;Wt.prototype.get=zc;Wt.prototype.has=qc;Wt.prototype.set=Uc;function Gt(t){var e=-1,n=t?t.length:0;for(this.clear();++e<n;){var r=t[e];this.set(r[0],r[1])}}function Vc(){this.__data__={hash:new Rt,map:new(Tc||Wt),string:new Rt}}function Wc(t){return Ue(this,t).delete(t)}function Gc(t){return Ue(this,t).get(t)}function Kc(t){return Ue(this,t).has(t)}function Yc(t,e){return Ue(this,t).set(t,e),this}Gt.prototype.clear=Vc;Gt.prototype.delete=Wc;Gt.prototype.get=Gc;Gt.prototype.has=Kc;Gt.prototype.set=Yc;function ke(t){var e=-1,n=t?t.length:0;for(this.__data__=new Gt;++e<n;)this.add(t[e])}function Xc(t){return this.__data__.set(t,Bn),this}function Fc(t){return this.__data__.has(t)}ke.prototype.add=ke.prototype.push=Xc;ke.prototype.has=Fc;function qe(t,e){for(var n=t.length;n--;)if(iu(t[n][0],e))return n;return-1}function Zc(t){if(!Ei(t)||eu(t))return!1;var e=su(t)||Ec(t)?Rc:bc;return e.test(nu(t))}function Jc(t,e,n){var r=-1,i=vc,o=t.length,a=!0,l=[],u=l;if(o>=dc){var f=Qc(t);if(f)return Ai(f);a=!1,i=Cc,u=new ke}else u=l;t:for(;++r<o;){var h=t[r],p=h;if(h=h!==0?h:0,a&&p===p){for(var y=u.length;y--;)if(u[y]===p)continue t;l.push(h)}else i(u,p,n)||(u!==l&&u.push(p),l.push(h))}return l}var Qc=ln&&1/Ai(new ln([,-0]))[1]==pc?function(t){return new ln(t)}:ou;function Ue(t,e){var n=t.__data__;return tu(e)?n[typeof e=="string"?"string":"hash"]:n.map}function In(t,e){var n=Sc(t,e);return Zc(n)?n:void 0}function tu(t){var e=typeof t;return e=="string"||e=="number"||e=="symbol"||e=="boolean"?t!=="__proto__":t===null}function eu(t){return!!Er&&Er in t}function nu(t){if(t!=null){try{return Si.call(t)}catch{}try{return t+""}catch{}}return""}function ru(t){return t&&t.length?Jc(t):[]}function iu(t,e){return t===e||t!==t&&e!==e}function su(t){var e=Ei(t)?kc.call(t):"";return e==gc||e==yc}function Ei(t){var e=typeof t;return!!t&&(e=="object"||e=="function")}function ou(){}var au=ru;const $i=$r(au);var Re={exports:{}};Re.exports;(function(t,e){var n=200,r="Expected a function",i="__lodash_hash_undefined__",o=1,a=2,l=1/0,u=9007199254740991,f="[object Arguments]",h="[object Array]",p="[object Boolean]",y="[object Date]",g="[object Error]",b="[object Function]",w="[object GeneratorFunction]",S="[object Map]",M="[object Number]",$="[object Object]",E="[object Promise]",j="[object RegExp]",P="[object Set]",et="[object String]",B="[object Symbol]",K="[object WeakMap]",J="[object ArrayBuffer]",At="[object DataView]",Kt="[object Float32Array]",pt="[object Float64Array]",zn="[object Int8Array]",U="[object Int16Array]",Ot="[object Int32Array]",ie="[object Uint8Array]",Pi="[object Uint8ClampedArray]",Ti="[object Uint16Array]",ji="[object Uint32Array]",Oi=/\.|\[(?:[^[\]]*|(["'])(?:(?!\1)[^\\]|\\.)*?\1)\]/,Ni=/^\w*$/,Bi=/^\./,Di=/[^.[\]]+|\[(?:(-?\d+(?:\.\d+)?)|(["'])((?:(?!\2)[^\\]|\\.)*?)\2)\]|(?=(?:\.|\[\])(?:\.|\[\]|$))/g,Hi=/[\\^$.*+?()[\]{}|]/g,Ii=/\\(\\)?/g,zi=/^\[object .+?Constructor\]$/,qi=/^(?:0|[1-9]\d*)$/,R={};R[Kt]=R[pt]=R[zn]=R[U]=R[Ot]=R[ie]=R[Pi]=R[Ti]=R[ji]=!0,R[f]=R[h]=R[J]=R[p]=R[At]=R[y]=R[g]=R[b]=R[S]=R[M]=R[$]=R[j]=R[P]=R[et]=R[K]=!1;var qn=typeof bt=="object"&&bt&&bt.Object===Object&&bt,Ui=typeof self=="object"&&self&&self.Object===Object&&self,gt=qn||Ui||Function("return this")(),Un=e&&!e.nodeType&&e,Vn=Un&&!0&&t&&!t.nodeType&&t,Vi=Vn&&Vn.exports===Un,Wn=Vi&&qn.process,Gn=function(){try{return Wn&&Wn.binding("util")}catch{}}(),Kn=Gn&&Gn.isTypedArray;function Wi(s,c){for(var d=-1,m=s?s.length:0,v=Array(m);++d<m;)v[d]=c(s[d],d,s);return v}function Gi(s,c){for(var d=-1,m=c.length,v=s.length;++d<m;)s[v+d]=c[d];return s}function Ki(s,c){for(var d=-1,m=s?s.length:0;++d<m;)if(c(s[d],d,s))return!0;return!1}function Yi(s){return function(c){return c==null?void 0:c[s]}}function Xi(s,c){for(var d=-1,m=Array(s);++d<s;)m[d]=c(d);return m}function Fi(s){return function(c){return s(c)}}function Zi(s,c){return s==null?void 0:s[c]}function Ve(s){var c=!1;if(s!=null&&typeof s.toString!="function")try{c=!!(s+"")}catch{}return c}function Ji(s){var c=-1,d=Array(s.size);return s.forEach(function(m,v){d[++c]=[v,m]}),d}function Qi(s,c){return function(d){return s(c(d))}}function ts(s){var c=-1,d=Array(s.size);return s.forEach(function(m){d[++c]=m}),d}var es=Array.prototype,ns=Function.prototype,se=Object.prototype,We=gt["__core-js_shared__"],Yn=function(){var s=/[^.]+$/.exec(We&&We.keys&&We.keys.IE_PROTO||"");return s?"Symbol(src)_1."+s:""}(),Xn=ns.toString,ot=se.hasOwnProperty,Nt=se.toString,rs=RegExp("^"+Xn.call(ot).replace(Hi,"\\$&").replace(/hasOwnProperty|(function).*?(?=\\\()| for .+?(?=\\\])/g,"$1.*?")+"$"),oe=gt.Symbol,Fn=gt.Uint8Array,is=se.propertyIsEnumerable,ss=es.splice,Zn=oe?oe.isConcatSpreadable:void 0,os=Qi(Object.keys,Object),Ge=Bt(gt,"DataView"),Yt=Bt(gt,"Map"),Ke=Bt(gt,"Promise"),Ye=Bt(gt,"Set"),Xe=Bt(gt,"WeakMap"),Xt=Bt(Object,"create"),as=St(Ge),ls=St(Yt),cs=St(Ke),us=St(Ye),fs=St(Xe),ae=oe?oe.prototype:void 0,Fe=ae?ae.valueOf:void 0,Jn=ae?ae.toString:void 0;function Ct(s){var c=-1,d=s?s.length:0;for(this.clear();++c<d;){var m=s[c];this.set(m[0],m[1])}}function hs(){this.__data__=Xt?Xt(null):{}}function ds(s){return this.has(s)&&delete this.__data__[s]}function ps(s){var c=this.__data__;if(Xt){var d=c[s];return d===i?void 0:d}return ot.call(c,s)?c[s]:void 0}function gs(s){var c=this.__data__;return Xt?c[s]!==void 0:ot.call(c,s)}function ys(s,c){var d=this.__data__;return d[s]=Xt&&c===void 0?i:c,this}Ct.prototype.clear=hs,Ct.prototype.delete=ds,Ct.prototype.get=ps,Ct.prototype.has=gs,Ct.prototype.set=ys;function at(s){var c=-1,d=s?s.length:0;for(this.clear();++c<d;){var m=s[c];this.set(m[0],m[1])}}function ms(){this.__data__=[]}function bs(s){var c=this.__data__,d=ce(c,s);if(d<0)return!1;var m=c.length-1;return d==m?c.pop():ss.call(c,d,1),!0}function xs(s){var c=this.__data__,d=ce(c,s);return d<0?void 0:c[d][1]}function ws(s){return ce(this.__data__,s)>-1}function vs(s,c){var d=this.__data__,m=ce(d,s);return m<0?d.push([s,c]):d[m][1]=c,this}at.prototype.clear=ms,at.prototype.delete=bs,at.prototype.get=xs,at.prototype.has=ws,at.prototype.set=vs;function lt(s){var c=-1,d=s?s.length:0;for(this.clear();++c<d;){var m=s[c];this.set(m[0],m[1])}}function _s(){this.__data__={hash:new Ct,map:new(Yt||at),string:new Ct}}function Ms(s){return ue(this,s).delete(s)}function As(s){return ue(this,s).get(s)}function Cs(s){return ue(this,s).has(s)}function Ss(s,c){return ue(this,s).set(s,c),this}lt.prototype.clear=_s,lt.prototype.delete=Ms,lt.prototype.get=As,lt.prototype.has=Cs,lt.prototype.set=Ss;function le(s){var c=-1,d=s?s.length:0;for(this.__data__=new lt;++c<d;)this.add(s[c])}function Es(s){return this.__data__.set(s,i),this}function $s(s){return this.__data__.has(s)}le.prototype.add=le.prototype.push=Es,le.prototype.has=$s;function ct(s){this.__data__=new at(s)}function Ls(){this.__data__=new at}function ks(s){return this.__data__.delete(s)}function Rs(s){return this.__data__.get(s)}function Ps(s){return this.__data__.has(s)}function Ts(s,c){var d=this.__data__;if(d instanceof at){var m=d.__data__;if(!Yt||m.length<n-1)return m.push([s,c]),this;d=this.__data__=new lt(m)}return d.set(s,c),this}ct.prototype.clear=Ls,ct.prototype.delete=ks,ct.prototype.get=Rs,ct.prototype.has=Ps,ct.prototype.set=Ts;function js(s,c){var d=ut(s)||Qe(s)?Xi(s.length,String):[],m=d.length,v=!!m;for(var x in s)ot.call(s,x)&&!(v&&(x=="length"||nr(x,m)))&&d.push(x);return d}function ce(s,c){for(var d=s.length;d--;)if(sr(s[d][0],c))return d;return-1}var Os=Js(Ds);function Ns(s,c,d,m,v){var x=-1,A=s.length;for(d||(d=io),v||(v=[]);++x<A;){var T=s[x];d(T)?Gi(v,T):v[v.length]=T}return v}var Bs=Qs();function Ds(s,c){return s&&Bs(s,c,ye)}function Qn(s,c){c=fe(c,s)?[c]:tr(c);for(var d=0,m=c.length;s!=null&&d<m;)s=s[he(c[d++])];return d&&d==m?s:void 0}function Hs(s){return Nt.call(s)}function Is(s,c){return s!=null&&c in Object(s)}function Ze(s,c,d,m,v){return s===c?!0:s==null||c==null||!pe(s)&&!ge(c)?s!==s&&c!==c:zs(s,c,Ze,d,m,v)}function zs(s,c,d,m,v,x){var A=ut(s),T=ut(c),O=h,N=h;A||(O=yt(s),O=O==f?$:O),T||(N=yt(c),N=N==f?$:N);var I=O==$&&!Ve(s),z=N==$&&!Ve(c),D=O==N;if(D&&!I)return x||(x=new ct),A||ho(s)?er(s,c,d,m,v,x):to(s,c,O,d,m,v,x);if(!(v&a)){var Y=I&&ot.call(s,"__wrapped__"),X=z&&ot.call(c,"__wrapped__");if(Y||X){var mt=Y?s.value():s,ft=X?c.value():c;return x||(x=new ct),d(mt,ft,m,v,x)}}return D?(x||(x=new ct),eo(s,c,d,m,v,x)):!1}function qs(s,c,d,m){var v=d.length,x=v;if(s==null)return!x;for(s=Object(s);v--;){var A=d[v];if(A[2]?A[1]!==s[A[0]]:!(A[0]in s))return!1}for(;++v<x;){A=d[v];var T=A[0],O=s[T],N=A[1];if(A[2]){if(O===void 0&&!(T in s))return!1}else{var I=new ct,z;if(!(z===void 0?Ze(N,O,m,o|a,I):z))return!1}}return!0}function Us(s){if(!pe(s)||oo(s))return!1;var c=or(s)||Ve(s)?rs:zi;return c.test(St(s))}function Vs(s){return ge(s)&&tn(s.length)&&!!R[Nt.call(s)]}function Ws(s){return typeof s=="function"?s:s==null?mo:typeof s=="object"?ut(s)?Xs(s[0],s[1]):Ys(s):bo(s)}function Gs(s){if(!ao(s))return os(s);var c=[];for(var d in Object(s))ot.call(s,d)&&d!="constructor"&&c.push(d);return c}function Ks(s,c){var d=-1,m=de(s)?Array(s.length):[];return Os(s,function(v,x,A){m[++d]=c(v,x,A)}),m}function Ys(s){var c=no(s);return c.length==1&&c[0][2]?ir(c[0][0],c[0][1]):function(d){return d===s||qs(d,s,c)}}function Xs(s,c){return fe(s)&&rr(c)?ir(he(s),c):function(d){var m=go(d,s);return m===void 0&&m===c?yo(d,s):Ze(c,m,void 0,o|a)}}function Fs(s){return function(c){return Qn(c,s)}}function Zs(s){if(typeof s=="string")return s;if(en(s))return Jn?Jn.call(s):"";var c=s+"";return c=="0"&&1/s==-l?"-0":c}function tr(s){return ut(s)?s:lo(s)}function Js(s,c){return function(d,m){if(d==null)return d;if(!de(d))return s(d,m);for(var v=d.length,x=-1,A=Object(d);++x<v&&m(A[x],x,A)!==!1;);return d}}function Qs(s){return function(c,d,m){for(var v=-1,x=Object(c),A=m(c),T=A.length;T--;){var O=A[++v];if(d(x[O],O,x)===!1)break}return c}}function er(s,c,d,m,v,x){var A=v&a,T=s.length,O=c.length;if(T!=O&&!(A&&O>T))return!1;var N=x.get(s);if(N&&x.get(c))return N==c;var I=-1,z=!0,D=v&o?new le:void 0;for(x.set(s,c),x.set(c,s);++I<T;){var Y=s[I],X=c[I];if(m)var mt=A?m(X,Y,I,c,s,x):m(Y,X,I,s,c,x);if(mt!==void 0){if(mt)continue;z=!1;break}if(D){if(!Ki(c,function(ft,Et){if(!D.has(Et)&&(Y===ft||d(Y,ft,m,v,x)))return D.add(Et)})){z=!1;break}}else if(!(Y===X||d(Y,X,m,v,x))){z=!1;break}}return x.delete(s),x.delete(c),z}function to(s,c,d,m,v,x,A){switch(d){case At:if(s.byteLength!=c.byteLength||s.byteOffset!=c.byteOffset)return!1;s=s.buffer,c=c.buffer;case J:return!(s.byteLength!=c.byteLength||!m(new Fn(s),new Fn(c)));case p:case y:case M:return sr(+s,+c);case g:return s.name==c.name&&s.message==c.message;case j:case et:return s==c+"";case S:var T=Ji;case P:var O=x&a;if(T||(T=ts),s.size!=c.size&&!O)return!1;var N=A.get(s);if(N)return N==c;x|=o,A.set(s,c);var I=er(T(s),T(c),m,v,x,A);return A.delete(s),I;case B:if(Fe)return Fe.call(s)==Fe.call(c)}return!1}function eo(s,c,d,m,v,x){var A=v&a,T=ye(s),O=T.length,N=ye(c),I=N.length;if(O!=I&&!A)return!1;for(var z=O;z--;){var D=T[z];if(!(A?D in c:ot.call(c,D)))return!1}var Y=x.get(s);if(Y&&x.get(c))return Y==c;var X=!0;x.set(s,c),x.set(c,s);for(var mt=A;++z<O;){D=T[z];var ft=s[D],Et=c[D];if(m)var ar=A?m(Et,ft,D,c,s,x):m(ft,Et,D,s,c,x);if(!(ar===void 0?ft===Et||d(ft,Et,m,v,x):ar)){X=!1;break}mt||(mt=D=="constructor")}if(X&&!mt){var me=s.constructor,be=c.constructor;me!=be&&"constructor"in s&&"constructor"in c&&!(typeof me=="function"&&me instanceof me&&typeof be=="function"&&be instanceof be)&&(X=!1)}return x.delete(s),x.delete(c),X}function ue(s,c){var d=s.__data__;return so(c)?d[typeof c=="string"?"string":"hash"]:d.map}function no(s){for(var c=ye(s),d=c.length;d--;){var m=c[d],v=s[m];c[d]=[m,v,rr(v)]}return c}function Bt(s,c){var d=Zi(s,c);return Us(d)?d:void 0}var yt=Hs;(Ge&&yt(new Ge(new ArrayBuffer(1)))!=At||Yt&&yt(new Yt)!=S||Ke&&yt(Ke.resolve())!=E||Ye&&yt(new Ye)!=P||Xe&&yt(new Xe)!=K)&&(yt=function(s){var c=Nt.call(s),d=c==$?s.constructor:void 0,m=d?St(d):void 0;if(m)switch(m){case as:return At;case ls:return S;case cs:return E;case us:return P;case fs:return K}return c});function ro(s,c,d){c=fe(c,s)?[c]:tr(c);for(var m,v=-1,A=c.length;++v<A;){var x=he(c[v]);if(!(m=s!=null&&d(s,x)))break;s=s[x]}if(m)return m;var A=s?s.length:0;return!!A&&tn(A)&&nr(x,A)&&(ut(s)||Qe(s))}function io(s){return ut(s)||Qe(s)||!!(Zn&&s&&s[Zn])}function nr(s,c){return c=c??u,!!c&&(typeof s=="number"||qi.test(s))&&s>-1&&s%1==0&&s<c}function fe(s,c){if(ut(s))return!1;var d=typeof s;return d=="number"||d=="symbol"||d=="boolean"||s==null||en(s)?!0:Ni.test(s)||!Oi.test(s)||c!=null&&s in Object(c)}function so(s){var c=typeof s;return c=="string"||c=="number"||c=="symbol"||c=="boolean"?s!=="__proto__":s===null}function oo(s){return!!Yn&&Yn in s}function ao(s){var c=s&&s.constructor,d=typeof c=="function"&&c.prototype||se;return s===d}function rr(s){return s===s&&!pe(s)}function ir(s,c){return function(d){return d==null?!1:d[s]===c&&(c!==void 0||s in Object(d))}}var lo=Je(function(s){s=po(s);var c=[];return Bi.test(s)&&c.push(""),s.replace(Di,function(d,m,v,x){c.push(v?x.replace(Ii,"$1"):m||d)}),c});function he(s){if(typeof s=="string"||en(s))return s;var c=s+"";return c=="0"&&1/s==-l?"-0":c}function St(s){if(s!=null){try{return Xn.call(s)}catch{}try{return s+""}catch{}}return""}function co(s,c){return Ns(uo(s,c))}function uo(s,c){var d=ut(s)?Wi:Ks;return d(s,Ws(c))}function Je(s,c){if(typeof s!="function"||c&&typeof c!="function")throw new TypeError(r);var d=function(){var m=arguments,v=c?c.apply(this,m):m[0],x=d.cache;if(x.has(v))return x.get(v);var A=s.apply(this,m);return d.cache=x.set(v,A),A};return d.cache=new(Je.Cache||lt),d}Je.Cache=lt;function sr(s,c){return s===c||s!==s&&c!==c}function Qe(s){return fo(s)&&ot.call(s,"callee")&&(!is.call(s,"callee")||Nt.call(s)==f)}var ut=Array.isArray;function de(s){return s!=null&&tn(s.length)&&!or(s)}function fo(s){return ge(s)&&de(s)}function or(s){var c=pe(s)?Nt.call(s):"";return c==b||c==w}function tn(s){return typeof s=="number"&&s>-1&&s%1==0&&s<=u}function pe(s){var c=typeof s;return!!s&&(c=="object"||c=="function")}function ge(s){return!!s&&typeof s=="object"}function en(s){return typeof s=="symbol"||ge(s)&&Nt.call(s)==B}var ho=Kn?Fi(Kn):Vs;function po(s){return s==null?"":Zs(s)}function go(s,c,d){var m=s==null?void 0:Qn(s,c);return m===void 0?d:m}function yo(s,c){return s!=null&&ro(s,c,Is)}function ye(s){return de(s)?js(s):Gs(s)}function mo(s){return s}function bo(s){return fe(s)?Yi(he(s)):Fs(s)}t.exports=co})(Re,Re.exports);var lu=Re.exports;const Li=$r(lu);function cu(t,e,n){let r=[];t.filterProperties.length&&t.filterProperties.forEach(o=>{const a={},l=f=>o.format==="date"?Zt(f).unix():parseFloat(f);e.forEach(f=>{var h,p;if(o.type==="range"){const y=Qt(o.key,f);if(Array.isArray(y)){const g=[l(y[0]),l(y[1])];a.min=a.min!==void 0?Math.min(a.min,g[0]):g[0],a.max=a.max!==void 0?Math.max(a.max,g[1]):g[1]}else{const g=l(y);a.min=a.min!==void 0?Math.min(a.min,g):g,a.max=a.max!==void 0?Math.max(a.max,g):g}return}Array.isArray(f[o.key])?f[o.key].forEach(y=>{a[y]=void 0}):o.type==="spatial"?(a.geometry=((h=o==null?void 0:o.state)==null?void 0:h.geometry)||void 0,a.geometry&&(o.stringifiedState=a.geometry.type),a.mode=o.mode||"intersects"):(p=o.key)!=null&&p.includes(".")?$i(Li(n.items,o.key)).filter(y=>y).forEach(y=>{a[y]=void 0}):a[f[o.key]]=void 0});const u=o.key||o.keys.join("|");n.filters[u]=Object.assign({type:o.type||"multiselect",dirty:o.state?Object.values(o.state).some(f=>f):void 0,key:u},o.type==="range"?{min:a.min,max:a.max,format:o.format}:{},o),n.filters[u].state=Object.assign({},a,o.state)}),t.matchAllWhenEmpty!==!1&&(n.results=n.sortResults(e),n.requestUpdate()),t.aggregateResults&&(r=Array.from(new Set(e.reduce((o,a)=>o.concat(a[t.aggregateResults]),[]))).sort((o,a)=>o.localeCompare(a)));const i=[];return Object.values(n.filters).forEach(o=>{o.type==="text"?o.keys.forEach(a=>{i.includes(a)||i.push(a)}):(o.type==="select"||o.type==="multiselect")&&(i.includes(o.key)||i.push(o.key))}),Tl(e,Object.assign({keys:i},t.fuseConfig)),r}async function uu(t,e,n){let r;n.externalFilter?r=await Bl(e,n.filters,t):r=await jl(e,n.filters,t),n.results=n.sortResults(r)}function fu(t,e,n){const r=`filter-${t.key}`.replace("|","-");switch(t.type){case"text":return C`<eox-itemfilter-text
        data-type="filter"
        data-cy="text-filter"
        slot="filter"
        id="${r}"
        .tabIndex=${e}
        .filterObject=${t}
        .unstyled=${n.unstyled}
        @filter=${()=>n.search()}
      ></eox-itemfilter-text>`;case"multiselect":case"select":return C`
        <eox-itemfilter-select
          .inlineMode=${n.inlineMode||!1}
          data-type="filter"
          id="${r}"
          .tabIndex=${e}
          .filterObject=${t}
          slot="filter"
          .suggestions="${$i(Li(n.items,t.key)).filter(i=>i)}"
          type="${t.type}"
          .unstyled=${n.unstyled}
          @filter=${()=>n.search()}
        ></eox-itemfilter-select>
      `;case"range":return C`
        <eox-itemfilter-range
          id="${r}"
          data-type="filter"
          .tabIndex=${e}
          .filterObject=${t}
          slot="filter"
          .unstyled=${n.unstyled}
          @filter=${()=>n.search()}
        ></eox-itemfilter-range>
      `;case"spatial":return C`
        <eox-itemfilter-spatial
          id="${r}"
          data-type="filter"
          .tabIndex=${e}
          .filterObject=${t}
          slot="filter"
          @filter=${()=>n.search()}
        ></eox-itemfilter-spatial>
      `;default:return C``}}function hu(t,e){return[...t].sort((n,r)=>n[e.titleProperty].localeCompare(r[e.titleProperty]))}function du(t,e,n){return C`
    ${H(t.dirty,()=>C`
        <button
          type="button"
          tabindex=${e}
          slot="reset-button"
          class="reset-icon icon"
          @click=${r=>{const i=r.target.parentElement.querySelector("[slot=filter]");i&&typeof i.reset=="function"&&i.reset(),n.search(),n.requestUpdate()}}
        >
          ${n.unstyled?"Reset":ht}
        </button>
      `)}
  `}function pu(t){t.renderRoot.querySelectorAll("[data-type='filter']").forEach(e=>{typeof e.reset=="function"&&e.reset()}),t.search()}var ee,It,F,Ut,ki,Ri;class gu extends it{constructor(){super();q(this,Ut);q(this,ee,[]);q(this,It,[]);q(this,F,hc);this.items=null,this.filters={},this.results=[],this.selectedResult=null,this.search=Ne(this.searchHandler,100,{leading:!0}),this.aggregateResults=void 0,this.autoSpreadSingle=!1,this.enableHighlighting=!1,this.externalFilter=null,this.filterProperties=[],this.fuseConfig={},this.inlineMode=!1,this.matchAllWhenEmpty=!0,this.showResults=!0,this.titleProperty="title",this.subTitleProperty=void 0,this.imageProperty=void 0,this.idProperty="id",this.expandMultipleFilters=!0,this.expandResults=!0,this.expandMultipleResults=!0,this.resultType="list",this.unstyled=!1}static get properties(){return{items:{attribute:!1,type:Object},results:{state:!0,attribute:!1,type:Object},filters:{state:!0,attribute:!1,type:Object},selectedResult:{attribute:!1,type:Object},aggregateResults:{attribute:"aggregate-results",type:String},autoSpreadSingle:{attribute:"auto-spread-single",type:Boolean},enableHighlighting:{attribute:"enable-highlighting",type:Boolean},filterProperties:{attribute:!1,type:Array},fuseConfig:{attribute:!1,type:Object},inlineMode:{attribute:"inline-mode",type:Boolean},matchAllWhenEmpty:{attribute:"match-all-when-empty",type:Boolean},showResults:{attribute:"show-result",type:Boolean},idProperty:{attribute:"id-property",type:String},titleProperty:{attribute:"title-property",type:String},subTitleProperty:{attribute:"sub-title-property",type:String},imageProperty:{attribute:"image-property",type:String},expandMultipleFilters:{attribute:"enable-multiple-filter",type:Boolean},expandResults:{attribute:"expand-result",type:Boolean},expandMultipleResults:{attribute:"expand-multiple-results",type:Boolean},externalFilter:{attribute:!1,type:Function},resultType:{attribute:"result-type",type:String},unstyled:{type:Boolean}}}apply(){xe(this,ee,cu(V(this,F),V(this,It),this)),this.search()}async searchHandler(){await uu(V(this,F),V(this,It),this),this.dispatchEvent(new CustomEvent("filter",{detail:{results:this.results,filters:this.filters},bubbles:!0,composed:!0})),this.inlineMode&&this.renderRoot.querySelector("eox-itemfilter-container").updateInline(),this.requestUpdate()}sortResults(n){return hu(n,V(this,F))}resetFilters(){pu(this)}firstUpdated(n){var i;let r={};Sr.map(o=>{r={...r,[o]:this[o]}}),xe(this,F,r),xe(this,It,((i=this.items)==null?void 0:i.map((o,a)=>Object.assign({id:o[this.idProperty]||`item-${a}`},o)))||[]),this.apply()}updated(n){Sr.map(r=>{if(n.has(r))return this.firstUpdated(),!0})}updateResult(n){this.selectedResult=n.detail,this.dispatchEvent(new CustomEvent("select",{detail:this.selectedResult,bubbles:!0,composed:!0})),this.requestUpdate()}render(){var n;return C`
      <style>
        ${$o}
        ${!this.unstyled&&ne}
        ${!this.unstyled&&Lo}
        ${this.styleOverride}
      </style>
      <form
        id="itemfilter"
        class=${this.inlineMode?"inline":ht}
        @submit="${r=>r.preventDefault()}"
      >
        ${H(this.filterProperties,()=>C`
            <eox-itemfilter-container
              .filters=${this.filters}
              .filterProperties=${this.filterProperties}
              .inlineMode=${this.inlineMode||!1}
              @reset=${()=>this.resetFilters()}
              @filter=${()=>this.search()}
            >
              <section slot="section">
                ${H(!this.inlineMode,()=>C`
                    <slot name="filterstitle"
                      ><h6 class="main-heading">Filters</h6></slot
                    >
                  `)}
                <ul id="filters">
                  ${Be(Object.values(this.filters),(r,i)=>C` <li>
                        <eox-itemfilter-expandcontainer
                          .filterObject=${r}
                          @details-toggled=${o=>ii(o,V(this,F),this)}
                          data-details="${r.key}"
                        >
                          ${L(this,Ut,Ri).call(this,r,Cr(i,1))}
                          ${L(this,Ut,ki).call(this,r,Cr(i,2))}
                        </eox-itemfilter-expandcontainer>
                      </li>`)}
                </ul>
                ${H(!this.inlineMode&&V(this,F).filterProperties&&!this.inlineMode&&V(this,F).filterProperties&&vn(this.filters),()=>C`
                    <button
                      type="button"
                      id="filter-reset"
                      class="outline small icon-text reset-icon"
                      data-cy="filter-reset"
                      @click=${()=>this.resetFilters()}
                    >
                      Reset all
                    </a>
                  `)}
              </section>
            </eox-itemfilter-container>
          `)}
        ${H(((n=V(this,F))==null?void 0:n.showResults)&&this.results,()=>C`
            <eox-itemfilter-results
              .config=${V(this,F)}
              .results=${this.results}
              .filters=${this.filters}
              .resultAggregation=${V(this,ee)}
              .selectedResult=${this.selectedResult}
              .resultType=${this.resultType}
              @result=${this.updateResult}
            >
              <slot name="resultstitle"
                ><h6 class="main-heading">Results</h6></slot
              >
            </eox-itemfilter-results>
          `)}
      </form>
    `}}ee=new WeakMap,It=new WeakMap,F=new WeakMap,Ut=new WeakSet,ki=function(n,r){return fu(n,r,this)},Ri=function(n,r){return du(n,r,this)};customElements.define("eox-itemfilter",gu);const yu={slot:"filterstitle",style:{margin:"14px 8px"}},mu={slot:"resultstitle",style:{margin:"14px 8px"}},cn="float:right; height:15px; padding:4px;  margin-top:-4px; background-color:white;",bu="float:right; height:15px; padding:4px;  margin-top:-4px; background-color:#9bcaeb;",Su={__name:"EodashItemFilter",props:{enableCompare:{type:Boolean,default:!1},filtersTitle:{type:String,default:"Indicators"},resultsTitle:{type:String,default:""},titleProperty:{type:String,default:"title"},aggregateResults:{type:String,default:"themes"},enableHighlighting:{type:Boolean,default:!0},expandMultipleFilters:{type:Boolean,default:!0},expandMultipleResults:{type:Boolean,default:!0},filterProperties:{type:Array,default:()=>[{keys:["title","themes","description"],title:"Search",type:"text"},{key:"themes",title:"Theme Filter",type:"multiselect"}]}},setup(t){const e=t,n=async l=>{var f,h;(h=(f=i.value)==null?void 0:f.shadowRoot)==null||h.querySelectorAll(".compareMapButton").forEach(p=>p.setAttribute("style",cn));const u=l.detail;u&&(o.resetSelectedCompareSTAC(),await o.loadSelectedSTAC(u.href))},r={titleProperty:e.titleProperty,filterProperties:e.filterProperties,aggregateResults:e.aggregateResults,enableHighlighting:e.enableHighlighting,expandMultipleFilters:e.expandMultipleFilters,expandMultipleResults:e.expandMultipleResults},i=Mo(null),o=vo(),a=()=>{setTimeout(()=>{var l,u;(l=i.value)==null||l.shadowRoot.querySelectorAll("details>summary").forEach(f=>f.setAttribute("style","width: 100%")),(u=i.value)==null||u.shadowRoot.querySelectorAll("details>div li").forEach(f=>{let h=document.createElement("button");h.className="compareMapButton",h.dataset.id=f.children[0].id,h.onclick=async g=>{var S,M,$;(M=(S=i.value)==null?void 0:S.shadowRoot)==null||M.querySelectorAll(".compareMapButton").forEach(E=>{E.setAttribute("style",cn)});const b=g.currentTarget;b==null||b.setAttribute("style",bu);const w=($=i.value)==null?void 0:$.items.find(E=>E.id===(b==null?void 0:b.dataset.id));w&&await o.loadSelectedCompareSTAC(w.href)},h.setAttribute("style",cn);const p=document.createElementNS("http://www.w3.org/2000/svg","svg"),y=document.createElementNS("http://www.w3.org/2000/svg","path");p.setAttribute("width","15"),p.setAttribute("height","15"),p.setAttribute("viewBox","0 0 24 24"),y.setAttribute("d","M19,3H14V5H19V18L14,12V21H19A2,2 0 0,0 21,19V5C21,3.89 20.1,3 19,3M10,18H5L10,12M10,3H5C3.89,3 3,3.89 3,5V19A2,2 0 0,0 5,21H10V23H12V1H10V3Z"),p.appendChild(y),h.appendChild(p),f.append(h)})},100)};return Ao(()=>{var f,h,p;const l=document.createElement("style");l.innerHTML=`
    section {
      margin: 0 !important;
    }
    section button#filter-reset {
      padding: 0 8px;
      top: 8px;
      right: 8px;
    }
  `,(h=(f=i.value)==null?void 0:f.shadowRoot)==null||h.appendChild(l);const u=(p=o.stac)==null?void 0:p.filter(y=>y.rel==="child");i.value.items=u,e.enableCompare&&a()}),(l,u)=>(Co(),So("eox-itemfilter",Eo({class:"fill-height"},r,{ref_key:"eoxItemFilter",ref:i,style:{overflow:"auto"},onSelect:n}),[cr("h4",yu,ur(t.filtersTitle),1),cr("h4",mu,ur(t.resultsTitle),1)],16))}};export{Su as default};
