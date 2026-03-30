// @ts-nocheck
import { initialCodes } from './initialCodes';
import SomMark, { HTML, JSON as SomMarkJSON, MARKDOWN, MDX } from 'sommark';
import { compile } from '@mdx-js/mdx';
import { CustomEditor } from './Editor';
import { OutputPanel } from './OutputPanel';
import { CustomSelect } from './CustomSelect';
export type OutputFormat = 'html' | 'markdown' | 'mdx' | 'json' | 'text';

export interface PlaygroundState {
    codes: Record<OutputFormat, string>;
    format: OutputFormat;
    tokens: any[];
    ast: any;
    output: string;
    transpiled: string;
    error: string | null;
    errorType: 'sommark' | 'mdx' | null;
}

export type TabType = 'rendered' | 'debug' | 'ast' | 'tokens' | 'transpiled';

export interface PlaygroundOptions {
    initialFormat?: OutputFormat;
    initialCode?: string;
    onUpdate?: (state: PlaygroundState) => void;
    enabledTabs?: TabType[];
    hideHeader?: boolean;
    autoRun?: boolean;
}

export class SomMarkPlayground {
    private container: HTMLElement;
    private state: PlaygroundState;
    private onUpdate?: (state: PlaygroundState) => void;
    private lastUpdateId = 0;
    private debounceTimer: ReturnType<typeof setTimeout> | null = null;
    private static STORAGE_KEY = 'sm-playground-state';

    // Internal Components
    private editor!: CustomEditor;
    private outputPanel!: OutputPanel;
    private formatSelect!: CustomSelect;

    constructor(container: HTMLElement | string, options: PlaygroundOptions = {}) {
        const el = typeof container === 'string' ? document.querySelector(container) : container;
        if (!el) throw new Error(`Container ${container} not found`);
        this.container = el as HTMLElement;

        // 1. Initialize Default Codes
        const defaultCodes: Record<OutputFormat, string> = {
            html: initialCodes.html || '',
            markdown: initialCodes.markdown || '',
            mdx: initialCodes.mdx || '',
            json: initialCodes.json || '',
            text: initialCodes.text || ''
        };

        // 2. Load Persisted State
        const persisted = this.loadPersistedState(defaultCodes);
        const format = options.initialFormat || persisted.format || 'html';
        const codes = persisted.codes;

        // 3. Override with initialCode if provided (only for the initial format)
        if (options.initialCode) {
            codes[format] = options.initialCode;
        }

        this.state = {
            codes,
            format,
            tokens: [],
            ast: null,
            output: '',
            transpiled: '',
            error: null,
            errorType: null
        };

        this.onUpdate = options.onUpdate;
        this.initUI(options);
        this.initComponents(options);
        this.setupInternalEvents();

        // Initial run
        this.runUpdate();
    }

    private loadPersistedState(defaultCodes: Record<OutputFormat, string>): { codes: Record<OutputFormat, string>, format?: OutputFormat } {
        try {
            const saved = localStorage.getItem(SomMarkPlayground.STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                const mergedCodes = { ...defaultCodes };
                
                if (parsed.codes) {
                    for (const fmt of Object.keys(parsed.codes) as OutputFormat[]) {
                        const val = parsed.codes[fmt];
                        // If stored value is non-empty, use it; otherwise use default
                        if (val && val.trim().length > 0) {
                            mergedCodes[fmt] = val;
                        }
                    }
                }

                return {
                    codes: mergedCodes,
                    format: parsed.format
                };
            }
        } catch (e) {
            console.warn('Failed to load persisted state:', e);
        }
        return { codes: defaultCodes };
    }

    private persistState() {
        try {
            const toSave = {
                codes: this.state.codes,
                format: this.state.format
            };
            localStorage.setItem(SomMarkPlayground.STORAGE_KEY, JSON.stringify(toSave));
        } catch (e) {
            console.warn('Failed to persist state:', e);
        }
    }

