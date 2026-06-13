import { Edge, EdgeId, EdgeOptions } from '../layout/scene-edge';
import { VertexElement } from './vertex-element';
import { GraphElement } from './graph-element';

function propName(attrStr: string){
  return attrStr.replace(/-([a-z])/g, (match, letter) => letter.toUpperCase());
}

export class EdgeElement extends HTMLElement {
  static observedAttributes = ['arrow', 'spline', 'visible', 'color', 'width', 'label'];
  edge!: Edge;
  source!: VertexElement;
  target!: VertexElement;

  constructor(){
    super();

    // for(let attr of EdgeElement.observedAttributes){
    //   const prop = propName(attr);
    //   Object.defineProperty(this, prop, {
    //     get: () => this.edge[prop],
    //     set: (value: any) => this.edge[prop] = value
    //   });
    // }
  }

  get arrow(){ return this.edge.arrow; }
  set arrow(v){ this.edge.arrow = v; }

  get spline(){ return this.edge.spline; }
  set spline(v){ this.edge.spline = v; }

  get visible(){ return this.edge.visible; }
  set visible(v){ this.edge.visible = v; }

  get color(){ return this.edge.color; }
  set color(v){ this.edge.color = v; }

  get width(){ return this.edge.width; }
  set width(v){ this.edge.width = v; }

  get label(){ return this.edge.label; }
  set label(v){ this.edge.label = v; }

  connectedCallback(){
    const parent = this.parentElement as GraphElement;

    if(parent && parent.graph){
      const [sourceId, targetId]= this.readPoints();
      const options = this.readAttributes();
      this.edge = parent.graph.addEdge(sourceId, targetId, options);

      this.source = parent.qs(sourceId) as VertexElement;
      this.target = parent.qs(targetId) as VertexElement;
    }else{
      setTimeout(() => {
        if(parent?.graph){
          const [sourceId, targetId]= this.readPoints();
          const options = this.readAttributes()
          this.edge = parent.graph.addEdge(sourceId, targetId, options);

          this.source.edges.add(this);
          this.target.edges.add(this);
        }
      }, 0);
    }
  }

  disconnectedCallback(){
    const parent = this.parentElement;
    (parent as GraphElement)?.removeEdge(this);
  }

  readPoints(): string[] {
    const sourceSel = this.getAttribute('source')!;
    const targetSel = this.getAttribute('target')!;

    const sourceEl = this.parentElement?.querySelector(sourceSel)!;
    const targetEl = this.parentElement?.querySelector(targetSel)!;

    const sourceId = sourceEl.getAttribute('id');
    const targetId = targetEl.getAttribute('id');

    // const sourceEl = this.parentElement?.querySelector<VertexElement>(sourceSel);
    // const targetEl = this.parentElement?.querySelector<VertexElement>(targetSel);
    // const sourceId: string = sourceEl!.vertex.id;
    // const targetId: string = targetEl!.vertex.id;

    return [sourceId, targetId];
  }

  readAttributes(){
    const parent = this.parentElement as GraphElement;

    const options: EdgeOptions = {
      id: this.getAttribute('id') ?? Edge.id(),
      arrow: this.hasAttribute('arrow') ? parent.getAttribute('arrow') == 'true' : parent.graph.defaults.edge.arrow,
      spline: this.hasAttribute('spline') ? this.getAttribute('spline') == 'true' : parent.graph.defaults.edge.spline,
      visible: this.hasAttribute('visible') ? this.getAttribute('visible') == 'true' : parent.graph.defaults.edge.visible,
      color: this.getAttribute('color') ?? parent.graph.defaults.edge.color,
      width: this.hasAttribute('width') ? parseFloat(this.getAttribute('width')!) : parent.graph.defaults.edge.width,
      label: this.getAttribute('label') ?? parent.graph.defaults.edge.label,
      strength: this.hasAttribute('strength') ? parseFloat(this.getAttribute('strength')!) : parent.graph.defaults.edge.strength
    }

    return options;
  }
}

customElements.define('edge-el', EdgeElement);