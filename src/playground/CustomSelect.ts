export interface SelectOption {
    label: string;
    value: string;
    hideRendered?: boolean;
}

export class CustomSelect {
    private container: HTMLElement;
    private options: SelectOption[];
    private selectedValue: string;
    private onChangeCallback: ((value: string) => void) | null = null;

    private optionsEl!: HTMLElement;
    private isOpen: boolean = false;

    constructor(container: HTMLElement | string, options: SelectOption[], initialValue: string) {
        const el = typeof container === 'string' ? document.getElementById(container) : container;
        if (!el) throw new Error(`Container ${container} not found`);
        this.container = el as HTMLElement;
        this.options = options;
        this.selectedValue = initialValue;

        this.init();
    }

    private init() {
        this.container.classList.add('sm-format-select');
        this.render();
        this.setupEvents();
    }

    private render() {
        const selectedLabel = this.options.find(o => o.value === this.selectedValue)?.label || this.selectedValue;

        const optionsHtml = this.options.map(opt => `
            <div class="sm-select-option ${opt.value === this.selectedValue ? 'sm-active' : ''}" data-value="${opt.value}">
                ${opt.label}
            </div>
        `).join('');

        this.container.innerHTML = `
            <div class="sm-select-trigger" tabindex="0">
                <span class="sm-select-value">${selectedLabel}</span>
                <div class="sm-select-arrow"></div>
            </div>
            <div class="sm-select-options ${this.isOpen ? 'sm-visible' : ''}">
                ${optionsHtml}
            </div>
        `;

        this.optionsEl = this.container.querySelector('.sm-select-options') as HTMLElement;
    }

    private setupEvents() {
        // Use event delegation on the container to handle re-renders
        this.container.addEventListener('click', (e) => {
            const target = e.target as HTMLElement;
            
            const trigger = target.closest('.sm-select-trigger');
            if (trigger) {
                e.stopPropagation();
                this.toggle();
                return;
            }

            const option = target.closest('.sm-select-option');
            if (option) {
                const value = (option as HTMLElement).dataset.value;
                if (value) {
                    this.select(value);
                }
            }
        });

        // Document click should only be added once in the constructor's init path
        const onDocClick = (e: MouseEvent) => {
            if (this.isOpen && !this.container.contains(e.target as Node)) {
                this.close();
            }
        };
        document.addEventListener('click', onDocClick);
    }

    private toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }

    private open() {
        this.isOpen = true;
        this.optionsEl.classList.add('sm-visible');
        this.container.classList.add('sm-open');
    }

    private close() {
        this.isOpen = false;
        this.optionsEl.classList.remove('sm-visible');
        this.container.classList.remove('sm-open');
    }

    public select(value: string) {
        this.selectedValue = value;
        this.close();
        this.render(); 
        if (this.onChangeCallback) {
            this.onChangeCallback(this.selectedValue);
        }
    }

    public onChange(callback: (value: string) => void) {
        this.onChangeCallback = callback;
    }

    public getValue(): string {
        return this.selectedValue;
    }

    public getSelectedOption(): SelectOption | undefined {
        return this.options.find(o => o.value === this.selectedValue);
    }
}

