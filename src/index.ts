// Public surface for @banzamel/honey 0.6.0 (Phase 2.5 — every cookie component
// is now a real React implementation. Feature-parity with the
// @banzamel/mineralui-pro@1.x cookie module.)

// Token + primitive CSS — side-effect imports so consumers get styles
// automatically the first time they import anything from @banzamel/honey.
import './tokens.css'
import './primitives.css'
// Component-specific layout (only the rules each component adds on top of
// the shared primitives). Tree-shaking cannot drop CSS, so we import here
// to keep all paint rules in one bundle.
import './components/CookieBanner/CookieBanner.css'
import './components/CookieTrigger/CookieTrigger.css'
import './components/CookiePreferences/CookiePreferences.css'
import './components/CookieDeclaration/CookieDeclaration.css'
import './components/CookieConsent/CookieConsent.css'

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

// UI components
export {CookieBanner} from './components/CookieBanner'
export type {
    CookieBannerProps,
    CookieBannerPosition,
    CookieBannerVariant,
} from './components/CookieBanner'

export {CookieTrigger} from './components/CookieTrigger'
export type {CookieTriggerProps, CookieTriggerVariant} from './components/CookieTrigger'

export {CookiePreferences} from './components/CookiePreferences'
export type {
    CookiePreferencesProps,
    CookiePreferencesVariant,
} from './components/CookiePreferences'

export {CookieDeclaration} from './components/CookieDeclaration'
export type {CookieDeclarationProps} from './components/CookieDeclaration'

export {CookieConsent} from './components/CookieConsent'
export type {
    CookieConsentProps,
    CookieConsentPlacement,
    CookieConsentTriggerPlacement,
} from './components/CookieConsent'

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
