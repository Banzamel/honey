export {CookieConsentProvider} from './CookieConsentProvider'
export type {CookieConsentProviderProps} from './CookieConsentProvider'

export {
    useCookieConsent,
    useOptionalCookieConsent,
    CookieConsentContextProvider,
} from './CookieConsentContext'
export type {CookieConsentContextValue} from './CookieConsentContext'

export {HONEY_CONSENT_CHANGE_EVENT} from './bootstrap-events'
export type {HoneyConsentChangeEventDetail} from './bootstrap-events'

export {
    COOKIE_CONSENT_COOKIE_MAX_AGE_DAYS,
    COOKIE_CONSENT_COOKIE_NAME,
    COOKIE_CONSENT_STORAGE,
    COOKIE_CONSENT_STORAGE_KEY,
    DEFAULT_HONEY_TEXTS,
    createCookieConsentCategories,
    createCookieConsentDeclaration,
    mergeCookieConsentTexts,
} from './CookieConsent.defaults'

export {
    clearStoredCookieConsent,
    readStoredCookieConsent,
    writeStoredCookieConsent,
} from './CookieConsent.storage'

export {detectDocumentCookies} from './CookieConsent.inventory'
