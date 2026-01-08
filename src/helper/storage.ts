export const STORAGE_KEYS = {
    SOMMARK_CODE: 'sommark_playground_input',
    MAPPER_CODE: 'sommark_playground_mapper',
    SOMMARK_CONFIG: 'sommark_playground_config_v2'
};

export const saveToStorage = (key: string, value: string) => {
    try {
        localStorage.setItem(key, value);
    } catch (error) {
        console.error('Error saving to localStorage:', error);
    }
};

export const getFromStorage = (key: string, defaultValue: string): string => {
    try {
        const item = localStorage.getItem(key);
        return item !== null ? item : defaultValue;
    } catch (error) {
        console.error('Error reading from localStorage:', error);
        return defaultValue;
    }
};