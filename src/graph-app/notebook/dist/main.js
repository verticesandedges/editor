import {EditorView as $TDEgv$EditorView, basicSetup as $TDEgv$basicSetup} from "codemirror";
import {Compartment as $TDEgv$Compartment, EditorState as $TDEgv$EditorState} from "@codemirror/state";
import {keymap as $TDEgv$keymap, placeholder as $TDEgv$placeholder, EditorView as $TDEgv$EditorView1} from "@codemirror/view";
import {javascript as $TDEgv$javascript} from "@codemirror/lang-javascript";
import {indentWithTab as $TDEgv$indentWithTab} from "@codemirror/commands";
import {markdown as $TDEgv$markdown} from "@codemirror/lang-markdown";
import {marked as $TDEgv$marked} from "marked";
import $TDEgv$katex from "katex";
import {transpileModule as $TDEgv$transpileModule, ModuleKind as $TDEgv$ModuleKind} from "typescript";













let $dd4ad8f3f241100e$var$tabSize = new (0, $TDEgv$Compartment)();
class $dd4ad8f3f241100e$export$7910644ddd3b55c3 extends HTMLElement {
    //#region public properties
    view;
    qs;
    qsa;
    ready;
    isRendered = false;
    set source(val) {
        if (this.view) this.view.dispatch({
            changes: {
                from: 0,
                to: this.view.state.doc.length,
                insert: val
            }
        });
    }
    get source() {
        return this.view ? this.view.state.doc.toString() : '';
    }
    //#endregion
    constructor(){
        // Call parent constructor
        super();
        // attach shadowRoot
        this.attachShadow({
            mode: "open"
        });
        // setup querySelector and querySelectorAll shorthands
        this.qs = this.shadowRoot.querySelector.bind(this.shadowRoot);
        this.qsa = this.shadowRoot.querySelectorAll.bind(this.shadowRoot);
        this.ready = new Promise(async (resolve)=>{
            await this.setupUI();
            resolve(true);
        });
    }
    async setupUI() {
        await this.fetchStyle();
        await this.fetchTemplate();
        this.setupCodeMirror();
        this.setupEvents();
        this.view.focus();
    }
    async fetchStyle() {
        const sheet = new CSSStyleSheet();
        const file = await fetch(new URL("markdown-cell.a81e32cc.css", import.meta.url));
        const css = await file.text();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [
            sheet
        ];
    }
    async fetchTemplate() {
        const file = await fetch(new URL("markdown-cell.1659e7b8.html", import.meta.url));
        const html = await file.text();
        this.shadowRoot.innerHTML = html;
    }
    setupEvents() {
        const output = this.qs('.cell-output');
        const renderBtn = this.qs('.render-btn') || this.qs('#render') || this.qs('button');
        // Toggle render when clicking the "Render" button below the cell
        renderBtn?.addEventListener('click', ()=>this.toggleRender());
        // Double-click output container to go back to editor mode
        output?.addEventListener('dblclick', ()=>{
            if (this.isRendered) this.toggleRender(false);
        });
    }
    /**
   * Toggles between raw Markdown editor and rendered HTML/KaTeX output
   */ toggleRender(forceState) {
        this.isRendered = forceState !== undefined ? forceState : !this.isRendered;
        const input = this.qs('.cell-editor');
        const output = this.qs('.cell-output');
        if (this.isRendered) {
            // 1. Convert Markdown to HTML
            const html = (0, $TDEgv$marked).parse(this.source);
            output.innerHTML = html;
            // 2. Parse KaTeX Math ($$ block $$ and $ inline $)
            output.querySelectorAll("*").forEach((el)=>{
                if (el.children.length === 0 && el.textContent?.includes("$$")) el.innerHTML = el.innerHTML.replace(/\$\$([\s\S]+?)\$\$/g, (_, math)=>{
                    try {
                        return (0, $TDEgv$katex).renderToString(math.trim(), {
                            displayMode: true
                        });
                    } catch (e) {
                        return `<span class="katex-error">${math}</span>`;
                    }
                });
                if (el.children.length === 0 && el.textContent?.includes("$")) el.innerHTML = el.innerHTML.replace(/\$([^\$\n]+?)\$/g, (_, math)=>{
                    try {
                        return (0, $TDEgv$katex).renderToString(math.trim(), {
                            displayMode: false
                        });
                    } catch (e) {
                        return `<span class="katex-error">${math}</span>`;
                    }
                });
            });
            // 3. Swap UI visibility
            input.style.display = 'none';
            output.style.display = 'block';
        } else {
            // Return to Editor
            output.style.display = 'none';
            input.style.display = 'block';
            this.view.focus();
        }
    }
    // Public method mapped to render button
    render() {
        this.toggleRender();
    }
    toJSON() {
        return {
            "cell_type": "markdown",
            "metadata": {},
            "source": this.source
        };
    }
    static fromJSON(obj) {
        const cell = new $dd4ad8f3f241100e$export$7910644ddd3b55c3();
        cell.fromJSON(obj);
        return cell;
    }
    fromJSON(obj) {
        this.ready.then(()=>{
            if (typeof obj.source === 'string') this.source = obj.source;
            if (Array.isArray(obj.source)) this.source = obj.source.join('');
            this.render(true);
        });
    }
    static fromString(str) {
        const obj = JSON.parse(str);
        return $dd4ad8f3f241100e$export$7910644ddd3b55c3.fromJSON(obj);
    }
    fromString(str) {
        const obj = JSON.parse(str);
        this.fromJSON(obj);
    }
    disconnectedCallback() {
        this.view?.destroy();
    }
    //#endregion
    //#region private methods
    setupCodeMirror() {
        const cell = this;
        const CtrlEnter = (0, $TDEgv$keymap).of([
            {
                key: "Ctrl-Enter",
                run () {
                    cell.toggleRender();
                    return true;
                }
            }
        ]);
        const extensions = [
            (0, $TDEgv$EditorView1).contentAttributes.of({
                'aria-label': "Cell editor"
            }),
            CtrlEnter,
            (0, $TDEgv$basicSetup),
            (0, $TDEgv$keymap).of([
                (0, $TDEgv$indentWithTab)
            ]),
            $dd4ad8f3f241100e$var$tabSize.of((0, $TDEgv$EditorState).tabSize.of(2)),
            (0, $TDEgv$EditorView1).lineWrapping,
            (0, $TDEgv$placeholder)("Write here..."),
            (0, $TDEgv$markdown)()
        ];
        this.view = new (0, $TDEgv$EditorView1)({
            state: (0, $TDEgv$EditorState).create({
                extensions: extensions
            }),
            parent: this.qs('.cell-editor')
        });
    }
}
if (!customElements.get('markdown-cell')) customElements.define("markdown-cell", $dd4ad8f3f241100e$export$7910644ddd3b55c3);












