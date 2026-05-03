export class TemplateElement extends HTMLElement {
  static template: string = `
    <div class="">
    </div>
  `;

  qs: (query: string) => HTMLElement;
  qsa: (query: string) => NodeList;

  constructor(){
    super();
    this.attachShadow({mode: 'open'});
    this.qs = this.shadowRoot?.querySelector.bind(this.shadowRoot);
    this.qsa = this.shadowRoot?.querySelectorAll.bind(this.shadowRoot);
    this.fetchStyle();
    this.fetchTemplate();
  }

  async fetchStyle(){
    const sheet = new CSSStyleSheet();
    const file = await fetch(new URL('./element-template.css', import.meta.url));
    const css = await file.text();
    sheet.replaceSync(css);
    this.shadowRoot!.adoptedStyleSheets = [sheet];
  }

  async fetchTemplate(){
    const file = await fetch(new URL('./template-element.html', import.meta.url));
    const html = await file.text();
    this.shadowRoot.innerHTML = html;
  }

  connectedCallback(){
    this.qsa('[popover]').forEach(popover => popover.showPopover());
  }
}