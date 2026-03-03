import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
    // Shared config for both dev and build
    const config: any = {
        base: '/SomMark-Playground/',
        root: '.',
        server: {
            open: true,
            host: true
        },
        build: {
            outDir: 'dist'
        }
    };

    // When building for production, add library mode
    if (command === 'build') {
        config.build = {
            outDir: 'dist',
            lib: {
                entry: resolve(__dirname, 'src/index.ts'),
                name: 'SomMarkPlayground',
                formats: ['es', 'umd'],
                fileName: (format: string) => `sommark-playground.${format}.js`
            },
            rollupOptions: {
                external: ['sommark'],
                output: {
                    globals: {
                        sommark: 'SomMark'
                    }
                }
            }
        };
    }

    return config;
});
