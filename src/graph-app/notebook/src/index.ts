import { CellTypeSelector } from "./notebook/cell-type-selector/cell-type-selector";
import { MarkdownCellElement } from "./notebook/markdown-cell/markdown-cell";
import { NotebookElement } from "./notebook/notebook/notebook";
import { CellActionsElement } from "./notebook/cell-actions/cell-actions";
import { JavascriptCellElement } from "./notebook/javascript-cell/javascript-cell";
import { TypescriptCellElement } from "./notebook/typescript-cell/typescript-cell";
import { NotebookActionsElement } from "./notebook/notebook-actions/notebook-actions";
import { NotebookAppElement } from "./notebook/notebook-app/notebook-app";

if(!customElements.get('markdown-cell')){
  window.customElements.define('markdown-cell', MarkdownCellElement);
}
if(!customElements.get('notebook-el')){
  window.customElements.define('notebook-el', NotebookElement);
}
if(!customElements.get('cell-type')){
  window.customElements.define('cell-type', CellTypeSelector)
}
if(!customElements.get('cell-actions')){
  window.customElements.define('cell-actions', CellActionsElement);
}
if(!customElements.get('javascript-cell')){
  window.customElements.define('javascript-cell', JavascriptCellElement);
}
if(!customElements.get('typescript-cell')){
  window.customElements.define('typescript-cell', TypescriptCellElement);
}
if(!customElements.get('notebook-actions')){
  window.customElements.define('notebook-actions', NotebookActionsElement);
}
if(!customElements.get('notebook-app')){
  window.customElements.define('notebook-app', NotebookAppElement);
} 

if("serviceWorker" in navigator){
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(new URL('./service-worker.js', import.meta.url), {
      scope: "/notebook/",
      type: "module"
    })
    .catch(error => {
      console.error(`Service Worker registration failed: ${error}`);
    });

    navigator.serviceWorker.ready
    .then(registration => {
      navigator.storage.persist();
    })
    .catch(error => {
      console.error(`Service Worker failed to become ready: ${error}`);
    });
  });
}