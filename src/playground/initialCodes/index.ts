import { htmlInitialCode } from './html';
import { markdownInitialCode } from './markdown';
import { mdxInitialCode } from './mdx';
import { textInitialCode } from './text';

export const initialCodes: Record<string, string> = {
    html: htmlInitialCode,
    markdown: markdownInitialCode,
    mdx: mdxInitialCode,
    text: textInitialCode
};
