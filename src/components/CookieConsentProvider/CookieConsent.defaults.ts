import type {
    CookieCategoryDefinition,
    CookieConsentPersistence,
    CookieDeclarationItem,
    HoneyCookieConsentTexts,
} from '../../types'

export const COOKIE_CONSENT_STORAGE_KEY = 'honey-cookie-consent'
export const COOKIE_CONSENT_COOKIE_NAME = 'honey-cookie-consent'
export const COOKIE_CONSENT_COOKIE_MAX_AGE_DAYS = 180
export const COOKIE_CONSENT_STORAGE: CookieConsentPersistence = 'localStorage'

/** Honey's built-in English text pack. Used when the consumer does not pass
 *  `texts` to the provider, or to fill in fields the consumer's override omits. */
export const DEFAULT_HONEY_TEXTS: HoneyCookieConsentTexts = {
    bannerTitle: 'We use cookies',
    bannerDescription:
        'We use necessary cookies to keep the site working and optional cookies to improve experience, analytics and marketing.',
    manage: 'Manage',
    preferencesTitle: 'Cookie preferences',
    preferencesDescription:
        'Choose which optional cookie categories you allow. Necessary cookies are always active.',
    acceptAll: 'Accept all',
    rejectAll: 'Reject optional',
    preferences: 'Preferences',
    savePreferences: 'Save preferences',
    close: 'Close',
    requiredLabel: 'Required',
    necessaryLabel: 'Necessary',
    necessaryDescription:
        'These cookies are required for core site functionality and cannot be disabled.',
    preferencesLabel: 'Preferences',
    preferencesDescriptionLabel:
        'These cookies remember settings such as language, theme or saved interface choices.',
    analyticsLabel: 'Analytics',
    analyticsDescription:
        'These cookies help measure usage and improve content, performance and navigation.',
    marketingLabel: 'Marketing',
    marketingDescription:
        'These cookies support campaigns, advertising attribution and embedded marketing tools.',
    declarationTitle: 'Cookie declaration',
    declarationDescription:
        'Review the cookies and storage technologies used by this page, grouped by purpose.',
    noDeclarationItems: 'No declaration items available.',
    searchDeclaration: 'Search cookies...',
    triggerLabel: 'Cookie settings',
    detectedCookiesLabel: 'Detected storage and trackers',
    noDetectedCookies: 'No storage or trackers detected in this category yet.',
}

/** Merge an override on top of Honey's default text pack. Fields the consumer
 *  omits fall back to the English defaults. */
export function mergeCookieConsentTexts(
    baseTexts: HoneyCookieConsentTexts,
    override?: Partial<HoneyCookieConsentTexts>
): HoneyCookieConsentTexts {
    return {...baseTexts, ...override}
}

/** Honey's built-in 4-category model. Consumers can pass their own category
 *  list to the provider to use a different shape (e.g. add `'social'`). */
export function createCookieConsentCategories(
    texts: HoneyCookieConsentTexts
): CookieCategoryDefinition[] {
    return [
        {
            key: 'necessary',
            label: texts.necessaryLabel,
            description: texts.necessaryDescription,
            required: true,
            defaultValue: true,
        },
        {
            key: 'preferences',
            label: texts.preferencesLabel,
            description: texts.preferencesDescriptionLabel,
            defaultValue: false,
        },
        {
            key: 'analytics',
            label: texts.analyticsLabel,
            description: texts.analyticsDescription,
            defaultValue: false,
        },
        {
            key: 'marketing',
            label: texts.marketingLabel,
            description: texts.marketingDescription,
            defaultValue: false,
        },
    ]
}

export function createCookieConsentDeclaration(): CookieDeclarationItem[] {
    return []
}
