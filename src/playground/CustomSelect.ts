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

    private triggerEl: HTMLElement;
    private optionsEl: HTMLElement;
    private isOpen: boolean = false;

    constructor(elementId: string, options: SelectOption[], initialValue: string) {
        const el = document.getElementById(elementId);
        if (!el) throw new Error(`Element ${elementId} not found`);
        this.container = el;
        this.options = options;
        this.selectedValue = initialValue;

        this.container.classList.add('custom-select-container');

        if (this.container.querySelector('.custom-select-trigger')) {
            this.container.innerHTML = '';
        }

        this.render();

        this.triggerEl = this.container.querySelector('.custom-select-trigger') as HTMLElement;
        this.optionsEl = this.container.querySelector('.custom-options') as HTMLElement;

        this.setupEvents();
    }

    private render() {
        const selectedLabel = this.options.find(o => o.value === this.selectedValue)?.label || this.selectedValue;

        const optionsHtml = this.options.map(opt => `
            <div class="custom-option ${opt.value === this.selectedValue ? 'selected' : ''}" data-value="${opt.value}">
                ${opt.label}
            </div>
        `).join('');

        this.container.innerHTML = `
            <div class="custom-select-trigger" tabindex="0">
                <span>${selectedLabel}</span>
                <div class="arrow"></div>
            </div>
            <div class="custom-options">
                ${optionsHtml}
            </div>
        `;
    }

    private setupEvents() {
        this.triggerEl.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggle();
        });

        this.triggerEl.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                this.toggle();
            }
        });

        this.optionsEl.addEventListener('click', (e) => {
            const option = (e.target as HTMLElement).closest('.custom-option');
            if (option) {
                const value = (option as HTMLElement).dataset.value;
                if (value) {
                    this.select(value);
                }
            }
        });

        document.addEventListener('click', (e) => {
            if (this.isOpen && !this.container.contains(e.target as Node)) {
                this.close();
            }
        });
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
        this.container.classList.add('open');
        this.optionsEl.classList.add('open');
    }

    private close() {
        this.isOpen = false;
        this.container.classList.remove('open');
        this.optionsEl.classList.remove('open');
    }

    public select(value: string) {
        this.selectedValue = value;
        const selectedLabel = this.options.find(o => o.value === this.selectedValue)?.label || value;

        const span = this.triggerEl.querySelector('span');
        if (span) span.textContent = selectedLabel;

        this.optionsEl.querySelectorAll('.custom-option').forEach(el => {
            el.classList.remove('selected');
            if ((el as HTMLElement).dataset.value === value) {
                el.classList.add('selected');
            }
        });

        this.close();

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
