// Public surface for @banzamel/honey 0.1.0 (scaffold).
//
// CookieBanner / CookieConsent / CookieDeclaration / CookiePreferences /
// CookieTrigger are placeholder components that render `null`. The actual
// implementations land in Phase 2 by porting from `@banzamel/mineralui-pro@1.x`
// with .mineral-* selectors renamed to .honey-* and dependencies on
// MineralUI components replaced by the local primitives in tokens.css.

// Token + base CSS — side-effect import so consumers get styles automatically.
import './tokens.css'

// Components
export {CookieBanner} from './components/CookieBanner'
export type {CookieBannerProps} from './components/CookieBanner'

export {CookieConsent} from './components/CookieConsent'
export type {CookieConsentProps} from './components/CookieConsent'

export {CookieConsentProvider, useCookieConsent} from './components/CookieConsentProvider'
export type {
    CookieConsentContextValue,
    CookieConsentProviderProps,
} from './components/CookieConsentProvider'

export {CookieDeclaration} from './components/CookieDeclaration'
export type {CookieDeclarationProps} from './components/CookieDeclaration'

export {CookiePreferences} from './components/CookiePreferences'
export type {CookiePreferencesProps} from './components/CookiePreferences'

export {CookieTrigger} from './components/CookieTrigger'
export type {CookieTriggerProps} from './components/CookieTrigger'

// Scaffold smoke-test (removed before 1.0).
export {HoneyJar} from './components/HoneyJar'
export type {HoneyJarProps} from './components/HoneyJar'

// Shared types
export type {HoneyColor, HoneyCookieCategory, HoneyConsentState} from './types'

// Utilities
export {cn} from './utils/cn'
