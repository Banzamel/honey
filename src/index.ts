// Public surface for @banzamel/honey 0.2.0 (Phase 2.1 — provider port complete,
// UI components still placeholders that render null).
//
// The provider (CookieConsentProvider), the typed context hook (useCookieConsent),
// the persistence helpers (read/write/clear stored consent), the inventory scanner
// (detectDocumentCookies), the default text pack (DEFAULT_HONEY_TEXTS) and the
// cross-package change event (HONEY_CONSENT_CHANGE_EVENT) are all real and
// behaviour-equivalent to what shipped in @banzamel/mineralui-pro@1.x.
//
// CookieBanner / CookieConsent / CookieDeclaration / CookiePreferences /
// CookieTrigger are still placeholders — they'll get their real implementation
// in Phase 2.2 (CookieBootstrap script) and 2.3-2.5 (UI port with .honey-* styling).

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
