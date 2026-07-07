import {EditorView as $TDEgv$EditorView, basicSetup as $TDEgv$basicSetup} from "codemirror";
import {Compartment as $TDEgv$Compartment, EditorState as $TDEgv$EditorState, Prec as $TDEgv$Prec} from "@codemirror/state";
import {keymap as $TDEgv$keymap, placeholder as $TDEgv$placeholder, EditorView as $TDEgv$EditorView1} from "@codemirror/view";
import {javascript as $TDEgv$javascript} from "@codemirror/lang-javascript";
import {indentWithTab as $TDEgv$indentWithTab, insertNewline as $TDEgv$insertNewline, history as $TDEgv$history} from "@codemirror/commands";
import {syntaxTree as $TDEgv$syntaxTree} from "@codemirror/language";
import {markdown as $TDEgv$markdown} from "@codemirror/lang-markdown";
import {linkPlugin as $TDEgv$linkPlugin, imageField as $TDEgv$imageField, codeBlockField as $TDEgv$codeBlockField, collapseOnSelectionFacet as $TDEgv$collapseOnSelectionFacet, mouseSelectingField as $TDEgv$mouseSelectingField, tableField as $TDEgv$tableField, tableEditorPlugin as $TDEgv$tableEditorPlugin, editorTheme as $TDEgv$editorTheme, livePreviewPlugin as $TDEgv$livePreviewPlugin, markdownStylePlugin as $TDEgv$markdownStylePlugin, mathPlugin as $TDEgv$mathPlugin, blockMathField as $TDEgv$blockMathField, setMouseSelecting as $TDEgv$setMouseSelecting} from "codemirror-live-markdown";
import {transpileModule as $TDEgv$transpileModule, ModuleKind as $TDEgv$ModuleKind} from "typescript";






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








let $dd4ad8f3f241100e$var$tabSize = new (0, $TDEgv$Compartment)();
class $dd4ad8f3f241100e$export$7910644ddd3b55c3 extends HTMLElement {
    //#region public properties
    view;
    qs;
    qsa;
    ready;
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
        this.qsa = this.shadowRoot.querySelector.bind(this.shadowRoot);
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
    //#region public methods
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
        });
    }
    static fromString(str) {
        const obj = JSON.parse(str);
        const cell = $dd4ad8f3f241100e$export$7910644ddd3b55c3.fromJSON(obj);
        return cell;
    }
    fromString(str) {
        const obj = JSON.parse(str);
        this.fromJSON(obj);
    }
    disconnectedCallback() {
        this.view.destroy();
    }
    //#endregion
    //#region private methods
    setupCodeMirror() {
        const clickableLinks = (0, $TDEgv$EditorView1).domEventHandlers({
            mousedown (event, view) {
                if (!(event.ctrlKey || event.metaKey)) return;
                let pos = view.posAtCoords({
                    x: event.clientX,
                    y: event.clientY
                });
                if (pos === null) return;
                let node = (0, $TDEgv$syntaxTree)(view.state).resolveInner(pos, 1);
                if (node.name === "URL" || node.name === "Link") {
                    let url = view.state.doc.sliceString(node.from, node.to);
                    window.open(url, '_blank');
                    return true;
                }
            }
        });
        this.view = new (0, $TDEgv$EditorView1)({
            state: (0, $TDEgv$EditorState).create({
                doc: '',
                extensions: [
                    (0, $TDEgv$markdown)(),
                    (0, $TDEgv$Prec).highest((0, $TDEgv$keymap).of([
                        {
                            key: "Enter",
                            run: (0, $TDEgv$insertNewline)
                        }
                    ])),
                    (0, $TDEgv$keymap).of([
                        (0, $TDEgv$indentWithTab)
                    ]),
                    (0, $TDEgv$linkPlugin)(),
                    (0, $TDEgv$imageField)(),
                    (0, $TDEgv$codeBlockField)(),
                    (0, $TDEgv$collapseOnSelectionFacet).of(true),
                    (0, $TDEgv$mouseSelectingField),
                    $dd4ad8f3f241100e$var$tabSize.of((0, $TDEgv$EditorState).tabSize.of(2)),
                    clickableLinks,
                    (0, $TDEgv$tableField),
                    (0, $TDEgv$tableEditorPlugin)(),
                    (0, $TDEgv$editorTheme),
                    (0, $TDEgv$EditorView1).lineWrapping,
                    (0, $TDEgv$EditorView1).theme({
                        "&.cm-focused": {
                            outline: "none"
                        }
                    }),
                    (0, $TDEgv$livePreviewPlugin),
                    (0, $TDEgv$markdownStylePlugin),
                    (0, $TDEgv$placeholder)("Write here..."),
                    (0, $TDEgv$history)(),
                    (0, $TDEgv$mathPlugin).extension,
                    (0, $TDEgv$blockMathField)
                ]
            }),
            parent: this.qs('.cell-editor')
        });
        this.view.contentDOM.addEventListener('mouseDown', (e)=>{
            this.view.dispatch({
                effects: (0, $TDEgv$setMouseSelecting).of(true)
            });
        });
        document.addEventListener('mouseup', ()=>{
            requestAnimationFrame(()=>{
                this.view.dispatch({
                    effects: (0, $TDEgv$setMouseSelecting).of(false)
                });
            });
        });
        this.view.focus();
    }
}








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
            await this.fetchStyle();
            await this.fetchTemplate();
            this.qs('.title').addEventListener('blur', (e)=>this.title = e.target.innerText);
            resolve(true);
        });
    }
    async fetchStyle() {
        const sheet = new CSSStyleSheet();
        const file = await fetch(new URL("notebook.123b0013.css", import.meta.url));
        const css = await file.text();
        sheet.replaceSync(css);
        this.shadowRoot.adoptedStyleSheets = [
            sheet
        ];
    }
    async fetchTemplate() {
        const file = await fetch(new URL("notebook.e3579e84.html", import.meta.url));
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


export {$71fc0554b53eb1ce$export$88315cbbb14c4be4 as NotebookElement};
//# sourceMappingURL=main.js.map
