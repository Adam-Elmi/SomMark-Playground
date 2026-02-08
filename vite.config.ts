import { defineConfig } from 'vite';

export default defineConfig({
    base: '/SomMark-Playground/',
    root: '.',
    server: {
        open: true,
        host: true
    },
    build: {
        outDir: 'dist'
    }
});
