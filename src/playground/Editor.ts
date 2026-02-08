// @ts-ignore
import { lex } from 'sommark';
import { CodeJar } from 'codejar';

export class CustomEditor {
    private container: HTMLElement;
    private editorEl: HTMLElement;
    private jar: any;
    private onInputCallback: ((code: string) => void) | null = null;

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

    constructor(elementId: string) {
        const el = document.getElementById(elementId);
        if (!el) throw new Error(`Element ${elementId} not found`);
        this.container = el;

        this.container.innerHTML = `
            <div class="editor-element" spellcheck="false"></div>
        `;

        this.editorEl = this.container.querySelector('.editor-element') as HTMLElement;

        this.jar = CodeJar(this.editorEl, (editor: HTMLElement) => {
            const text = editor.textContent || "";
            editor.innerHTML = this.highlight(text);
        }, {
            tab: '  ',
            addClosing: false
        });

        this.setupEvents();
    }

    private setupEvents() {
        this.jar.onUpdate((code: string) => {
            if (this.onInputCallback) {
                this.onInputCallback(code);
            }
        });
    }

    public setValue(code: string) {
        this.jar.updateCode(code);
    }

    public getValue(): string {
        return this.jar.toString();
    }

    public onInput(callback: (code: string) => void) {
        this.onInputCallback = callback;
    }

    private highlight(text: string): string {
        try {
            const tokens = lex(text);
            if (!tokens || tokens.length === 0) {
                return this.escapeHtml(text);
            }

            const lines = text.split('\n');
            let html = '';
            let currentLine = 1;
            let currentCol = 1;

            for (const t of tokens) {
                const newlineCount = (t.value.match(/\n/g) || []).length;
                const tokenStartLine = t.line - newlineCount;

                while (currentLine < tokenStartLine || (currentLine === tokenStartLine && currentCol < t.start)) {
                    if (currentLine < tokenStartLine) {
                        const lineText = lines[currentLine - 1];
                        html += this.escapeHtml(lineText.substring(currentCol - 1)) + '\n';
                        currentLine++;
                        currentCol = 1;
                    } else {
                        const lineText = lines[currentLine - 1];
                        html += this.escapeHtml(lineText.substring(currentCol - 1, t.start - 1));
                        currentCol = t.start;
                    }
                }

                const className = CustomEditor.TOKEN_MAP[t.type] || '';
                const safeValue = this.escapeHtml(t.value);
                if (className) {
                    html += `<span class="${className}">${safeValue}</span>`;
                } else {
                    html += safeValue;
                }

                const valueLines = t.value.split('\n');
                if (valueLines.length > 1) {
                    currentLine += valueLines.length - 1;
                    currentCol = valueLines[valueLines.length - 1].length + 1;
                } else {
                    currentCol += t.value.length;
                }
            }

            while (currentLine <= lines.length) {
                const lineText = lines[currentLine - 1];
                html += this.escapeHtml(lineText.substring(currentCol - 1));
                if (currentLine < lines.length) {
                    html += '\n';
                }
                currentLine++;
                currentCol = 1;
            }

            return html;

        } catch (e) {
            console.error('Lex Error:', e);
            return this.escapeHtml(text);
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
