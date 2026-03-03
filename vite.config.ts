import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig(({ command }) => {
    const isLibBuild = process.env.VITE_BUILD_MODE === 'lib';

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

    // Library mode: for npm publishing
    if (command === 'build' && isLibBuild) {
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
