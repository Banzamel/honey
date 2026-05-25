import type {ReactNode} from 'react'

export interface CookieConsentProps {
    title?: ReactNode
    description?: ReactNode
    className?: string
}

// TODO Phase 2: port MCookieConsent.tsx + .css from mineralui — full-screen
// modal variant. Reuses CookieConsentProvider state.
export function CookieConsent(_props: CookieConsentProps) {
    return null
}
