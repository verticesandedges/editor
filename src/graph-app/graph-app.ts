import { GraphElement, VertexElement, EdgeElement } from "./graph-element/src/index.ts";

import { NotebookElement } from "./notebook/src/notebook/notebook/notebook.ts";
import { CellTypeSelector } from "./notebook/src/notebook/cell-type-selector/cell-type-selector";
import { MarkdownCellElement } from "./notebook/src/notebook/markdown-cell/markdown-cell";
import { CellActionsElement } from "./notebook/src/notebook/cell-actions/cell-actions";
import { JavascriptCellElement } from "./notebook/src/notebook/javascript-cell/javascript-cell";
import { TypescriptCellElement } from "./notebook/src/notebook/typescript-cell/typescript-cell";
import { NotebookActionsElement } from "./notebook/src/notebook/notebook-actions/notebook-actions";
// import { NotebookAppElement } from "./notebook/src/notebook/notebook-app/notebook-app";
import "./drill-down/src/drill-down.ts";
import { Constants } from "./graph-element/src/index.ts";

if(!customElements.get('markdown-cell')) customElements.define("markdown-cell", MarkdownCellElement);
if(!customElements.get('notebook-el')) customElements.define("notebook-el", NotebookElement);
if(!customElements.get('cell-type')) customElements.define("cell-type", CellTypeSelector);
if(!customElements.get('cell-actions')) customElements.define("cell-actions", CellActionsElement);
if(!customElements.get('javascript-cell')) customElements.define("javascript-cell", JavascriptCellElement);
if(!customElements.get('typescript-cell')) customElements.define('typescript-cell', TypescriptCellElement);
if(!customElements.get('notebook-actions')) customElements.define('notebook-actions', NotebookActionsElement);
// if(!customElements.get('notebook-app')) customElements.define('notebook-app', NotebookAppElement);

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
    .then(() => this.graph = this.qs('graph-el') as GraphElement)
    .then(() => this.notebook = this.qs('notebook-el') as NotebookElement)
    .then(() => this.wireTopMenu())
    .then(() => this.wireToolMenu())
    .then(() => this.wireNotebook());

    /*.then(() => this.setupGraphMenuHandlers())
    .then(() => this.setupNotebookMenuHandlers())
    .then(() => this.setupVertexMenuHandlers())
    .then(() => this.setupEdgeMenuHandlers())
    */
  }

  wireTopMenu(){
    // file menu
    // graph
    this.qs('#new-graph')?.addEventListener('click', () => this.graph.clear())
    this.qs('#file-graph-open-file')?.addEventListener('click', () => this.openGraphFile());
    this.qs('#file-graph-open-url')?.addEventListener('click', () => this.openGraphURL());
    this.qs('#file-graph-open-indexeddb')?.addEventListener('click', () => this.openGraphIndexedDB());
    this.qs('#file-graph-save-file')?.addEventListener('click', () => this.saveGraphFile());
    this.qs('#file-graph-save-url')?.addEventListener('click', () => this.saveGraphURL());
    this.qs('#file-graph-save-indexedDB')?.addEventListener('click', () => this.saveGraphIndexedDB());

    // notebook
    this.qs('#new-notebook')?.addEventListener('click', () => this.notebook.clear());
    this.qs('#run-notebook')?.addEventListener('click', () => this.notebook.runAll());
    this.qs('#file-notebook-open-file')?.addEventListener('click', () => this.openNotebookFile());
    this.qs('#file-notebook-open-url')?.addEventListener('click', () => this.openNotebookURL());
    this.qs('#file-notebook-open-indexeddb')?.addEventListener('click', () => this.openNotebookIndexedDB());
    this.qs('#file-notebook-save-file')?.addEventListener('click', () => this.saveNotebookFile());
    this.qs('#file-notebook-save-url')?.addEventListener('click', () => this.saveNotebookURL());
    this.qs('#file-notebook-save-indexeddb')?.addEventListener('click', () => this.saveNotebookIndexedDB());

    this.qs('#edit-cut')?.addEventListener('click', () => this.cut());
    this.qs('#edit-copy')?.addEventListener('click', () => this.copy());
    this.qs('#edit-paste')?.addEventListener('click', () => this.paste());

    // selection
    this.qs('#selection-select-all')?.addEventListener('click', () => this.graph.vertices.forEach(v => v.selected = true));
    this.qs('#selection-select-none')?.addEventListener('click', () => this.graph.selected.forEach(v => v.selected = false));
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

  //#region graph file functions

  async saveGraphFile(){
    const json = this.graph.toJSON();
    const contents = JSON.stringify(json);
    const previous = localStorage.getItem('lastGraphFilename') ?? '';
    
    if("showSaveFilePicker" in window){
      const fileHandle = await window.showSaveFilePicker();
      const writable = await fileHandle.createWritable({suggestedName: previous ?? "Graph.json"});
      await writable.write(contents);
      await writable.close();
    }else{
      const anchor = document.createElement('a');
      const url = URL.createObjectURL(new Blob([contents]));
      document.body.appendChild(anchor);
      anchor.href = url;

      const filename = prompt('Filename: ', previous);
      if(filename) localStorage.setItem('lastGraphFilename', filename);
      else return;
      anchor.download = filename;
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    }
  }

  async saveGraphURL(){
    let previous = localStorage.getItem('lastGraphURL') ?? '';
    const url = prompt('URL: ', previous);
    if(!url) return;
    localStorage.setItem("lastGraphURL", url);
    const graph = this.graph.toJSON();
    const res = await fetch(url, {method: "POST", body: JSON.stringify(graph)});
    if(res.ok) alert(`Graph successfully sent to ${url}`);
    else alert(`Error sending graph to ${url}: ${res.status} - ${res.statusText}`);
  }

  async saveGraphIndexedDB(){
    const open = window.indexedDB.open('graph.graphDB', 1);
    const previousTitle = localStorage.getItem('lastGraphDBTitle') ?? '';
    const title = prompt("Graph Title: ", previousTitle);
    if(title) localStorage.setItem('lastGraphDBTitle', title);
    else return;

    open.onupgradeneeded = () => {
      const db = open.result;
      const store = db.createObjectStore('graphStore', {keyPath: 'title'});
      const index = store.createIndex('graphTitleIndex', ['title']);
    }

    open.onsuccess = () => {
      const db  = event?.target.result;
      const transaction = db.transaction(['graphStore'], 'readwrite');
      const store = transaction.objectStore('graphStore');

      store.put(this.graph.toJSON());

      transaction.oncomplete = () => {
        db.close();
        alert(`Graph titled ${title} successfully written to browser's IndexedDB`);
      }
    }

    open.onerror = () => {
      alert(`Error opening DB. Graph ${title} not saved to browser's IndexedDB`);
    }
  }

  openGraphFile(){
    const input = this.qs('#graph-upload');

    input.onchange = () => {
      const file = input.files[0];
      const reader = new FileReader();
      reader.onload = () => {
        this.graph.fromJSON(reader.result)
      }
      reader.readAsText(file);
    }

    input.showPicker();
  }

  async openGraphURL(){
    const url = prompt('URL: ', localStorage.getItem('lastGraphURL'));
    if(url) localStorage.setItem('lastGraphURL', url);
    else return;

    const res = await fetch(url);
    if(!res.ok){
      alert(`There was an error fetching ${url}: ${res.status} - ${res.statusText}`);
      return;
    }

    const json = await res.json();
    this.openGraph(json);
  }

  async openGraphIndexedDB(){
    let previous = localStorage.getItem("lastGraphTitle") ?? '';
    const title = prompt('Title', previous);
    if(!title) return;
    localStorage.setItem("lastGraphTitle", title);

    const open = indexedDB.open('graph.graphDB', 1);
    open.onupgradeneedd = () => {
      alert(`No DB "graph.graphDB" present. Thus no graph of title ${title} could be found.`);
    }

    open.onsuccess = () => {
      const db = open.result;
      const transaction = db.transaction('graphStore', 'readonly');
      const store = transaction.objectStore('graphStore');
      const index = store.index("graphTitleIndex");

      const getGraph = index.get(title);

      getGraph.onsuccess = () => {
        const json = getGraph.result;
        this.openGraph(json);
      }
    }
  }

  openGraph(graph: object){
    Constants.fromJSON(graph.constants);
    Object.assign(this.defaults, graph.defaults);

    const map = new Map();

    for(let vertex of graph.V){
      const v = this.graph.addVertex(vertex);
      if(this.graph.qs(vertex.id)){
        map.set(vertex.id, v.id);
      }
    }

    for(let edge of graph.E){
      if(map.has(edge.sourceId)) edge.sourceId = map.get(edge.sourceId);
      if(map.has(edge.targetId)) edge.targetId = map.get(edge.targetId);
      this.graph.addEdge(edge.sourceId, edge.targetId, edge);
    }
  }

  //#endregion graph file functions

  //#region notebook file functions

  async openNotebookFile(){
    if("showOpenFilePicker" in window){
      const [fileHandle] = await window.showOpenFilePicker({multiple: false});
      const file: File = await fileHandle.getFile();
      const contents = await file.text();
      const json = JSON.parse(contents);
      nb.fromString(json, true);
    }else{
      const input = document.createElement('input');
      input.type = 'file';
      input.click();
      input.onchange = async () => {
        if(input.files!.length){
          const file = input.files![0];
          const contents = await file.text();
          const json = JSON.parse(contents);
          this.notebook.fromJSON(json, true);
        }
      }
    }
  }

  async openNotebookURL(){
    let previous = localStorage.getItem('lastNotebookURL') ?? '';
    const url = prompt('URL: ', previous);
    if(url) localStorage.setItem('lastNotebookURL', url)
    else return;

    try{
      const res = await fetch(url, {headers: { "Content-Type": "application/json" }})
      const json = res.json();  
      this.notebook.fromJSON(json, true);
    }catch(e){
      console.error(e);
      alert(`Error occured while opening ${url}: ${e}`)
    }
  }

  openNotebookIndexedDB(){
    const previous = localStorage.getItem('lastNotebookDBTitle') ?? '';
    const title = prompt('Title: ', previous);
    if(title) localStorage.setItem('lastNotebookDBTitle', title)
    else return;

    const open = window.indexedDB.open('notebook.notebookDB', 1);
    open.onupgradeneeded = () => {
      alert(`No DB "notebook.notebookDB" present, thus no notebook titled ${title} found.`);
    };

    open.onsuccess = () => {
      const db = open.result;
      const transaction = db.transaction('notebookStore', 'readonly');
      const store = transaction.objectStore('notebookStore');
      const index = store.index("notebookTitleIndex");

      const getNotebook = index.get([title]);

      getNotebook.onsuccess = () => this.notebook.fromJSON(getNotebook.result, true);
      getNotebook.onerror = () => alert(`Error reading ${title} from browser's indexedDB`);

      transaction.oncomplete = () => db.close();
    }
  }

  async saveNotebookFile(){
    const contents = this.notebook.toJSON();
    const title = this.notebook.title;

    if('showSaveFilePicker' in window){
      const fileHandle = await window.showSaveFilePicker({
        suggestedName: `${title}${title.includes('.ipynb') ? '' : '.ipynb'}`
      })

      const writable = await fileHandle.createWritable();
      await writable.write(contents);
      await writable.close();
    }else{
      const anchor = document.createElement('a');
      const url = URL.createObjectURL(new Blob([contents]));
      document.body.appendChild(anchor);
      anchor.href = url;
      anchor.download = `${title}${title.includes('.ipynb') ? "" : ".ipynb"}`;
      anchor.click();
      anchor.remove();
      URL.revokeObjectURL(url);
    }
  }

  async saveNotebookURL(){
    const previous = localStorage.getItem('lastNotebookURL') ?? '';
    const url = prompt("URL: ", previous);
    if(url) localStorage.setItem('lastNotebookURL', url);
    const res = await fetch(url, {method: "POST", body: this.notebook.toString()});
    if(res.ok){
      alert(`${this.notebook.title} successfully sent to ${url}`);
    }else{
      alert(`Error sending ${this.notebook.title} to ${url}: ${res.status} - ${res.statusText}`);
    }
  }

  async saveNotebookIndexedDB(){
    const open = window.indexedDB.open('notebook.notebookDB', 1);
    localStorage.setItem('lastNotebookDBTitle', this.notebook.title);

    open.onupgradeneeded = () => {
      const db = open.result;
      const store = db.createObjectStore('notebookStore', {keyPath: "metadata.title"});
      const index = store.createIndex('notebookTitleIndex', ['metadata.title']);
    };

    open.onsuccess = (event) => {
      const db = event.target.result;
      const transaction = db.transaction(['notebookStore'], 'readwrite');
      const store = transaction.objectStore('notebookStore');

      store.put(this.notebook.toJSON());

      transaction.oncomplete = () => {
        db.close();
        alert(`Notebook ${this.notebook.title} successfully written to browser's indexedDB.`);
      }
    }

    open.onerror = () => {
      alert(`Error opening DB. Notebook ${this.notebook.title} not saved to browser's indexedDB.`);
    }
  }

  //#endregion notebook file functions 


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