    private initUI(options: PlaygroundOptions) {
        this.container.classList.add('sm-playground-root');

        const hideHeader = options.hideHeader ? 'sm-hidden' : '';

        this.container.innerHTML = `
            <header class="sm-header ${hideHeader}">
                <div class="sm-header-brand">
                    <img src="/sommark-icon.svg" alt="SomMark" class="sm-header-logo">
                    <a href="https://github.com/Adam-Elmi/SomMark" target="_blank" class="sm-github-link" title="View Source on GitHub">
                        <svg viewBox="0 0 16 16" width="30" height="30" aria-hidden="true">
                            <path fill="#dcf" d="M8 0C3.58 0 0 3.58 0 8c0 3.54 2.29 6.53 5.47 7.59.4.07.55-.17.55-.38 0-.19-.01-.82-.01-1.49-2.01.37-2.53-.49-2.69-.94-.09-.23-.48-.94-.82-1.13-.28-.15-.68-.52-.01-.53.63-.01 1.08.58 1.23.82.72 1.21 1.87.87 2.33.66.07-.52.28-.87.51-1.07-1.78-.2-3.64-.89-3.64-3.95 0-.87.31-1.59.82-2.15-.08-.2-.36-1.02.08-2.12 0 0 .67-.21 2.2.82.64-.18 1.32-.27 2-.27.68 0 1.36.09 2 .27 1.53-1.04 2.2-.82 2.2-.82.44 1.1.16 1.92.08 2.12.51.56.82 1.27.82 2.15 0 3.07-1.87 3.75-3.65 3.95.29.25.54.73.54 1.48 0 1.07-.01 1.93-.01 2.2 0 .21.15.46.55.38A8.013 8.013 0 0016 8c0-4.42-3.58-8-8-8z"></path>
                        </svg>
                    </a>
                </div>
                <div class="sm-controls">
                    <div class="sm-format-select-container"></div>
                    <button class="sm-reset-btn">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"></path>
                            <path d="M21 3v5h-5"></path>
                            <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16"></path>
                            <path d="M8 16H3v5"></path>
                        </svg>
                        <span>Reset</span>
                    </button>
                </div>
            </header>
            <div class="sm-mobile-view-switcher">
                <button class="view-btn active" data-view="editor">Editor</button>
                <button class="view-btn" data-view="output">Output</button>
            </div>
            <div class="sm-playground sm-show-editor">
                <div class="sm-pane sm-editor-pane">
                    <div class="sm-pane-header">Input (SomMark)</div>
                    <div class="sm-editor-container"></div>
                </div>
                <div class="sm-pane sm-output-pane">
                    <div class="sm-pane-header">Output</div>
                    <div class="sm-output-container"></div>
                </div>
            </div>
        `;
    }

    private initComponents(options: PlaygroundOptions) {
        const formatSelectContainer = this.container.querySelector('.sm-format-select-container') as HTMLElement;
        const editorContainer = this.container.querySelector('.sm-editor-container') as HTMLElement;
        const outputContainer = this.container.querySelector('.sm-output-container') as HTMLElement;

        this.outputPanel = new OutputPanel(outputContainer);
        if (options.enabledTabs) {
            this.outputPanel.setEnabledTabs(options.enabledTabs);
        }

        this.formatSelect = new CustomSelect(formatSelectContainer, [
            { label: 'HTML', value: 'html' },
            { label: 'Markdown', value: 'markdown' },
            { label: 'MDX', value: 'mdx' },
            { label: 'JSON', value: 'json', hideRendered: true },
            { label: 'Text', value: 'text', hideRendered: true }
        ], this.state.format);

        this.editor = new CustomEditor(editorContainer, {
            source: this.state.codes[this.state.format]
        });

        this.outputPanel.setRenderedTabVisible(!this.formatSelect.getSelectedOption()?.hideRendered);
    }

