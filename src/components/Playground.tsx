import { useState, useEffect, useRef } from 'react';
import { loader } from '@monaco-editor/react';
import * as monaco from 'monaco-editor';
import { Panel, Group as PanelGroup, type PanelImperativeHandle as ImperativePanelHandle } from 'react-resizable-panels';
// @ts-ignore
import { somMarkLanguage, somMarkTheme } from '../monaco/sommark';
import { saveToStorage, getFromStorage, STORAGE_KEYS } from '../helper/storage';
import { DEFAULT_HTML_MAPPER, DEFAULT_MD_MAPPER, DEFAULT_MDX_MAPPER } from '../constants/defaultMappers';
import { SHOWCASES } from '../constants/showcases';
import { wrap } from 'comlink';
// @ts-ignore
import SomMarkWorker from '../workers/sommark.worker?worker';
import type { SomMarkService } from '../workers/sommark.worker';
import { DEFAULT_SMARK, DEFAULT_CONFIG, DEFAULT_MAPPER } from './playground/defaults';
import ResizeHandle from './playground/ResizeHandle';
import SmarkEditor from './playground/SmarkEditor';
import MapperEditor from './playground/MapperEditor';
import ConfigEditor from './playground/ConfigEditor';
import OutputView from './playground/OutputView';
import ConsoleEditor from './playground/ConsoleEditor';

loader.config({ monaco });

