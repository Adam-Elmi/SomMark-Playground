import Editor from '@monaco-editor/react';

interface OutputViewProps {
    mode: 'render' | 'code';
    content: string;
}

const OutputView = ({ mode, content }: OutputViewProps) => (
    <div className="flex-1 overflow-hidden h-full flex flex-col">
        {mode === 'render' ? (
            <div className="h-full w-full p-8 overflow-auto prose prose-invert max-w-none text-black">
                <div dangerouslySetInnerHTML={{ __html: content }} />
            </div>
        ) : (
            <Editor
                height="100%"
                defaultLanguage="html"
                theme="sommark-theme"
                value={content}
                options={{
                    readOnly: true,
                    minimap: { enabled: false },
                    fontSize: 13,
                    fontFamily: "'JetBrains Mono', 'JetBrainsMono', monospace",
                    fontLigatures: true,
                    wordWrap: 'on',
                    stickyScroll: { enabled: false },
                    padding: { top: 16 }
                }}
            />
        )}
    </div>
);

export default OutputView;
