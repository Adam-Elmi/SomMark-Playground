import Editor from '@monaco-editor/react';

interface ConfigEditorProps {
    isVisible: boolean;
    code: string;
    onChange: (val: string) => void;
}

const ConfigEditor = ({ isVisible, code, onChange }: ConfigEditorProps) => (
    <div style={{ display: isVisible ? 'block' : 'none', height: '100%' }}>
        <Editor
            key="config"
            height="100%"
            defaultLanguage="javascript"
            theme="sommark-theme"
            value={code}
            onChange={(val) => onChange(val || '')}
            options={{
                minimap: { enabled: false },
                stickyScroll: { enabled: false },
                padding: { top: 16 },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'JetBrainsMono', monospace",
                fontLigatures: true
            }}
        />
    </div>
);

export default ConfigEditor;
