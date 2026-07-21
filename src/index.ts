import { GraphAppElement } from "./graph-app/graph-app";

if(!customElements.get("graph-app")){
  customElements.define("graph-app", GraphAppElement);
}