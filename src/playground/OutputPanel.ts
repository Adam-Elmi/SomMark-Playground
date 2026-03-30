import './prism-init';
import Prism from "prismjs";
import "prismjs/components/prism-markdown";
import "prismjs/components/prism-json";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";
import "prismjs/components/prism-typescript";
import "prismjs/themes/prism-tomorrow.css";
import { marked } from 'marked';
import { TabType } from "./SomMarkPlayground";

export class OutputPanel {
  private container: HTMLElement;
  private renderedFrame: HTMLIFrameElement;
  private transpiledEl: HTMLElement;
  private astEl: HTMLElement;
  private tokensEl: HTMLElement;
  private updateSequence: number = 0;

  private mdxReady = false;
  private mdxInitializing = false;
  private mdxPending: string | null = null;
  private lastMdxJs: string | null = null;

  private enabledTabs: TabType[] = ['rendered', 'debug', 'ast', 'tokens', 'transpiled'];

  constructor(container: HTMLElement | string) {
    const el = typeof container === 'string' ? document.querySelector(container) : container;
    if (!el) throw new Error(`Element ${container} not found`);
    this.container = el as HTMLElement;

    this.container.innerHTML = `
            <div class="sm-tabs-container">
                <div class="sm-tabs-header">
                    <button class="sm-tab-btn sm-active" data-tab="rendered">Rendered</button>
                    <button class="sm-tab-btn" data-tab="debug">Debug</button>
                </div>

                <!-- 1. Rendered Tab -->
                <div id="rendered" class="sm-tab-content sm-active">
                    <iframe class="sm-preview-frame"></iframe>
                </div>

                <!-- 2. Debug Tab (Nested Sub-tabs) -->
                <div id="debug" class="sm-tab-content">
                    <div class="sm-tabs-header sm-sub-tabs">
                        <button class="sm-tab-btn sm-active" data-subtab="transpiled">Transpiled</button>
                        <button class="sm-tab-btn" data-subtab="ast">AST</button>
                        <button class="sm-tab-btn" data-subtab="tokens">Tokens</button>
                    </div>
                    <div id="transpiled" class="sm-tab-content sm-active"><pre class="sm-output-content"></pre></div>
                    <div id="ast" class="sm-tab-content"><pre class="sm-output-content"></pre></div>
                    <div id="tokens" class="sm-tab-content"><pre class="sm-output-content"></pre></div>
                </div>
            </div>
        `;

    this.renderedFrame = this.container.querySelector(
      ".sm-preview-frame",
    ) as HTMLIFrameElement;
    this.transpiledEl = this.container.querySelector(
      "#transpiled .sm-output-content",
    ) as HTMLElement;
    this.astEl = this.container.querySelector(
      "#ast .sm-output-content",
    ) as HTMLElement;
    this.tokensEl = this.container.querySelector(
      "#tokens .sm-output-content",
    ) as HTMLElement;

    this.setupTabListeners();

    // Listen for 'ready' from MDX iframe
    window.addEventListener('message', (e) => {
      if (e.data?.type === 'mdx-ready') {
        this.mdxReady = true;
        this.mdxInitializing = false;
        if (this.mdxPending !== null) {
          try {
            const msg = typeof this.mdxPending === 'string' && this.mdxPending.startsWith('{') 
              ? JSON.parse(this.mdxPending) 
              : { type: 'mdx-update', js: this.mdxPending, sequence: this.updateSequence };
            this.renderedFrame.contentWindow?.postMessage(msg, '*');
          } catch {
            this.renderedFrame.contentWindow?.postMessage({ type: 'mdx-update', js: this.mdxPending, sequence: this.updateSequence }, '*');
          }
          this.mdxPending = null;
        }
      }
    });
  }

  private setupTabListeners() {
    this.container.addEventListener('click', (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const btn = target.closest('.sm-tab-btn') as HTMLElement;
      if (!btn) return;

      const mainTab = btn.dataset.tab;
      const subTab = btn.dataset.subtab;

      if (mainTab) {
        this.switchMainTab(mainTab);
      } else if (subTab) {
        this.switchSubTab(subTab);
      }
    });
  }

  private switchMainTab(tabId: string) {
    this.container
      .querySelectorAll(".sm-tabs-header:not(.sm-sub-tabs) > .sm-tab-btn")
      .forEach((b) => b.classList.remove("sm-active"));
    this.container
      .querySelector(`[data-tab="${tabId}"]`)
      ?.classList.add("sm-active");

    const mainContents = this.container.querySelectorAll(
      ".sm-tabs-container > .sm-tab-content",
    );
    mainContents.forEach((c) => c.classList.remove("sm-active"));
    this.container.querySelector(`#${tabId}`)?.classList.add("sm-active");
  }

