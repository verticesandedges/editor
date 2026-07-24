import "./graph-element/src/web-component/graph-element.ts";
import type { GraphElement, VertexElement, EdgeElement } from "./graph-element/src/index.ts"; 
import "./notebook/src/notebook/notebook/notebook.ts";
import type { NotebookElement } from "./notebook/src/notebook/notebook/notebook.ts";  
import "./drill-down/src/drill-down.ts";
import { openDB } from "idb";

type ItemType = 'graph' | 'notebook';
type Method = 'file' | 'url' | 'indexeddb';
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
    .then(() => this.graph = this.qs('graph-el') as GraphElement)
    .then(() => this.notebook = this.qs('notebook-el') as NotebookElement)
    .then(() => this.wireTopMenu())
    .then(() => this.wireToolMenu())
    .then(() => this.wireNotebook());
  }

  async wireTopMenu(){
    // file
    // graph
    this.qs('#new-graph')?.addEventListener('click', () => this.graph.clear())
    this.qs('#file-graph-open-file')?.addEventListener('click',         () => this.open('graph', 'file'));
    this.qs('#file-graph-open-url')?.addEventListener('click',          () => this.open('graph', 'url'));
    this.qs('#file-graph-open-indexeddb')?.addEventListener('click',    () => this.open('graph', 'indexeddb'));
    this.qs('#file-graph-save-file')?.addEventListener('click',         () => this.save('graph', 'file'));
    this.qs('#file-graph-save-url')?.addEventListener('click',          () => this.save('graph', 'url'));
    this.qs('#file-graph-save-indexeddb')?.addEventListener('click',    () => this.save('graph', 'indexeddb'));

    // notebook
    this.qs('#new-notebook')?.addEventListener('click',                 () => this.notebook.clear());
    this.qs('#run-notebook')?.addEventListener('click',                 () => this.notebook.runAll());
    this.qs('#file-notebook-open-file')?.addEventListener('click',      () => this.open('notebook', 'file'));
    this.qs('#file-notebook-open-url')?.addEventListener('click',       () => this.open('notebook', 'url'));
    this.qs('#file-notebook-open-indexeddb')?.addEventListener('click', () => this.open('notebook', 'indexeddb'));
    this.qs('#file-notebook-save-file')?.addEventListener('click',      () => this.save('notebook', 'file'));
    this.qs('#file-notebook-save-url')?.addEventListener('click',       () => this.save('notebook', 'url'));
    this.qs('#file-notebook-save-indexeddb')?.addEventListener('click', () => this.save('notebook', 'indexeddb'));

    // build recently opened menu
    await this.buildRecentlyOpenedMenu();

    // edit
    this.qs('#edit-cut')?.addEventListener('click', () => this.cut());
    this.qs('#edit-copy')?.addEventListener('click', () => this.copy());
    this.qs('#edit-paste')?.addEventListener('click', () => this.paste());

    // selection
    this.qs('#selection-select-all')?.addEventListener('click', () => this.graph.vertices.forEach(v => (v as VertexElement).selected = true));
    this.qs('#selection-select-none')?.addEventListener('click', () => this.graph.selected.forEach(v => (v as VertexElement).selected = false));
  }

  async openDB(){
    return await openDB('graph-app', 1, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('opened')) {
          db.createObjectStore('opened', { keyPath: 'id', autoIncrement: true });
        }
        if(!db.objectStoreNames.contains('saved')){
          db.createObjectStore('saved', { keyPath: 'title' });
        }
      }
    });
  }

  private async buildRecentlyOpenedMenu() {
    const hasFileSystemAccess = ("showOpenFilePicker" in window);

    const menu = this.qs('#file-recent') as HTMLUListElement;
    menu.innerHTML = '';

    const db = await this.openDB();
    const tx = db.transaction('opened', 'readonly');
    const store = tx.objectStore('opened');
    const entries = await store.getAll();
    entries.sort((a, b) => b.timestamp - a.timestamp);

    for (const entry of entries) {
      const isFileHandleEntry = entry.method === 'file' && typeof entry.identifier !== 'string';
      if(isFileHandleEntry && !hasFileSystemAccess) continue;

      const li = document.createElement('li');
      const button = document.createElement('button');
      button.textContent = `${capFirst(entry.type)} (${entry.method}): ${typeof entry.identifier === 'string' ? entry.identifier : entry.identifier.name}`;
      button.addEventListener('click', () => this.open(entry.type, entry.method, entry.identifier));
      li.appendChild(button);
      menu.appendChild(li);
    }
    await db.close();
  }

  async registerOpened(type: ItemType, method: Method, identifier: any){
    if(!identifier) return;

    const db = await this.openDB();
    const store = db.transaction('opened', 'readwrite').objectStore('opened');

    await store.add({
      type,
      method,
      identifier,
      timestamp: Date.now()
    });

    db.close();

    this.buildRecentlyOpenedMenu();
  }

  async openRecent(id: number){
    const db = await this.openDB();
    const store = db.transaction('opened', 'readonly').objectStore('opened');
    const entry = await store.get(id);
    if(!entry) return;

    await this.open(entry.type, entry.method, entry.identifier);
  }

  //#region save/open

  async save(type: ItemType, method: Method, content?: any){
    const fileApiWindow = window as typeof window & {
      showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>;
      showSaveFilePicker?: (options?: any) => Promise<FileSystemFileHandle>;
    };

    // after this, content is a string from graph.toJSON() or notebook.toJSON()
    content ??= JSON.stringify((this as any)[type].toJSON());
    const previous = localStorage.getItem(`graph-app.previous-${type}-${method}`);
    const extension = type === 'graph' ? '.json' : '.ipynb';
          
    
    if(method === 'file'){

      try{
        if(fileApiWindow.showSaveFilePicker){
          const filename = previous?.endsWith(extension) ? previous : `${previous}${extension}`;
          const handle = await fileApiWindow.showSaveFilePicker({ suggestedName: filename });
          const writable = await handle.createWritable();
          await writable.write(content); // a string
          await writable.close();
          localStorage.setItem(`graph-app.previous-${type}-file`, handle.name);
          await this.registerOpened(type, method, handle);
          return;
        }else{
          let filename = prompt(`Enter the filename to save the ${type} as: `, previous || `${capFirst(type)}${extension}`);
          if(!filename) return;
          if(!filename.endsWith(extension)) filename += extension;
          const blob = new Blob([content], { type: 'application/json' }); // a blob from a string
          const url = URL.createObjectURL(blob);
          const anchor = document.createElement('a');
          anchor.href = url;
          anchor.download = filename;
          document.body.appendChild(anchor);
          anchor.click();
          anchor.remove();
          URL.revokeObjectURL(url);
          localStorage.setItem(`graph-app.previous-${type}-file`, filename);
        }
      }catch(e: any){
        if(e?.name === 'AbortError') return;
        console.error(`Failed to save ${type} to file`, e);
      }

      return;
    }

    if(method === 'url'){
      const url = prompt(`Enter the URL to save the ${type} to: `, previous || '');
      if(!url) return;
      
      const success = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: content // a string, already stringified above, no further stringification needed
      }).then(r => r.ok).catch(e => {
        console.error(`Failed to save ${type} to URL: ${url}`, e);
        return false;
      });

      if(success) localStorage.setItem(`graph-app.previous-${type}-url`, url);
    }

    if(method === 'indexeddb'){
      const title = prompt(`Enter the title to save the ${type} as: `, previous || (type === 'notebook' ? this.notebook.title : ''));
      if(!title) return;

      const db = await this.openDB();
      const tx = db.transaction('saved', 'readwrite');
      const store = tx.objectStore('saved');
      await store.put({ title, content }); // content is a string, already stringified above, no further stringification needed
      await tx.done;
      
      localStorage.setItem(`graph-app.previous-${type}-indexeddb`, title);
    }
  }

  async open(type: ItemType, method: Method, openThis?: any){
    let identifier, content;
    const fileApiWindow = window as typeof window & {
      showOpenFilePicker?: (options?: any) => Promise<FileSystemFileHandle[]>;
      showSaveFilePicker?: (options?: any) => Promise<FileSystemFileHandle>;
    };

    const previous = localStorage.getItem(`graph-app.previous-${type}-${method}`);

    // fetch graph/notebook content from either file, url, or indexeddb
    if(method === 'file' && (fileApiWindow.showOpenFilePicker || openThis)){
      let fileHandle: FileSystemFileHandle | undefined;
      try {
        if(openThis && typeof openThis.getFile === 'function'){
          fileHandle = openThis as FileSystemFileHandle;
        }else if(fileApiWindow.showOpenFilePicker){
          const [handle] = await fileApiWindow.showOpenFilePicker({ multiple: false });
          fileHandle = handle;
        }

        if(!fileHandle) return;

        // looks complicated, checks if permission for filehandle, 
        // if not, asks for permission for filehandle, 
        // returns file or null
        let file = await (async (handle: FileSystemFileHandle) => {
          if((await handle.queryPermission({ mode: 'read' }) === 'granted')
          || (await handle.requestPermission({ mode: 'read' }) === 'granted')){
            return await handle.getFile();
          }
          return null;
        })(fileHandle);
        if(!file) return;

        // const file = await fileHandle.getFile();
        const text = await file.text();
        content = JSON.parse(text); // content is a json object, either notebook or graph
        identifier = fileHandle;
      } catch(e: any) {
        if(e?.name === 'AbortError') return;
        console.error(`Failed to open ${type} from file`, e);
        return false;
      }
    }else if(method === 'file'){
      const fileInput = document.createElement('input');
      content = await new Promise<any | null>((resolve) => {
        fileInput.type = 'file';
        fileInput.accept = type === 'graph' ? '.json' : '.ipynb';

        fileInput.onchange = async (e) => {
          const target = e.target as HTMLInputElement;
          if(!target.files || target.files.length === 0) return resolve(null);
          const file = target.files[0];
          const text = await file.text();
          try{
            const parsed = JSON.parse(text);
            identifier = file.name;
            resolve(parsed);
          }catch(e){
            resolve(null);
          }
        };
        fileInput.click();
      });
      fileInput.remove();
      if(!content) return;

      // if we made it here, content is a json object, either a notebook or a graph
    }

    if(method === 'url'){
      const url = openThis || prompt(`Enter the URL of the ${type} to open`, previous || '');
      if(!url) return;
      identifier = url;
      
      content = await fetch(url).then(r => r.json()).catch(e => {
        console.error(`Failed to fetch ${type} from URL: ${url}`, e);
        return false;
      });
      // content should be a string
    }

    if(method === 'indexeddb'){
      const title = openThis || prompt(`Enter the title of the ${type} to open`, previous || '');
      if(!title) return;
      identifier = title;

      let db;
      try{
        db = await this.openDB();
        const store = db.transaction('saved', 'readonly').objectStore('saved');
        const item = await store.get(title);
        // item content should be a string
        content = JSON.parse(item.content);
        // but content should be a json object, either a notebook or a graph
      }catch(e){
        console.error(`Failed to read ${type} from indexedDB: ${title}`, e);
        return false;
      }finally{
        await db?.close();
      }
    }

    // open content in either graph or notebook
    // content should be json
    if(content){
      // open content (Which is a json notebook or graph)
      (this as any)[type].fromJSON(content, true);

      // register recently opened file (in indexedDB)
      if(!openThis && identifier) await this.registerOpened(type, method, identifier);

      // remember file identifer as last opened title/url/filename in localStorage
      localStorage.setItem(`graph-app.previous-${type}-${method}`, typeof identifier === 'string' ? identifier : identifier.name);
    }else{
      console.error(`Failed to open ${type} using method ${method}`);
    }
  }

  //#endregion

  //#region cut/copy/save

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

  //#endregion

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