class $e4d3529c0c677131$export$ac85885ea219ea4e extends HTMLElement {
    //#region public properties
    qs;
    qsa;
    //#endregion
    constructor(){
        super();
        this.attachShadow({
            mode: "open"
        });
        this.qs = this.shadowRoot.querySelector.bind(this.shadowRoot);
        this.qsa = this.shadowRoot.querySelector.bind(this.shadowRoot);
        this.setupUI();
    }
    async setupUI() {
        await this.fetchStyle();
        await this.fetchTemplate();
        this.setupCellActions();
    }
    async fetchStyle() {
        const sheet = new CSSStyleSheet();
        const file = await fetch(new URL("cell-actions.93a45d96.css", import.meta.url));
        const css = await file.text();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [
            sheet
        ];
    }
    async fetchTemplate() {
        const file = await fetch(new URL("cell-actions.9659f20b.html", import.meta.url));
        const html = await file.text();
        this.shadowRoot.innerHTML = html;
    }
    //#region private methods
    setupCellActions() {
        this.qs('.delete-cell').addEventListener('click', ()=>this.onDeleteCellClick());
        this.qs('.prepend-cell').addEventListener('click', ()=>this.onPrependCellClick());
        this.qs('.append-cell').addEventListener('click', ()=>this.onAppendCellClick());
        this.qs('.run-cell').addEventListener('click', ()=>this.onRunClick());
        const cell = this.getParent();
        if (cell instanceof (0, $60393df850c1c53c$export$5a61110bddf305c0) || cell instanceof (0, $312a93348be6f698$export$62a1cc341f70ee8e)) {
            this.qs('.run-cell').innerText = 'Run';
            this.qs('.reset-cell').addEventListener('click', ()=>this.onResetCellClick());
        } else {
            this.qs('.run-cell').innerText = 'Render';
            this.qs('.reset-cell').parentElement?.remove();
        }
    }
    getParent() {
        const md = this.getRootNode().host.closest('markdown-cell');
        const ts = this.getRootNode().host.closest('typescript-cell');
        const js = this.getRootNode().host.closest('javascript-cell');
        return md ?? ts ?? js;
    }
    onDeleteCellClick() {
        this.getParent().remove();
    }
    onResetCellClick() {
        this.getParent().resetOutput();
    }
    onPrependCellClick() {
        const CellType = this.getParent().constructor;
        const cell = new CellType();
        cell.ready.then(()=>{
            this.getParent().before(cell);
            cell.view.focus();
        });
    }
    onAppendCellClick() {
        const CellType = this.getParent().constructor;
        const cell = new CellType();
        cell.ready.then(()=>{
            this.getParent().after(cell);
            cell.view.focus();
        });
    }
    isRunnable(cell) {
        return cell instanceof (0, $60393df850c1c53c$export$5a61110bddf305c0) || cell instanceof (0, $312a93348be6f698$export$62a1cc341f70ee8e);
    }
    isRenderable(cell) {
        return cell instanceof (0, $dd4ad8f3f241100e$export$7910644ddd3b55c3);
    }
    onRunClick() {
        const parentCell = this.getParent();
        if (this.isRunnable(parentCell)) parentCell.run();
        if (this.isRenderable(parentCell)) parentCell.render();
    }
}
if (!customElements.get('cell-actions')) customElements.define("cell-actions", $e4d3529c0c677131$export$ac85885ea219ea4e);