  private switchSubTab(tabId: string) {
    this.container
      .querySelectorAll(".sm-sub-tabs .sm-tab-btn")
      .forEach((b) => b.classList.remove("sm-active"));
    this.container
      .querySelector(`[data-subtab="${tabId}"]`)
      ?.classList.add("sm-active");

    const subContents = this.container.querySelectorAll(
      "#debug > .sm-tab-content",
    );
    subContents.forEach((c) => c.classList.remove("sm-active"));
    this.container.querySelector(`#${tabId}`)?.classList.add("sm-active");
  }

  public setEnabledTabs(tabs: TabType[]) {
    this.enabledTabs = tabs;
    this.renderTabs();
  }

  private renderTabs() {
    const tabButtons = this.container.querySelectorAll('.sm-tab-btn');
    tabButtons.forEach(btn => {
      const b = btn as HTMLElement;
      const tab = (b.dataset.tab || b.dataset.subtab) as TabType;

      // Special case: if a sub-tab is enabled, its parent 'debug' tab must also be visible
      let isVisible = this.enabledTabs.includes(tab);
      if (tab === 'debug') {
        isVisible = this.enabledTabs.includes('debug') ||
          this.enabledTabs.includes('transpiled') ||
          this.enabledTabs.includes('ast') ||
          this.enabledTabs.includes('tokens');
      }

      if (isVisible) {
        btn.classList.remove('sm-hidden');
      } else {
        btn.classList.add('sm-hidden');
      }
    });

    // If active tab is hidden, switch to first visible
    const activeTab = this.container.querySelector('.sm-tab-btn.sm-active') as HTMLElement;
    if (activeTab && activeTab.classList.contains('sm-hidden')) {
      const firstVisible = this.container.querySelector('.sm-tab-btn:not(.sm-hidden)') as HTMLElement;
      if (firstVisible) firstVisible.click();
    }
  }

  public setRenderedTabVisible(visible: boolean) {
    const renderedBtn = this.container.querySelector(
      '[data-tab="rendered"]',
    ) as HTMLElement;
    if (!renderedBtn) return;

    if (visible) {
      renderedBtn.style.display = "";
    } else {
      renderedBtn.style.display = "none";
      if (renderedBtn.classList.contains("sm-active")) {
        this.switchMainTab("debug");
      }
    }
  }

