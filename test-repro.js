import SomMark, { MDX } from 'sommark';
import { compile } from '@mdx-js/mdx';

const input = `@_mdx_@;
export const v = 3;
@_end_@

[h1]Hello World{v}[end]

@_mdx_@;
export const v = 3;
@_end_@

[h1]Hello World{v}[end]
[p]Is 1 < 5? {1 < 5}[end]`;

async function test() {
    console.log("TESTING WITH DUAL BOUNDARY CLEANUP...");
    const engine = new SomMark({ format: 'mdx' });
    
    engine.register("mdx", ({ content }) => {
        let lines = content.replace(/\u200B/g, "").split('\n');
        let clean = lines.map(l => l.trim()).filter(l => l !== "").join('\n');
        if (clean.startsWith(';')) clean = clean.substring(1).trim();
        // NATIVE FIX: No more markers needed!
        return "\n" + clean + "\n\n";
    }, { escape: false, type: ["AtBlock", "Block"] });

    try {
        const transpiled = await engine.transpile(input);
        console.log("TRANSPILED OUTPUT (RAW):", JSON.stringify(transpiled));
        
        // Clean up like the playground does
        const cleanTranspiled = transpiled
            .replace(/&lt;/g, '<').replace(/&gt;/g, '>')
            .replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&#x27;/g, "'")
            .replace(/&amp;/g, '&')
            .replace(/\/\* MB \*\//g, "")
            .replace(/\/\* ME \*\//g, "")
            .trim();
        
        console.log("CLEAN TRANSPILED (RAW):", JSON.stringify(cleanTranspiled));

        const compiled = await compile(cleanTranspiled, { outputFormat: 'program', development: false });
        console.log("MDX SUCCESS!");
    } catch (e) {
        console.error("MDX ERROR:");
        console.error(e.message);
    }
}
test();
