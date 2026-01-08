import Editor from '@monaco-editor/react';

interface ConsoleEditorProps {
    activeTab: 'lexed' | 'parsed' | 'transpiled';
    format: string;
    tokens: string;
    ast: string;
    transpiled: string;
}

const ConsoleEditor = ({ activeTab, format, tokens, ast, transpiled }: ConsoleEditorProps) => {
    const getLanguage = () => {
        if (activeTab === 'transpiled') {
            return format === 'html' ? 'html' : 'markdown';
        }
        return 'json';
    };

    const getValue = () => {
        if (activeTab === 'lexed') return tokens;
        if (activeTab === 'parsed') return ast;
        return transpiled;
    };

    return (
        <Editor
            height="100%"
            language={getLanguage()}
            theme="sommark-theme"
            value={getValue()}
            options={{
                readOnly: true,
                minimap: { enabled: false },
                fontSize: 12,
                fontFamily: "'JetBrains Mono', 'JetBrainsMono', monospace",
                fontLigatures: true,
                wordWrap: 'on',
                stickyScroll: { enabled: false },
                padding: { top: 16 }
            }}
        />
    );
};

export default ConsoleEditor;
