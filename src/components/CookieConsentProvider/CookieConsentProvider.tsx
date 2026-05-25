import {createContext, useContext, useMemo, type ReactNode} from 'react'
import type {HoneyConsentState} from '../../types'

/**
 * Placeholder consent context. The real implementation will land in Phase 2
 * once the storage / inventory / defaults helpers are ported from
 * `@banzamel/mineralui-pro@1.x`.
 */
export interface CookieConsentContextValue {
    consent: HoneyConsentState
    grantAll: () => void
    rejectAll: () => void
    setCategory: (category: keyof Omit<HoneyConsentState, 'necessary' | 'updatedAt'>, granted: boolean) => void
    openPreferences: () => void
    closePreferences: () => void
    isPreferencesOpen: boolean
}

const initialConsent: HoneyConsentState = {
    necessary: true,
    preferences: null,
    statistics: null,
    marketing: null,
    other: null,
    updatedAt: null,
}

const CookieConsentContext = createContext<CookieConsentContextValue | null>(null)

export interface CookieConsentProviderProps {
    children?: ReactNode
}

// TODO Phase 2: port persistence (localStorage + cookie write), inventory
// validation, default category map, and the open/close preferences toggle.
export function CookieConsentProvider({children}: CookieConsentProviderProps) {
    const value = useMemo<CookieConsentContextValue>(
        () => ({
            consent: initialConsent,
            grantAll: () => {},
            rejectAll: () => {},
            setCategory: () => {},
            openPreferences: () => {},
            closePreferences: () => {},
            isPreferencesOpen: false,
        }),
        []
    )

    return <CookieConsentContext.Provider value={value}>{children}</CookieConsentContext.Provider>
}

export function useCookieConsent(): CookieConsentContextValue {
    const ctx = useContext(CookieConsentContext)
    if (!ctx) {
        throw new Error('useCookieConsent must be called inside <CookieConsentProvider>.')
    }
    return ctx
}
