import {defineConfig, type Plugin} from 'vite'
import {resolve} from 'path'
import {readFileSync, writeFileSync} from 'fs'
import dts from 'vite-plugin-dts'

/**
 * Auto-injects the built CSS into the JS entry on first import, so consumers
 * get fully styled components without an explicit `import '@banzamel/honey/styles.css'`.
 * The styles can still be imported manually for SSR-only setups.
 */
function cssAutoInject(entryNames: string[]): Plugin {
    return {
        name: 'honey-css-auto-inject',
        apply: 'build',
        closeBundle() {
            const distDir = resolve(__dirname, 'dist')
            let css: string
            try {
                css = readFileSync(resolve(distDir, 'styles.css'), 'utf-8')
            } catch {
                return
            }

            const escaped = css.replace(/\\/g, '\\\\').replace(/`/g, '\\`').replace(/\$/g, '\\$')

            const runtimes = [
                {
                    file: 'style-runtime.js',
                    include: (file: string) => `${file}.js`,
                    prefix: "import {ensureStyles} from './style-runtime.js'\nensureStyles()\n",
                    code: [
                        'export function ensureStyles(){',
                        'if(typeof document!=="undefined"){',
                        'let s=document.getElementById("honey-styles");',
                        'if(!s){s=document.createElement("style");',
                        's.id="honey-styles";',
                        `s.textContent=\`${escaped}\`;`,
                        'document.head.appendChild(s)}}',
                        '}',
                    ].join(''),
                },
                {
                    file: 'style-runtime.cjs',
                    include: (file: string) => `${file}.cjs`,
                    prefix: "const {ensureStyles}=require('./style-runtime.cjs')\nensureStyles()\n",
                    code: [
                        'function ensureStyles(){',
                        'if(typeof document!=="undefined"){',
                        'let s=document.getElementById("honey-styles");',
                        'if(!s){s=document.createElement("style");',
                        's.id="honey-styles";',
                        `s.textContent=\`${escaped}\`;`,
                        'document.head.appendChild(s)}}',
                        '}',
                        'exports.ensureStyles=ensureStyles',
                    ].join(''),
                },
            ]

            for (const runtime of runtimes) {
                writeFileSync(resolve(distDir, runtime.file), runtime.code)
                for (const entryName of entryNames) {
                    const entryPath = resolve(distDir, runtime.include(entryName))
                    try {
                        const code = readFileSync(entryPath, 'utf-8')
                        if (!code.startsWith(runtime.prefix)) {
                            writeFileSync(entryPath, runtime.prefix + code)
                        }
                    } catch {
                        /* skip if file doesn't exist */
                    }
                }
            }
        },
    }
}

const entryMap = {
    index: resolve(__dirname, 'src/index.ts'),
    'cookie-consent-bootstrap': resolve(__dirname, 'src/cookie-consent-bootstrap.ts'),
}

// The bootstrap entry runs before any React/CSS is loaded — it must not pull
// in styles or trigger the auto-inject runtime. Only inject styles into the
// React-facing entries.
const styleInjectedEntries = Object.keys(entryMap).filter(
    (entryName) => entryName !== 'cookie-consent-bootstrap'
)

export default defineConfig({
    plugins: [
        dts({insertTypesEntry: true, rollupTypes: false}),
        cssAutoInject(styleInjectedEntries),
    ],
    build: {
        lib: {
            entry: entryMap,
            name: 'Honey',
            formats: ['es', 'cjs'],
            fileName: (format, entryName) => `${entryName}.${format === 'es' ? 'js' : 'cjs'}`,
        },
        rollupOptions: {
            external: ['react', 'react-dom', 'react/jsx-runtime'],
            output: {
                globals: {
                    react: 'React',
                    'react-dom': 'ReactDOM',
                    'react/jsx-runtime': 'jsxRuntime',
                },
                assetFileNames: 'styles.css',
            },
        },
        cssCodeSplit: false,
        sourcemap: true,
    },
})
