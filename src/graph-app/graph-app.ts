export class GraphAppElement extends HTMLElement {
  static template: string = `
    <div class="app">
      <header>

        <!-- Graph Menu -->
        <details>
          <summary>Graph</summary>
          <menu class="graph">
            <li>Open</li>
            <li>Save</li>
            <li>Clear</li>
          </menu>
        </details>

        <!-- Notebook Menu -->
        <details>
          <summary>Notebook</summary>
          <menu class="notebook">
            <li>Open</li>
            <li>Save</li>
            <li>Run All</li>
            <li>Clear</li>
            <li>Toggle</li>
          </menu>
        </details>
      </header>

      <main>
        <div class="content-menus">
          <details>
            <summary>Vertex</summary>
            <menu class="vertex">
              <li>Add</li>
              <li>Select All</li>
              <li>Cut</li>
              <li>Copy</li>
              <li>Paste</li>
              <li>Add Neighbor</li>
              <li>Edit</li>
            </menu>

            <!-- Vertex List -->
            <details>
              <summary>List</summary>
              <menu>
                <li>Hello</li>
                <li>World</li>
                <li>!</li>
              </menu>
            </details>
          </details>
          
          <details>
            <summary>Edge</summary>
            <menu class="edge">
              <li>Connect Vertices</li>
              <li>Select All</li>
            </menu>
            <!-- Edge List -->
            <details>
              <summary>List</summary>
              <menu>
                <li>Hello</li>
                <li>Once</li>
                <li>Again</li.>
              </menu>
            </details>
          </details>
        </div>

        <div class="graph-element">
        test
        </div>
      </main>
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

  connectedCallback(){
    this.qsa('[popover]').forEach(popover => popover.showPopover());
  }
}