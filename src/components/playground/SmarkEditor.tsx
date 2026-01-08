import Editor from '@monaco-editor/react';

interface SmarkEditorProps {
    code: string;
    onChange: (val: string) => void;
    beforeMount: (monaco: any) => void;
}

const SmarkEditor = ({ code, onChange, beforeMount }: SmarkEditorProps) => (
    <Editor
        height="100%"
        defaultLanguage="sommark"
        theme="sommark-theme"
        value={code}
        beforeMount={beforeMount}
        onChange={(val) => onChange(val || '')}
        options={{
            minimap: { enabled: false },
            stickyScroll: { enabled: false },
            padding: { top: 16 },
            fontSize: 14,
            fontFamily: "'JetBrains Mono', 'JetBrainsMono', monospace",
            fontLigatures: true
        }}
    />
);

export default SmarkEditor;
