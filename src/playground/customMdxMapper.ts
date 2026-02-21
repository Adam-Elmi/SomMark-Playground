// @ts-ignore
import { MARKDOWN, Mapper } from 'sommark';

const CustomMDX = new Mapper();
CustomMDX.outputs = MARKDOWN.outputs;
const { tag } = CustomMDX;

CustomMDX.register(['Alert', 'alert'], ({ args, content }: any) => {
    return tag('Alert')
        .props({ type: 'string', typeValue: args.type })
        .body(content);
}, {
    rules: { type: 'Block' }
});

CustomMDX.register(['Button', 'button'], ({ args, content }: any) => {
    const message = args.message || 'Hello!';
    return tag('Button')
        .props({ type: 'string', onClick: `alert("${message}")` })
        .body(content);
}, {
    rules: { type: 'Block' }
});

export default CustomMDX;
