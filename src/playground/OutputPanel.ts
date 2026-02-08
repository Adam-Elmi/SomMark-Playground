// @ts-ignore
import { HTML } from 'sommark';
import { marked } from 'marked';
import hljs from 'highlight.js/lib/core';
import xml from 'highlight.js/lib/languages/xml';
import markdown from 'highlight.js/lib/languages/markdown';
import json from 'highlight.js/lib/languages/json';

hljs.registerLanguage('html', xml);
hljs.registerLanguage('markdown', markdown);
hljs.registerLanguage('json', json);

export class OutputPanel {
    private container: HTMLElement;
    private renderedFrame: HTMLIFrameElement;
    private transpiledEl: HTMLElement;
    private astEl: HTMLElement;
    private tokensEl: HTMLElement;

    constructor(elementId: string) {
        const el = document.getElementById(elementId);
        if (!el) throw new Error(`Element ${elementId} not found`);
        this.container = el;

        this.container.innerHTML = `
            <div class="tabs-container">
                <div class="tabs-header">
                    <button class="tab-btn active" data-tab="rendered">Rendered</button>
                    <button class="tab-btn" data-tab="output">Output</button>
                </div>
                
                <div id="rendered" class="tab-content active">
                    <iframe class="preview-frame"></iframe>
                </div>
                
                <div id="output" class="tab-content">
                    <div class="tabs-header sub-tabs">
                        <button class="tab-btn active" data-subtab="transpiled">Transpiled</button>
                        <button class="tab-btn" data-subtab="ast">AST</button>
                        <button class="tab-btn" data-subtab="tokens">Tokens</button>
                    </div>
                    <div id="transpiled" class="tab-content active"><div class="output-content"></div></div>
                    <div id="ast" class="tab-content"><div class="output-content"></div></div>
                    <div id="tokens" class="tab-content"><div class="output-content"></div></div>
                </div>
            </div>
        `;

        this.renderedFrame = this.container.querySelector('.preview-frame') as HTMLIFrameElement;
        this.transpiledEl = this.container.querySelector('#transpiled .output-content') as HTMLElement;
        this.astEl = this.container.querySelector('#ast .output-content') as HTMLElement;
        this.tokensEl = this.container.querySelector('#tokens .output-content') as HTMLElement;

        this.setupTabListeners();
    }

    private setupTabListeners() {
        const mainBtns = this.container.querySelectorAll('.tabs-header:not(.sub-tabs) .tab-btn');
        mainBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = (btn as HTMLElement).dataset.tab;
                this.switchMainTab(target!);
            });
        });

        const subBtns = this.container.querySelectorAll('.sub-tabs .tab-btn');
        subBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const target = (btn as HTMLElement).dataset.subtab;
                this.switchSubTab(target!);
            });
        });
    }

    private switchMainTab(tabId: string) {
        this.container.querySelectorAll('.tabs-header:not(.sub-tabs) .tab-btn').forEach(b => b.classList.remove('active'));
        this.container.querySelector(`[data-tab="${tabId}"]`)?.classList.add('active');

        const mainContents = this.container.querySelectorAll('.tabs-container > .tab-content');
        mainContents.forEach(c => c.classList.remove('active'));
        this.container.querySelector(`#${tabId}`)?.classList.add('active');
    }

    private switchSubTab(tabId: string) {
        this.container.querySelectorAll('.sub-tabs .tab-btn').forEach(b => b.classList.remove('active'));
        this.container.querySelector(`[data-subtab="${tabId}"]`)?.classList.add('active');

        const subContents = this.container.querySelectorAll('#output > .tab-content');
        subContents.forEach(c => c.classList.remove('active'));
        this.container.querySelector(`#${tabId}`)?.classList.add('active');
    }

    public setRenderedTabVisible(visible: boolean) {
        const renderedBtn = this.container.querySelector('[data-tab="rendered"]') as HTMLElement;
        if (!renderedBtn) return;

        if (visible) {
            renderedBtn.style.display = '';
        } else {
            renderedBtn.style.display = 'none';
            if (renderedBtn.classList.contains('active')) {
                this.switchMainTab('output');
            }
        }
    }

    public async updateAll(data: { html: string, ast: any, tokens: any, format: string }) {
        const doc = this.renderedFrame.contentDocument;
        if (doc) {
            doc.open();

            let contentToRender = data.html;

            if (data.ast && data.ast.error) {
                contentToRender = `
                    <style>
                        @font-face {
                          font-family: 'JetBrains Mono';
                          src: url('/fonts/JetBrainsMono-Regular.ttf') format('truetype');
                          font-weight: 400;
                          font-style: normal;
                        }
                        
                        body {
                            background-color: transparent;
                            margin: 0;
                            padding: 20px;
                            font-family: 'JetBrains Mono', monospace;
                        }

                        .error-container {
                            background: #101014;
                            border: 1px solid rgba(255, 255, 255, 0.08);
                            border-left: 3px solid #e03131;
                            color: #e0e0e0; 
                            padding: 16px;
                            font-family: 'JetBrains Mono', monospace;
                            white-space: pre-wrap;
                            word-break: break-word;
                            overflow-wrap: break-word;
                            border-radius: 8px;
                            font-size: 13px;
                            box-shadow: 0 4px 16px rgba(0, 0, 0, 0.4);
                            line-height: 1.5;
                        }
                    </style>
                    ${contentToRender}
                 `;
            } else if (data.format === 'markdown' || data.format === 'mdx') {
                try {
                    contentToRender = await marked.parse(data.html);

                    contentToRender = `
                        <style>
                            body { font-family: sans-serif; line-height: 1.6; padding: 20px; color: #333; }
                            h1, h2, h3 { color: #111; }
                            pre { background: #f4f4f4; padding: 10px; border-radius: 5px; overflow-x: auto; }
                            code { background: #f4f4f4; padding: 2px 4px; border-radius: 3px; font-family: monospace; }
                            blockquote { border-left: 4px solid #ccc; margin: 0; padding-left: 10px; color: #666; }
                        </style>
                        ${contentToRender}
                     `;
                } catch (e) {
                    contentToRender = `<div style="color:red">Error rendering markdown: ${e}</div>`;
                }
            } else if (data.format === 'text') {
                contentToRender = `
                    <style>
                        body { font-family: monospace; white-space: pre-wrap; padding: 20px; color: #333; background: #fff; }
                    </style>
                    ${this.escapeHtml(data.html)}
                 `;
            }

            doc.write(contentToRender);
            doc.close();
        }

        let outputContent = data.html;
        let highlightLang = 'html';

        if (data.format === 'markdown' || data.format === 'mdx') {
            highlightLang = 'markdown';
        } else if (data.format === 'text') {
            highlightLang = 'plaintext';
        }

        if (data.ast && data.ast.error) {
            this.transpiledEl.innerHTML = data.html;
        } else {
            this.transpiledEl.innerHTML = this.highlight(outputContent, highlightLang);
        }

        this.astEl.innerHTML = this.highlight(JSON.stringify(data.ast, null, 2), 'json');

        this.tokensEl.innerHTML = this.highlight(JSON.stringify(data.tokens, null, 2), 'json');
    }

    private highlight(code: string, language: string): string {
        try {
            return hljs.highlight(code, { language }).value;
        } catch (e) {
            return this.escapeHtml(code);
        }
    }

    private escapeHtml(text: string): string {
        return text
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }
}
