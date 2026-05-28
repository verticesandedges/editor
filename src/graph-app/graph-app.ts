import "./graph-element/dist/main"
import { GraphElement, VertexElement } from "./graph-element/dist/main";


export class GraphAppElement extends HTMLElement {
  static template: string = ``;

  qs: (query: string) => HTMLElement;
  qsa: (query: string) => NodeList;
  graph!: GraphElement;

  constructor(){
    super();
    this.attachShadow({mode: 'open'});
    this.qs = this.shadowRoot!.querySelector.bind(this.shadowRoot);
    this.qsa = this.shadowRoot!.querySelectorAll.bind(this.shadowRoot);

    this.fetchStyle()
    .then(() => this.fetchTemplate())
    .then(() => this.graph = this.qs('graph-el') as GraphElement)
    .then(() => this.setupGraphMenuHandlers())
    .then(() => this.setupNotebookMenuHandlers())
    .then(() => this.setupVertexMenuHandlers())
    .then(() => this.setupEdgeMenuHandlers())
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

  setupGraphMenuHandlers(): void {
  }

  setupNotebookMenuHandlers(): void {

  }

  setupVertexMenuHandlers(): void {
    // add click handler
    const ach = (query:string, handler: () => void): void => {
      this.qs(query ).addEventListener('click', handler.bind(this))
    };

    ach('.add.vertex', this.onAddVertexClick);
    ach('.remove.vertex', this.onRemoveVertexClick);
    ach('.select.all', this.onSelectAllClick);
    ach('.cut.vertex', this.onCutVertexClick);
    ach('.add.neighbor', this.onAddNeighborClick)

    // this.qs('.add.vertex').addEventListener('click', this.onAddVertexClick.bind(this));
    // this.qs('.remove.vertex').addEventListener('click', this.onRemoveVertexClick.bind(this));
    // this.qs('.select.all').addEventListener('click', this.onSelectAllClick.bind(this));
    // this.qs('.cut.vertex').addEventLister
  }

  setupEdgeMenuHandlers(): void {
    this.qs('.add.edges').addEventListener('click', this.onAddEdgesClick);
    this.qs('.remove.edges').addEventListener('click', this.onRemoveEdgesClick);
  }

  onAddEdgesClick(e: PointerEvent): void {
    let prev: VertexElement | null = null;
    this.graph.selected.forEach(v => {
      if(prev !== null){
        const prevSel = `#${prev.getAttribute('id')}`;
        const curSel = `#${v.getAttribute('id')};`
        this.graph.addEventListener(prevSel, curSel, {})
      }

      prev = v;
    })
  }

  onRemoveEdgesClick(e: PointerEvent): void {

  }

  onSelectAllEdgesClick(): void {

  }

  //#region graph
  onOpenGraphClick(): void {
    
  }
  //#endregion

  //#region vertex
  onAddVertexClick(): void {
    this.graph.addVertex({});
  }

  onRemoveVertexClick(): void {
    this.qsa('vertex-el').forEach((v: VertexElement): void => {
      if(v.selected){
        v.remove();
      }
    });
  }

  onSelectAllClick(): void {
    this.qsa('vertex-el').forEach((v: VertexElement): void => {
      v.selected = true;
    })
  }

  onCutVertexClick(): void {
    console.error("Not implemented, yet");
  }

  onCopyClick(): void {
    console.error('Not implemented, yet');
  }

  onPasteClick(): void {
    console.error('Not implemented, yet');
  }

  onAddNeighborClick(): void {
    this.qsa('vertex-el').forEach((v: VertexElement): void => {
      if(v.selected){
        const u = this.graph.addVertex({});
        const e = this.graph.addEdge(`#${v.id}`, `#${u.id}`, {});
      }
    })
  }
  //#endregion
}