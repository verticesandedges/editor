import { Graph } from './scene-graph';
import * as three from 'three';

declare class Vertex {
  static nextId: number;
  static id(): string;
  constructor( graph: Graph, options: any);
  get spline(): boolean;
  set spline(val: boolean);
  get edges(): any; // !
  get graph(): Graph;
  get group(): three.Group;
  get color(): three.Color;
  set color(color: string | any);
  resetColor(color: string | any): void;
  get texture(): string;
  set texture(src: string);
  get selectionColor(): number;
  set selectionColor(color: string | number | any);
  get size(): number;
  set size(value: number);
  get selected(): boolean;
  set selected(value: boolean);
  get visible(): boolean;
  set visible(value: boolean);
  toJSON(): object;
  get pos(): three.Vector3;
  set pos(p: {x: number, y: number, z: number});
  get label(): string | null;
  get labelEl(): HTMLLabelElement | null;
  set label(text: string | null);
  update(): void;
  remove(): void;
  get position(): three.Vector3;
  set position(p: {x: number, y: number, z: number});
}