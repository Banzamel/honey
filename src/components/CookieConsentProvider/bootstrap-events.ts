/**
 * Browser-side event name fired on `window` after every consent change. The
 * (future) cookie-bootstrap script listens for this to unblock or re-block
 * tracker tags as the user's choices change. Kept in its own tiny module so
 * the bootstrap script can import this constant without dragging in the React
 * provider source.
 */
export const HONEY_CONSENT_CHANGE_EVENT = 'honey:consent-change'

export interface HoneyConsentChangeEventDetail {
    state: import('../../types').CookieConsentState | null
}
