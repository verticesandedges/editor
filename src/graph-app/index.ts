export class GraphAppElement extends HTMLElement {
  static template: string = `
    <div>
    Hello World!
    </div>
  `;

  qs: (query: string) => HTMLElement;
  qsa: (query: string) => NodeList;

  constructor(){
    super();
    this.attachShadow({mode: 'open'});
    this.qs = this.shadowRoot?.querySelector.bind(this.shadowRoot);
    this.qsa = this.shadowRoot?.querySelectorAll.bind(this.shadowRoot);
    this.shadowRoot.innerHTML = GraphAppElement.template;
    this.fetchStyle();
  }

  async fetchStyle(){
    const sheet = new CSSStyleSheet();
    const file = await fetch(new URL('./graph-app.css', import.meta.url));
    const css = await file.text();
    sheet.replaceSync(css);
    this.shadowRoot!.adoptedStyleSheets = [sheet];
  }
}