// Public surface for @banzamel/honey 0.3.0 (Phase 2.2 — bootstrap port complete,
// UI components still placeholders that render null).
//
// Working today (behaviour-equivalent to @banzamel/mineralui-pro@1.x):
// - CookieConsentProvider + useCookieConsent / useOptionalCookieConsent
// - bootstrapCookieConsent / autoBootstrapCookieConsent: blocks third-party
//   <script>/<iframe>/<img>, MutationObserver-watches for late injections,
//   patches Node insertion APIs, syncs to consent changes
// - scanCookieSurface / reportCookieSurface: scan the page for cookies + DOM
//   resources + localStorage/sessionStorage, optionally POST the report back
// - createHoneyCookieRuntime + initializeCookieConsentBootstrapScript +
//   resolveCookieBootstrapConfigFromScript: loader-script glue that wires the
//   bootstrap to your Cookie Compliance backend
// - inventory scanner, persistence layer, change-event constant, default texts
//
// Subpath entry @banzamel/honey/cookie-consent-bootstrap auto-runs the loader
// when included via <script src>.
//
// Still placeholders (Phase 2.3-2.5):
// - CookieBanner, CookieConsent, CookieDeclaration, CookiePreferences, CookieTrigger

// Token + base CSS — side-effect import so consumers get styles automatically.
import './tokens.css'

// Provider, context, persistence, inventory, defaults
export {
    CookieConsentProvider,
    useCookieConsent,
    useOptionalCookieConsent,
    CookieConsentContextProvider,
    HONEY_CONSENT_CHANGE_EVENT,
    COOKIE_CONSENT_COOKIE_MAX_AGE_DAYS,
    COOKIE_CONSENT_COOKIE_NAME,
    COOKIE_CONSENT_STORAGE,
    COOKIE_CONSENT_STORAGE_KEY,
    DEFAULT_HONEY_TEXTS,
    createCookieConsentCategories,
    createCookieConsentDeclaration,
    mergeCookieConsentTexts,
    clearStoredCookieConsent,
    readStoredCookieConsent,
    writeStoredCookieConsent,
    detectDocumentCookies,
} from './components/CookieConsentProvider'
export type {
    CookieConsentProviderProps,
    CookieConsentContextValue,
    HoneyConsentChangeEventDetail,
} from './components/CookieConsentProvider'

// Bootstrap (cookie-blocking script + scan/report helpers + runtime factory)
export {
    autoBootstrapCookieConsent,
    bootstrapCookieConsent,
    readCookieBootstrapConfig,
    reportCookieSurface,
    scanCookieSurface,
    createHoneyCookieRuntime,
    initializeCookieConsentBootstrapScript,
    resolveCookieBootstrapConfigFromScript,
    HONEY_COOKIE_BOOTSTRAP_CONFIG_KEY,
    HONEY_COOKIE_RUNTIME_KEY,
    HONEY_COOKIE_RUNTIME_READY_EVENT,
} from './components/CookieBootstrap'
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
    HoneyCookieRuntime,
} from './components/CookieBootstrap'

// UI components (placeholders — Phase 2.3-2.5)
export {CookieBanner} from './components/CookieBanner'
export type {CookieBannerProps} from './components/CookieBanner'

export {CookieConsent} from './components/CookieConsent'
export type {CookieConsentProps} from './components/CookieConsent'

export {CookieDeclaration} from './components/CookieDeclaration'
export type {CookieDeclarationProps} from './components/CookieDeclaration'

export {CookiePreferences} from './components/CookiePreferences'
export type {CookiePreferencesProps} from './components/CookiePreferences'

export {CookieTrigger} from './components/CookieTrigger'
export type {CookieTriggerProps} from './components/CookieTrigger'

// Scaffold smoke-test (removed before 1.0).
export {HoneyJar} from './components/HoneyJar'
export type {HoneyJarProps} from './components/HoneyJar'

// Shared types
export type {
    HoneyColor,
    CookieConsentCategory,
    CookieConsentSource,
    CookieConsentMode,
    CookieConsentPersistence,
    CookieMatchRule,
    CookieCategoryDefinition,
    CookieCategoryRules,
    CookieDeclarationItem,
    CookieStorageType,
    CookieConsentState,
    DetectedCookie,
    DetectedCookieSource,
    DetectedCookieMatch,
    HoneyCookieConsentTexts,
    // Deprecated aliases — to be removed once consumers migrate
    HoneyCookieCategory,
    HoneyConsentState,
} from './types'

// Utilities
export {cn} from './utils/cn'
