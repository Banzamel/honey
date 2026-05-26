// Public surface for @banzamel/honey 0.5.0 (Phase 2.4 — CookieBanner and
// CookieTrigger are real React components now, painted with the .honey-* CSS
// primitives. Three placeholders left: CookieConsent (modal variant),
// CookieDeclaration (inventory table), CookiePreferences (drawer). Phase 2.5.)

// Token + primitive CSS — side-effect imports so consumers get styles
// automatically the first time they import anything from @banzamel/honey.
import './tokens.css'
import './primitives.css'
// Component-specific layout (only the rules each component adds on top of
// the shared primitives). Tree-shaking cannot drop CSS, so we import here
// to keep all paint rules in one bundle.
import './components/CookieBanner/CookieBanner.css'
import './components/CookieTrigger/CookieTrigger.css'

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

// UI components — real implementations
export {CookieBanner} from './components/CookieBanner'
export type {
    CookieBannerProps,
    CookieBannerPosition,
    CookieBannerVariant,
} from './components/CookieBanner'

export {CookieTrigger} from './components/CookieTrigger'
export type {CookieTriggerProps, CookieTriggerVariant} from './components/CookieTrigger'

// UI components (placeholders — Phase 2.5)
export {CookieConsent} from './components/CookieConsent'
export type {CookieConsentProps} from './components/CookieConsent'

export {CookieDeclaration} from './components/CookieDeclaration'
export type {CookieDeclarationProps} from './components/CookieDeclaration'

export {CookiePreferences} from './components/CookiePreferences'
export type {CookiePreferencesProps} from './components/CookiePreferences'

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
