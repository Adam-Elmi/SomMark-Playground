import { expose } from 'comlink';
import SomMark, { Mapper, lex, parse } from 'sommark';

const prepareCodeForEval = (code: string) => {
    let cleanCode = code.replace(/^\s*import\s+.*?[\r\n]+|^\s*import\s+.*?;/gm, '');
    return cleanCode;
};

export class SomMarkService {
    async compile(
        src: string,
        config: any,
        mapperCode: string
    ): Promise<{
        output: string;
        tokens: any;
        ast: any;
        notification?: { type: 'info' | 'warning' | 'error'; message: string };
    }> {
        let finalMapperInstance = null;
        let notification: { type: 'info' | 'warning' | 'error'; message: string } | undefined = undefined;

        if (config.mode !== 'default') {
            let cleanMapperCode = prepareCodeForEval(mapperCode);

            if (cleanMapperCode.includes('export default')) {
                cleanMapperCode = cleanMapperCode.replace('export default', 'return ');
            } else {
                const mapperRegex = /(?:const|let|var)\s+([a-zA-Z_$][0-9a-zA-Z_$]*)\s*=\s*new\s+Mapper\s*\(/g;
                const matches = [...cleanMapperCode.matchAll(mapperRegex)];

                if (matches.length > 0) {
                    const firstInstanceName = matches[0][1];
                    cleanMapperCode += `\nreturn ${firstInstanceName};`;

                    if (matches.length > 1) {
                        notification = {
                            type: 'warning',
                            message: `Multiple Mapper instances detected. Auto-exported: '${firstInstanceName}'.`
                        };
                    }
                }
            }

            const createMapper = new Function('Mapper', cleanMapperCode);
            finalMapperInstance = createMapper(Mapper);

            if (!(finalMapperInstance instanceof Mapper)) {
                throw new Error("Mapper code must return an instance of Mapper class.");
            }
        }

        // @ts-ignore
        const sommark = new SomMark({
            src: src,
            ...config,
            mapperFile: finalMapperInstance
        });

        // 1. Lex
        const tokens = lex(src);

        // 2. Parse
        const ast = parse(src);

        // 3. Transpile
        const output = sommark.transpile();

        return {
            output,
            tokens,
            ast,
            notification
        };
    }
}

expose(new SomMarkService());
