import { defineConfig } from 'vite';
import { nodePolyfills } from 'vite-plugin-node-polyfills';

// https://vite.dev/config/
export default defineConfig({
  server: {
    host: true,
  },
  build: {
    sourcemap: true,
  },
  resolve: {
    alias: {
      // Direct aliases for Node.js built-ins to a safe empty mock
      // This satisfies both dev (esbuild) and build (rollup)
      'node:fs/promises': 'node-stdlib-browser/mock/empty',
      'node:fs': 'node-stdlib-browser/mock/empty',
      'node:url': 'node-stdlib-browser/mock/empty',
      'node:path': 'node-stdlib-browser/mock/empty',
      'node:os': 'node-stdlib-browser/mock/empty',
    }
  },
  plugins: [
    nodePolyfills({
      protocolImports: true,
    }),
  ],
});