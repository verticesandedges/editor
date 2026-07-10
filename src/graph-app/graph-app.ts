import "./graph-element/dist/main"
import { GraphElement, VertexElement } from "./graph-element/dist/main";

import { NotebookElement } from "./notebook/src/notebook/notebook/notebook.ts";
import { CellTypeSelector } from "./notebook/src/notebook/cell-type-selector/cell-type-selector";
import { MarkdownCellElement } from "./notebook/src/notebook/markdown-cell/markdown-cell";
import { CellActionsElement } from "./notebook/src/notebook/cell-actions/cell-actions";
import { JavascriptCellElement } from "./notebook/src/notebook/javascript-cell/javascript-cell";
import { TypescriptCellElement } from "./notebook/src/notebook/typescript-cell/typescript-cell";
import { NotebookActionsElement } from "./notebook/src/notebook/notebook-actions/notebook-actions";
import { NotebookAppElement } from "./notebook/src/notebook/notebook-app/notebook-app";
import "./drill-down/src/drill-down.ts";

window.customElements.define("markdown-cell", MarkdownCellElement);
window.customElements.define("notebook-el", NotebookElement);
window.customElements.define("cell-type", CellTypeSelector)
window.customElements.define("cell-actions", CellActionsElement);
window.customElements.define("javascript-cell", JavascriptCellElement);
window.customElements.define('typescript-cell', TypescriptCellElement);
window.customElements.define('notebook-actions', NotebookActionsElement);
window.customElements.define('notebook-app', NotebookAppElement);

export class GraphAppElement extends HTMLElement {
  static template: string = ``;

  qs: (query: string) => HTMLElement | null;
  qsa: (query: string) => NodeList;
  graph!: GraphElement;

  constructor(){
    super();
    this.attachShadow({mode: 'open'});
    this.qs = (query: string) => this.shadowRoot!.querySelector(query);
    this.qsa = (query: string) => this.shadowRoot!.querySelectorAll(query);

    this.fetchStyle()
    .then(() => this.fetchTemplate())
    .then(() => this.graph = this.qs('graph-el') as GraphElement)
    .then(() => this.wireToolMenu())
    .then(() => this.wireNotebook());

    /*.then(() => this.setupGraphMenuHandlers())
    .then(() => this.setupNotebookMenuHandlers())
    .then(() => this.setupVertexMenuHandlers())
    .then(() => this.setupEdgeMenuHandlers())
    */
  }

  wireToolMenu(){
    /* Tool Menu Toggle in the Main Menu */
    /* main menu: tool menu toggle (button & checkbox for show-hide)*/
    const button = this.qs('#tool-menu-button') as HTMLButtonElement;
    const trigger = this.qs('#tool-menu-checkbox')! as HTMLInputElement;
    const menu = this.qs('#tool-menu')!;

    trigger.onchange = (e) => {
      e.stopPropagation();
      menu.togglePopover(trigger.checked);
    }

    button.onclick = (e) => {
      e.stopPropagation();
      trigger.toggleAttribute('checked');
    }

    trigger.onchange(new Event('change'));

    /* tool menu buttons */
    /* Click Handlers */

    // add vertex

    this.addEventListener('add-vertex', () => {
      this.graph.addVertex();
    });

    // add edges
    this.addEventListener('connect-vertices', () => {
      const selected = [...this.graph.selected];
      for(let i=0; i<selected.length; i++){
        if(i>0){
          this.graph.addEdge(selected.at(i-1), selected.at(i));
        }
      }
      if(selected.length > 2){
        this.graph.addEdge(selected.at(-1), selected.at(0));
      }
    })

    // select all 
    this.addEventListener('tool-select-all', () => {
      this.graph.vertices.forEach(v => v.selected = true)
    });

    // select none 
    this.addEventListener('tool-select-none', () => {
      this.graph.selected.forEach(v => v.selected = false);
    });

    // remove selected vertices
    this.addEventListener('remove-vertices', () => {
      this.graph.selected.forEach(v => this.graph.removeVertex(v));
    });

    // remove selected edges
    this.addEventListener('remove-edge', () => {
      this.graph.edges.forEach(e => {
        const source: VertexElement = this.qs(e.getAttribute('source'));
        const target: VertexElement = this.qs(e.getAttribute('target'));

        const selected: Set<VertexElement> = new Set(this.graph.selected);
        if(selected.has(source) || selected.has(target)){
          this.graph.removeEdge(e);
        }
      })
    });
  }

  wireNotebook(){
    const button = this.qs('#notebook-button') as HTMLButtonElement;
    const trigger = this.qs('#notebook-checkbox')! as HTMLInputElement;
    const notebook = this.qs('#notebook')! as NotebookElement;

    trigger.onchange = (e) => {
      e.stopPropagation();
      notebook.togglePopover(trigger.checked);
    }

    button.onclick = (e) => {
      e.stopPropagation();
      trigger.toggleAttribute('checked');
    }

    trigger.onchange(new Event('change'));

    notebook.context = {
      graph: this.graph
    }
  }

  async fetchStyle(): Promise<void> {
    const sheet = new CSSStyleSheet();
    const file = await fetch(new URL('./graph-app.css', import.meta.url));
    const css = await file.text();
    sheet.replaceSync(css);
    this.shadowRoot!.adoptedStyleSheets = [sheet];
  }

  async fetchTemplate(): Promise<void> {
    const file = await fetch(new URL('./graph-app.html', import.meta.url));
    const html = await file.text();
    this.shadowRoot!.innerHTML = html;
  }
}