    private setupInternalEvents() {
        this.editor.onUpdate((values) => {
            this.setCode(values.source);
        });

        // Add backup save on page close
        window.addEventListener('beforeunload', () => this.persistState());

        this.formatSelect.onChange((newVal) => {
            const format = newVal as OutputFormat;
            this.setValues({ format });
            
            // Sync editor with the code for the newly selected format
            const codeForNewFormat = this.state.codes[format];
            this.editor.setValues({ source: codeForNewFormat });
            
            this.outputPanel.setRenderedTabVisible(!this.formatSelect.getSelectedOption()?.hideRendered);
            this.persistState(); // Persist format change
        });

        this.container.querySelector('.sm-reset-btn')?.addEventListener('click', () => {
            const fmt = this.state.format;
            if (confirm(`Reset ${fmt} code to initial?`)) {
                const initialCode = initialCodes[fmt] || initialCodes['html'];
                this.editor.setValues({ source: initialCode });
                this.setCode(initialCode);
                this.persistState(); // Persist reset
            }
        });

        // Mobile View Switcher
        const playground = this.container.querySelector('.sm-playground') as HTMLElement;
        const viewBtns = this.container.querySelectorAll('.view-btn');
        
        viewBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const view = (btn as HTMLElement).dataset.view;
                
                // Update buttons
                viewBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
                
                // Update playground
                if (view === 'editor') {
                    playground.classList.remove('sm-show-output');
                    playground.classList.add('sm-show-editor');
                } else {
                    playground.classList.remove('sm-show-editor');
                    playground.classList.add('sm-show-output');
                }
            });
        });
    }

    public static mount(container: HTMLElement | string, options: PlaygroundOptions = {}): SomMarkPlayground {
        return new SomMarkPlayground(container, options);
    }

    public async setValues(values: Partial<PlaygroundState>) {
        Object.assign(this.state, values);
        
        // If format changed, run immediately; otherwise debounce
        if (values.format) {
            if (this.debounceTimer) clearTimeout(this.debounceTimer);
            await this.runUpdate();
            this.persistState();
        } else {
            this.debouncedUpdate();
        }
    }

    public async setCode(code: string) {
        this.state.codes[this.state.format] = code;
        await this.setValues({}); // Trigger update with the new code in current format
        this.persistState(); // Persist code change
    }

    public async setFormat(format: OutputFormat) {
        await this.setValues({ format });
    }

    public getState(): PlaygroundState {
        return { ...this.state };
    }

    private debouncedUpdate() {
        if (this.debounceTimer) clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.runUpdate();
        }, 500);
    }

    private async runUpdate() {
        const updateId = ++this.lastUpdateId;
        const format = this.state.format;
        const source = this.state.codes[format];

        try {
            const engine = new SomMark({
                src: source,
                format: format,
                mapperFile: format === 'mdx' ? MDX : null,
                plugins: ['raw-content'],
                excludePlugins: ['module-system']
            });


            const transpiled = await engine.transpile(source);
            const tokens = await engine.lex(source);
            const ast = await engine.parse(source);

            if (updateId !== this.lastUpdateId) return;

            // Use temporary variables for the results to avoid partial state updates
            let cleanTranspiled = transpiled || '';
            if (format === 'mdx') {
                cleanTranspiled = cleanTranspiled
                    .replace(/&amp;/g, '&') // Keep only amp for potential legacy
                    .trim();
            }

            let finalOutput = '';
            let finalError: string | null = null;
            let finalErrorType: 'sommark' | 'mdx' | null = null;

            // MDX: compile transpiled output through @mdx-js/mdx
            if (format === 'mdx') {
                try {
                    const compiled = await compile(cleanTranspiled, {
                        outputFormat: 'program',
                        development: false,
                    });
                    finalOutput = String(compiled);
                } catch (mdxError: any) {
                    if (updateId !== this.lastUpdateId) return;
                    console.error('MDX Compilation Error:', mdxError);
                    let msg = mdxError.message || String(mdxError);
                    if (mdxError.line || mdxError.column) {
                        msg += ` (at line ${mdxError.line}, column ${mdxError.column})`;
                    }
                    finalError = msg;
                    finalErrorType = 'mdx';
                }
            } else {
                finalOutput = cleanTranspiled;
            }

            if (!finalError && format === 'json') {
                try {
                    finalOutput = JSON.stringify(JSON.parse(finalOutput), null, 2);
                } catch {
                    // Keep as is
                }
            }

            // Apply final results to state and UI ONLY if this is still the current update
            if (updateId === this.lastUpdateId) {
                this.state.tokens = tokens || [];
                this.state.ast = ast || null;
                this.state.transpiled = cleanTranspiled;
                this.state.output = finalOutput;
                this.state.error = finalError;
                this.state.errorType = finalErrorType;

                if (this.onUpdate) {
                    this.onUpdate(this.state);
                }

                // Update UI
                this.outputPanel.updateAll({
                    ...this.state,
                    html: this.state.error || (format === 'mdx' ? this.state.output : cleanTranspiled),
                    transpiledContent: cleanTranspiled,
                    errorType: this.state.errorType
                });
            }
        } catch (e: any) {
            if (updateId === this.lastUpdateId) {
                this.state.error = e.message || String(e);
                this.state.errorType = 'sommark';
                console.error('Playground Update Error:', e);

                if (this.onUpdate) {
                    this.onUpdate(this.state);
                }

                this.outputPanel.updateAll({
                    ...this.state,
                    html: this.state.error,
                    transpiled: this.state.transpiled,
                    errorType: this.state.errorType
                });
            }
        }
    }
}
