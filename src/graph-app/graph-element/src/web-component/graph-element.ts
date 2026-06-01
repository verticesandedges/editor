import { Graph } from '../layout/scene-graph';
import { VertexOptions } from '../layout/scene-vertex';
import { EdgeOptions } from '../layout/scene-edge';
import { VertexElement } from './vertex-element';
import { EdgeElement } from './edge-element';

function propName(attrStr: string){
  return attrStr.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

export class GraphElement extends HTMLElement {
  static observedAttributes = ['background-color'];
  graph: Graph;

  qs: (query: string) => HTMLElement;
  qsa: (query: string) => NodeList;

  constructor(){
    super();
    this.attachShadow({mode: "open"});

    this.shadowRoot!.innerHTML = `
    <style>
      :host {
        display: flex;
        flex-grow: 1;
      }

      div { 
        width: 100%; 
        height: 100%; 
      } 
    </style>  
    
    <div>
    </div>
    `
    const div = this.shadowRoot!.querySelector('div')!;
    this.graph = new Graph( div );

    this.qs = this.shadowRoot?.querySelector.bind(this.shadowRoot);
    this.qsa = this.shadowRoot?.querySelectorAll.bind(this.shadowRoot);
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

  addVertex(options: VertexOptions = {}){
    const vertexEl = document.createElement('vertex-el') as VertexElement;
    for(let prop of Object.keys(options)){
      vertexEl[prop] = options[prop];
    }
    
    this.appendChild(vertexEl);
    return vertexEl;
  }

  addEdge(sourceSel: string | VertexElement, targetSel: string | VertexElement, options: EdgeOptions = {}){
    sourceSel = sourceSel instanceof VertexElement ? `#${sourceSel.getAttribute('id')}` : sourceSel;
    targetSel = targetSel instanceof VertexElement ? `#${targetSel.getAttribute('id')}` : targetSel;

    const edgeEl = document.createElement('edge-el') as EdgeElement;

    edgeEl.setAttribute('source', sourceSel)
    edgeEl.setAttribute('target', targetSel);

    for(let prop of Object.keys(options)){
      edgeEl[prop] = options[prop];
    }

    this.appendChild(edgeEl);
    return edgeEl;
  }

  removeVertex(sel: string): void {
    const vertex = this.shadowRoot!.querySelector(sel);
    vertex?.remove();
  }

  removeEdge(sel: string): void {
    const edge = this.shadowRoot!.querySelector(sel);
    edge?.remove();
  }

  get backgroundColor(): string {
    return this.getAttribute('background-color') ?? 'white';
  }

  set backgroundColor(val: string | number){
    this.setAttribute('background-color', String(val));
  }
}