import "./graph-element/src/web-component/graph-element.ts";
import type { GraphElement, VertexElement, EdgeElement } from "./graph-element/src/index.ts"; 
import "./notebook/src/notebook/notebook/notebook.ts";
import type { NotebookElement } from "./notebook/src/notebook/notebook/notebook.ts";  
import "./drill-down/src/drill-down.ts";
import { openDB } from "idb";

const capFirst = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);

export class GraphAppElement extends HTMLElement {
  static template: string = ``;

  qs: (query: string) => HTMLElement | null;
  qsa: (query: string) => NodeList;
  graph!: GraphElement;
  notebook!: NotebookElement;

  #clipboard = {
    V: new Map(),
    E: new Map(),
    clear: function(){
      this.V.clear();
      this.E.clear();
    }
  }

  constructor(){
    super();
    this.attachShadow({mode: 'open'});
    this.qs = (query: string) => this.shadowRoot!.querySelector(query);
    this.qsa = (query: string) => this.shadowRoot!.querySelectorAll(query);

    this.fetchStyle()
    .then(() => this.fetchTemplate())
    .then(() => {
      const graphEl = this.qs('graph-el') as any;
      // if(!graphEl || typeof graphEl.addVertex !== 'function' || typeof graphEl.addEdge !== 'function'){
      //   throw new Error("Graph element not found or does not have addVertex/addEdge methods");
      // } 

      this.graph = graphEl as GraphElement;
    })
    .then(() => this.notebook = this.qs('notebook-el') as NotebookElement)
    .then(() => this.wireTopMenu())
    .then(() => this.wireToolMenu())
    .then(() => this.wireNotebook());
  }

  wireTopMenu(){
    // file
    // graph
    this.qs('#new-graph')?.addEventListener('click', () => this.graph.clear())
    this.qs('#file-graph-open-file')?.addEventListener('click',         () => this.open());
    this.qs('#file-graph-open-url')?.addEventListener('click',          () => this.open());
    this.qs('#file-graph-open-indexeddb')?.addEventListener('click',    () => this.open());
    this.qs('#file-graph-save-file')?.addEventListener('click',         () => this.save());
    this.qs('#file-graph-save-url')?.addEventListener('click',          () => this.save());
    this.qs('#file-graph-save-indexedDB')?.addEventListener('click',    () => this.save());

    // notebook
    this.qs('#new-notebook')?.addEventListener('click',                 () => this.notebook.clear());
    this.qs('#run-notebook')?.addEventListener('click',                 () => this.notebook.runAll());
    this.qs('#file-notebook-open-file')?.addEventListener('click',      () => this.open());
    this.qs('#file-notebook-open-url')?.addEventListener('click',       () => this.open());
    this.qs('#file-notebook-open-indexeddb')?.addEventListener('click', () => this.open());
    this.qs('#file-notebook-save-file')?.addEventListener('click',      () => this.save());
    this.qs('#file-notebook-save-url')?.addEventListener('click',       () => this.save());
    this.qs('#file-notebook-save-indexeddb')?.addEventListener('click', () => this.save());

    // recent
    this.buildRecentMenu();

    // edit
    this.qs('#edit-cut')?.addEventListener('click', () => this.cut());
    this.qs('#edit-copy')?.addEventListener('click', () => this.copy());
    this.qs('#edit-paste')?.addEventListener('click', () => this.paste());

    // selection
    this.qs('#selection-select-all')?.addEventListener('click', () => this.graph.vertices.forEach(v => (v as VertexElement).selected = true));
    this.qs('#selection-select-none')?.addEventListener('click', () => this.graph.selected.forEach(v => (v as VertexElement).selected = false));
  }

  cut(){
    this.#clipboard.clear();

    const selected = [...this.graph.vertices].filter((v: any) => (v as VertexElement).selected) as VertexElement[];


    selected.forEach((v: VertexElement) => {
      this.#clipboard.V.set(v.id, v.toJSON());
      
      [...v.edges]
      .filter((e: EdgeElement) => selected.includes(e.source) && selected.includes(e.target))
      .forEach((e: EdgeElement) => this.#clipboard.E.set(e.id, {
        ...e.toJSON(),
        sourceId: e.source.id,
        targetId: e.target.id
      }));
      
      this.graph.removeVertex(v.id);
    });
  }

  copy(){
    this.#clipboard.clear();

    const selected = [...this.graph.vertices]
    .filter((v: any) => (v as VertexElement).selected) as VertexElement[];

    selected.forEach((v: VertexElement) => {
      this.#clipboard.V.set(v.id, v.toJSON());

      [...v.edges]
      .filter((e: EdgeElement) => selected.includes(e.source) && selected.includes(e.target))
      .forEach((e: EdgeElement) => this.#clipboard.E.set(e.id, {
        ...e.toJSON(),
        sourceId: e.source.id,
        targetId: e.target.id
      }));
    });
  }

  async paste(){
    const pastedV = new Map<string, string>();

    this.#clipboard.V.forEach((old: any, oldId: string) => {
      const fresh = this.graph.addVertex({...old, id: null, selected: false });
      pastedV.set(oldId, fresh.id);
    });

    this.#clipboard.E.forEach((old: any) => {
      const sourceId = pastedV.get(old.sourceId);
      const targetId = pastedV.get(old.targetId);
      if(!sourceId || !targetId) return;

      const { sourceId: _s, targetId: _t, ...edgeOptions } = old;
      this.graph.addEdge(sourceId, targetId, {...edgeOptions, id: null });
    });
  }

  //#region save/open

  //#endregion save/open

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
      const selected = [...this.graph.selected] as VertexElement[];
      for(let i=0; i<selected.length; i++){
        if(i>0){
          this.graph.addEdge(selected.at(i-1)!, selected.at(i)!);
        }
      }
      if(selected.length > 2){
        this.graph.addEdge(selected.at(-1)!, selected.at(0)!);
      }
    })

    // select all 
    this.addEventListener('tool-select-all', () => {
      this.graph.vertices.forEach(v => (v as VertexElement).selected = true)
    });

    // select none 
    this.addEventListener('tool-select-none', () => {
      this.graph.selected.forEach(v => (v as VertexElement).selected = false);
    });

    // remove selected vertices
    this.addEventListener('remove-vertices', () => {
      this.graph.selected.forEach(v => this.graph.removeVertex(v as VertexElement));
    });

    // remove selected edges
    this.addEventListener('remove-edges', () => {
      const edges = Array.from(this.graph.edges) as EdgeElement[];
      for(const edge of edges){
        if(edge.source?.selected && edge.target?.selected){
          this.graph.removeEdge(edge);
        }
      }
    });

    this.addEventListener('clear-graph', () => {
      this.graph.clear();
    })
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