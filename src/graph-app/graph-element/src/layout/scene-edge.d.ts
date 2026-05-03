import { Graph } from './scene-graph';
import { Vertex } from './scene-vertex';
import * as three from 'three';

declare class Edge {
  static newId: number;
  static id(): string;
  constructor(graph: Graph, source: Vertex, target: Vertex, options: object);
  get label(): string | null;
  get labelEl(): HTMLLabelElement | null;
  set label(text: string | null);
  get source(): Vertex;
  get target(): Vertex;
  get options(): object;
  get id(): string;
  set id(val: string);
  get group(): three.Group;
  get color(): three.Color;
  set color(color: any);
  get width(): number;
  set width(value: number);
  get strength(): number;
  set strength(val: number);
  get visible(): boolean;
  set visible(val: boolean);
  get arrow(): boolean;
  set arrow(val: boolean);
  get spline(): boolean;
  set spline(val: boolean);
  toJSON(): object;
  update(): void;
  remove(): void;
}