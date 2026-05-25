import type {ReactNode} from 'react'

export interface CookiePreferencesProps {
    open?: boolean
    onClose?: () => void
    title?: ReactNode
    description?: ReactNode
    className?: string
}

// TODO Phase 2: port MCookiePreferences.tsx + .css — drawer with category-
// level toggles. Replaces MDrawer + MToggle with .honey-drawer / .honey-toggle
// primitives styled from tokens.css.
export function CookiePreferences(_props: CookiePreferencesProps) {
    return null
}
