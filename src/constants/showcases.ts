export const SHOWCASES = [
    {
        id: 'docs-basics',
        label: 'Documentation Basics',
        description: 'Standard headers, lists, and formatting.',
        config: { mode: 'custom', format: 'html' },
        smark: `[Main]
[Section = "Getting Started"]
Welcome to the documentation. This is a basic example of (bold text)->(bold), (italic text)->(italic), and a (link)->(link: #, "custom link").
[end]

(Here is a list of features:)->(bold)
@_Features_@
- fast performance
- easy syntax
- custom mappers
@_end_@

[Info]
This is a (shining)->(bold) info callout using the custom mapper.
[end]
[end]`,
        mapper: `const doc = new Mapper();
const { tag, code, list } = doc;
// Main Block
doc.create("Main", ({ content }) => {
    return tag("div").attributes({ class: "container mx-auto px-4 py-8" }).body(content);
});
// Section Block
doc.create("Section", ({ args, content }) => {
    return tag("div")
        .attributes({ class: "mb-8" })
        .body(
            tag("h2")
                .attributes({ 
                    class: "text-3xl font-bold mb-4 pb-2 border-b border-gray-200 text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-indigo-600" 
                })
                .body(args[0]?.replace(/"/g, '') || 'Section')
            + 
            tag("div").attributes({ class: "text-gray-700 leading-relaxed text-lg" }).body(content)
        );
});
// Info Block
doc.create("Info", ({ content }) => {
    return tag("div")
        .attributes({ 
            class: "my-6 p-4 rounded-xl bg-blue-50 border border-blue-100 shadow-sm relative overflow-hidden group flex gap-3 items-center transition-transform hover:scale-[1.01] duration-300" 
        })
        .body(
            tag("div").attributes({ class: "w-1 self-stretch bg-blue-500 rounded-full" }).body("") +
            tag("div").attributes({ class: "text-blue-800 text-base font-medium flex-1" }).body(content)
        );
});
// List Block
doc.create("Features", ({ content }) => {
    let listItems = list(content);
    // Use explicit span for bullet to avoid string escaping issues with before:content
    listItems = listItems.replace(/<li>/g, '<li class="flex items-start gap-3 text-gray-700 font-medium"><span class="text-blue-500 text-2xl leading-none select-none">•</span><div>');
    // Close the div we opened
    listItems = listItems.replace(/<\\/li>/g, '</div></li>');
    return tag("div")
        .attributes({ class: "pl-2 space-y-3 my-4" })
        .body(listItems);
}, { escape: false });
// Link Inline
doc.create("link", ({ args, content }) => {
    return tag("a")
        .attributes({ 
            href: args[0], 
            class: "text-blue-600 hover:text-blue-800 font-semibold underline underline-offset-4 decoration-blue-300 hover:decoration-blue-600 transition-all"
        })
        .body(content);
});

doc.create(["bold", "b"], ({ content }) => tag("strong").attributes({ class: "font-bold text-gray-900" }).body(content));
doc.create(["italic", "i"], ({ content }) => tag("em").attributes({ class: "italic text-gray-600 font-serif" }).body(content));

return doc;`
    },
    {
        id: 'tailwind-ui',
        label: 'Tailwind UI Components',
        description: 'Mapping blocks to complex Tailwind CSS components.',
        config: { mode: 'custom', format: 'html' },
        smark: `[Card]
[h3]
User Profile
[end]
(Avatar)->(image: https://api.dicebear.com/7.x/adventurer/svg?seed=luffy "User Avatar")
(Adam ELmi)->(bold)
(Software Engineer)->(color: white)
(Contact Me)->(link: mailto:adam.elmi@example.com "Contact Me")
[end]

[Alert = info]
Info! This is an informational message.
[end]

[Alert = success]
Success! Your changes have been saved successfully.
[end]

[Alert = warning]
Warning! Your account subscription is expiring soon.
[end]

[Alert = error]
Error! An unexpected error occurred.
[end]`,
        mapper: `const map = new Mapper();
const { tag } = map;

// -- Card Component --
map.create("Card", ({ content }) => {
    return tag("div")
        .attributes({ 
            class: "max-w-sm mx-auto bg-white rounded-xl shadow-md overflow-hidden m-4 p-6 hover:shadow-xl transition-shadow duration-300 border border-gray-100 dark:bg-gray-800 dark:border-gray-700" 
        })
        .body(tag("div").attributes({ class: "flex flex-col items-center gap-4 text-center" }).body(content));
});

// -- Alert Component --
map.create("Alert", ({ args, content }) => {
    const type = args[0] || "info";
    const colors = {
        success: "bg-green-50 text-green-700 border-green-200",
        warning: "bg-yellow-50 text-yellow-700 border-yellow-200",
        error: "bg-red-50 text-red-700 border-red-200",
        info: "bg-blue-50 text-blue-700 border-blue-200"
    };
    const colorClass = colors[type] || colors.info;
    
    return tag("div")
        .attributes({ 
            class: \`p-4 mb-4 rounded-lg border \${colorClass} flex items-start gap-3\` 
        })
        .body(content);
});

// -- Button Inline --
map.create("link", ({ args, content }) => {
    return tag("a")
        .attributes({ 
            href: args[0] || "#",
            class: "inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
        })
        .body(content);
});

// -- Standard Elements Passthrough --
map.create("color", ({ args, content }) => tag("span").attributes({ style: \`color:\${args[0]};\` }).body(content));
map.create("h3", ({ content }) => tag("h3").attributes({ class: "text-xl font-bold text-gray-900 dark:text-white" }).body(content));
map.create(["bold", "b"], ({ content }) => tag("strong").attributes({ class: "font-semibold text-gray-900 dark:text-gray-100" }).body(content));
map.create("image", ({ args, content }) => tag("img").attributes({ src: args[0], alt: args[1], class: "w-24 h-24 rounded-full border-4 border-white shadow-sm" }).selfClose());

return map;`
    },
    {
        id: 'blog-post',
        label: 'Blog Post Layout',
        description: 'Article layout with hero image and typography.',
        config: { mode: 'custom', format: 'html' },
        smark: `[Article]
[Title]
The Future of Web Development
[end]

[Meta]
By: (Adam ELmi)->(color: #000) • Published on Jan 8, 2026
[end]

[Hero]
(Hero Image)->(image: https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1200&q=80 "Code on screen")
[end]

[Content]
Web development is constantly evolving. From static HTML pages to complex Single Page Applications \`(SPAs)\`, the journey has been incredible.

[Quote]
"The only constant in technology is change."
[end]

Today, tools like (SomMark)->(bold) allow us to define our own content structures and map them to any output format we desire. This flexibility is key for modern content management systems.
[end]
[end]`,
        mapper: `const blog = new Mapper();
const { tag } = blog;

blog.create("Article", ({ content }) => {
    return tag("article").attributes({ class: "max-w-3xl mx-auto px-4 py-12 prose prose-lg dark:prose-invert" }).body(content);
});

blog.create("Title", ({ content }) => {
    return tag("h1").attributes({ class: "text-4xl md:text-5xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-4" }).body(content);
});

blog.create("Meta", ({ content }) => {
    return tag("div").attributes({ class: "flex items-center text-sm text-gray-700 dark:text-gray-400 mb-8 pb-8 border-b border-gray-200 dark:border-gray-800 gap-2" }).body(content);
});

blog.create("Hero", ({ content }) => {
    return tag("div").attributes({ class: "mb-10 rounded-2xl overflow-hidden shadow-lg" }).body(content);
});

blog.create("Content", ({ content }) => {
    return tag("div").attributes({ class: "space-y-6 leading-relaxed text-gray-700 dark:text-gray-300" }).body(content);
});

blog.create("Quote", ({ content }) => {
    return tag("blockquote").attributes({ class: "border-l-4 border-purple-500 pl-4 italic text-xl text-gray-800 dark:text-gray-200 my-6 bg-gray-50 dark:bg-gray-800/50 p-4 rounded-r-lg" }).body(content);
});

// Helpers
blog.create("color", ({ args, content }) => tag("span").attributes({ style: \`color:\${args[0]};\` }).body(content));
blog.create("image", ({ args }) => tag("img").attributes({ src: args[0], alt: args[1], class: "w-full object-cover" }).selfClose());
blog.create(["bold", "b"], ({ content }) => tag("strong").attributes({ class: "font-bold text-gray-600" }).body(content));

return blog;`
    }
];
