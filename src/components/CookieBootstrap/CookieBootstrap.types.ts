import type {
    CookieCategoryDefinition,
    CookieConsentPersistence,
    CookieConsentState,
    CookieDeclarationItem,
} from '../../types'

export {HONEY_CONSENT_CHANGE_EVENT} from '../CookieConsentProvider/bootstrap-events'
export type {HoneyConsentChangeEventDetail} from '../CookieConsentProvider/bootstrap-events'

/** Window global key where consumers can park the bootstrap config before the
 *  bootstrap script loads. Read by `readCookieBootstrapConfig()`. */
export const HONEY_COOKIE_BOOTSTRAP_CONFIG_KEY = '__HONEY_COOKIE_CONFIG__'

/** Window global key for the per-page runtime created by the loader script
 *  (declaration / consent / saveConsent endpoints wired to your backend). */
export const HONEY_COOKIE_RUNTIME_KEY = '__HONEY_COOKIE_RUNTIME__'

/** Browser-side event fired by the loader script once the runtime is attached
 *  to `window`. React providers can wait for it before reading the runtime. */
export const HONEY_COOKIE_RUNTIME_READY_EVENT = 'honey:runtime-ready'

export type CookieBootstrapResourceKind = 'script' | 'iframe' | 'image'

/** Per-category lists of patterns that mark a `<script>` / `<iframe>` / `<img>`
 *  src or host as belonging to a given consent category. Patterns may use a
 *  trailing wildcard (`example.*`) and are evaluated against both host and src. */
export interface CookieBootstrapResourceRules {
    scripts?: Record<string, string[]>
    iframes?: Record<string, string[]>
    images?: Record<string, string[]>
}

export interface CookieBootstrapScanOptions {
    cookies?: boolean
    storage?: boolean
    scripts?: boolean
    iframes?: boolean
    images?: boolean
}

export interface CookieBootstrapConfig {
    siteKey?: string
    domain?: string
    version?: string
    storage?: CookieConsentPersistence
    storageKey?: string
    cookieName?: string
    cookieMaxAgeDays?: number
    categories?: CookieCategoryDefinition[]
    hideOnAccept?: boolean
    autoShow?: boolean
    reopenOnVersionChange?: boolean
    requiredCookies?: string[]
    categoryRules?: Record<string, string[]>
    resources?: CookieBootstrapResourceRules
    scan?: CookieBootstrapScanOptions
    configEndpoint?: string
    scanEndpoint?: string
    reportEndpoint?: string
    reportMethod?: 'POST' | 'PUT'
    reportHeaders?: Record<string, string>
}

/** Runtime parked on `window[HONEY_COOKIE_RUNTIME_KEY]` by the loader script.
 *  Bridges Honey's React provider to your hosted Cookie Compliance backend. */
export interface HoneyCookieRuntime {
    config: CookieBootstrapConfig
    getDeclaration?: () => Promise<CookieDeclarationItem[]>
    getConsent?: () => Promise<CookieConsentState | null>
    saveConsent?: (state: CookieConsentState) => void | Promise<void>
}

export interface CookieScanStorageItem {
    kind: 'localStorage' | 'sessionStorage'
    key: string
    value: string
}

export interface CookieScanResourceItem {
    kind: CookieBootstrapResourceKind
    src: string
    host: string
    category?: string
}

export interface CookieScanCookieItem {
    name: string
    value: string
    category: string
    required: boolean
    matchedBy: string
    source: string
}

export interface CookieScanReport {
    siteKey?: string
    domain: string
    url: string
    scannedAt: string
    cookies: CookieScanCookieItem[]
    storage: CookieScanStorageItem[]
    resources: CookieScanResourceItem[]
}

export interface CookieBootstrapHandle {
    config: CookieBootstrapConfig
    destroy: () => void
    getState: () => CookieConsentState | null
    sync: (state?: CookieConsentState | null) => void
}

declare global {
    interface Window {
        __HONEY_COOKIE_CONFIG__?: CookieBootstrapConfig
        __HONEY_COOKIE_RUNTIME__?: HoneyCookieRuntime
        HoneyCookieConsentBootstrap?: CookieBootstrapHandle
    }
}
