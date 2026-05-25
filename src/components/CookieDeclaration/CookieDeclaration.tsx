import type {ReactNode} from 'react'

export interface CookieDeclarationProps {
    title?: ReactNode
    /** Optional override for the cookie inventory; falls back to the provider's. */
    inventory?: unknown
    className?: string
}

// TODO Phase 2: port MCookieDeclaration.tsx + .css — full table of all cookies
// the site sets, grouped by category. Uses a local .honey-table primitive
// instead of MineralUI's MDataTable to keep Honey standalone.
export function CookieDeclaration(_props: CookieDeclarationProps) {
    return null
}
