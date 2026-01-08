declare module 'sommark' {
    export class Mapper {
        constructor();
        create(id: string | string[], renderOutput: (data: { args: any[], content: string }) => string): void;
        removeOutput(id: string): void;
        outputs: any[];
    }

    export function transpile(options: {
        src: string;
        format?: 'html' | 'md' | 'mdx';
        mapperFile?: Mapper;
        includeDocument?: boolean;
    }): string;

    export function parse(src: string): any[];
    export function lex(src: string): any[];
}
