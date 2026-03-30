import { compile } from '@mdx-js/mdx';

const input = `
export function add(a,b) {
  return a + b;
}

<h1>
SomMark MDX Playground
</h1>
`;

async function test() {
    try {
        const compiled = await compile(input, { outputFormat: 'program', development: false });
        console.log("SUCCESS");
    } catch (e) {
        console.error("ERROR:");
        console.log(e.message);
    }
}
test();
