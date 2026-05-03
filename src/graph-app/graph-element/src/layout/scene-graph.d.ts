// import { DynamicMatching } from './dynamic-matching'
import { Vertex } from './scene-vertex';
import { Edge } from './scene-edge';

declare class Graph {
  // dynamicMatching: DynamicMatching;
  selected: boolean | null;

  constructor(elem: HTMLElement);

  clear(): void;
  remove(): void;
  defaults: {
    string: {
      string: any
    }
  };
  
  onPointerDown(e: PointerEvent): void;
  onPointerMove(e: PointerEvent): void;
  onPointerUp(e: PointerEvent): void;
  set constants(obj: {string: any});
  get constants(): {string: any};
  fromJSON(json: {string: any}): void;
  toJSON(): {string: any};
  get vertices(): any; // !
  get edges(): any; // !
  get canvas(): HTMLCanvasElement;
  set backgroundColor(color: any); // !
  createLabel(text: string): HTMLElement;
  addVertex(options: any): Vertex;
  getVertex(id: string): Vertex | undefined;
  removeVertex(id: string): boolean;
  addEdge(sourceId: string | Vertex, targetId: string | Vertex, options: any): Edge;
  getEdge(id: string): Edge | undefined;
  removeEdge(id: string): boolean;
}