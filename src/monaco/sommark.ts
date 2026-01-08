import type { languages } from 'monaco-editor';

export const somMarkLanguage: languages.IMonarchLanguage = {
    defaultToken: '',
    tokenPostfix: '.sommark',

    tokenizer: {
        root: [
            // Comments
            [/#.*$/, 'comment'],

            // Blocks
            [/\[end\]/, 'keyword.block.end.sommark'],
            [/\[[a-zA-Z0-9]+/, { token: 'keyword.block.sommark', next: '@blockHeader' }],

            // At-Blocks
            [/[@]_([a-zA-Z0-9]+)_[@]/, { token: 'keyword.atblock.sommark', next: '@atBlockArgs' }],

            // Inline Statements: (Value)->(Action: args)
            // Rule 1: With arguments
            [/(\()([^)]+)(\))(\s*->\s*)(\()([a-zA-Z0-9]+)(:)([^)]*)(\))/, [
                'delimiter.parenthesis',
                'string',
                'delimiter.parenthesis',
                'operator',
                'delimiter.parenthesis',
                'keyword',
                'operator',
                'variable.parameter',
                'delimiter.parenthesis'
            ]],
            // Rule 2: Without arguments
            [/(\()([^)]+)(\))(\s*->\s*)(\()([a-zA-Z0-9]+)(\))/, [
                'delimiter.parenthesis',
                'string',
                'delimiter.parenthesis',
                'operator',
                'delimiter.parenthesis',
                'keyword',
                'delimiter.parenthesis'
            ]],

            // Standard whitespace
            { include: '@whitespace' },
        ],

        whitespace: [
            [/[ \t\r\n]+/, 'white'],
        ],

        blockHeader: [
            [/\]/, { token: 'keyword.block.sommark', next: '@pop' }],
            [/[0-9]+/, 'number'],
            [/[a-zA-Z0-9]+/, 'string.unquoted'],
            [/"[^"]*"/, 'string.quoted'],
            [/=/, 'operator.assignment'],
            [/,/, 'delimiter'],
            [/[ \t\r\n]+/, 'white'],
        ],

        atBlockArgs: [
            [/^/, { token: '', next: '@pop' }],

            [/$/, { token: '', next: '@atBlockBody' }],

            // Arguments
            [/[0-9]+/, 'number'],
            [/[a-zA-Z0-9]+/, 'string.unquoted'],
            [/:/, 'operator'],
            [/,/, 'delimiter'],
            [/[ \t]+/, 'white'],
        ],

        atBlockBody: [
            // End tag
            [/[@]_end_[@]/, { token: 'keyword.atblock.sommark', next: '@pop' }],

            // Raw content
            [/./, ''],
        ]
    }
};

export const somMarkTheme = {
    base: 'vs-dark',
    inherit: true,
    rules: [
        { token: 'keyword.block.sommark', foreground: '569CD6', fontStyle: 'bold' },
        { token: 'keyword.block.end.sommark', foreground: '569CD6' },
        { token: 'keyword.atblock.sommark', foreground: '569CD6' },
        { token: 'string.unquoted', foreground: '9CDCFE' },
        { token: 'string.quoted', foreground: 'CE9178' },
        { token: 'operator', foreground: 'D4D4D4' },
        { token: 'comment', foreground: '6A9955' },
        { token: 'number', foreground: 'b5cea8' },
        { token: 'variable.parameter', foreground: '9CDCFE' },
        { token: 'delimiter.parenthesis', foreground: 'D4D4D4' }
    ],
    colors: {}
};
