import { DEFAULT_HTML_MAPPER } from "../../constants/defaultMappers";
export const DEFAULT_SMARK = `[Section = "Introduction"]
Hello to (SomMark)->(color: red)!

@_Code_@: js
console.log("Hello World");
@_end_@

This is a (link)->(link: https://google.com "Google").
[end]\`;

export const DEFAULT_CONFIG = \`export default {
    mode: "default", // "default" or "custom"
    format: "html",  // "html", "md", or "mdx"
    includeDocument: true
};\`;

export const DEFAULT_MAPPER = \`
const mdx = new Mapper();
const { tag, code, list, htmlTable, setHeader, cssTheme } = mdx;

// Inject default SomMark CSS theme
setHeader([cssTheme()]);

// --- Blocks ---

mdx.create("Section", ({ args, content }) => {
    const header = tag("h1").body(args[0]?.replace(/"/g, '') || 'Section');
    return tag("section")
        .body(header + content);
});

mdx.create("Info", ({ content }) => {
    return tag("div")
        .attributes({
            style: "background: #1e1e1e; padding: 15px; border-left: 4px solid #61dafb; margin: 10px 0; border-radius: 4px;"
        })
        .body(content);
});

// --- Inline Elements ---

mdx.create("color", ({ args, content }) => {
    return tag("span")
        .attributes({ style: \`color:\${args[0]}\` })
        .body(content);
});

mdx.create("link", ({ args, content }) => {
    return tag("a")
        .attributes({ 
            href: args[0] || '#', 
            title: args[1],
            style: "color: #61dafb; text-decoration: none;"
        })
        .body(content);
});

mdx.create(["bold", "b"], ({ content }) => {
    return tag("strong").body(content);
});

mdx.create(["italic", "i"], ({ content }) => {
    return tag("em").body(content);
});

// --- At-Blocks ---

// Code highlighting using built-in helper
mdx.create("Code", ({ args, content }) => {
    return code(args, content);
});

// Table using built-in helper
mdx.create("table", ({ args, content }) => {
    // args contains headers, content contains rows
    return htmlTable(content, args);
});

// Lists
mdx.create(["list", "List"], ({ content }) => {
    return list(content);
});

return mdx;
`;

export const DEFAULT_CONFIG = 
`export default {
    mode: "default", // "default" or "custom"
    format: "html",  // "html", "md", or "mdx"
    includeDocument: true
};`;

export const DEFAULT_MAPPER = DEFAULT_HTML_MAPPER;