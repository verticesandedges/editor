import * as three from 'three';
import { Vertex } from './scene-vertex';
import { EdgeOptions } from './scene-edge';
import { Graph } from './scene-graph';

declare class LineHelper {
  static generateLine( from: Vertex, to: Vertex, options: EdgeOptions ): three.Group;
  static generateSpline( from: Vertex, to: Vertex, options: EdgeOptions, graph: Graph ): three.Group;
  static generateArrow( from: Vertex, to: Vertex, options: EdgeOptions): three.Group;
  static generateSplarrow( from: Vertex, to: Vertex, options: EdgeOptions, graph: Graph): three.Group;
  static updateArrow( group: three.Group, from: Vertex, to: Vertex): void;
  static updateLine( group: three.Group, from: Vertex, to: Vertex ): void;
  static updateSpline( group: three.Group, from: Vertex, to: Vertex, graph: Graph ): void;
  static updateSplarrow( group: three.Group, from: Vertex, to: Vertex, graph: Graph): void;
}