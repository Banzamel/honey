import type {ReactNode} from 'react'

export interface CookieBannerProps {
    title?: ReactNode
    description?: ReactNode
    className?: string
}

// TODO Phase 2: port MCookieBanner.tsx + .css from mineralui (rename .button
// → .honey-btn, .card → .honey-card, etc.) and wire to useCookieConsent().
export function CookieBanner(_props: CookieBannerProps) {
    return null
}
