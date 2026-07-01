import {defineConfig} from 'vite'
import {resolve} from 'path'

// Standalone build for the hosted loader script served at
// `api.mineralui.io/cookie/bootstrap.min.js`. The bootstrap entry has no React
// dependency, so it is bundled fully self-contained as a classic-script IIFE
// (no imports/exports at the top level) that can load from a plain `<script src>`
// in the page <head>. This is intentionally separate from the library build in
// `vite.config.ts`, which emits ES/CJS modules for npm consumers.
export default defineConfig({
    build: {
        outDir: '.bootstrap-build',
        emptyOutDir: true,
        minify: true,
        sourcemap: false,
        lib: {
            entry: resolve(__dirname, 'src/cookie-consent-bootstrap.ts'),
            name: 'HoneyCookieBootstrap',
            formats: ['iife'],
            fileName: () => 'bootstrap.min.js',
        },
        rollupOptions: {
            // No externals — the loader must be a single self-contained file.
            output: {
                entryFileNames: 'bootstrap.min.js',
            },
        },
    },
})
