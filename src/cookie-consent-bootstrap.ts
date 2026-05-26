/**
 * Subpath entry: `@banzamel/honey/cookie-consent-bootstrap`.
 *
 * Loaded by the hosted `<script src="https://api.mineralui.io/cookie-consent-bootstrap.js?siteKey=..."`
 * tag (or a local copy). Self-running: as soon as the script is parsed, it
 * resolves the per-site config from the backend, parks the runtime on
 * `window.__HONEY_COOKIE_RUNTIME__`, and starts the bootstrap (block + watch
 * + sync) so third-party trackers stay parked until the user accepts.
 *
 * Has no React dependency — safe to ship as a single-file `<script>` that
 * runs before the main app bundle loads.
 */
import {initializeCookieConsentBootstrapScript} from './components/CookieBootstrap/CookieBootstrap.script'

void initializeCookieConsentBootstrapScript()

// Re-export public helpers so library consumers can also drive the bootstrap
// programmatically from an inline `<script type="module">` snippet.
export {
    autoBootstrapCookieConsent,
    bootstrapCookieConsent,
    readCookieBootstrapConfig,
    reportCookieSurface,
    scanCookieSurface,
    createHoneyCookieRuntime,
    initializeCookieConsentBootstrapScript,
    resolveCookieBootstrapConfigFromScript,
    HONEY_CONSENT_CHANGE_EVENT,
    HONEY_COOKIE_BOOTSTRAP_CONFIG_KEY,
    HONEY_COOKIE_RUNTIME_KEY,
    HONEY_COOKIE_RUNTIME_READY_EVENT,
} from './components/CookieBootstrap'
export type {
    CookieBootstrapConfig,
    CookieBootstrapHandle,
    CookieBootstrapResourceKind,
    CookieBootstrapResourceRules,
    CookieBootstrapScanOptions,
    CookieScanCookieItem,
    CookieScanReport,
    CookieScanResourceItem,
    CookieScanStorageItem,
    HoneyConsentChangeEventDetail,
    HoneyCookieRuntime,
} from './components/CookieBootstrap'
