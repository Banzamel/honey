/**
 * Shared types for Honey's cookie-consent system.
 *
 * Kept intentionally small and framework-agnostic so consumers can extend the
 * shape from outside without reaching into individual component prop types.
 */

/** Categorical color tokens accepted by primitives. Mirrors a sensible subset
 *  of MineralUI's MColor without dragging the full union over. */
export type HoneyColor =
    | 'primary'
    | 'neutral'
    | 'success'
    | 'warning'
    | 'error'
    | 'info'

/** Cookie category bucket. Necessary cookies are always granted; everything
 *  else is opt-in per category. */
export type HoneyCookieCategory =
    | 'necessary'
    | 'preferences'
    | 'statistics'
    | 'marketing'
    | 'other'

/** Snapshot of the user's current consent. `null` for a category means the
 *  user has not made a choice yet (i.e. show the banner). */
export interface HoneyConsentState {
    necessary: true
    preferences: boolean | null
    statistics: boolean | null
    marketing: boolean | null
    other: boolean | null
    /** Unix timestamp (ms) of the last save; `null` until first decision. */
    updatedAt: number | null
}