  public async updateAll(data: {
    html: string;
    ast: any;
    tokens: any[];
    format: string;
    transpiled?: string;
    error?: string | null;
    errorType?: 'sommark' | 'mdx' | null;
  }) {
    this.updateSequence++;
    const doc = this.renderedFrame.contentDocument;

    if (doc) {
      if (data.error) {
        const errorType = data.errorType || (data.format === 'mdx' ? 'mdx' : 'sommark');
        const errorTitle = errorType === 'mdx' ? 'MDX Compilation Error' : 'SomMark Transpiler Error';

        if (data.format === 'mdx' && (this.mdxReady || this.mdxInitializing)) {
          // If bootstrapper is alive or loading, send the error via message
          const msg = { type: 'mdx-error', error: data.error, sequence: this.updateSequence };
          this.lastMdxJs = null; // Important: reset cache so next success always triggers
          if (this.mdxReady) {
            this.renderedFrame.contentWindow?.postMessage(msg, '*');
          } else {
            this.mdxPending = JSON.stringify(msg);
          }
        } else {
          // Show static error card only for non-MDX formats OR if MDX bootstrapper hasn't started yet
          if (data.format === 'mdx') {
            this.mdxReady = false;
            this.mdxInitializing = false;
          }
          this.lastMdxJs = null;
          this.mdxPending = null;

          doc.open();
          doc.write(`<!DOCTYPE html>
                      <html>
                      <head>
                      <style>
                           @font-face {
                                font-family: 'JetBrains Mono';
                                src: url('${window.location.origin}${window.location.pathname.replace(/\/$/, '')}/fonts/JetBrainsMono-Regular.ttf') format('truetype');
                                font-weight: normal; font-style: normal;
                           }
                           body { background: #0f0f12; color: #ff5555; font-family: 'JetBrains Mono', monospace; padding: 20px; margin: 0; display: flex; align-items: flex-start; justify-content: center; min-height: 100vh; }
                           .error-container { 
                               background: rgba(255, 85, 85, 0.05); 
                               border: 1px solid rgba(255, 85, 85, 0.2);
                               border-left: 4px solid #ff5555; 
                               padding: 24px; 
                               border-radius: 12px; 
                               box-shadow: 0 10px 30px rgba(0,0,0,0.3); 
                               width: 100%;
                               max-width: 600px;
                               margin-top: 20px;
                           }
                           .error-header { 
                               font-weight: bold; margin-bottom: 12px; font-size: 0.85rem; color: #ff5555; 
                               text-transform: uppercase; letter-spacing: 1px;
                               display: flex; align-items: center;
                           }
                           .error-message { 
                               font-size: 0.95rem; white-space: pre-wrap; word-break: break-word; 
                               line-height: 1.6; color: rgba(255, 255, 255, 0.9); 
                           }
                      </style>
                      </head>
                      <body>
                          <div class="error-container">
                              <div class="error-header">${errorTitle}</div>
                              <div class="error-message">${this.escapeHtml(data.error)}</div>
                          </div>
                      </body>
                      </html>`);
          doc.close();
        }
      } else if (data.format === "mdx") {
        if (!this.mdxReady && !this.mdxInitializing) {
          // Initialize MDX iframe once — only on the very first call
          this.mdxInitializing = true;
          doc.open();
          doc.write(`<!DOCTYPE html>
                    <html>
                    <head>
                    <style>
                        @font-face {
                            font-family: 'JetBrains Mono';
                            src: url('${window.location.origin}${window.location.pathname.replace(/\/$/, '')}/fonts/JetBrainsMono-Regular.ttf') format('truetype');
                            font-weight: normal; font-style: normal;
                        }
                        @font-face {
                            font-family: 'JetBrains Mono';
                            src: url('${window.location.origin}${window.location.pathname.replace(/\/$/, '')}/fonts/JetBrainsMono-Bold.ttf') format('truetype');
                            font-weight: bold; font-style: normal;
                        }
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; line-height: 1.6; padding: 20px; color: #333; background: #fff; margin: 0; }
                        .error-container { 
                            background: #0f0f12; 
                            border: 1px solid rgba(255, 85, 85, 0.2);
                            border-left: 4px solid #ff5555; 
                            padding: 24px; 
                            border-radius: 12px; 
                            box-shadow: 0 10px 30px rgba(0,0,0,0.5); 
                            margin: 20px 0;
                            font-family: 'JetBrains Mono', monospace;
                        }
                        .error-header { 
                            font-weight: bold; margin-bottom: 12px; font-size: 0.85rem; color: #ff5555; 
                            text-transform: uppercase; letter-spacing: 1px;
                            display: flex; align-items: center;
                        }
                        .error-message { 
                            font-size: 0.95rem; white-space: pre-wrap; word-break: break-word; 
                            line-height: 1.6; color: rgba(255, 255, 255, 0.9); 
                        }
                    </style>
                    <script type="importmap">
                    {
                        "imports": {
                            "react": "https://esm.sh/react@19?dev",
                            "react-dom": "https://esm.sh/react-dom@19?dev",
                            "react-dom/client": "https://esm.sh/react-dom@19/client?dev",
                            "react/jsx-runtime": "https://esm.sh/react@19/jsx-runtime?dev",
                            "@mdx-js/react": "https://esm.sh/@mdx-js/react@3?dev"
                        }
                    }
                    </script>
                    </head>
                    <body>
                        <div id="mdx-root"></div>
                        <div id="mdx-errors"></div>
                        <script type="module">
                            import React from 'react';
                            import { createRoot } from 'react-dom/client';
                            import { MDXProvider } from '@mdx-js/react';

                            const rootEl = document.getElementById('mdx-root');
                            const errorsEl = document.getElementById('mdx-errors');
                            
                            const showError = (html) => {
                                rootEl.style.display = 'none';
                                errorsEl.style.display = 'block';
                                errorsEl.innerHTML = html;
                            };

                            const hideError = () => {
                                rootEl.style.display = 'block';
                                errorsEl.style.display = 'none';
                                errorsEl.innerHTML = '';
                            };

                            // Industry-standard Warning Overlay (similar to Next.js / Vite / CRA)
                            // React validation warnings (unrecognized tags, nesting) are only emitted via console.error.
                            const originalConsoleError = console.error;
                            console.error = (...args) => {
                                // Always call the original console.error so it shows in DevTools
                                originalConsoleError.apply(console, args);

                                // If this is a React warning (typically format strings with %s)
                                if (typeof args[0] === 'string' && args[0].includes('Warning:')) {
                                    let msg = args[0];
                                    let i = 1;
                                    // Replace printf-style placeholders with actual values
                                    msg = msg.replace(/%[sodf]/g, (match) => {
                                        if (i < args.length) return String(args[i++]);
                                        return match;
                                    });
                                    addWarning(msg);
                                }
                            };

                            // Formal React 19 approach to catch recoverable errors (like hydration mismatches)
                            const root = createRoot(rootEl, {
                                onRecoverableError: (error) => {
                                    addWarning(typeof error === 'string' ? error : (error.message || String(error)));
                                }
                            });

                            const knownWarnings = new Set();
                            function addWarning(msg) {
                                // Clean up React trace stacks from the message for cleaner display
                                const cleanMsg = msg.split('\\n    in ')[0].trim();
                                if (knownWarnings.has(cleanMsg)) return;
                                knownWarnings.add(cleanMsg);
                                
                                const card = document.createElement('div');
                                card.className = 'error-container';
                                card.innerHTML = '<div class="error-header">React Warning</div><div class="error-message" style="color: #e67e22">' + cleanMsg.replace(/</g, '&lt;').replace(/>/g, '&gt;') + '</div>';
                                errorsEl.style.display = 'block';
                                errorsEl.appendChild(card);
                            }

                            class ErrorBoundary extends React.Component {
                                constructor(props) {
                                    super(props);
                                    this.state = { hasError: false, error: null };
                                }
                                static getDerivedStateFromError(error) {
                                    return { hasError: true, error };
                                }
                                render() {
                                    if (this.state.hasError) {
                                        return React.createElement('div', { className: 'error-container', style: { margin: '20px' } },
                                            React.createElement('div', { className: 'error-header' }, 'MDX Runtime Error'),
                                            React.createElement('div', { className: 'error-message' }, this.state.error.message)
                                        );
                                    }
                                    return this.props.children;
                                }
                            }

                            const escape = (text) => {
                                if (typeof text !== 'string') return String(text);
                                return text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&#039;");
                            };

                            let latestSeq = -1;
                            window.addEventListener('message', async (event) => {
                                if (event.data?.type === 'mdx-error') {
                                    if (event.data.sequence !== undefined && event.data.sequence < latestSeq) return;
                                    if (event.data.sequence !== undefined) latestSeq = event.data.sequence;

                                    showError('<div class="error-container" style="margin: 20px">' +
                                        '<div class="error-header">MDX Compilation Error</div>' +
                                        '<div class="error-message">' + escape(event.data.error) + '</div>' +
                                        '</div>');
                                    return;
                                }
                                if (event.data?.type !== 'mdx-update') return;
                                if (event.data.sequence !== undefined && event.data.sequence < latestSeq) return;
                                if (event.data.sequence !== undefined) latestSeq = event.data.sequence;

                                try {
                                    const blob = new Blob([event.data.js], { type: 'text/javascript' });
                                    const url = URL.createObjectURL(blob);
                                    const { default: MDXContent } = await import(url);
                                    URL.revokeObjectURL(url);
                                    
                                    // Final check after async import
                                    if (event.data.sequence !== undefined && event.data.sequence < latestSeq) return;

                                    hideError();
                                    root.render(
                                        React.createElement(ErrorBoundary, { key: event.data.sequence || Date.now() },
                                            React.createElement(MDXProvider, { components: {} },
                                                React.createElement(MDXContent)
                                            )
                                        )
                                    );
                                } catch (err) {
                                    // Final check after async error
                                    if (event.data.sequence !== undefined && event.data.sequence < latestSeq) return;

                                    showError('<div class="error-container" style="margin: 20px">' +
                                        '<div class="error-header">MDX Render Error</div>' +
                                        '<div class="error-message">' + escape(err.message) + '</div>' +
                                        '</div>');
                                }
                            });

                            // Signal parent that bootstrapper is ready
                            window.parent.postMessage({ type: 'mdx-ready' }, '*');
                        </script>
                    </body>
                    </html>`);
          doc.close();
          this.mdxPending = JSON.stringify({ type: 'mdx-update', js: data.html, sequence: this.updateSequence });
        } else if (!this.mdxReady) {
          // Bootstrapper is loading — just update the pending data
          this.mdxPending = JSON.stringify({ type: 'mdx-update', js: data.html, sequence: this.updateSequence });
        } else {
          // Already initialized — send if content changed
          if (data.html !== this.lastMdxJs) {
            this.lastMdxJs = data.html;
            this.renderedFrame.contentWindow?.postMessage({ type: 'mdx-update', js: data.html, sequence: this.updateSequence }, '*');
          }
        }
      } else if (data.format === "html") {
        this.mdxReady = false;
        this.mdxInitializing = false;
        this.lastMdxJs = null;
        doc.open();
        const isFullDoc = data.html?.trim().toLowerCase().startsWith("<!doctype") ||
          data.html?.trim().toLowerCase().startsWith("<html");

        if (isFullDoc) {
          doc.write(data.html || '');
        } else {
          doc.write(`<!DOCTYPE html>
                    <html>
                    <head>
                    <style>
                        body { font-family: sans-serif; line-height: 1.6; padding: 20px; color: #333; transition: all 0.2s ease; }
                        code, pre { font-family: 'JetBrains Mono', monospace; }
                        img { max-width: 100%; height: auto; border-radius: 8px; }
                    </style>
                    </head>
                    <body>
                        ${data.html || ''}
                    </body>
                    </html>`);
        }
        doc.close();
      } else if (data.format === "markdown") {
        this.mdxReady = false;
        this.mdxInitializing = false;
        this.lastMdxJs = null;
        doc.open();

        try {
          const parsedHtml = await marked.parse(data.html || '');
          doc.write(`<!DOCTYPE html>
                    <html>
                    <head>
                    <style>
                        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; line-height: 1.6; padding: 20px; color: #333; max-width: 800px; margin: 0 auto; }
                        h1, h2, h3 { border-bottom: 1px solid #eee; padding-bottom: 0.3em; margin-top: 1.5em; }
                        pre { background: #f6f8fa; padding: 16px; border-radius: 6px; overflow: auto; font-family: 'JetBrains Mono', monospace; }
                        code { background: rgba(175, 184, 193, 0.2); padding: 0.2em 0.4em; border-radius: 4px; font-family: 'JetBrains Mono', monospace; font-size: 85%; }
                        pre > code { background: transparent; padding: 0; }
                        blockquote { border-left: 4px solid #dfe2e5; padding-left: 1em; color: #6a737d; margin-left: 0; }
                        table { border-collapse: collapse; width: 100%; margin: 15px 0; }
                        th, td { border: 1px solid #dfe2e5; padding: 6px 13px; }
                        th { background-color: #f6f8fa; font-weight: 600; }
                        tr:nth-child(2n) { background-color: #f6f8fa; }
                        a { color: #0366d6; text-decoration: none; }
                        a:hover { text-decoration: underline; }
                        img { max-width: 100%; border-radius: 4px; }
                    </style>
                    </head>
                    <body>
                        ${parsedHtml}
                    </body>
                    </html>`);
        } catch (e: any) {
          doc.write(`<!DOCTYPE html><html><body><pre style="color:red">Markdown Parse Error: ${this.escapeHtml(e.message)}</pre></body></html>`);
        }
        doc.close();
      } else {
        // Fallback for JSON and txt formats
        this.mdxReady = false;
        this.mdxInitializing = false;
        this.lastMdxJs = null;
        doc.open();
        doc.write(`<!DOCTYPE html><html><body><pre>${this.escapeHtml(data.html || '')}</pre></body></html>`);
        doc.close();
      }
    }

    // Update Debug Tabs
    const isError = !!data.error;

    // Transpiled tab: show SomMark's intermediate output (transpiled), not compiled JS
    let transpiledContent = data.transpiled || data.html || '';
    if (data.format === "json") {
      try {
        transpiledContent = JSON.stringify(JSON.parse(transpiledContent), null, 2);
      } catch {
        // Keep as is if parsing fails
      }
    }
    const transpiledLang = data.format === "mdx" ? "jsx" : (data.format === "json" ? "json" : "markup");
    this.transpiledEl.innerHTML = isError
      ? `<div class="error-container" style="margin: 0">
            <div class="error-header">Error</div>
            <div class="error-message">${this.escapeHtml(data.error!)}</div>
         </div>`
      : this.highlight(transpiledContent, transpiledLang);

    this.astEl.innerHTML = isError ? '' : this.highlight(JSON.stringify(data.ast || {}, null, 2), "json");
    this.tokensEl.innerHTML = isError ? '' : this.highlight(JSON.stringify(data.tokens || [], null, 2), "json");
  }

  private highlight(code: string, language: string): string {
    try {
      const lang = Prism.languages[language] || Prism.languages.markup;
      const highlighted = Prism.highlight(code, lang, language);
      return `<code class="language-${language}">${highlighted}</code>`;
    } catch (e) {
      return `<code>${this.escapeHtml(code)}</code>`;
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
