/// <reference types="vitest/config" />
import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Strict CSP, added to the built HTML only (the dev server needs inline scripts for hot reload).
// The same policy is in public/_headers for hosts that support response headers.
const CSP =
  "default-src 'self'; script-src 'self' 'wasm-unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob:; font-src 'self' data:; connect-src 'self' data:; object-src 'none'; base-uri 'self'; form-action 'none'";

function cspPlugin(): Plugin {
  return {
    name: 'spikeline-csp',
    apply: 'build',
    transformIndexHtml(html) {
      return html.replace('<!--CSP-->', `<meta http-equiv="Content-Security-Policy" content="${CSP}" />`);
    },
  };
}

export default defineConfig({
  // Relative base: works on any static host, including a GitHub Pages repo subpath.
  base: './',
  plugins: [react(), cspPlugin()],
  resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
  build: { target: 'es2022', sourcemap: false },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['src/test/setup.ts'],
    include: ['src/**/*.test.{ts,tsx}'],
  },
});
