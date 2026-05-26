import {autoBootstrapCookieConsent} from './CookieBootstrap'
import {
    HONEY_COOKIE_BOOTSTRAP_CONFIG_KEY,
    HONEY_COOKIE_RUNTIME_KEY,
    HONEY_COOKIE_RUNTIME_READY_EVENT,
    type CookieBootstrapConfig,
    type HoneyCookieRuntime,
} from './CookieBootstrap.types'
import type {CookieConsentState} from '../../types'

/** Suffix appended to the storage key to track the server-issued consent key
 *  returned by `POST /cookie/sites/:siteKey/consent`. The consent key lets
 *  consumers reload the same consent across browsers when they sign in. */
const CONSENT_KEY_STORAGE_SUFFIX = '-key'

function trimTrailingSlash(value: string) {
    return value.replace(/\/+$/, '')
}

function getConsentKeyStorageKey(config: CookieBootstrapConfig) {
    return `${config.storageKey ?? 'honey-cookie-consent'}${CONSENT_KEY_STORAGE_SUFFIX}`
}

function readStoredConsentKey(storageKey: string) {
    if (typeof window === 'undefined') {
        return null
    }

    try {
        return window.localStorage.getItem(storageKey)
    } catch {
        return null
    }
}

function writeStoredConsentKey(storageKey: string, consentKey: string | null | undefined) {
    if (typeof window === 'undefined' || !consentKey) {
        return
    }

    try {
        window.localStorage.setItem(storageKey, consentKey)
    } catch {
        // ignore storage issues — non-blocking for the bootstrap.
    }
}

/** Park the resolved config + runtime on `window` so the React provider can pick
 *  it up via `useEffect(() => window.__HONEY_COOKIE_RUNTIME__)`. Fires the
 *  ready event so providers that mounted before the script can rerender. */
function dispatchRuntimeReady(runtime: HoneyCookieRuntime) {
    if (typeof window === 'undefined') {
        return
    }

    window[HONEY_COOKIE_BOOTSTRAP_CONFIG_KEY] = runtime.config
    window[HONEY_COOKIE_RUNTIME_KEY] = runtime
    window.dispatchEvent(new CustomEvent(HONEY_COOKIE_RUNTIME_READY_EVENT))
}

function readScriptUrl(candidate: HTMLScriptElement | null) {
    if (!candidate?.src || typeof window === 'undefined') {
        return null
    }

    try {
        return new URL(candidate.src, window.location.href)
    } catch {
        return null
    }
}

/** Locate the bootstrap `<script>` element on the page so we can read `data-*`
 *  attributes and query string parameters from it. Tries `id="honey-cookie-bootstrap"`
 *  first, then `document.currentScript`, finally any `<script src>` that matches
 *  the resolved URL by origin + pathname. */
function findBootstrapScriptElement(scriptUrl?: URL | null) {
    if (typeof document === 'undefined') {
        return null
    }

    const namedScript = document.getElementById('honey-cookie-bootstrap')
    if (namedScript instanceof HTMLScriptElement) {
        return namedScript
    }

    const currentScript = document.currentScript
    if (currentScript instanceof HTMLScriptElement) {
        return currentScript
    }

    if (!scriptUrl || typeof window === 'undefined') {
        return null
    }

    for (const candidate of Array.from(document.querySelectorAll<HTMLScriptElement>('script[src]'))) {
        try {
            const candidateUrl = new URL(candidate.src, window.location.href)

            if (candidateUrl.href === scriptUrl.href) {
                return candidate
            }

            if (candidateUrl.origin === scriptUrl.origin && candidateUrl.pathname === scriptUrl.pathname) {
                return candidate
            }
        } catch {
            // ignore invalid script urls
        }
    }

    return null
}

/** Build a runtime whose declaration / consent / saveConsent calls go to the
 *  hosted Cookie Compliance backend at `apiBaseUrl`. The runtime caches the
 *  server-issued consent key in localStorage so the same browser stays in sync
 *  with the backend without forcing the user to sign in. */
