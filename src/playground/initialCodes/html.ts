export const htmlInitialCode = `[Html = 
    title: "SomMark | Documentation Hub",
    charset: "UTF-8",
    --brand: "hsl(221, 83%, 53%)",
    --brand-soft: "hsl(221, 83%, 95%)",
    --text-primary: "hsl(215, 25%, 27%)",
    --text-secondary: "hsl(215, 16%, 47%)",
    --surface: "hsl(0, 0%, 100%)",
    --bg-app: "hsl(210, 40%, 98%)",
    --border: "hsl(214, 32%, 91%)"
]
[end]

[section = class: "main-viewport"]


[div = class: "intro-badge"]MISSION CONTROL[end]
[h1]The v3 Engine Journey.[end]
[p = class: "lead"]Tracking the technical evolution and core milestones of the SomMark transpiler ecosystem.[end]

[h2]Architectural Vision[end]
[blockquote]
    "Our goal for v3 was simple: Performance without compromise and extensibility through a modular plugin architecture."
[end]

[h2]Performance Benchmarks[end]
[Block]
@_Table_@: Component, Optimization, Status;
Lexer, Infinite loop protection & safe identifier rules, Stable;
Parser, Distributed argument trimming & multi-line support, Stable;
Plugin Dev, stage-based lifecycle (beforeLex\\, onAst\\, afterTranspile), Stable;
CLI, Unified API integration with smark.config.js support, Stable;
@_end_@
[end]

[h2]Completed Milestones[end]
[div = class: "checklist-container"]
    [h3]Feature Velocity List[end]
    (x)->(todo: Full HTML5 and Markdown/MDX support)
    (x)->(todo: Scoped plugin system with instance isolation)
    (x)->(todo: Auto-generate anchor IDs for headings)
    (x)->(todo: Case-insensitive target matching)
    (x)->(todo: Built-in QuoteEscaper and RawContentPlugin)
    ( )->(todo: Real-time Visual Playground)
[end]

[div = class: "intro-badge"]CORE SPECIFICATION[end]
[h1]The Language Standard.[end]
[p = class: "lead"]Defining the formal grammar, structural constraints, and behavioral patterns of the SomMark syntax.[end]

[h2]Primary Constructs[end]
[div = class: "feature-grid"]
    [div = class: "feature-item"]
        [h3]Blocks[end]
        [p]The primary structural element. Supports hierarchical nesting and optional positional/key-value arguments.[end]
    [end]
    [div = class: "feature-item"]
        [h3]Inline Statements[end]
        [p]Used for phrase-level transformations like bold text. Cannot contains nested syntax.[end]
    [end]
    [div = class: "feature-item"]
        [h3]AtBlocks[end]
        [p]Specialized containers for raw, unparsed text. Perfect for source code snippets and literal data.[end]
    [end]
    [div = class: "feature-item"]
        [h3]Comments[end]
        [p]Single-line annotations starting with hash symbol. Interpreted or removed based on the target mapper.[end]
    [end]
[end]

[h2]Grammar Constraints[end]
[blockquote]
    "At the top level, only Blocks and comments are permitted. All phrase content must reside within a valid Block scope."
[end]

[h2]Construct Matrix[end]
@_Table_@: Construct, Nesting, Parsing, Arguments;
Blocks, Yes, Full, Positional and Key-Value;
Inline Statements, No, Partial, Positional Only;
AtBlocks, No, Raw, Positional and Key-Value;
Comments, No, Ignored, None;
@_end_@

[h2]Identifier Precision[end]
[p]Identifiers must be alphanumeric and may include dollar signs, underscores, or hyphens. Spaces are strictly prohibited.[end]

[div = class: "intro-badge"]PRACTICAL GUIDES[end]
[h1]Mastering the Syntax.[end]
[p = class: "lead"]Hands-on examples and best practices for building rich documentation with SomMark's core features.[end]

[h2]1. Advanced Blocks[end]
[p]Blocks group content together and support flexible argument passing. Escape colons \\('\\:'\\) if they appear inside a key-value value.[end]
[div = class: "syntax-window"]
    [span = class: "syntax-label"]// Standard Block with Arguments[end]
    @_Code_@: sommark;
    [Section = id: "about", class: "dark"]
        [h1]Welcome[end]
        This is structured content.
    [end]
    @_end_@
[end]

[h2]2. Fluent Inline Statements[end]
[p]Transform short text fragments using identifiers. Inline arguments are comma-separated and do not support key-value pairs.[end]
[div = class: "syntax-window"]
    [span = class: "syntax-label"]// Functional Inlines[end]
    @_Code_@: sommark;
    [Block]
        [a = href: "https://sommark.org", target: _blank]Click Here[end]
        (IMPORTANT)->(emphasis)
    [end]
    @_end_@
[end]

[h2]3. Secure At-Blocks[end]
[p]Use At-Blocks for raw content that must bypass the parser. Remember to terminate the argument list with a semicolon \\('\;\\').[end]
[div = class: "syntax-window"]
    [span = class: "syntax-label"]// Raw Code Injection[end]
    @_Code_@;
    \\@_Code\\_@: javascript;
    function hello() {
        return "world";
    }
    \\@_end\\_@
    @_end_@
[end]

[h2]4. Expert Escaping[end]
[blockquote]
    "The backslash character '\\' is your most powerful tool for rendering literal syntax characters."
[end]
[p]To print a literal bracket, use '\\\['. To print a literal equal sign as the start of a block argument value, use '\\\='.[end] 
@_style_@;
:root {
    --ease-out-expo: cubic-bezier(0.19, 1, 0.22, 1);
}
body {
    background-color: var(--bg-app);
    color: var(--text-primary);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
    line-height: 1.6;
    margin: 0;
    -webkit-font-smoothing: antialiased;
}
.main-viewport {
    padding: 80px 20px;
    max-width: 860px;
    margin: 0 auto;
    animation: fadeIn 1.2s var(--ease-out-expo);
}
@keyframes fadeIn {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
}
.intro-badge {
    display: inline-block;
    padding: 6px 14px;
    background: var(--brand-soft);
    color: var(--brand);
    border-radius: 99px;
    font-size: 0.85rem;
    font-weight: 600;
    margin-bottom: 24px;
    letter-spacing: 0.02em;
}
h1 { font-size: 3.5rem; font-weight: 800; letter-spacing: -0.04em; margin-bottom: 16px; color: #0f172a; }
p.lead { font-size: 1.25rem; color: var(--text-secondary); margin-bottom: 48px; max-width: 600px; }
h2 { font-size: 1.75rem; font-weight: 700; margin-top: 64px; margin-bottom: 24px; display: flex; align-items: center; gap: 12px; }
h2::before { content: ''; width: 4px; height: 24px; background: var(--brand); border-radius: 4px; }

.sommark-table {
    width: fit-content;
    border-collapse: separate;
    border-spacing: 0;
    background: var(--surface);
    border-radius: 12px;
    overflow: hidden;
    border: 1px solid var(--border);
    margin: 24px 0;
}
.sommark-table th {
    background: var(--bg-app);
    color: var(--text-primary);
    padding: 16px;
    text-align: left;
    font-size: 0.9rem;
    font-weight: 600;
    border-bottom: 1px solid var(--border);
}
.sommark-table td {
    padding: 16px;
    font-size: 0.95rem;
    border-bottom: 1px solid var(--border);
}
.sommark-table tr:last-child td { border-bottom: none; }

.feature-grid { display: grid; grid-template-columns: 1fr 1fr; gap: 20px; }
.feature-item { 
    background: var(--surface); 
    padding: 24px; 
    border-radius: 12px; 
    border: 1px solid var(--border);
}

.syntax-window {
    background: #0f172a;
    border-radius: 16px;
    padding: 32px;
    margin: 24px 0;
    color: #cbd5e1;
    font-family: 'JetBrains Mono', monospace;
    font-size: 0.95rem;
    box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
.syntax-label {
    display: block;
    color: var(--brand);
    font-size: 0.75rem;
    text-transform: uppercase;
    font-weight: 700;
    margin-bottom: 16px;
    letter-spacing: 0.1em;
}
.syntax-window pre {
    margin: 0;
    padding: 0;
    background: transparent;
}
.syntax-window code {
    background: transparent;
    color: #f8fafc;
    padding: 0;
}

.checklist-container {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    padding: 32px;
    margin-top: 40px;
}
.checklist-container h3 { font-size: 1.1rem; color: var(--text-secondary); text-transform: uppercase; letter-spacing: 0.1em; margin-bottom: 24px; }

blockquote {
    margin: 40px 0;
    padding: 24px;
    background: var(--brand-soft);
    border-left: 4px solid var(--brand);
    border-radius: 0 12px 12px 0;
    font-style: italic;
}

.module-separator {
    height: 1px;
    background: var(--border);
    margin: 80px 0;
    position: relative;
    display: flex;
    justify-content: center;
}
.module-separator::after {
    content: "MODULE BOUNDARY";
    position: absolute;
    top: -10px;
    background: var(--bg-app);
    padding: 0 12px;
    font-size: 0.65rem;
    font-weight: 800;
    color: var(--text-secondary);
    letter-spacing: 0.2em;
}

@media (max-width: 768px) {
    .main-viewport { padding: 40px 16px; }
    h1 { font-size: 2.25rem; }
    p.lead { font-size: 1.1rem; margin-bottom: 32px; }
    h2 { font-size: 1.5rem; margin-top: 40px; }
    .feature-grid { grid-template-columns: 1fr; }
    .syntax-window { padding: 20px; font-size: 0.85rem; overflow-x: auto; }
    .checklist-container { padding: 20px; }
    blockquote { padding: 16px; margin: 24px 0; }
    
    /* Ensure tables don't break layout */
    .sommark-table { 
        display: block; 
        overflow-x: auto; 
        -webkit-overflow-scrolling: touch;
    }
}
@_end_@
[end] `;

