import "./graph-element/dist/main"
import { Graph, Vertex, Edge } from "./graph-element/src/layout/dynamic-matching";
import { GraphElement, VertexElement } from "./graph-element/dist/main";


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
    .then(() => this.wireEvents());

    /*.then(() => this.setupGraphMenuHandlers())
    .then(() => this.setupNotebookMenuHandlers())
    .then(() => this.setupVertexMenuHandlers())
    .then(() => this.setupEdgeMenuHandlers())
    */
  }

  async wireEvents(){
    // Options
    
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