export function createHoneyCookieRuntime(
    config: CookieBootstrapConfig,
    apiBaseUrl: string,
    siteKey: string
): HoneyCookieRuntime {
    const cookieSiteBase = `${trimTrailingSlash(apiBaseUrl)}/cookie/sites/${encodeURIComponent(siteKey)}`
    const consentKeyStorage = getConsentKeyStorageKey(config)

    return {
        config,
        getDeclaration: async () => {
            const response = await fetch(`${cookieSiteBase}/declaration`)

            if (!response.ok) {
                return []
            }

            const payload = await response.json()
            return payload.items ?? []
        },
        getConsent: async () => {
            const consentKey = readStoredConsentKey(consentKeyStorage)

            if (!consentKey) {
                return null
            }

            const response = await fetch(
                `${cookieSiteBase}/consent?consentKey=${encodeURIComponent(consentKey)}`
            )

            if (!response.ok) {
                return null
            }

            const payload = await response.json()
            return payload.state ?? null
        },
        saveConsent: async (state: CookieConsentState) => {
            const consentKey = readStoredConsentKey(consentKeyStorage)
            const response = await fetch(`${cookieSiteBase}/consent`, {
                method: 'POST',
                headers: {'content-type': 'application/json'},
                body: JSON.stringify({
                    ...(consentKey ? {consentKey} : {}),
                    version: state.version,
                    decidedAt: state.decidedAt,
                    source: state.source,
                    categories: state.categories,
                    domain: typeof window !== 'undefined' ? window.location.hostname : (config.domain ?? null),
                }),
            })

            if (!response.ok) {
                return
            }

            const payload = await response.json()
            writeStoredConsentKey(consentKeyStorage, payload.consentKey)
        },
    }
}

/** Ask the backend for the per-site config (categories, resource rules, scan
 *  endpoint, etc.). Reads `data-site-key` / `data-api-base` / `data-config-endpoint`
 *  / `data-scan-endpoint` off the loader script, or falls back to query string
 *  params on its URL. Caches the resolved config on `window` so subsequent
 *  bootstraps reuse it without a second fetch. */
export async function resolveCookieBootstrapConfigFromScript(scriptUrl?: URL | null) {
    if (typeof window === 'undefined' || typeof fetch === 'undefined') {
        return null
    }

    const existingConfig = window[HONEY_COOKIE_BOOTSTRAP_CONFIG_KEY]
    if (existingConfig) {
        return existingConfig
    }

    const bootstrapScript = findBootstrapScriptElement(scriptUrl)
    const resolvedScriptUrl = scriptUrl ?? readScriptUrl(bootstrapScript)
    const siteKey = bootstrapScript?.dataset.siteKey ?? resolvedScriptUrl?.searchParams.get('siteKey')

    if (!siteKey) {
        return null
    }

    const apiBaseUrl =
        bootstrapScript?.dataset.apiBase ??
        resolvedScriptUrl?.searchParams.get('apiBase') ??
        resolvedScriptUrl?.origin ??
        window.location.origin

    const configEndpoint =
        bootstrapScript?.dataset.configEndpoint ??
        resolvedScriptUrl?.searchParams.get('configEndpoint') ??
        `${trimTrailingSlash(apiBaseUrl)}/cookie/bootstrap/${encodeURIComponent(siteKey)}`

    try {
        const response = await fetch(configEndpoint, {
            headers: {'x-honey-site-key': siteKey},
        })

        if (!response.ok) {
            return null
        }

        const resolvedConfig = (await response.json()) as CookieBootstrapConfig
        const mergedConfig: CookieBootstrapConfig = {
            ...resolvedConfig,
            siteKey: resolvedConfig.siteKey ?? siteKey,
            scanEndpoint:
                resolvedConfig.scanEndpoint ??
                bootstrapScript?.dataset.scanEndpoint ??
                resolvedScriptUrl?.searchParams.get('scanEndpoint') ??
                undefined,
        }

        dispatchRuntimeReady(createHoneyCookieRuntime(mergedConfig, apiBaseUrl, siteKey))
        return mergedConfig
    } catch {
        return null
    }
}

/** Entry point invoked by `cookie-consent-bootstrap.js` when the script tag
 *  loads. Resolves the server config, parks the runtime on `window`, then
 *  starts the bootstrap so trackers are blocked/unblocked immediately. */
export async function initializeCookieConsentBootstrapScript(scriptUrl?: URL | null) {
    await resolveCookieBootstrapConfigFromScript(scriptUrl)
    return autoBootstrapCookieConsent()
}
