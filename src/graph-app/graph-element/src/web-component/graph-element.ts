import { Graph } from '../layout/scene-graph';
import { VertexOptions } from '../layout/scene-vertex';
import { EdgeOptions } from '../layout/scene-edge';
import { VertexElement } from './vertex-element';
import { EdgeElement } from './edge-element';
import { Constants } from '../layout/dynamic-matching';

function propName(attrStr: string){
  return attrStr.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

export class GraphElement extends HTMLElement {
  static observedAttributes = ['background-color'];
  graph: Graph;
  defaults = {
    vertex: {},
    edge: {}
  }

  qs: (query: string) => HTMLElement;
  qsa: (query: string) => NodeList;

  constructor(){
    super();

    this.attachShadow({mode: "open"});
    this.qs = this.shadowRoot!.querySelector.bind(this.shadowRoot);
    this.qsa = this.shadowRoot!.querySelectorAll.bind(this.shadowRoot);

    // element setup, fetchStyle (css), fetchTemplate (html)
    this.fetchStyle()
    .then(() => this.fetchTemplate())
    .then(() => {
      const div = this.shadowRoot!.querySelector('div')!;
      this.graph = new Graph( div );
    });
  }

  toJSON(){
    const vertices = [...this.qsa('vertex-el')].map(el => (el as VertexElement).toJSON());
    const edges = [...this.qsa('edge-el')].map(el => (el as EdgeElement).toJSON());
    const constants = Constants.toJSON();
    const defaults = Object.assign({}, this.defaults);

    return {
      vertices,
      edges,
      constants,
      defaults
    };
  }

  fromJSON(graph: any){
    Constants.fromJSON(graph.constants);
    Object.assign(this.defaults, graph.defaults);

    const map = new Map();

    for(let vertex of graph.V){
      const v = this.addVertex(vertex);
      if(this.qs(vertex.id)){
        map.set(vertex.id, v.id);
      }
    }

    for(let edge of graph.E){
      if(map.has(edge.sourceId)) edge.sourceId = map.get(edge.sourceId);
      if(map.has(edge.targetId)) edge.targetId = map.get(edge.targetId);
      this.addEdge(edge.sourceId, edge.targetId, edge);
    }
  }

  async fetchStyle(): Promise<void> {
    const sheet = new CSSStyleSheet();
    const file = await fetch(new URL('./graph-element.css', import.meta.url));
    const css = await file.text();
    sheet.replaceSync(css);
    this.shadowRoot!.adoptedStyleSheets = [sheet];
  }

  async fetchTemplate(): Promise<void> {
    this.shadowRoot!.innerHTML = '<div></div>';
  }

  attributeChangedCallback(attr: string, old: string, value: string){
    const prop = propName(attr);
    this.graph[prop] = value;
  }

  get vertices(): NodeList {
    return this.querySelectorAll('vertex-el');
  }

  get edges(): NodeList {
    return this.querySelectorAll('edge-el');
  }

  get selected(): NodeList {
    return this.querySelectorAll('vertex-el[selected]')
  }

  private hasChildWithId(id: string): boolean {
    return this.querySelector(`[id="${CSS.escape(id)}"]`) !== null;
  }

  private nextId(prefix: string): string {
    return `${prefix}-${Math.random().toString(36).slice(2, 10)}`;
  }

  addVertex(options: VertexOptions = {}){
    const vertexEl = document.createElement('vertex-el') as VertexElement;
    if(!options.id){
      options.id = this.nextId('vertex');
    }
    while(this.hasChildWithId(String(options.id))){
      options.id = this.nextId('vertex');
    }
    for(let prop of Object.keys(options)){
      vertexEl[prop] = options[prop];
    }
    
    this.appendChild(vertexEl);
    return vertexEl;
  }

  addEdge(sourceSel: string | VertexElement, targetSel: string | VertexElement, options: EdgeOptions = {}){
    sourceSel = sourceSel instanceof VertexElement ? `#${sourceSel.getAttribute('id')}` : sourceSel.startsWith('#') ? sourceSel : `#${sourceSel}`;
    targetSel = targetSel instanceof VertexElement ? `#${targetSel.getAttribute('id')}` : targetSel.startsWith('#') ? targetSel : `#${targetSel}`;

    const edgeEl = document.createElement('edge-el') as EdgeElement;

    edgeEl.setAttribute('source', sourceSel);
    edgeEl.setAttribute('target', targetSel);

    if(!options.id){
      options.id = this.nextId('edge');
    }
    while(this.hasChildWithId(String(options.id))){
      options.id = this.nextId('edge');
    }

    for(let prop of Object.keys(options)){
      edgeEl[prop] = options[prop];
    }

    this.appendChild(edgeEl);
    return edgeEl;
  }

  removeVertex(sel: string | VertexElement): void {
    let vertex: VertexElement;
    if(typeof sel === 'string'){
      vertex = this.shadowRoot!.querySelector(sel);
    }else if(sel instanceof VertexElement){
      vertex = sel;
    }

    vertex.edges.forEach(e => {
      e.remove();
    })
    
    vertex?.remove();
  }

  removeEdge(sel: string | EdgeElement): void {
    let edge!: EdgeElement;
    if(typeof sel === 'string'){
      edge = this.shadowRoot!.querySelector(sel);
    }else if(sel instanceof EdgeElement){
      edge = sel;
    }

    (edge as EdgeElement)?.source?.edges.delete(edge);
    (edge as EdgeElement)?.target?.edges.delete(edge);

    edge?.remove();
  }

  clear(): void {
    for(let edge of this.graph.edges){
      edge.remove();
    }

    for(let vertex of this.graph.vertices){
      vertex.remove();
    }
  }

  get backgroundColor(): string {
    return this.getAttribute('background-color') ?? 'white';
  }

  set backgroundColor(val: string | number){
    this.setAttribute('background-color', String(val));
  }
}

if(!customElements.get('graph-el')){
  customElements.define('graph-el', GraphElement);
}