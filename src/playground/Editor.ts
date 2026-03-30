// @ts-nocheck
import './prism-init';
import 'prismjs/components/prism-markdown';
import 'prismjs/components/prism-json';
import 'prismjs/components/prism-jsx';
import 'prismjs/components/prism-tsx';
import 'prismjs/components/prism-css';
import 'prismjs/components/prism-lua';
import 'prismjs/components/prism-javascript';
import 'prismjs/components/prism-typescript';
import 'prismjs/themes/prism-tomorrow.css';
import Prism from 'prismjs';
import { CodeJar } from 'codejar';
import { lexSync } from 'sommark';

export class CustomEditor {
    private container: HTMLElement;
    private editorEl: HTMLElement;
    private jar: any;
    private onUpdateCallback: ((values: { source: string }) => void) | null = null;

    private static TOKEN_MAP: { [key: string]: string } = {
        'OPEN_BRACKET': 'token-operator',
        'CLOSE_BRACKET': 'token-operator',
        'END_KEYWORD': 'token-keyword',
        'IDENTIFIER': 'token-identifier',
        'EQUAL': 'token-operator',
        'VALUE': 'token-value',
        'TEXT': 'token-text',
        'THIN_ARROW': 'token-operator',
        'OPEN_PAREN': 'token-operator',
        'CLOSE_PAREN': 'token-operator',
        'OPEN_AT': 'token-operator',
        'CLOSE_AT': 'token-operator',
        'COLON': 'token-operator',
        'COMMA': 'token-operator',
        'SEMICOLON': 'token-operator',
        'COMMENT': 'token-comment',
        'ESCAPE': 'token-operator'
    };

    private static CODE_LANG_MAP: { [key: string]: string } = {
        'mdx': 'jsx',
        'style': 'css',
        'Style': 'css',
        'script': 'typescript',
        'Script': 'typescript',
        'Code': 'auto',
    };

    constructor(container: HTMLElement | string, options: { source: string }) {
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) throw new Error(`Container ${container} not found`);
        this.container = el as HTMLElement;

        this.container.innerHTML = `
            <div class="sm-editor-element" spellcheck="false" contenteditable="true"></div>
        `;

        this.editorEl = this.container.querySelector('.sm-editor-element') as HTMLElement;

        this.jar = CodeJar(this.editorEl, (editor: HTMLElement) => {
            const text = editor.textContent || "";
            editor.innerHTML = this.highlight(text);
        }, {
            tab: '  ',
            addClosing: false
        });

        if (options.source) {
            this.jar.updateCode(options.source);
        }

