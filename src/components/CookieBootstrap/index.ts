export {
    autoBootstrapCookieConsent,
    bootstrapCookieConsent,
    readCookieBootstrapConfig,
    reportCookieSurface,
    scanCookieSurface,
} from './CookieBootstrap'

export {
    createHoneyCookieRuntime,
    initializeCookieConsentBootstrapScript,
    resolveCookieBootstrapConfigFromScript,
} from './CookieBootstrap.script'

export {
    HONEY_CONSENT_CHANGE_EVENT,
    HONEY_COOKIE_BOOTSTRAP_CONFIG_KEY,
    HONEY_COOKIE_RUNTIME_KEY,
    HONEY_COOKIE_RUNTIME_READY_EVENT,
} from './CookieBootstrap.types'

export type {
    CookieBootstrapConfig,
    CookieBootstrapHandle,
    CookieBootstrapResourceKind,
    CookieBootstrapResourceRules,
    CookieBootstrapScanOptions,
    CookieScanCookieItem,
    CookieScanReport,
    CookieScanResourceItem,
    CookieScanStorageItem,
    HoneyConsentChangeEventDetail,
    HoneyCookieRuntime,
} from './CookieBootstrap.types'
