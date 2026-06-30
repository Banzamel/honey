import {CookieConsent, type CookieConsentProps} from '../CookieConsent'

export type HoneySetupProps = CookieConsentProps

/**
 * Backward-compatible alias for {@link CookieConsent} — the one comprehensive,
 * all-in-one entry point. It mounts the provider, picks up config + runtime from
 * the bootstrap loader script, renders the consent panel at the placement of
 * your choice and drops the floating re-open trigger once the user has decided:
 *
 *     <HoneySetup placement="modal" triggerPlacement="bottom-left">
 *         <YourApp />
 *     </HoneySetup>
 *
 * Every `CookieConsent` prop is accepted (`placement`, `triggerPlacement`,
 * `blockInteraction`, `mode`, `categories`, the text dictionary, etc.). New code
 * should prefer `<CookieConsent>` directly; `HoneySetup` stays exported so
 * existing integrations keep working.
 */
export function HoneySetup(props: HoneySetupProps) {
    return <CookieConsent {...props} />
}
