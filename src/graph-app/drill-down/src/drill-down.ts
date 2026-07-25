type Option = {
  title: string | {
    symbol: string,
    word: string,
  },
  options?: Option[],
  onclick?: string,
  id?: string,
  parent: Option | null,
  event?: string,
  control?: string
};

export class DrillDown extends HTMLElement {
  qs: (query: string) => HTMLElement;
  qsa: (query: string) => NodeList;

  titleEl!: HTMLSpanElement;
  back!: HTMLButtonElement;
  menu!: HTMLUListElement;
  data!: Option;
  
  constructor(){
    super();
    this.attachShadow({mode: 'open'});

    // setup convenience shortcuts querySelector and querySelectorAll
    this.qs = this.shadowRoot?.querySelector.bind(this.shadowRoot)!;
    this.qsa = this.shadowRoot?.querySelectorAll.bind(this.shadowRoot)!;
    
    // fetch and apply styles and templates
    this.fetchStyle()
    .then(() => this.fetchTemplate())
    .then(() => {
      this.titleEl = this.qs('#title') as HTMLSpanElement;
      this.back = this.qs('#back') as HTMLButtonElement;
      this.menu = this.qs('#menu') as HTMLUListElement;
    })
    .then(() => {
      const option = JSON.parse(this.textContent) as Option;
      this.parseLevel(option, null);
    })
  }

  parseLevel(option: Option, parent: Option | null){
    this.menu.innerHTML = '';
    option.parent = parent;

    let controlRendered = false;

    // assign option title to title element
    if(typeof option.title === 'string'){
      this.titleEl.innerHTML = option.title;
    }else{
      this.titleEl.innerHTML = `
        <span class="symbol">${option.title.symbol}</span>
        <span class="word">${option.title.word}</span>
      `
    }

    // set display to none if top level
    if(parent){
      this.back.style.display = 'block';
      this.back.onclick = () => this.parseLevel(option.parent!, option.parent!.parent);
    }else{
      this.back.style.display = 'none';
    }

    this.menu.append(...option.options!.map(sub => {
      const li = document.createElement('li');

      // li.innerHTML = sub.title;
      if(typeof sub.title === 'string'){
        li.innerHTML = `<span>${sub.title}</span>`;
      }else{
        li.innerHTML = `
          <span class="symbol">${sub.title.symbol}</span>
          <span class="word">${sub.title.word}</span>
        `
      }

      if(sub.options){
        li.onclick = () => this.parseLevel(sub, option);
      }else{
        if(sub.control){
          if(sub.control === 'color'){
            const input = document.createElement('input');
            input.type = sub.control;
            input.onchange = () => {
              if(sub.event) this.dispatchEvent(new CustomEvent(sub.event!, {bubbles: true, composed: true, detail: {value: input.value}}));
            }
            li.appendChild(input);
          }

          if(sub.control === 'file'){
            const input = document.createElement('input');
            input.type = sub.control;
            input.onchange = (e) => {
              const file = input.files![0] || null;
              if(!file) return;
              
              const reader = new FileReader();
              reader.onload = () => {;
                const dataUrl = reader.result as string;
                if(sub.event) this.dispatchEvent(new CustomEvent(sub.event!, {bubbles: true, composed: true, detail: {value: dataUrl}}));
              };
              reader.onerror = () => {
                alert('Error reading file: ' + reader.error);
              };
              reader.readAsDataURL(file);
            }

            const id = Math.random().toString(36).substring(2, 9);
            input.id = id;

            const label = document.createElement('label');
            label.classList.add('custom-file-upload');
            label.innerHTML = 'Upload File';
            label.setAttribute('for', id)

            li.appendChild(input);
            li.appendChild(label);
          }

          if(sub.control === 'number'){
            const input = document.createElement('input');
            input.type = sub.control;
            input.onchange = () => {
              if(sub.event) this.dispatchEvent(new CustomEvent(sub.event!, {bubbles: true, composed: true, detail: {value: parseFloat(input.value ?? '0')}}));
            }
            li.appendChild(input);
          }

          if(sub.control === 'text'){
            const input = document.createElement('input');
            input.type = sub.control;
            input.onchange = () => {
              if(sub.event) this.dispatchEvent(new CustomEvent(sub.event!, {bubbles: true, composed: true, detail: {value: input.value}}));
            }
            li.appendChild(input);
          }

          if(sub.control === 'checkbox'){
            const input = document.createElement('input');
            input.type = sub.control;
            input.onchange = () => {
              if(sub.event) this.dispatchEvent(new CustomEvent(sub.event!, {bubbles: true, composed: true, detail: {value: input.checked}}));
            }
            li.appendChild(input);
          }

          controlRendered = true;
        }else if(sub.event){
          li.onclick = () => {
            this.dispatchEvent(new CustomEvent(sub.event!, {bubbles: true, composed: true}));
          };
        }

        if(sub.onclick){
          li.onclick = () => eval(sub.onclick!);
        }
      }

      if(sub.id){
        li.id = sub.id;
      }

      return li;
    }));

    if(controlRendered){
      this.dispatchEvent(
        new CustomEvent('drill-level-change', {
          bubbles: true, 
          composed: true, 
          detail: { option }
        })
      );
    }
  }

  async fetchStyle(){
    const sheet = new CSSStyleSheet();
    const file = await fetch(new URL('./drill-down.css', import.meta.url));
    const css = await file.text();
    sheet.replaceSync(css);
    this.shadowRoot!.adoptedStyleSheets = [sheet];
  }

  async fetchTemplate(){
    const file = await fetch(new URL('./drill-down.html', import.meta.url));
    const html = await file.text();
    this.shadowRoot!.innerHTML = html;
  }
}

if(!customElements.get('drill-down')){
  window.customElements.define('drill-down', DrillDown);
}