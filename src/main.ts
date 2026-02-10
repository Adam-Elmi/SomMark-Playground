import { CustomEditor } from './playground/Editor';
import { OutputPanel } from './playground/OutputPanel';
// @ts-ignore
import { parse, transpile, lex, HTML, MARKDOWN, MDX } from 'sommark';
// @ts-ignore
import Filter from 'ansi-to-html';
import { CustomSelect } from './playground/CustomSelect';
import { initialCode } from './playground/initialCode';

const ansiConverter = new Filter({
    newline: true,
    escapeXML: true,
    colors: {
        0: '#1a1a1e', // Base
        1: '#e03131', // Red
        2: '#69db7c', // Green
        3: '#fcc419', // Yellow
        4: '#4dabf7', // Blue
        5: '#f06595', // Pink
        6: '#3bc9db', // ++++
        7: '#e0e0e0', // Text
        8: '#707070', // Subtext1
        9: '#ff6b6b', // Red Light
        10: '#b2f2bb', // Bright Green
        11: '#ffe066', // Bright Yellow
        12: '#748ffc', // ++++++
        13: '#fcc2d7', // ++++++
        14: '#99e9f2', // ++++++
        15: '#ffffff'
    }
});

const FORMAT_MAPPERS: Record<string, any> = {
    'html': HTML,
    'markdown': MARKDOWN,
    'mdx': MDX,
    'text': null
};

const STORAGE_KEY_CODE = 'sommark-code';
const STORAGE_KEY_FORMAT = 'sommark-format';

async function main() {
    const editor = new CustomEditor('editor-container');
    const outputPanel = new OutputPanel('output-container');

    const savedFormat = localStorage.getItem(STORAGE_KEY_FORMAT) || 'html';
    const savedCode = localStorage.getItem(STORAGE_KEY_CODE);

    const formatSelect = new CustomSelect('format-select-container', [
        { label: 'HTML', value: 'html' },
        { label: 'Markdown', value: 'markdown' },
        { label: 'MDX', value: 'mdx' },
        { label: 'Text', value: 'text', hideRendered: true }
    ], savedFormat);

    const initialCodeContent = savedCode !== null ? savedCode : initialCode;

    editor.setValue(initialCodeContent);

    const update = async (code: string) => {
        const format = formatSelect.getValue();

        // Save to LocalStorage
        localStorage.setItem(STORAGE_KEY_CODE, code);
        localStorage.setItem(STORAGE_KEY_FORMAT, format);

        let transpiled = '';
        let ast: any = null;
        let tokens: any = null;

        try {
            tokens = lex(code);
            ast = parse(code);
            const mapperFile = FORMAT_MAPPERS[format] !== undefined ? FORMAT_MAPPERS[format] : HTML;
            const options = { src: code, format: format, mapperFile: mapperFile };
            transpiled = await transpile(options);

        } catch (e: any) {
            let errorMsg = 'An unknown error occurred.';
            if (typeof e === 'string') {
                errorMsg = e;
            } else if (e && e.message) {
                errorMsg = e.message;
            } else {
                try {
                    errorMsg = JSON.stringify(e);
                } catch (err) {
                    errorMsg = String(e);
                }
            }

            transpiled = `<div class="error-container">${ansiConverter.toHtml(errorMsg)}</div>`;

            ast = { error: errorMsg };
            if (!tokens) {
                tokens = [];
            }
            console.error(e);
        }

        outputPanel.updateAll({
            html: transpiled,
            ast: ast,
            tokens: tokens,
            format: format
        });

        outputPanel.setRenderedTabVisible(!formatSelect.getSelectedOption()?.hideRendered);
    };

    const debounce = (func: Function, delay: number) => {
        let timeoutId: any;
        return (...args: any[]) => {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                func.apply(null, args);
            }, delay);
        };
    };

    const debouncedUpdate = debounce((code: string) => {
        update(code);
    }, 500);

    editor.onInput((code) => {
        debouncedUpdate(code);
    });

    formatSelect.onChange(() => {
        update(editor.getValue());
    });

    const resetBtn = document.getElementById('reset-btn');
    resetBtn?.addEventListener('click', () => {
        if (confirm('Are you sure you want to reset the editor to its initial state?')) {
            editor.setValue(initialCode);
            localStorage.removeItem(STORAGE_KEY_CODE);
            update(initialCode);
        }
    });

    const mobileViewBtns = document.querySelectorAll('.view-btn');
    const playground = document.querySelector('.playground');
    mobileViewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            const view = (btn as HTMLElement).dataset.view;
            mobileViewBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            if (playground) {
                playground.classList.remove('show-editor', 'show-output');
                playground.classList.add(view === 'editor' ? 'show-editor' : 'show-output');
            }
        });
    });

    update(editor.getValue());
}

main();
