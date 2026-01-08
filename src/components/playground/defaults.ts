import { DEFAULT_HTML_MAPPER } from "../../constants/defaultMappers";
export const DEFAULT_SMARK = `[Section = Introduction]
Hello to (SomMark)->(color: red)!

@_Code_@: js
console.log("Hello World");
@_end_@

This is a (link)->(link: https://google.com "Google").
[end]`;

export const DEFAULT_CONFIG = `export default {
    mode: "default", // "default" or "custom"
    format: "html",  // "html", "md", or "mdx"
    includeDocument: true
};`;

export const DEFAULT_MAPPER = DEFAULT_HTML_MAPPER;
