import { Vertex, VertexId, VertexOptions } from '../layout/scene-vertex';
import { GraphElement } from './graph-element';

function propName(attrStr: string){
  return attrStr.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

export class VertexElement extends HTMLElement {
  static observedAttributes = ['color', 'texture', 'selection-color', 'size', 'label', 'visible', 'selected', 'spline'];
  vertex!: Vertex;

  constructor(){
    super();

    // for(let attr of VertexElement.observedAttributes){
    //   const prop = propName(attr);
    //   Object.defineProperty(this, prop, {
    //     get: () => this.vertex[prop],
    //     set: (value: any) => this.vertex[prop] = value
    //   });
    // }
  }

  get color(){ return this.vertex.color; }
  set color(v){ this.vertex.color = v; }
  
  get texture(){ return this.vertex.texture; }
  set texture(v){ this.vertex.texture = v; }

  get selectionColor(){ return this.vertex.selectionColor }
  set selectionColor(v){ this.vertex.selectionColor = v; }

  get size(){ return this.vertex.size; }
  set size(v){ this.vertex.size = v; }

  get label(){ return this.vertex.label; }
  set label(v){ this.vertex.label = v; }

  get visible(){ return this.vertex.visible; }
  set visible(v){ this.vertex.visible = v; }

  get selected(){ return this.vertex.selected; }
  set selected(v){ 
    this.toggleAttribute('selected', v);
    this.vertex.selected = v; 
  }

  get spline(){ return this.vertex.spline; }
  set spline(v){ this.vertex.spline = v; }

  connectedCallback(){
    const parent = this.parentElement as GraphElement;

    if(parent && parent.graph){
      const options = this.readAttributes();
      this.vertex = parent.graph.addVertex(options);
      this.setAttribute('id', this.vertex.id);
    }else{
      setTimeout(() => {
        if(parent?.graph){
          const options = this.readAttributes();
          this.vertex = parent.graph.addVertex(options);
          this.setAttribute('id', this.vertex.id);
        }
      }, 0);
    }
  }

  disconnectedCallback(){
    this.vertex.remove();
  }

  attributeChangedCallback(attr: string, old: string, value: string){
    if(!this.isConnected || !this.vertex) return;

    const prop = propName(attr);
    this.vertex[prop] = value;
  }

  readAttributes(): VertexOptions {
    const parent = this.parentElement as GraphElement;
    
    const vo: VertexOptions = {
      id: this.getAttribute('id') ?? Vertex.id(),
      color: this.getAttribute('color') ?? parent.graph.defaults.vertex.color,
      texture: this.getAttribute('texture') ?? parent.graph.defaults.vertex.texture,
      selectionColor: this.getAttribute('selection-color') ?? parent.graph.defaults.vertex.selectionColor,
      size: this.hasAttribute('size') ? parseFloat(this.getAttribute('size')!) : parent.graph.defaults.vertex.size,
      label: this.getAttribute('label') ?? parent.graph.defaults.vertex.label,
      visible: this.hasAttribute('visible') ? this.getAttribute('visible') == 'true' : parent.graph.defaults.vertex.visible,
      selected: this.hasAttribute('selected') ? this.getAttribute('selected') == 'true' : parent.graph.defaults.vertex.selected,
      spline: this.hasAttribute('spline') ? this.getAttribute('spline') == 'true' : parent.graph.defaults.vertex.spline
    };

    return vo;
  }
}

customElements.define('vertex-el', VertexElement);