let $312a93348be6f698$var$language = new (0, $TDEgv$Compartment)();
let $312a93348be6f698$var$tabSize = new (0, $TDEgv$Compartment)();
class $312a93348be6f698$export$62a1cc341f70ee8e extends HTMLElement {
    //#region properties
    view;
    qs;
    qsa;
    ready;
    #execution_count = 0;
    #result = null;
    //#endregion
    constructor(){
        super();
        this.attachShadow({
            mode: "open"
        });
        this.qs = (query)=>this.shadowRoot?.querySelector(query);
        this.qsa = (query)=>this.shadowRoot.querySelectorAll(query);
        this.ready = new Promise(async (resolve, reject)=>{
            await this.setupUI();
            resolve(true);
        });
    }
    async setupUI() {
        await this.fetchStyle();
        await this.fetchTemplate();
        this.setupCodeMirror();
    }
    async fetchStyle() {
        const sheet = new CSSStyleSheet();
        const file = await fetch(new URL("typescript-cell.1b23ac87.css", import.meta.url));
        const css = await file.text();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [
            sheet
        ];
    }
    async fetchTemplate() {
        const file = await fetch(new URL("typescript-cell.5d809dea.html", import.meta.url));
        const html = await file.text();
        this.shadowRoot.innerHTML = html;
    }
    //#region public properties
    set source(val) {
        this.view?.dispatch({
            changes: {
                from: 0,
                to: this.view.state.doc.length,
                insert: val
            }
        });
    }
    get source() {
        return this.view.state.doc.toString();
    }
    set result(result) {
        const output = this.qs('.cell-output.result');
        this.#result = result;
        if (result instanceof HTMLElement) output.append(result);
        else if (typeof result in new Set([
            'number',
            'string',
            'boolean',
            'bigint'
        ])) output.innerText = result;
        else if (typeof result === 'object' || typeof result === 'array') output.innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
        else if (result === null) output.innerText = 'null';
        else if (result === undefined) output.value = '';
        else output.innerText = JSON.stringify(result);
    }
    get result() {
        return this.#result;
    }
    //#endregion
    //#region public methods
    log(...args) {
        const messages = this.qs('.cell-output.messages');
        args.forEach((arg)=>{
            const p = document.createElement('p');
            p.classList.add('log');
            p.innerText = arg;
            messages.appendChild(p);
        });
    }
    error(...args) {
        const messages = this.qs('.cell-output.messages');
        args.forEach((arg)=>{
            const p = document.createElement('p');
            p.classList.add('error');
            p.innerText = arg;
            messages.appendChild(p);
        });
    }
    async run() {
        const context = this.createContext();
        const func = this.createFunction(context);
        const indicator = this.createIndicator();
        try {
            this.resetOutput();
            this.result = await func(...Object.values(context));
            this.#execution_count++;
        } catch (error) {
            this.error(`Error ${error} ${error.stack}`);
        } finally{
            this.stopIndicator(indicator);
        }
    }
    resetOutput() {
        this.qs('.cell-outputs').innerHTML = `
      <output class="cell-output indicator"></output>
      <output class="cell-output messages"></output>
      <output class="cell-output result"></output>`;
        this.result = undefined;
    }
    toJSON() {
        const outputs = [];
        // console.log and console.error outputs
        const messages = this.qs('.cell-output.messages');
        [
            ...messages.children
        ].forEach((p)=>{
            let output;
            if (p.classList.contains('log')) output = {
                "output_type": "stream",
                "name": "stdout",
                "text": p.innerText
            };
            if (p.classList.contains('error')) output = {
                "output_type": "stream",
                "name": "stderr",
                "text": p.innerText
            };
            outputs.push(output);
        });
        // execute_result outputs
        if (this.result) outputs.push({
            "output_type": "execute_result",
            "execution_count": this.#execution_count,
            "data": {
                "text/plain": this.result
            }
        });
        const obj = {
            "cell_type": "code",
            "execution_count": this.#execution_count,
            "metadata": {
                "language": "typescript",
                "collapsed": false,
                "autoscroll": false
            },
            "source": this.source,
            "outputs": outputs
        };
        return obj;
    }
    static fromJSON(incoming) {
        const cell = new $312a93348be6f698$export$62a1cc341f70ee8e();
        cell.fromJSON(incoming);
        return cell;
    }
    fromJSON(incoming) {
        this.ready.then(()=>{
            this.#execution_count = incoming.execution_count;
            if (typeof incoming.source === 'string') this.source = incoming.source;
            if (Array.isArray(incoming.source)) this.source = incoming.source.join('');
            for (let output of incoming.outputs){
                if (output.name === 'stdout') this.log(output.text);
                if (output.name === 'stderr') this.error(output.text);
                if (output.output_type === 'execute_result') this.result = output.data["text/plain"];
            }
        });
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    static fromString(str) {
        const obj = JSON.parse(str);
        const cell = $312a93348be6f698$export$62a1cc341f70ee8e.fromJSON(obj);
        return cell;
    }
    disconnectedCallback() {
        this.view.destroy();
    }
    //#endregion
    //#region private methods
    setupCodeMirror() {
        const cell = this;
        function CtrlEnter() {
            return (0, $TDEgv$keymap).of([
                {
                    key: "Ctrl-Enter",
                    run () {
                        cell.run();
                        return true;
                    }
                }
            ]);
        }
        this.view = new (0, $TDEgv$EditorView)({
            state: (0, $TDEgv$EditorState).create({
                doc: '',
                extensions: [
                    (0, $TDEgv$EditorView).contentAttributes.of({
                        "aria-label": "Cell Editor"
                    }),
                    CtrlEnter(),
                    (0, $TDEgv$basicSetup),
                    (0, $TDEgv$keymap).of([
                        (0, $TDEgv$indentWithTab)
                    ]),
                    $312a93348be6f698$var$language.of((0, $TDEgv$javascript)({
                        typescript: true
                    })),
                    $312a93348be6f698$var$tabSize.of((0, $TDEgv$EditorState).tabSize.of(2)),
                    (0, $TDEgv$placeholder)('TypeScript code...'),
                    (0, $TDEgv$EditorView).lineWrapping
                ]
            }),
            parent: this.qs('.cell-editor')
        });
    }
    createContext() {
        const outputs = this.qs('.cell-outputs');
        const indicator = this.qs('.cell-output.indicator');
        const messages = this.qs('.cell-output.messages');
        const result = this.qs('.cell-output.result');
        outputs.value = '';
        indicator.innerText = '';
        messages.value = '';
        result.value = '';
        outputs.appendChild(indicator);
        outputs.appendChild(messages);
        outputs.appendChild(result);
        const notebook = this.getRootNode().host.closest('notebook-el');
        const context = {
            ...notebook.context,
            cell: this,
            output: outputs,
            console: {
                log: (...args)=>{
                    this.log(...args);
                    console.log(...args);
                },
                error: (...args)=>{
                    this.error(...args);
                    console.error(...args);
                }
            }
        };
        return context;
    }
    createFunction(context) {
        const AsyncFunction = (async function() {}).constructor;
        const source = $TDEgv$transpileModule(this.source, {
            module: $TDEgv$ModuleKind.ESNext,
            compact: false
        }).outputText;
        const func = new AsyncFunction(...Object.keys(context), `
      try{
        ${source}
      }catch(e){
        console.error(e.message);
        console.error(e.stack);
      }
    `);
        return func;
    }
    createIndicator() {
        let indicator = this.qs('.cell-output.indicator');
        if (!indicator) {
            const outputs = this.qs('.cell-outputs');
            indicator = document.createElement('output');
            indicator.classList.add('cell-output', 'indicator');
            outputs.prepend(indicator);
        }
        let i = 0;
        const states = [
            '...',
            ':..',
            '.:.',
            '..:'
        ];
        let indicating = setInterval(()=>{
            indicator.innerText = states[i++ % states.length];
            if (i === states.length) i = 0;
        }, 250);
        return {
            indicator: indicator,
            indicating: indicating
        };
    }
    stopIndicator(pkg) {
        clearInterval(pkg.indicating);
        pkg.indicator.value = '';
    }
}
if (!customElements.get('typescript-cell')) customElements.define('typescript-cell', $312a93348be6f698$export$62a1cc341f70ee8e);


class $bdaad2d5f3551cf2$export$a97aa3d704ecd66b extends HTMLElement {
    static observedAttributes = [
        "data-selected"
    ];
    //#region public properties
    qs;
    qsa;
    get selected() {
        const option = this.qs('.cell-type[checked]');
        return option.value;
    }
    set selected(selection) {
        if (selection !== this.dataset.selected) {
            this.qs(`.cell-type[checked]`).removeAttribute('checked');
            this.qs(`.cell-type.${selection}`).setAttribute('checked', 'true');
        }
    }
    //#endregion
    constructor(){
        super();
        this.attachShadow({
            mode: "open"
        });
        this.qs = this.shadowRoot.querySelector.bind(this.shadowRoot);
        this.qsa = this.shadowRoot.querySelectorAll.bind(this.shadowRoot);
        this.setupUI();
    }
    async setupUI() {
        await this.fetchStyle();
        await this.fetchTemplate();
        this.setupSelectors();
    }
    async fetchStyle() {
        const sheet = new CSSStyleSheet();
        const file = await fetch(new URL("cell-type-selector.5bdba451.css", import.meta.url));
        const css = await file.text();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [
            sheet
        ];
    }
    async fetchTemplate() {
        const file = await fetch(new URL("cell-type-selector.68e1798a.html", import.meta.url));
        const html = await file.text();
        this.shadowRoot.innerHTML = html;
    }
    //#region public methods
    attributeChangedCallback(name, old, value) {
        switch(name){
            case "data-selected":
                this.selected = value;
                break;
        }
    }
    //#endregion
    //#region private methods
    setupSelectors() {
        const md = this.qs('.cell-type.markdown');
        const js = this.qs('.cell-type.javascript');
        const ts = this.qs('.cell-type.typescript');
        md.addEventListener('click', this.onMarkdownClick.bind(this));
        js.addEventListener('click', this.onJavascriptClick.bind(this));
        ts.addEventListener('click', this.onTypescriptClick.bind(this));
        this.qs('.label.markdown').addEventListener('click', this.onMarkdownClick.bind(this));
        this.qs('.label.javascript').addEventListener('click', this.onJavascriptClick.bind(this));
        this.qs('.label.typescript').addEventListener('click', this.onTypescriptClick.bind(this));
        switch(this.dataset.selected){
            case 'markdown':
                md.setAttribute('checked', 'checked');
                break;
            case 'javascript':
                js.setAttribute('checked', 'checked');
                break;
            case 'typescript':
                ts.setAttribute('checked', 'checked');
                break;
        }
    }
    getOld() {
        const md = this.getRootNode().host.closest('markdown-cell');
        const js = this.getRootNode().host.closest('javascript-cell');
        const ts = this.getRootNode().host.closest('typescript-cell');
        const old = md ?? js ?? ts;
        return old;
    }
    onMarkdownClick() {
        const cell = new (0, $dd4ad8f3f241100e$export$7910644ddd3b55c3)();
        cell.ready.then(()=>{
            const old = this.getOld();
            const text = old.source;
            old.replaceWith(cell);
            cell.source = text;
            cell.view.focus();
        });
    }
    onJavascriptClick() {
        const cell = new (0, $60393df850c1c53c$export$5a61110bddf305c0)();
        cell.ready.then(()=>{
            const old = this.getOld();
            const text = old.source;
            old.replaceWith(cell);
            cell.source = text;
            cell.view.focus();
        });
    }
    onTypescriptClick() {
        const cell = new (0, $312a93348be6f698$export$62a1cc341f70ee8e)();
        cell.ready.then(()=>{
            const old = this.getOld();
            const text = old.source;
            old.replaceWith(cell);
            cell.source = text;
            cell.view.focus();
        });
    }
}
if (!customElements.get('cell-type')) customElements.define("cell-type", $bdaad2d5f3551cf2$export$a97aa3d704ecd66b);



let $60393df850c1c53c$var$language = new (0, $TDEgv$Compartment)();
let $60393df850c1c53c$var$tabSize = new (0, $TDEgv$Compartment)();
class $60393df850c1c53c$export$5a61110bddf305c0 extends HTMLElement {
    //#region properties
    view;
    qs;
    qsa;
    ready;
    #execution_count = 0;
    #result = null;
    //#endregion
    constructor(){
        super();
        this.attachShadow({
            mode: "open"
        });
        this.qs = (query)=>this.shadowRoot?.querySelector(query);
        this.qsa = (query)=>this.shadowRoot?.querySelectorAll(query);
        this.ready = new Promise(async (resolve, reject)=>{
            await this.setupUI();
            resolve(true);
        });
    }
    async setupUI() {
        await this.fetchStyle();
        await this.fetchTemplate();
        this.setupCodeMirror();
    }
    async fetchStyle() {
        const sheet = new CSSStyleSheet();
        const file = await fetch(new URL("javascript-cell.a5e0a626.css", import.meta.url));
        const css = await file.text();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [
            sheet
        ];
    }
    async fetchTemplate() {
        const file = await fetch(new URL("javascript-cell.8b466d5a.html", import.meta.url));
        const html = await file.text();
        this.shadowRoot.innerHTML = html;
    }
    //#region public properties
    set source(val) {
        this.view?.dispatch({
            changes: {
                from: 0,
                to: this.view.state.doc.length,
                insert: val
            }
        });
    }
    get source() {
        return this.view.state.doc.toString();
    }
    set result(result) {
        const output = this.qs('.cell-output.result');
        this.#result = result;
        if (result instanceof HTMLElement) output.append(result);
        else if (typeof result in new Set([
            'number',
            'string',
            'boolean',
            'bigint'
        ])) output.innerText = result;
        else if (typeof result === 'object' || Array.isArray(result)) output.innerHTML = `<pre>${JSON.stringify(result, null, 2)}</pre>`;
        else if (result === null) output.innerText = 'null';
        else if (result === undefined) output.value = '';
        else output.innerText = JSON.stringify(result);
    }
    get result() {
        return this.#result;
    }
    //#endregion
    //#region public methods
    log(...args) {
        const messages = this.qs('.cell-output.messages');
        args.forEach((arg)=>{
            const p = document.createElement('p');
            p.classList.add('log');
            p.innerText = arg;
            messages.appendChild(p);
        });
    }
    error(...args) {
        const messages = this.qs('.cell-output.messages');
        args.forEach((arg)=>{
            const p = document.createElement('p');
            p.classList.add('error');
            p.innerText = arg;
            messages.appendChild(p);
        });
    }
    async run() {
        const context = this.createContext();
        const func = this.createFunction(context);
        const indicator = this.createIndicator();
        try {
            this.resetOutput();
            this.result = await func(...Object.values(context));
            this.#execution_count++;
        } catch (error) {
            this.error(`Error ${error} ${error.stack}`);
        } finally{
            this.stopIndicator(indicator);
        }
    }
    resetOutput() {
        this.qs('.cell-outputs').innerHTML = `
      <output class="cell-output indicator"></output>
      <output class="cell-output messages"></output>
      <output class="cell-output result"></output>`;
        this.result = undefined;
    }
    toJSON() {
        const outputs = [];
        // console.log and console.error outputs
        const messages = this.qsa('.cell-output.messages>*');
        messages.forEach((p)=>{
            let output;
            if (p.classList.contains('log')) output = {
                "output_type": "stream",
                "name": "stdout",
                "text": p.innerText
            };
            if (p.classList.contains('error')) output = {
                "output_type": "stream",
                "name": "stderr",
                "text": p.innerText
            };
            outputs.push(output);
        });
        // execute_result outputs
        if (this.result) outputs.push({
            "output_type": "execute_result",
            "execution_count": this.#execution_count,
            "data": {
                "text/plain": this.result
            }
        });
        const obj = {
            "cell_type": "code",
            "execution_count": this.#execution_count,
            "metadata": {
                "language": "javascript",
                "collapsed": false,
                "autoscroll": false
            },
            "source": this.source,
            "outputs": outputs
        };
        return obj;
    }
    static fromJSON(incoming) {
        const cell = new $60393df850c1c53c$export$5a61110bddf305c0();
        cell.fromJSON(incoming);
        return cell;
    }
    fromJSON(incoming) {
        this.ready.then(()=>{
            this.#execution_count = incoming.execution_count;
            if (typeof incoming.source === 'string') this.source = incoming.source;
            if (Array.isArray(incoming.source)) this.source = incoming.source.join('');
            for (let output of incoming.outputs){
                if (output.name && output.name === 'stdout') this.log(output.text);
                if (output.name && output.name === 'stderr') this.error(output.text);
                if (output.output_type === 'execute_result') this.result = output.data["text/plain"];
            }
        });
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    static fromString(str) {
        const obj = JSON.parse(str);
        const cell = $60393df850c1c53c$export$5a61110bddf305c0.fromJSON(obj);
        return cell;
    }
    fromString(str) {
        const obj = JSON.parse(str);
        this.fromJSON(obj);
    }
    disconnectedCallbac() {
        this.view.destroy();
    }
    //#endregion
    //#region private methods
    setupCodeMirror() {
        const cell = this;
        function CtrlEnter() {
            return (0, $TDEgv$keymap).of([
                {
                    key: "Ctrl-Enter",
                    run () {
                        cell.run();
                        return true;
                    }
                }
            ]);
        }
        this.view = new (0, $TDEgv$EditorView)({
            state: (0, $TDEgv$EditorState).create({
                doc: '',
                extensions: [
                    (0, $TDEgv$EditorView).contentAttributes.of({
                        "aria-label": "Cell Editor"
                    }),
                    CtrlEnter(),
                    (0, $TDEgv$basicSetup),
                    (0, $TDEgv$keymap).of([
                        (0, $TDEgv$indentWithTab)
                    ]),
                    $60393df850c1c53c$var$language.of((0, $TDEgv$javascript)({
                        typescript: false
                    })),
                    $60393df850c1c53c$var$tabSize.of((0, $TDEgv$EditorState).tabSize.of(2)),
                    (0, $TDEgv$placeholder)('JavaScript code... for example: return 7 * 3;'),
                    (0, $TDEgv$EditorView).lineWrapping
                ]
            }),
            parent: this.qs('.cell-editor')
        });
    }
    createContext() {
        const outputs = this.qs('.cell-outputs');
        const indicator = this.qs('.cell-output.indicator');
        const messages = this.qs('.cell-output.messages');
        const result = this.qs('.cell-output.result');
        // outputs.value = '';
        indicator.innerText = '';
        messages.value = '';
        result.value = '';
        outputs.appendChild(indicator);
        outputs.appendChild(messages);
        outputs.appendChild(result);
        const notebook = this.getRootNode().host.closest('notebook-el');
        const context = {
            ...notebook.context,
            cell: this,
            output: outputs,
            console: {
                log: (...args)=>{
                    this.log(...args);
                    console.log(...args);
                },
                error: (...args)=>{
                    this.error(...args);
                    console.error(...args);
                }
            }
        };
        return context;
    }
    createFunction(context) {
        const AsyncFunction = (async function() {}).constructor;
        const func = new AsyncFunction(...Object.keys(context), `
      try{
        ${this.source}
      }catch(e){
        console.error(e.message);
        console.error(e.stack);
      }
    `);
        return func;
    }
    createIndicator() {
        let indicator = this.qs('.cell-output.indicator');
        if (!indicator) {
            const outputs = this.qs('.cell-outputs');
            indicator = document.createElement('output');
            indicator.classList.add('cell-output', 'indicator');
            outputs.prepend(indicator);
        }
        let i = 0;
        const states = [
            '...',
            ':..',
            '.:.',
            '..:'
        ];
        let indicating = setInterval(()=>{
            indicator.innerText = states[i++ % states.length];
            if (i === states.length) i = 0;
        }, 250);
        return {
            indicator: indicator,
            indicating: indicating
        };
    }
    stopIndicator(pkg) {
        clearInterval(pkg.indicating);
        pkg.indicator.value = '';
    }
}
if (!customElements.get('javascript-cell')) customElements.define("javascript-cell", $60393df850c1c53c$export$5a61110bddf305c0);







class $54cacde54151b574$export$e5e297d53d9ad3c7 extends HTMLElement {
    //#region public properties
    qs;
    qsa;
    //#endregion
    constructor(){
        super();
        this.attachShadow({
            mode: "open"
        });
        this.qs = this.shadowRoot.querySelector.bind(this.shadowRoot);
        this.qsa = this.shadowRoot.querySelector.bind(this.shadowRoot);
        this.setupUI();
    }
    async setupUI() {
        await this.fetchStyle();
        await this.fetchTemplate();
        this.setupNotebookActions();
    }
    async fetchStyle() {
        const sheet = new CSSStyleSheet();
        const file = await fetch(new URL("notebook-actions.2095f95b.css", import.meta.url));
        const css = await file.text();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [
            sheet
        ];
    }
    async fetchTemplate() {
        const file = await fetch(new URL("notebook-actions.a3eb6f21.html", import.meta.url));
        const html = await file.text();
        this.shadowRoot.innerHTML = html;
    }
    //#region private methods
    setupNotebookActions() {
        this.qs('.add-cell').addEventListener('click', ()=>this.onAddCellClick());
        this.qs('.run-cells').addEventListener('click', ()=>this.onRunCellsClick());
        this.qs('.reset-cells').addEventListener('click', ()=>this.onResetCellsClick());
    }
    getParent() {
        return this.getRootNode().host;
    }
    onAddCellClick() {
        const cell = new (0, $dd4ad8f3f241100e$export$7910644ddd3b55c3)();
        this.getParent().qs('.cells').appendChild(cell);
        cell.ready.then(()=>cell.view.focus());
    }
    onRunCellsClick() {
        this.getParent().qsa('.cells>*').forEach(async (cell)=>{
            if (cell instanceof (0, $60393df850c1c53c$export$5a61110bddf305c0) || cell instanceof (0, $312a93348be6f698$export$62a1cc341f70ee8e)) await cell.run();
        });
    }
    onResetCellsClick() {
        this.getParent().qsa('.cells>*').forEach((cell)=>{
            if (cell instanceof (0, $60393df850c1c53c$export$5a61110bddf305c0) || cell instanceof (0, $312a93348be6f698$export$62a1cc341f70ee8e)) cell.resetOutput();
        });
    }
}
if (!customElements.get('notebook-actions')) customElements.define('notebook-actions', $54cacde54151b574$export$e5e297d53d9ad3c7);


class $71fc0554b53eb1ce$export$88315cbbb14c4be4 extends HTMLElement {
    //#region public properties
    qs;
    qsa;
    context = {};
    ready;
    get title() {
        return this.qs('h1').innerText;
    }
    set title(val) {
        val = val?.replace('\n', '');
        if (val === "") val = undefined;
        this.qs('h1').innerText = val ?? "Untitled Notebook";
    }
    //#endregion
    constructor(){
        super();
        this.attachShadow({
            mode: "open"
        });
        this.qs = this.shadowRoot.querySelector.bind(this.shadowRoot);
        this.qsa = this.shadowRoot.querySelectorAll.bind(this.shadowRoot);
        this.ready = new Promise(async (resolve, reject)=>{
            try {
                await this.fetchStyle();
                await this.fetchTemplate();
                this.qs('.title').addEventListener('blur', (e)=>this.title = e.target.innerText);
                resolve(true);
            } catch (error) {
                reject(error);
            }
        });
    }
    runAll() {
        this.qsa('.cells>*').forEach(async (cell)=>{
            if (cell instanceof (0, $60393df850c1c53c$export$5a61110bddf305c0) || cell instanceof (0, $312a93348be6f698$export$62a1cc341f70ee8e)) await cell.run();
        });
    }
    async fetchStyle() {
        const sheet = new CSSStyleSheet();
        const file = await fetch(new URL("notebook.3f4b208f.css", import.meta.url));
        const css = await file.text();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [
            sheet
        ];
    }
    async fetchTemplate() {
        const file = await fetch(new URL("notebook.264230b7.html", import.meta.url));
        const html = await file.text();
        this.shadowRoot.innerHTML = html;
    }
    //#region public methods
    toJSON() {
        const cells = [];
        this.qsa('.cells>*').forEach((cell)=>{
            cells.push(cell.toJSON());
        });
        return {
            "metadata": {
                "kernelspec": {
                    "display_name": "JavaScript",
                    "language": "javascript",
                    "name": "javascript"
                },
                "language_info": {
                    "codemirror_mode": {
                        "name": "javascript",
                        "version": 6
                    },
                    "file_extension": ".js",
                    "mimetype": "text/javascript",
                    "name": "javascript",
                    "nbconvert_exporter": "javascript"
                },
                "title": this.title
            },
            "nbformat": 4,
            "nbformat_minor": 2,
            "cells": cells
        };
    }
    static fromJSON(obj) {
        const notebook = new $71fc0554b53eb1ce$export$88315cbbb14c4be4();
        notebook.qs('.cells').innerHTML = '';
        notebook.fromJSON(obj, true);
        return notebook;
    }
    clear() {
        this.title = 'Untitled Notebook';
        const cells = this.qs('.cells');
        cells.innerHTML = '';
        const jsCell = document.createElement('javascript-cell');
        cells.appendChild(jsCell);
    }
    fromJSON(obj, clearFirst = false) {
        this.ready.then(()=>{
            const cells = this.qs('.cells');
            if (clearFirst) cells.innerHTML = '';
            this.title = obj.metadata.title;
            obj.cells.forEach((spec)=>{
                let cell;
                if (spec.cell_type === 'markdown') cell = (0, $dd4ad8f3f241100e$export$7910644ddd3b55c3).fromJSON(spec);
                if (spec.metadata.language === 'javascript') cell = (0, $60393df850c1c53c$export$5a61110bddf305c0).fromJSON(spec);
                if (spec.metadata.language === 'typescript') cell = (0, $312a93348be6f698$export$62a1cc341f70ee8e).fromJSON(spec);
                cells.appendChild(cell);
            });
        });
    }
    toString() {
        return JSON.stringify(this.toJSON());
    }
    static fromString(str) {
        const obj = JSON.parse(str);
        return $71fc0554b53eb1ce$export$88315cbbb14c4be4.fromJSON(obj);
    }
    fromString(str, clearFirst = false) {
        const obj = JSON.parse(str);
        this.fromJSON(obj, clearFirst);
    }
}
if (!customElements.get('notebook-el')) customElements.define("notebook-el", $71fc0554b53eb1ce$export$88315cbbb14c4be4);


export {$71fc0554b53eb1ce$export$88315cbbb14c4be4 as NotebookElement};
//# sourceMappingURL=main.js.map
