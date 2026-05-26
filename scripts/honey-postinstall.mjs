#!/usr/bin/env node

import {
    createInactiveActivationState,
    getPackageManifest,
    readProjectActivationState,
    resolvePackageRoot,
    resolveProjectRoot,
    writePackageActivationRuntime,
} from './honey-package-utils.mjs'

const packageRoot = resolvePackageRoot(import.meta.url)
const projectRoot = resolveProjectRoot()
const manifest = getPackageManifest(packageRoot)
const storedState = readProjectActivationState(projectRoot)
const packageName = typeof manifest.name === 'string' ? manifest.name : '@banzamel/honey'
const packageVersion = typeof manifest.version === 'string' ? manifest.version : null

/**
 * Re-emit the activation runtime after every `npm install`. If the project
 * already has a `.honey/activation.json` from a prior `honey activate` run,
 * the runtime is regenerated with that state preserved — so reinstalling
 * the package or its peers does not silently de-register the install.
 */
if (storedState?.activated === true && storedState.packageName === packageName) {
    writePackageActivationRuntime(packageRoot, {
        ...storedState,
        packageVersion: storedState.packageVersion ?? packageVersion,
    })
    process.exit(0)
}

writePackageActivationRuntime(
    packageRoot,
    createInactiveActivationState({
        packageName,
        packageVersion,
    })
)

console.warn(
    [
        '[Honey] Package installed, but this project is not activated yet.',
        'Run `node ./node_modules/@banzamel/honey/bin/honey.js activate --license-key=YOUR_LICENSE_KEY` in the project root.',
        'Honey will keep working without activation — only the backend premium features (audit logging, cross-domain consent, server-side scan reports) require a registered install.',
    ].join(' ')
)
