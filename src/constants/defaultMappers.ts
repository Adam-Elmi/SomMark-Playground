export const DEFAULT_HTML_MAPPER = `const html = new Mapper();
const { tag, code, list } = html;

html.selectedTheme = "paraiso-dark";
html.env = "browser";

// Block
html.create("Block", ({ content }) => {
	return content;
});
// Section
html.create("Section", ({ content }) => {
	return tag("section").body(content);
});
// Headings
html.create("h1", ({ content }) => {
	return tag("h1").body(content);
});
html.create("h2", ({ content }) => {
	return tag("h2").body(content);
});
html.create("h3", ({ content }) => {
	return tag("h3").body(content);
});
html.create("h4", ({ content }) => {
	return tag("h4").body(content);
});
html.create("h5", ({ content }) => {
	return tag("h5").body(content);
});
html.create("h6", ({ content }) => {
	return tag("h6").body(content);
});
// Bold
html.create(["bold", "b"], ({ content }) => {
	return tag("strong").body(content);
});
// Italic
html.create(["italic", "i"], ({ content }) => {
	return tag("i").body(content);
});
// Italic
html.create(["emphasis", "e"], ({ content }) => {
	return tag("span").attributes({ style: "font-weight:bold; font-style: italic;" }).body(content);
});
// Colored Text
html.create("color", ({ args, content }) => {
	return tag("span")
		.attributes({ style: \`color:\${args[0]};\` })
		.body(content);
});
// Link
html.create("link", ({ args, content }) => {
	return tag("a").attributes({ href: args[0], title: args[1] }).body(content);
});
// Image
html.create("image", ({ args, content }) => {
	return tag("img").selfClose().attributes({ src: args[0], alt: content }).body("");
});
// Code
html.create("code", ({ args, content }) => {
	return code(args, content);
}, { escape: false });
// List
html.create(["list", "List"], ({ content }) => {
	return list(content);
}, { escape: false });
// Table
html.create("table", ({ content, args }) => {
	return html.htmlTable(content.split(/\\n/), args);
}, { escape: false });
// Horizontal Rule
html.create("hr", () => {
	return tag("hr").selfClose();
});

export default html;`;

export const DEFAULT_MD_MAPPER = `const markdown = new Mapper();
const { md } = markdown;
// Block
markdown.create("Block", ({ content }) => {
	return content;
});
// Headings
markdown.create("Heading", ({ args, content }) => {
	return md.heading(args[1], args[0]) + content;
});
// Inline Headings
markdown.create("h1", ({ content }) => {
	return md.heading(content, 1);
});
markdown.create("h2", ({ content }) => {
	return md.heading(content, 2);
});
markdown.create("h3", ({ content }) => {
	return md.heading(content, 3);
});
markdown.create("h4", ({ content }) => {
	return md.heading(content, 4);
});
markdown.create("h5", ({ content }) => {
	return md.heading(content, 5);
});
markdown.create("h6", ({ content }) => {
	return md.heading(content, 6);
});
// Bold
markdown.create(["bold", "b"], ({ content }) => {
	return md.bold(content);
});
// Italic
markdown.create(["italic", "i"], ({ content }) => {
	return md.italic(content);
});
// Bold and Italic (emphasis)
markdown.create(["emphasis", "e"], ({ content }) => {
	return md.emphasis(content);
});
// Code Blocks
markdown.create(["code", "Code", "codeBlock", "CodeBlock"], ({ args, content }) => {
	return md.codeBlock(content, args[0]);
}, { escape: false });
// Link
markdown.create("link", ({ args, content }) => {
	return md.url("link", content, args[0], args[1]);
});
// Image
markdown.create("image", ({ args, content }) => {
	return md.url("image", content, args[0], args[1]);
});
// Horizontal Rule
markdown.create(["horizontal", "h"], ({ content }) => {
	return md.horizontal(content);
});
// Escape Characters
markdown.create(["escape", "s"], ({ content }) => {
	return md.escape(content);
});
// Table
markdown.create("table", ({ args, content }) => {
	return md.table(args, content.split("\\n"));
}, { escape: false });
// List
markdown.create(["list", "List"], ({ content }) => {
	return content;
}, { escape: false });
export default markdown;
`;

export const DEFAULT_MDX_MAPPER = `const mdx = new Mapper();
mdx.outputs = markdown.outputs;
export default mdx;`;
