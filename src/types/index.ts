/**
 * Shared types for Honey's cookie-consent system. The shape mirrors what shipped
 * inside `@banzamel/mineralui-pro@1.x` so existing inventories, default consent
 * maps and declarations are forward-compatible — the rename is only at the
 * type-name level (`M*` prefix dropped).
 */

/** Categorical color tokens accepted by primitives. */
export type HoneyColor = 'primary' | 'neutral' | 'success' | 'warning' | 'error' | 'info'

/** Built-in consent categories. Custom categories are accepted as `(string & {})`. */
export type CookieConsentCategory = 'necessary' | 'preferences' | 'analytics' | 'marketing'

/** What triggered a save — banner CTA, the preferences drawer or a programmatic API call. */
export type CookieConsentSource = 'banner' | 'preferences' | 'api'

/** Legal mode. `'opt-in'` requires an explicit decision; `'informational'` is the
 *  EU-cookie-banner-light variant where browsing the page implies consent. */
export type CookieConsentMode = 'opt-in' | 'informational'

/** Where to persist the consent state. Cookie storage cooperates with SSR; local
 *  storage is simpler and recommended for client-only apps. */
export type CookieConsentPersistence = 'localStorage' | 'cookie'

/** A cookie rule can be a plain string (exact match, or `'foo-*'` prefix) or a
 *  pre-built regex for advanced patterns. */
export type CookieMatchRule = string | RegExp

export type DetectedCookieSource = 'document.cookie'

export type DetectedCookieMatch = 'required' | 'custom' | 'built-in' | 'fallback'

export interface CookieCategoryDefinition {
    key: string
    label: string
    description: string
    required?: boolean
    defaultValue?: boolean
}

export type CookieStorageType = 'cookie' | 'localStorage' | 'sessionStorage' | 'pixel' | 'script'

export interface CookieDeclarationItem {
    id: string
    name: string
    category: string
    purpose: string
    provider?: string
    duration?: string
    type?: CookieStorageType
    domain?: string
}

export interface DetectedCookie {
    name: string
    value: string
    category: string
    required: boolean
    source: DetectedCookieSource
    matchedBy: DetectedCookieMatch
}

export type CookieCategoryRules = Partial<
    Record<Exclude<CookieConsentCategory, 'necessary'> | (string & {}), CookieMatchRule[]>
>

/** Snapshot of consent persisted to storage. `decidedAt` is ISO-8601; `categories`
 *  maps category key → granted? (booleans). Necessary cookies are always `true`
 *  even if the consumer's map says otherwise. */
export interface CookieConsentState {
    version: string
    decidedAt: string
    source: CookieConsentSource
    categories: Record<string, boolean>
}

/** Strings shown by Honey's UI. Every field has a sensible English default in
 *  `DEFAULT_HONEY_TEXTS` — consumers override what they need via the provider's
 *  `texts` prop. */
export interface HoneyCookieConsentTexts {
    bannerTitle: string
    bannerDescription: string
    manage: string
    preferencesTitle: string
    preferencesDescription: string
    acceptAll: string
    rejectAll: string
    preferences: string
    savePreferences: string
    close: string
    requiredLabel: string
    necessaryLabel: string
    necessaryDescription: string
    preferencesLabel: string
    preferencesDescriptionLabel: string
    analyticsLabel: string
    analyticsDescription: string
    marketingLabel: string
    marketingDescription: string
    declarationTitle: string
    declarationDescription: string
    noDeclarationItems: string
    searchDeclaration: string
    triggerLabel: string
    detectedCookiesLabel: string
    noDetectedCookies: string
}

// ── Legacy aliases (deprecated, kept for the brief transition period) ──
// These will be removed once `@banzamel/mineralui-pro@2.0.0` ships and any
// downstream consumers have migrated. Do not use in new code.
/** @deprecated Use `CookieConsentCategory` instead. */
export type HoneyCookieCategory = CookieConsentCategory
/** @deprecated Use `CookieConsentState` instead. */
export type HoneyConsentState = CookieConsentState