        this.setupEvents();
    }

    private setupEvents() {
        this.jar.onUpdate((code: string) => {
            if (this.onUpdateCallback) {
                this.onUpdateCallback({ source: code });
            }
        });
    }

    private highlight(text: string): string {
        try {
            // Use lexSync on original text to ensure token-to-source alignment
            const tokens = lexSync(text);
            return this.renderTokens(tokens, text);
        } catch (e) {
            console.error("Highlight Error:", e);
            return this.escapeHtml(text);
        }
    }

    public setValues(values: { source: string }) {
        this.jar.updateCode(values.source);
    }

    public getValue(): string {
        return this.jar.toString();
    }

    public onUpdate(callback: (values: { source: string }) => void) {
        this.onUpdateCallback = callback;
    }

    private renderTokens(tokens: any[], text: string): string {
        const lines = text.split('\n');
        let html = '';
        let currentPos = 0;
        let activeLang: string | null = null;
        let isInsideAtBlock = false;

        // Filter and sort tokens by start position to handle overlaps or gaps
        const sortedTokens = tokens
            .filter(t => t.type !== 'EOF' && t.range)
            .sort((a, b) => {
                const startA = this.getAbsolutePos(a.range.start, lines);
                const startB = this.getAbsolutePos(b.range.start, lines);
                return startA - startB;
            });

        for (let i = 0; i < sortedTokens.length; i++) {
            const t = sortedTokens[i];
            const prevT = i > 0 ? sortedTokens[i - 1] : null;
            const start = this.getAbsolutePos(t.range.start, lines);
            const end = this.getAbsolutePos(t.range.end, lines);

            // Fill gap with raw text from original source
            if (start > currentPos) {
                html += this.escapeHtml(text.substring(currentPos, start));
            }

            const tokenValue = text.substring(start, end);
            let className = CustomEditor.TOKEN_MAP[t.type] || '';

            if (t.type === 'OPEN_AT') {
                isInsideAtBlock = true;
            }

            if (t.type === 'IDENTIFIER') {
                const isTagName = prevT && (
                    prevT.type === 'OPEN_BRACKET' ||
                    prevT.type === 'OPEN_PAREN' ||
                    prevT.type === 'OPEN_AT'
                );

                if (isTagName) {
                    className = 'token-tag-name';
                    // Check if this AtBlock identifier specifies a language
                    if (prevT.type === 'OPEN_AT') {
                        if (tokenValue === 'end' || tokenValue === 'end_block') {
                            activeLang = null;
                        } else {
                            activeLang = CustomEditor.CODE_LANG_MAP[tokenValue] || null;
                        }
                    }
                } else {
                    className = 'token-attr-name';
                }

                // Special case for @_Code_: language; or @_Code_@: language; (Header-level)
                if ((tokenValue === 'Code' || tokenValue === 'Code_') && prevT && prevT.type === 'OPEN_AT') {
                    // Peek ahead for the language argument
                    // Header could be: @_Code: js;  OR  @_Code_@: js;
                    let nextTIdx = i + 1;
                    let nextT = (nextTIdx < sortedTokens.length) ? sortedTokens[nextTIdx] : null;
                    
                    if (nextT && nextT.type === 'CLOSE_AT') {
                        nextTIdx++;
                        nextT = (nextTIdx < sortedTokens.length) ? sortedTokens[nextTIdx] : null;
                    }

                    if (nextT && (nextT.type === 'COLON' || nextT.type === 'EQUAL')) {
                        let langToken = (nextTIdx + 1 < sortedTokens.length) ? sortedTokens[nextTIdx + 1] : null;
                        if (langToken && (langToken.type === 'VALUE' || langToken.type === 'IDENTIFIER')) {
                            const lStart = this.getAbsolutePos(langToken.range.start, lines);
                            const lEnd = this.getAbsolutePos(langToken.range.end, lines);
                            let detected = text.substring(lStart, lEnd).trim();
                            // Normalize
                            if (detected === 'js') detected = 'javascript';
                            if (detected === 'ts') detected = 'typescript';
                            activeLang = detected;
                        }
                    }
                }
            } else if (t.type === 'VALUE') {
                const isQuoted = tokenValue.startsWith('"') || tokenValue.startsWith("'");
                const isNumOrBool = /^(true|false|[0-9]+(\.[0-9]+)?)$/.test(tokenValue);
                if (isQuoted) {
                    className = 'token-string-quoted';
                } else if (isNumOrBool) {
                    className = 'token-value-primitive';
                } else {
                    className = 'token-string-unquoted';
                }
            } else if (t.type === 'TEXT') {
                // If we are in a 'auto' detection state, look for ': language;' prefix at start of body
                if (activeLang === 'auto' && tokenValue.trim().startsWith(':')) {
                    const match = tokenValue.match(/^\s*:\s*([a-zA-Z0-9]+)\s*;/);
                    if (match) {
                        let detected = match[1];
                        if (detected === 'js') detected = 'javascript';
                        if (detected === 'ts') detected = 'typescript';
                        activeLang = detected;
                    }
                }

                if (activeLang && activeLang !== 'auto' && Prism.languages[activeLang]) {
                    // APPLY PRISMJS HIGHLIGHTING TO ATBLOCK BODY
                    const code = tokenValue;
                    const highlighted = Prism.highlight(code, Prism.languages[activeLang], activeLang);
                    html += `<span class="token-code-block">${highlighted}</span>`;
                    currentPos = end;
                    continue;
                } else {
                    className = 'token-text-value';
                }
            }

            const safeValue = this.escapeHtml(tokenValue);
            if (className) {
                html += `<span class="${className}">${safeValue}</span>`;
            } else {
                html += safeValue;
            }
            currentPos = end;
        }

        // Fill remaining text
        if (currentPos < text.length) {
            html += this.escapeHtml(text.substring(currentPos));
        }

        return html;
    }

    private getAbsolutePos(pos: { line: number, character: number }, lines: string[]): number {
        let abs = 0;
        for (let i = 0; i < pos.line && i < lines.length; i++) {
            abs += lines[i].length + 1; // +1 for the \n delimiter
        }
        abs += pos.character;
        return abs;
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

