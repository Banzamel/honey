import {createContext, useContext} from 'react'
import type {
    CookieCategoryDefinition,
    CookieConsentMode,
    CookieConsentSource,
    CookieConsentState,
    CookieDeclarationItem,
    DetectedCookie,
    HoneyCookieConsentTexts,
} from '../../types'

export interface CookieConsentContextValue {
    /** True once the provider has finished its initial async read (storage + `loadConsent`). */
    ready: boolean
    /** True when `ready` and there is no saved consent yet — i.e. the user has not decided. */
    pending: boolean
    bannerOpen: boolean
    preferencesOpen: boolean
    version: string
    mode: CookieConsentMode
    state: CookieConsentState | null
    texts: HoneyCookieConsentTexts
    categories: CookieCategoryDefinition[]
    declaration: CookieDeclarationItem[]
    inventory: DetectedCookie[]
    hasConsent: (category: string) => boolean
    isRequired: (category: string) => boolean
    showBanner: () => void
    hideBanner: () => void
    openPreferences: () => void
    closePreferences: () => void
    acceptAll: (source?: CookieConsentSource) => void
    rejectAll: (source?: CookieConsentSource) => void
    savePreferences: (next: Record<string, boolean>, source?: CookieConsentSource) => void
    withdrawConsent: () => void
    setDeclaration: (items: CookieDeclarationItem[]) => void
    refreshInventory: () => void
}

const CookieConsentCtx = createContext<CookieConsentContextValue | null>(null)

export const CookieConsentContextProvider = CookieConsentCtx.Provider

/** Returns the current cookie-consent context value, or `null` if used outside
 *  the provider. Use this when the consuming component is rendered both inside
 *  and outside the provider tree (e.g. a generic shared component). */
export function useOptionalCookieConsent(): CookieConsentContextValue | null {
    return useContext(CookieConsentCtx)
}

/** Returns the current cookie-consent context value. Throws when used outside
 *  the provider — the strict default for components that depend on consent state. */
export function useCookieConsent(): CookieConsentContextValue {
    const ctx = useOptionalCookieConsent()
    if (!ctx) {
        throw new Error('useCookieConsent must be used within <CookieConsentProvider>.')
    }
    return ctx
}
