import Editor from '@monaco-editor/react';

interface MapperEditorProps {
    isVisible: boolean;
    code: string;
    readOnly: boolean;
    onChange: (val: string) => void;
}

const MapperEditor = ({ isVisible, code, readOnly, onChange }: MapperEditorProps) => (
    <div style={{ display: isVisible ? 'block' : 'none', height: '100%' }}>
        <Editor
            key="mapper"
            height="100%"
            defaultLanguage="javascript"
            theme="sommark-theme"
            value={code}
            onChange={(val) => {
                if (!readOnly) {
                    onChange(val || '');
                }
            }}
            options={{
                minimap: { enabled: false },
                readOnly: readOnly,
                stickyScroll: { enabled: false },
                padding: { top: 16 },
                fontSize: 13,
                fontFamily: "'JetBrains Mono', 'JetBrainsMono', monospace",
                fontLigatures: true
            }}
        />
    </div>
);

export default MapperEditor;
