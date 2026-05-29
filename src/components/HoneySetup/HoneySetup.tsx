import type {ReactNode} from 'react'

import {CookieBanner, type CookieBannerProps} from '../CookieBanner'
import {
    CookieConsentProvider,
    type CookieConsentProviderProps,
} from '../CookieConsentProvider/CookieConsentProvider'
import {CookiePreferences, type CookiePreferencesProps} from '../CookiePreferences'
import {CookieTrigger, type CookieTriggerProps} from '../CookieTrigger'

export interface HoneySetupProps extends Omit<CookieConsentProviderProps, 'children'> {
    children?: ReactNode
    /** Render the bottom/top consent banner. Pass `false` to hide it, an object
     *  to forward props to `<CookieBanner>`, or leave the default `true`. */
    banner?: boolean | CookieBannerProps
    /** Render the per-category preferences drawer. Pass `false` to hide it, an
     *  object to forward props to `<CookiePreferences>`, or leave the default
     *  `true` so the drawer is wired automatically (footer triggers and banner's
     *  Manage button open it through the provider). */
    preferences?: boolean | CookiePreferencesProps
    /** Render the floating "Cookie settings" trigger button. Off by default —
     *  most apps already have a footer link they want to wire with
     *  `<CookieTrigger />`. Pass `true` to enable the default ghost style or
     *  an object to forward props. */
    trigger?: boolean | CookieTriggerProps
}

/**
 * Drop-in wrapper that combines the provider, the banner, the preferences
 * drawer (and optionally the footer trigger) into a single component. Lets
 * a consumer get a compliant cookie surface with one tag:
 *
 *     <HoneySetup>
 *         <YourApp />
 *     </HoneySetup>
 *
 * All `CookieConsentProvider` props are accepted on top — `version`,
 * `categories`, `loadDeclaration`, `mode`, the text dictionary, etc. The three
 * UI slots (`banner`, `preferences`, `trigger`) each accept `true`/`false` for
 * quick toggling or an object to forward props to the underlying component.
 *
 * When a consumer needs the strict-consent wall variant (modal/drawer that
 * blocks the page until decided), use `<CookieConsent>` instead.
 */
export function HoneySetup({
    children,
    banner = true,
    preferences = true,
    trigger = false,
    ...providerProps
}: HoneySetupProps) {
    return (
        <CookieConsentProvider {...providerProps}>
            {children}
            {banner !== false ? <CookieBanner {...(banner === true ? {} : banner)} /> : null}
            {preferences !== false ? (
                <CookiePreferences {...(preferences === true ? {} : preferences)} />
            ) : null}
            {trigger !== false ? <CookieTrigger {...(trigger === true ? {} : trigger)} /> : null}
        </CookieConsentProvider>
    )
}