const stripAnsi = (str: string) => str.replace(/\x1b\[[0-9;]*m/g, '');

const Playground = () => {
    const [smarkCode, setSmarkCode] = useState(() =>
        getFromStorage(STORAGE_KEYS.SOMMARK_CODE, DEFAULT_SMARK)
    );
    const [configCode, setConfigCode] = useState(() =>
        getFromStorage(STORAGE_KEYS.SOMMARK_CONFIG, DEFAULT_CONFIG)
    );
    const [customMapperCode, setCustomMapperCode] = useState(() =>
        getFromStorage(STORAGE_KEYS.MAPPER_CODE, DEFAULT_MAPPER)
    );
    const [displayMapperCode, setDisplayMapperCode] = useState(DEFAULT_MAPPER);
    const [mapperReadOnly, setMapperReadOnly] = useState(false);
    const [activeMapperPaneTab, setActiveMapperPaneTab] = useState<'mapper' | 'config'>('mapper');

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SOMMARK_CODE, smarkCode);
    }, [smarkCode]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.MAPPER_CODE, customMapperCode);
    }, [customMapperCode]);

    useEffect(() => {
        saveToStorage(STORAGE_KEYS.SOMMARK_CONFIG, configCode);
    }, [configCode]);

    const [output, setOutput] = useState('');
    const [tokens, setTokens] = useState('');
    const [ast, setAst] = useState('');
    const [error, setError] = useState<string | null>(null);
    const [notification, setNotification] = useState<{ message: string; type: 'info' | 'warning' | 'error' } | null>(null);
    const [format, setFormat] = useState('html');
    const workerRef = useRef<Worker | null>(null);

    const handleEditorWillMount = (monaco: any) => {
        if (!monaco.languages.getLanguages().some((l: any) => l.id === 'sommark')) {
            monaco.languages.register({ id: 'sommark' });
            monaco.languages.setMonarchTokensProvider('sommark', somMarkLanguage);
        }
        monaco.editor.defineTheme('sommark-theme', somMarkTheme);
    };

    useEffect(() => {
        if (error) setError(null);
        if (notification) setNotification(null);
    }, [smarkCode, customMapperCode, configCode]);

    useEffect(() => {
        const run = async () => {
            try {
                const prepareCodeForEval = (code: string) => {
                    let cleanCode = code.replace(/^\s*import\s+.*?[\r\n]+|^\s*import\s+.*?;/gm, '');
                    return cleanCode;
                };

                const configModule = { exports: {} };
                const cleanConfigCode = prepareCodeForEval(configCode).replace('export default', 'module.exports = ');
                const configWrapper = new Function('module', 'exports', cleanConfigCode);
                configWrapper(configModule, configModule.exports);
                const config = (configModule.exports as any).default || configModule.exports;

                if (!config || typeof config !== 'object') {
                    throw new Error("Config code must export a configuration object.");
                }

                setFormat(config.format || 'html');

                let mapperCodeToEval = '';

                if (config.mode === 'default') {
                    setMapperReadOnly(true);
                    let defaultCode = DEFAULT_HTML_MAPPER;
                    if (config.format === 'md') defaultCode = DEFAULT_MD_MAPPER;
                    if (config.format === 'mdx') defaultCode = DEFAULT_MDX_MAPPER;

                    setDisplayMapperCode(defaultCode);
                    mapperCodeToEval = defaultCode;
                } else {
                    setMapperReadOnly(false);
                    setDisplayMapperCode(customMapperCode);
                    mapperCodeToEval = customMapperCode;
                }

                if (workerRef.current) {
                    workerRef.current.terminate();
                }

                const worker = new SomMarkWorker();
                workerRef.current = worker;
                const service = wrap<SomMarkService>(worker);

                const { output, tokens: lexedTokens, ast: parsedAst, notification: workerNotification } = await service.compile(
                    smarkCode,
                    config,
                    mapperCodeToEval
                );

                setTokens(JSON.stringify(lexedTokens, null, 2));
                setAst(JSON.stringify(parsedAst, null, 2));
                setOutput(output);

                if (workerNotification) {
                    setNotification(workerNotification);
                }

            } catch (err: any) {
                const msg = typeof err === 'string' ? err : (err.message || String(err));
                console.log('Raw Error:', msg);
                setError(stripAnsi(msg));

                setTokens('');
                setAst('');
                setOutput('');

                console.groupEnd();
                console.groupEnd();
            }
        };

        const timeout = setTimeout(run, 500);
        return () => clearTimeout(timeout);
    }, [smarkCode, customMapperCode, configCode]);

    const [activeTab, setActiveTab] = useState<'render' | 'code'>('render');
    const [consoleTab, setConsoleTab] = useState<'lexed' | 'parsed' | 'transpiled'>('lexed');

    const consolePanelRef = useRef<ImperativePanelHandle>(null);
    const [isConsoleCollapsed, setIsConsoleCollapsed] = useState(false);

    const maximizeConsole = () => {
        const panel = consolePanelRef.current;
        if (panel) {
            panel.resize(300);
        }
    };

    const minimizeConsole = () => {
        const panel = consolePanelRef.current;
        if (panel) {
            panel.collapse();
        }
    };

    const loadShowcase = (id: string) => {
        const showcase = SHOWCASES.find(s => s.id === id);
        if (!showcase) return;
        const inferredMode = showcase.mapper ? 'custom' : 'default';
        const newConfig = {
            mode: inferredMode,
            format: showcase.config.format,
            includeDocument: true
        };
        setConfigCode(`export default ${JSON.stringify(newConfig, null, 4)};`);
        setSmarkCode(showcase.smark);
        if (showcase.mapper) {
            setCustomMapperCode(showcase.mapper);
            setMapperReadOnly(false);
        }
    };

    const [activeMobileModal, setActiveMobileModal] = useState<'none' | 'mapper' | 'output' | 'console'>('none');
    const [orientation, setOrientation] = useState<'horizontal' | 'vertical'>('horizontal');

    useEffect(() => {
        const handleResize = () => {
            if (window.innerWidth <= 768) {
                setOrientation('vertical');
            } else {
                setOrientation('horizontal');
            }
        };
        handleResize();
        window.addEventListener('resize', handleResize);
        return () => window.removeEventListener('resize', handleResize);
    }, []);

    const isMobile = orientation === 'vertical';

    if (isMobile) {
        return (
            <div className="h-screen w-screen bg-gray-900 text-white overflow-hidden flex flex-col relative">
                <div className="bg-gray-800 px-4 py-2 text-sm font-semibold border-b border-gray-700 flex justify-between items-center z-10 shrink-0">
                    <span>SomMark Input</span>
                    <div className="flex items-center gap-2">
                        <label className="text-gray-400 text-xs hidden sm:inline">Load:</label>
                        <select
                            className="bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500 max-w-[120px]"
                            onChange={(e) => loadShowcase(e.target.value)}
                            defaultValue=""
                        >
                            <option value="" disabled>Example...</option>
                            {SHOWCASES.map(s => (
                                <option key={s.id} value={s.id}>
                                    {s.label}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 px-2 py-1 flex items-center gap-2 justify-between z-10 shrink-0">
                    <span className="text-xs text-gray-500 uppercase font-bold tracking-wider px-2">Views</span>
                    <div className="flex gap-2">
                        <button onClick={() => setActiveMobileModal('mapper')} className="px-3 py-1 bg-gray-700 hover:bg-gray-600 rounded text-xs border border-gray-600">Mapper</button>
                        <button onClick={() => setActiveMobileModal('output')} className="px-3 py-1 bg-blue-600 hover:bg-blue-500 text-white rounded text-xs border border-blue-500">Preview</button>
                        <button onClick={() => setActiveMobileModal('console')} className="px-3 py-1 bg-purple-600 hover:bg-purple-500 text-white rounded text-xs border border-purple-500">Console</button>
                    </div>
                </div>

                <div className="flex-1 overflow-hidden relative">
                    <SmarkEditor
                        code={smarkCode}
                        onChange={setSmarkCode}
                        beforeMount={handleEditorWillMount}
                    />
                </div>

                {/* --- MODALS --- */}

                {/* Mapper Modal */}
                {activeMobileModal === 'mapper' && (
                    <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col">
                        <div className="bg-gray-800 px-4 py-2 text-sm font-semibold border-b border-gray-700 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <span>Mapper / Config</span>
                                <div className="flex gap-2 bg-gray-900 rounded p-0.5 border border-gray-700">
                                    <button onClick={() => setActiveMapperPaneTab('mapper')} className={`px-2 py-0.5 rounded text-xs ${activeMapperPaneTab === 'mapper' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Map</button>
                                    <button onClick={() => setActiveMapperPaneTab('config')} className={`px-2 py-0.5 rounded text-xs ${activeMapperPaneTab === 'config' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Cfg</button>
                                </div>
                            </div>
                            <button onClick={() => setActiveMobileModal('none')} className="text-gray-400 hover:text-white">✕ Close</button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <MapperEditor
                                isVisible={activeMapperPaneTab === 'mapper'}
                                code={displayMapperCode}
                                readOnly={mapperReadOnly}
                                onChange={setCustomMapperCode}
                            />
                            <ConfigEditor
                                isVisible={activeMapperPaneTab === 'config'}
                                code={configCode}
                                onChange={setConfigCode}
                            />
                        </div>
                    </div>
                )}

                {/* Output/Preview Modal */}
                {activeMobileModal === 'output' && (
                    <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col">
                        <div className="bg-gray-800 px-4 py-2 text-sm font-semibold border-b border-gray-700 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <span>Output Preview</span>
                                <div className="flex gap-2 bg-gray-900 rounded p-0.5 border border-gray-700">
                                    <button onClick={() => setActiveTab('render')} className={`px-2 py-0.5 rounded text-xs ${activeTab === 'render' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>View</button>
                                    <button onClick={() => setActiveTab('code')} className={`px-2 py-0.5 rounded text-xs ${activeTab === 'code' ? 'bg-blue-600 text-white' : 'text-gray-400'}`}>Code</button>
                                </div>
                            </div>
                            <button onClick={() => setActiveMobileModal('none')} className="text-gray-400 hover:text-white">✕ Close</button>
                        </div>
                        {/* Errors/Notifications */}
                        {error && <div className="bg-rose-700 text-white p-2 text-xs font-mono whitespace-pre-wrap shrink-0">Error: {error}</div>}
                        {notification && <div className="bg-blue-900 text-white p-2 text-xs flex justify-between shrink-0">{notification.message} <button onClick={() => setNotification(null)}>✕</button></div>}

                        <div className="flex-1 overflow-hidden bg-white text-black relative flex flex-col">
                            <OutputView
                                mode={activeTab}
                                content={output}
                            />
                        </div>
                    </div>
                )}

                {/* Console Modal */}
                {activeMobileModal === 'console' && (
                    <div className="absolute inset-0 z-50 bg-gray-900 flex flex-col">
                        <div className="bg-gray-800 px-4 py-2 text-sm font-semibold border-b border-gray-700 flex justify-between items-center shrink-0">
                            <div className="flex items-center gap-4">
                                <span>Console</span>
                                {/* Mobile console */}
                                <select
                                    className="bg-gray-900 text-xs text-white border border-gray-600 rounded px-1 py-0.5"
                                    value={consoleTab}
                                    onChange={(e) => setConsoleTab(e.target.value as any)}
                                >
                                    <option value="lexed">Lexed</option>
                                    <option value="parsed">Parsed</option>
                                    <option value="transpiled">Transpiled</option>
                                </select>
                            </div>
                            <button onClick={() => setActiveMobileModal('none')} className="text-gray-400 hover:text-white">✕ Close</button>
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <ConsoleEditor
                                activeTab={consoleTab}
                                format={format}
                                tokens={tokens}
                                ast={ast}
                                transpiled={output}
                            />
                        </div>
                    </div>
                )}
            </div>
        );
    }

    // --- DESKTOP LAYOUT ---
    return (
        <div className="h-screen w-screen bg-gray-900 text-white overflow-hidden flex flex-col">
            <PanelGroup orientation={orientation} className="h-full w-full">
                {/* Left Pane: Inputs */}
                <Panel defaultSize={50} minSize={20}>
                    <PanelGroup orientation="vertical" className="h-full w-full">
                        <Panel defaultSize={50} minSize={20}>
                            <div className="h-full flex flex-col">
                                <div className="bg-gray-800 px-4 py-2 text-sm font-semibold border-b border-gray-700 flex justify-between items-center">
                                    <span>SomMark Input</span>

                                    {/* Showcase Dropdown */}
                                    <div className="flex items-center gap-2">
                                        <label className="text-gray-400 text-xs">Load Showcase:</label>
                                        <select
                                            className="bg-gray-700 text-white text-xs rounded px-2 py-1 border border-gray-600 focus:outline-none focus:border-blue-500"
                                            onChange={(e) => loadShowcase(e.target.value)}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>Select an example...</option>
                                            {SHOWCASES.map(s => (
                                                <option key={s.id} value={s.id}>
                                                    {s.label}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <SmarkEditor
                                        code={smarkCode}
                                        onChange={setSmarkCode}
                                        beforeMount={handleEditorWillMount}
                                    />
                                </div>
                            </div>
                        </Panel>
                        <ResizeHandle orientation="vertical" className="h-px w-full cursor-row-resize" />
                        <Panel defaultSize={50} minSize={20}>
                            <div className="h-full flex flex-col">
                                <div className="bg-gray-800 px-4 py-1 text-sm font-semibold border-b border-gray-700 flex items-center gap-4">
                                    <span className='text-white mr-4'>Mapper / Config</span>
                                    <button
                                        onClick={() => setActiveMapperPaneTab('mapper')}
                                        className={`px-3 py-1 rounded ${activeMapperPaneTab === 'mapper' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Mapper
                                    </button>
                                    <button
                                        onClick={() => setActiveMapperPaneTab('config')}
                                        className={`px-3 py-1 rounded ${activeMapperPaneTab === 'config' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Config
                                    </button>
                                </div>
                                <div className="flex-1 overflow-hidden">
                                    <MapperEditor
                                        isVisible={activeMapperPaneTab === 'mapper'}
                                        code={displayMapperCode}
                                        readOnly={mapperReadOnly}
                                        onChange={setCustomMapperCode}
                                    />
                                    <ConfigEditor
                                        isVisible={activeMapperPaneTab === 'config'}
                                        code={configCode}
                                        onChange={setConfigCode}
                                    />
                                </div>
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>

                <ResizeHandle orientation="horizontal" className="w-px h-full cursor-col-resize" />

                {/* Right Pane: Output & Console */}
                <Panel defaultSize={50} minSize={20}>
                    <PanelGroup orientation="vertical" className="h-full w-full">
                        {/* Output Preview */}
                        <Panel defaultSize={70} minSize={20}>
                            <div className="h-full flex flex-col bg-white text-black">
                                <div className="bg-gray-800 px-4 py-1 text-sm font-semibold border-b border-gray-700 flex items-center gap-4">
                                    <span className='text-white mr-4'>Output Preview</span>
                                    <button
                                        onClick={() => setActiveTab('render')}
                                        className={`px-3 py-1 rounded ${activeTab === 'render' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Render
                                    </button>
                                    <button
                                        onClick={() => setActiveTab('code')}
                                        className={`px-3 py-1 rounded ${activeTab === 'code' ? 'bg-blue-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Code
                                    </button>
                                </div>
                                {error && (
                                    <div className="bg-rose-700 text-white p-4 border-b border-rose-700 text-sm font-mono whitespace-pre-wrap">
                                        Error: {error}
                                    </div>
                                )}
                                {notification && (
                                    <div className={`p-3 text-sm border-b flex justify-between items-start ${notification.type === 'error' ? 'bg-red-900 text-white border-red-700' :
                                        notification.type === 'warning' ? 'bg-amber-100 text-amber-900 border-amber-200' :
                                            'bg-blue-100 text-blue-900 border-blue-200'
                                        }`}>
                                        <div className="flex gap-2">
                                            {notification.type === 'warning' && <span>⚠️</span>}
                                            {notification.type === 'info' && <span>ℹ️</span>}
                                            <span className="font-medium">{notification.message}</span>
                                        </div>
                                        <button
                                            onClick={() => setNotification(null)}
                                            className="ml-4 opacity-60 hover:opacity-100 transition-opacity"
                                        >
                                            ✕
                                        </button>
                                    </div>
                                )}
                                <div className="flex-1 overflow-hidden h-full flex flex-col">
                                    <OutputView
                                        mode={activeTab}
                                        content={output}
                                    />
                                </div>
                            </div>
                        </Panel>

                        <ResizeHandle orientation="vertical" className="h-px w-full cursor-row-resize" />

                        {/* Console Panel */}
                        <Panel
                            panelRef={consolePanelRef}
                            collapsible={true}
                            defaultSize={30}
                            collapsedSize="36.8px"
                            minSize={0}
                            onResize={(size) => {
                                const isCollapsed = (size as any).inPixels <= 80;
                                if (isCollapsed !== isConsoleCollapsed) {
                                    setIsConsoleCollapsed(isCollapsed);
                                }
                            }}
                        >
                            <div className="h-full flex flex-col bg-gray-900 border-t border-gray-700">
                                <div className="bg-gray-800 px-4 py-1 text-sm font-semibold border-b border-gray-700 flex items-center gap-4">
                                    <span className='text-white mr-4'>Console</span>
                                    {/* ... Tabs ... */}
                                    <button
                                        onClick={() => setConsoleTab('lexed')}
                                        className={`px-3 py-1 rounded ${consoleTab === 'lexed' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Lexed
                                    </button>
                                    <button
                                        onClick={() => setConsoleTab('parsed')}
                                        className={`px-3 py-1 rounded ${consoleTab === 'parsed' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Parsed
                                    </button>
                                    <button
                                        onClick={() => setConsoleTab('transpiled')}
                                        className={`px-3 py-1 rounded ${consoleTab === 'transpiled' ? 'bg-purple-600 text-white' : 'text-gray-400 hover:text-white'}`}
                                    >
                                        Transpiled
                                    </button>
                                    <div className="flex-1" />
                                    <div className="flex items-center gap-1">
                                        <button
                                            onClick={minimizeConsole}
                                            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
                                            title="Minimize"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="m6 9 6 6 6-6" />
                                            </svg>
                                        </button>
                                        <button
                                            onClick={maximizeConsole}
                                            className="text-gray-400 hover:text-white p-1 rounded hover:bg-gray-700 transition-colors"
                                            title="Maximize"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                                <path d="m18 15-6-6-6 6" />
                                            </svg>
                                        </button>
                                    </div>
                                </div>
                                <div className={`flex-1 overflow-hidden ${isConsoleCollapsed ? 'hidden' : ''}`}>
                                    <ConsoleEditor
                                        activeTab={consoleTab}
                                        format={format}
                                        tokens={tokens}
                                        ast={ast}
                                        transpiled={output}
                                    />
                                </div>
                            </div>
                        </Panel>
                    </PanelGroup>
                </Panel>
            </PanelGroup>
        </div>
    );
};

export default Playground;
