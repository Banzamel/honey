import {createHash} from 'crypto'
import {existsSync, mkdirSync, readFileSync, writeFileSync} from 'fs'
import {basename, dirname, resolve} from 'path'
import {fileURLToPath} from 'url'

const defaultApiBaseUrl = 'https://api.mineralui.io'
const defaultPackageName = '@banzamel/honey'

function safeReadFile(filePath) {
    try {
        return readFileSync(filePath, 'utf8')
    } catch {
        return null
    }
}

export function resolvePackageRoot(metaUrl) {
    return resolve(dirname(fileURLToPath(metaUrl)), '..')
}

/**
 * The "project root" is the npm-consumer's project — where `npm install
 * @banzamel/honey` was invoked. `INIT_CWD` is set by npm during the install
 * / run-script lifecycle; `process.cwd()` is the fallback for the CLI being
 * invoked outside an npm context.
 */
export function resolveProjectRoot() {
    return resolve(process.env.INIT_CWD || process.cwd())
}

export function readJson(filePath) {
    const content = safeReadFile(filePath)

    if (!content) {
        return null
    }

    try {
        return JSON.parse(content)
    } catch {
        return null
    }
}

export function writeJson(filePath, value) {
    mkdirSync(dirname(filePath), {recursive: true})
    writeFileSync(filePath, `${JSON.stringify(value, null, 4)}\n`)
}

export function getProjectPackageJson(projectRoot) {
    return readJson(resolve(projectRoot, 'package.json')) ?? {}
}

export function getPackageManifest(packageRoot) {
    return readJson(resolve(packageRoot, 'package.json')) ?? {}
}

/** State file location inside the consumer project. Marked with a leading dot
 *  so it joins .git, .vscode etc. in the ignored / collapsed bucket. */
export function getProjectActivationFilePath(projectRoot) {
    return resolve(projectRoot, '.honey', 'activation.json')
}

export function readProjectActivationState(projectRoot) {
    return readJson(getProjectActivationFilePath(projectRoot))
}

export function writeProjectActivationState(projectRoot, state) {
    writeJson(getProjectActivationFilePath(projectRoot), state)
}

export function createStableHash(value, length = 40) {
    return createHash('sha256').update(value).digest('hex').slice(0, length)
}

export function resolveProjectName(projectRoot, packageJson = {}) {
    const packageName = typeof packageJson.name === 'string' ? packageJson.name.trim() : ''

    if (packageName) {
        return packageName
    }

    return basename(projectRoot)
}

export function resolveHostname(packageJson = {}) {
    const homepage = typeof packageJson.homepage === 'string' ? packageJson.homepage.trim() : ''

    if (homepage) {
        try {
            return new URL(homepage).hostname
        } catch {
            // ignore invalid homepage values
        }
    }

    return 'localhost'
}

export function resolveEnvironment() {
    const value = process.env.NODE_ENV?.trim()
    return value || 'development'
}

export function resolveInstanceId(projectRoot, packageName, hostname) {
    return createStableHash(`${packageName}|${hostname}|${projectRoot}`, 40)
}

export function resolveFingerprint(projectRoot, packageName, packageVersion, hostname) {
    return createStableHash(`${projectRoot}|${packageName}|${packageVersion}|${hostname}`, 64)
}

/**
 * Resolve the licensing API base URL.
 *
 * Honey shares the backend with `@banzamel/mineralui-pro` — the same
 * `/licensing/activate` endpoint accepts both products, discriminated by the
 * `package_name` field on the activation payload. Consumers that already
 * point MINERALUI_API_URL at a custom backend get that value picked up
 * automatically; HONEY_API_URL takes precedence when set.
 */
export function resolveApiBaseUrl(projectRoot) {
    const envValue =
        process.env.HONEY_API_URL?.trim() ||
        process.env.HONEY_LICENSE_API_URL?.trim() ||
        process.env.MINERALUI_API_URL?.trim() ||
        process.env.MINERALUI_LICENSE_API_URL?.trim() ||
        process.env.MINERALUI_REGISTRY_API_URL?.trim()

    if (envValue) {
        return envValue.replace(/\/+$/, '')
    }

    const npmrcContent = safeReadFile(resolve(projectRoot, '.npmrc'))

    if (npmrcContent) {
        const registryLine = npmrcContent
            .split(/\r?\n/)
            .map((line) => line.trim())
            .find((line) => line.startsWith('@banzamel:registry='))

        if (registryLine) {
            const registryUrl = registryLine.slice('@banzamel:registry='.length).trim()

            try {
                const parsed = new URL(registryUrl)
                const normalizedPath = parsed.pathname.replace(/\/npm\/?$/, '')
                return `${parsed.origin}${normalizedPath}`.replace(/\/+$/, '')
            } catch {
                // ignore invalid registry urls
            }
        }
    }

    return defaultApiBaseUrl
}

export function createInactiveActivationState(overrides = {}) {
    return {
        activated: false,
        packageName: defaultPackageName,
        packageVersion: null,
        projectName: null,
        environment: null,
        hostname: null,
        instanceId: null,
        activationId: null,
        activatedAt: null,
        apiBaseUrl: defaultApiBaseUrl,
        ...overrides,
    }
}

function getActivationWarningMessage() {
    return [
        '[Honey] This project is using @banzamel/honey, but the installation is not registered yet.',
        'Run `node ./node_modules/@banzamel/honey/bin/honey.js activate --license-key=YOUR_LICENSE_KEY` to register this project in your license portal.',
        'Honey will keep working without activation, but premium backend features (audit logging, cross-domain consent sharing, server-side scan reports) need a registered install.',
    ].join(' ')
}

/**
 * Generate the small JS module that runs the activation check at import time.
 * Stashed in `dist/honey-activation-runtime.{js,cjs}` and prepended to every
 * non-bootstrap dist entry by the cssAutoInject-equivalent in vite.config.ts.
 */
function buildActivationRuntimeSource(state, format) {
    const serializedState = JSON.stringify(state, null, 4)
    const warningMessage = JSON.stringify(getActivationWarningMessage())

    if (format === 'cjs') {
        return `const activationState = ${serializedState}

function applyHoneyActivationState() {
    if (typeof window === 'undefined') {
        return
    }

    if (activationState.activated) {
        window.__HONEY_ACTIVATED__ = true
        return
    }

    if (window.__HONEY_ACTIVATION_WARNING_SHOWN__ === true) {
        return
    }

    window.__HONEY_ACTIVATION_WARNING_SHOWN__ = true
    console.warn(${warningMessage})
}

applyHoneyActivationState()

exports.activationState = activationState
exports.applyHoneyActivationState = applyHoneyActivationState
`
    }

    return `const activationState = ${serializedState}

function applyHoneyActivationState() {
    if (typeof window === 'undefined') {
        return
    }

    if (activationState.activated) {
        window.__HONEY_ACTIVATED__ = true
        return
    }

    if (window.__HONEY_ACTIVATION_WARNING_SHOWN__ === true) {
        return
    }

    window.__HONEY_ACTIVATION_WARNING_SHOWN__ = true
    console.warn(${warningMessage})
}

applyHoneyActivationState()

export {activationState, applyHoneyActivationState}
`
}

export function writePackageActivationRuntime(packageRoot, state) {
    const distDir = resolve(packageRoot, 'dist')

    if (!existsSync(distDir)) {
        return
    }

    writeFileSync(resolve(distDir, 'honey-activation-runtime.js'), buildActivationRuntimeSource(state, 'esm'))
    writeFileSync(resolve(distDir, 'honey-activation-runtime.cjs'), buildActivationRuntimeSource(state, 'cjs'))
}
