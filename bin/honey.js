#!/usr/bin/env node

import {
    createInactiveActivationState,
    getPackageManifest,
    getProjectPackageJson,
    readProjectActivationState,
    resolveApiBaseUrl,
    resolveEnvironment,
    resolveFingerprint,
    resolveHostname,
    resolveInstanceId,
    resolvePackageRoot,
    resolveProjectName,
    resolveProjectRoot,
    writePackageActivationRuntime,
    writeProjectActivationState,
} from '../scripts/honey-package-utils.mjs'

function printUsage() {
    console.log(`Honey CLI

Usage:
    honey activate --license-key=YOUR_LICENSE_KEY

Optional flags:
    --api-url=https://api.mineralui.io
    --project-name=my-project
    --hostname=cookies.example.com
    --environment=production
    --instance-id=custom-instance-id

Environment variables (highest precedence first):
    HONEY_API_URL, HONEY_LICENSE_API_URL,
    MINERALUI_API_URL, MINERALUI_LICENSE_API_URL, MINERALUI_REGISTRY_API_URL
`)
}

function parseArgs(argv) {
    const values = {}
    const positional = []

    for (const entry of argv) {
        if (!entry.startsWith('--')) {
            positional.push(entry)
            continue
        }

        const withoutPrefix = entry.slice(2)
        const separatorIndex = withoutPrefix.indexOf('=')

        if (separatorIndex === -1) {
            values[withoutPrefix] = true
            continue
        }

        const key = withoutPrefix.slice(0, separatorIndex)
        const value = withoutPrefix.slice(separatorIndex + 1)
        values[key] = value
    }

    return {values, positional}
}

async function readJsonResponse(response) {
    try {
        return await response.json()
    } catch {
        return null
    }
}

async function main() {
    const {values, positional} = parseArgs(process.argv.slice(2))
    const command = positional[0]

    if (!command || values.help || values.h) {
        printUsage()
        return 0
    }

    if (command !== 'activate') {
        console.error(`[Honey] Unknown command: ${command}`)
        printUsage()
        return 1
    }

    const licenseKey = typeof values['license-key'] === 'string' ? values['license-key'].trim() : ''

    if (!licenseKey) {
        console.error('[Honey] Missing required flag: --license-key')
        return 1
    }

    const projectRoot = resolveProjectRoot()
    const packageRoot = resolvePackageRoot(import.meta.url)
    const packageManifest = getPackageManifest(packageRoot)
    const projectPackage = getProjectPackageJson(projectRoot)
    const storedActivationState = readProjectActivationState(projectRoot)
    const packageName = typeof packageManifest.name === 'string' ? packageManifest.name : '@banzamel/honey'
    const packageVersion = typeof packageManifest.version === 'string' ? packageManifest.version : null
    const projectName =
        (typeof values['project-name'] === 'string' ? values['project-name'].trim() : '') ||
        resolveProjectName(projectRoot, projectPackage)
    const hostname =
        (typeof values.hostname === 'string' ? values.hostname.trim() : '') ||
        resolveHostname(projectPackage)
    const environment =
        (typeof values.environment === 'string' ? values.environment.trim() : '') || resolveEnvironment()
    const storedInstanceId =
        storedActivationState?.activated === true &&
        storedActivationState.packageName === packageName &&
        typeof storedActivationState.instanceId === 'string' &&
        storedActivationState.instanceId.trim() !== ''
            ? storedActivationState.instanceId.trim()
            : ''
    const instanceId =
        (typeof values['instance-id'] === 'string' ? values['instance-id'].trim() : '') ||
        storedInstanceId ||
        resolveInstanceId(projectRoot, packageName, hostname)
    const fingerprint = resolveFingerprint(projectRoot, packageName, packageVersion ?? '0.0.0', hostname)
    const apiBaseUrl =
        (typeof values['api-url'] === 'string' ? values['api-url'].trim() : '') ||
        resolveApiBaseUrl(projectRoot)
    const endpoint = `${apiBaseUrl.replace(/\/+$/, '')}/licensing/activate`

    const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
            'content-type': 'application/json',
            accept: 'application/json',
        },
        body: JSON.stringify({
            license_key: licenseKey,
            instance_id: instanceId,
            package_name: packageName,
            package_version: packageVersion,
            project_name: projectName,
            environment,
            hostname,
            fingerprint,
            metadata: {
                cwd: projectRoot,
                user_agent: process.env.npm_config_user_agent ?? null,
                activated_via: 'honey-cli',
            },
        }),
    })

    const payload = await readJsonResponse(response)

    if (!response.ok) {
        const message =
            payload?.errors?.license_key?.[0] ??
            payload?.message ??
            `Activation request failed with status ${response.status}.`

        console.error(`[Honey] ${message}`)
        return 1
    }

    const activationState = {
        activated: true,
        packageName,
        packageVersion,
        projectName,
        environment,
        hostname,
        instanceId,
        activationId: payload?.activation?.activation_id ?? null,
        activatedAt: payload?.activation?.activated_at ?? new Date().toISOString(),
        apiBaseUrl: apiBaseUrl.replace(/\/+$/, ''),
    }

    writeProjectActivationState(projectRoot, activationState)
    writePackageActivationRuntime(packageRoot, activationState)

    const operation = payload?.operation === 'updated' ? 'updated' : 'created'

    if (operation === 'updated') {
        console.log('[Honey] Installation updated successfully.')
    } else {
        console.log('[Honey] Installation activated successfully.')
    }

    if (activationState.activationId) {
        console.log(`[Honey] Activation ID: ${activationState.activationId}`)
    }

    console.log(`[Honey] Project: ${projectName}`)
    console.log(`[Honey] Hostname: ${hostname}`)
    return 0
}

main()
    .then((code) => {
        process.exitCode = code ?? 0
    })
    .catch((error) => {
        const message = error instanceof Error ? error.message : 'Unknown activation error.'
        console.error(`[Honey] ${message}`)

        // Write an inactive runtime so the package keeps signalling its
        // unregistered state — never leave the package in a half-state where
        // the previous activation runtime is still on disk but stale.
        const packageRoot = resolvePackageRoot(import.meta.url)
        const manifest = getPackageManifest(packageRoot)

        writePackageActivationRuntime(
            packageRoot,
            createInactiveActivationState({
                packageName: typeof manifest.name === 'string' ? manifest.name : '@banzamel/honey',
                packageVersion: typeof manifest.version === 'string' ? manifest.version : null,
            })
        )

        process.exitCode = 1
    })
