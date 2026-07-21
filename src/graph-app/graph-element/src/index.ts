import { SettingsElement } from './web-component/settings-element';
import { VertexElement } from './web-component/vertex-element';
import { EdgeElement} from './web-component/edge-element';
import { GraphElement } from "./web-component/graph-element";
import { Constants } from './layout/dynamic-matching';

export { 
  VertexElement,
  EdgeElement,
  GraphElement,
  Constants
};

if(!customElements.get('vertex-el')){
  customElements.define("vertex-el", VertexElement);
}
if(!customElements.get('edge-el')){
  customElements.define("edge-el", EdgeElement);
}
if(!customElements.get('graph-el')){
  customElements.define("graph-el", GraphElement);
}