import {detectDocumentCookies} from '../CookieConsentProvider/CookieConsent.inventory'
import {
    COOKIE_CONSENT_COOKIE_NAME,
    COOKIE_CONSENT_STORAGE,
    COOKIE_CONSENT_STORAGE_KEY,
} from '../CookieConsentProvider/CookieConsent.defaults'
import {readStoredCookieConsent} from '../CookieConsentProvider/CookieConsent.storage'
import {HONEY_CONSENT_CHANGE_EVENT} from '../CookieConsentProvider/bootstrap-events'
import type {CookieConsentState} from '../../types'
import {HONEY_COOKIE_BOOTSTRAP_CONFIG_KEY} from './CookieBootstrap.types'
import type {
    CookieBootstrapConfig,
    CookieBootstrapHandle,
    CookieBootstrapResourceKind,
    CookieScanReport,
    CookieScanResourceItem,
    CookieScanStorageItem,
} from './CookieBootstrap.types'

const CATEGORY_ATTRIBUTE = 'data-honey-cookie-category'
const BLOCKED_ATTRIBUTE = 'data-honey-cookie-blocked'
const SRC_ATTRIBUTE = 'data-honey-cookie-src'
const TYPE_ATTRIBUTE = 'data-honey-cookie-type'

/** Translate a glob-ish pattern (`*.example.com`, `foo*`) into a case-insensitive
 *  RegExp that matches the host or src in full. */
function toPatternRegExp(pattern: string) {
    const escaped = pattern.replace(/[.+?^${}()|[\]\\]/g, '\\$&').replace(/\*/g, '.*')
    return new RegExp(`^${escaped}$`, 'i')
}

function matchesPattern(value: string, pattern: string) {
    return toPatternRegExp(pattern).test(value)
}

function getElementSource(node: Element) {
    if (
        node instanceof HTMLScriptElement ||
        node instanceof HTMLIFrameElement ||
        node instanceof HTMLImageElement
    ) {
        return node.getAttribute('src') ?? node.getAttribute(SRC_ATTRIBUTE) ?? ''
    }

    return ''
}

function getSourceHost(src: string) {
    try {
        return new URL(src, window.location.href).hostname
    } catch {
        return ''
    }
}

function getConsentState(config: CookieBootstrapConfig) {
    return readStoredCookieConsent({
        storage: config.storage ?? COOKIE_CONSENT_STORAGE,
        storageKey: config.storageKey ?? COOKIE_CONSENT_STORAGE_KEY,
        cookieName: config.cookieName ?? COOKIE_CONSENT_COOKIE_NAME,
    })
}

function isCategoryAllowed(state: CookieConsentState | null, category: string) {
    if (category === 'necessary') {
        return true
    }

    return state?.categories?.[category] === true
}

function findMatchedCategory(node: Element, config: CookieBootstrapConfig) {
    const explicitCategory = node.getAttribute(CATEGORY_ATTRIBUTE)
    if (explicitCategory) {
        return explicitCategory
    }

    const src = getElementSource(node)
    if (!src) {
        return null
    }

    const host = getSourceHost(src)
    if (!host) {
        return null
    }

    const kind: CookieBootstrapResourceKind | null =
        node instanceof HTMLScriptElement
            ? 'script'
            : node instanceof HTMLIFrameElement
              ? 'iframe'
              : node instanceof HTMLImageElement
                ? 'image'
                : null

    if (!kind) {
        return null
    }

    const rules =
        kind === 'script'
            ? config.resources?.scripts
            : kind === 'iframe'
              ? config.resources?.iframes
              : config.resources?.images

    if (!rules) {
        return null
    }

    for (const [category, patterns] of Object.entries(rules)) {
        if (patterns.some((pattern) => matchesPattern(host, pattern) || matchesPattern(src, pattern))) {
            node.setAttribute(CATEGORY_ATTRIBUTE, category)
            return category
        }
    }

    return null
}

/** Convert a live `<script>` / `<iframe>` / `<img>` into a parked, non-executing
 *  version. Scripts get `type="text/plain"` so the browser won't run them; src
 *  is squirrelled away under `data-honey-cookie-src` for later reactivation. */
function blockNode(node: Element) {
    if (node.getAttribute(BLOCKED_ATTRIBUTE) === 'true') {
        return
    }

    if (node instanceof HTMLScriptElement) {
        const currentType = node.getAttribute('type') ?? ''
        const src = node.getAttribute('src')
        if (src) {
            node.setAttribute(SRC_ATTRIBUTE, src)
            node.removeAttribute('src')
        }

        node.setAttribute(TYPE_ATTRIBUTE, currentType === 'text/plain' ? '' : currentType)
        node.type = 'text/plain'
        node.setAttribute(BLOCKED_ATTRIBUTE, 'true')
        return
    }

    if (node instanceof HTMLIFrameElement || node instanceof HTMLImageElement) {
        const src = node.getAttribute('src')
        if (src) {
            node.setAttribute(SRC_ATTRIBUTE, src)
            node.removeAttribute('src')
        }

        node.setAttribute(BLOCKED_ATTRIBUTE, 'true')
    }
}

/** Replace a blocked `<script type="text/plain">` with a live clone. The browser
 *  treats the new node as a fresh script and executes it. Other attributes
 *  (data-* / async / defer / crossorigin) carry over. */
function activateScript(node: HTMLScriptElement) {
    const src = node.getAttribute(SRC_ATTRIBUTE)
    const clone = document.createElement('script')

    for (const attribute of node.getAttributeNames()) {
        if (
            attribute === 'type' ||
            attribute === BLOCKED_ATTRIBUTE ||
            attribute === SRC_ATTRIBUTE ||
            attribute === TYPE_ATTRIBUTE
        ) {
            continue
        }

        clone.setAttribute(attribute, node.getAttribute(attribute) ?? '')
    }

    const originalType = node.getAttribute(TYPE_ATTRIBUTE)
    if (originalType) {
        clone.type = originalType
    }

    if (src) {
        clone.src = src
    } else {
        clone.textContent = node.textContent
    }

    node.replaceWith(clone)
}

function activateNode(node: Element) {
    if (node instanceof HTMLScriptElement) {
        const canActivate =
            node.getAttribute(BLOCKED_ATTRIBUTE) === 'true' ||
            (node.type === 'text/plain' && node.hasAttribute(CATEGORY_ATTRIBUTE))

        if (!canActivate) {
            return
        }

        activateScript(node)
        return
    }

    if (node instanceof HTMLIFrameElement || node instanceof HTMLImageElement) {
        if (node.getAttribute(BLOCKED_ATTRIBUTE) !== 'true' && !node.hasAttribute(SRC_ATTRIBUTE)) {
            return
        }

        const src = node.getAttribute(SRC_ATTRIBUTE)
        if (src) {
            node.setAttribute('src', src)
        }

        node.removeAttribute(SRC_ATTRIBUTE)
        node.removeAttribute(BLOCKED_ATTRIBUTE)
    }
}

function collectCandidateNodes(root: ParentNode) {
    const directNodes: Element[] = []

    if (root instanceof Element) {
        directNodes.push(root)
    }

    const nestedNodes = Array.from(root.querySelectorAll('script, iframe, img'))
    return [...directNodes, ...nestedNodes]
}

function syncNode(node: Element, state: CookieConsentState | null, config: CookieBootstrapConfig) {
    const category = findMatchedCategory(node, config)
    if (!category) {
        return
    }

    if (isCategoryAllowed(state, category)) {
        activateNode(node)
        return
    }

    blockNode(node)
}

function syncDocument(state: CookieConsentState | null, config: CookieBootstrapConfig) {
    for (const node of collectCandidateNodes(document)) {
        syncNode(node, state, config)
    }
}

/** Patch `Node.prototype.appendChild` / `insertBefore` / `replaceChild` so any
 *  late-injected script/iframe/img is blocked or activated according to the
 *  current consent state before it joins the live DOM. Returns a teardown that
 *  restores the originals. */
function patchDomInsertion(getState: () => CookieConsentState | null, config: CookieBootstrapConfig) {
    const appendChild = Node.prototype.appendChild
    const insertBefore = Node.prototype.insertBefore
    const replaceChild = Node.prototype.replaceChild

    Node.prototype.appendChild = function patchedAppendChild<T extends Node>(node: T) {
        if (node instanceof Element) {
            for (const element of collectCandidateNodes(node)) {
                syncNode(element, getState(), config)
            }
        }

        return appendChild.call(this, node) as T
    }

    Node.prototype.insertBefore = function patchedInsertBefore<T extends Node>(node: T, child: Node | null) {
        if (node instanceof Element) {
            for (const element of collectCandidateNodes(node)) {
                syncNode(element, getState(), config)
            }
        }

        return insertBefore.call(this, node, child) as T
    }

    Node.prototype.replaceChild = function patchedReplaceChild<T extends Node>(node: Node, child: T) {
        if (node instanceof Element) {
            for (const element of collectCandidateNodes(node)) {
                syncNode(element, getState(), config)
            }
        }

        return replaceChild.call(this, node, child) as T
    }

    return () => {
        Node.prototype.appendChild = appendChild
        Node.prototype.insertBefore = insertBefore
        Node.prototype.replaceChild = replaceChild
    }
}

function scanStorage(storage: Storage, kind: 'localStorage' | 'sessionStorage') {
    const items: CookieScanStorageItem[] = []

    try {
        for (let index = 0; index < storage.length; index += 1) {
            const key = storage.key(index)
            if (!key) {
                continue
            }

            items.push({kind, key, value: storage.getItem(key) ?? ''})
        }
    } catch {
        return []
    }

    return items
}

/** Read a config from the argument or fall back to `window[HONEY_COOKIE_BOOTSTRAP_CONFIG_KEY]`.
 *  Returns null when neither is available — callers should bail. */
export function readCookieBootstrapConfig(config?: CookieBootstrapConfig | null) {
    if (config) {
        return config
    }

    if (typeof window === 'undefined') {
        return null
    }

    return window[HONEY_COOKIE_BOOTSTRAP_CONFIG_KEY] ?? null
}

/** Walk the current page (cookies, localStorage/sessionStorage, script/iframe/img
 *  resources) and produce a report describing every storage technology in use,
 *  classified by consent category. Used both for the developer-facing scan in
 *  the website portal and for periodic reports back to the Cookie Compliance
 *  backend. */
export function scanCookieSurface(config?: CookieBootstrapConfig | null): CookieScanReport | null {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return null
    }

    const resolvedConfig = readCookieBootstrapConfig(config)
    if (!resolvedConfig) {
        return null
    }

    const scan = resolvedConfig.scan ?? {}
    const storageItems: CookieScanStorageItem[] = []
    const resources: CookieScanResourceItem[] = []

    if (scan.storage !== false) {
        storageItems.push(...scanStorage(window.localStorage, 'localStorage'))
        storageItems.push(...scanStorage(window.sessionStorage, 'sessionStorage'))
    }

    const resourceSelectors: Array<[boolean, string, CookieBootstrapResourceKind]> = [
        [scan.scripts !== false, 'script[src], script[data-honey-cookie-src]', 'script'],
        [scan.iframes !== false, 'iframe[src], iframe[data-honey-cookie-src]', 'iframe'],
        [scan.images !== false, 'img[src], img[data-honey-cookie-src]', 'image'],
    ]

    for (const [enabled, selector, kind] of resourceSelectors) {
        if (!enabled) {
            continue
        }

        for (const node of Array.from(document.querySelectorAll(selector))) {
            const src = getElementSource(node)
            if (!src) {
                continue
            }

            resources.push({
                kind,
                src,
                host: getSourceHost(src),
                category: node.getAttribute(CATEGORY_ATTRIBUTE) ?? undefined,
            })
        }
    }

    return {
        siteKey: resolvedConfig.siteKey,
        domain: resolvedConfig.domain ?? window.location.hostname,
        url: window.location.href,
        scannedAt: new Date().toISOString(),
        cookies:
            scan.cookies === false
                ? []
                : detectDocumentCookies({
                      requiredCookies: resolvedConfig.requiredCookies ?? [],
                      categoryRules: resolvedConfig.categoryRules ?? {},
                  }).map((item) => ({
                      ...item,
                      matchedBy: item.matchedBy,
                      source: item.source,
                  })),
        storage: storageItems,
        resources,
    }
}

/** POST/PUT the report to `config.scanEndpoint` (or legacy `config.reportEndpoint`).
 *  Includes `x-honey-site-key` when a siteKey is configured. */
export async function reportCookieSurface(config?: CookieBootstrapConfig | null, report?: CookieScanReport | null) {
    const resolvedConfig = readCookieBootstrapConfig(config)
    const endpoint = resolvedConfig?.scanEndpoint ?? resolvedConfig?.reportEndpoint

    if (!endpoint || typeof fetch === 'undefined') {
        return report ?? null
    }

    if (!resolvedConfig) {
        return report ?? null
    }

    const payload = report ?? scanCookieSurface(resolvedConfig)
    if (!payload) {
        return null
    }

    await fetch(endpoint, {
        method: resolvedConfig.reportMethod ?? 'POST',
        headers: {
            'content-type': 'application/json',
            ...(resolvedConfig.siteKey ? {'x-honey-site-key': resolvedConfig.siteKey} : {}),
            ...resolvedConfig.reportHeaders,
        },
        body: JSON.stringify(payload),
    })

    return payload
}

/** Start the bootstrap: take the current stored consent, sync every existing
 *  script/iframe/img against it, MutationObserver-watch for new ones, patch
 *  DOM insertion APIs, listen for `HONEY_CONSENT_CHANGE_EVENT` so updates from
 *  the React provider flow back here, and (when configured) periodically post
 *  scan reports to your backend. Returns a handle whose `.destroy()` puts the
 *  world back. */
export function bootstrapCookieConsent(config?: CookieBootstrapConfig | null): CookieBootstrapHandle | null {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return null
    }

    const resolvedConfig = readCookieBootstrapConfig(config)
    if (!resolvedConfig) {
        return null
    }

    let state = getConsentState(resolvedConfig)
    let reportTimer: number | null = null
    let followUpReportTimer: number | null = null

    const clearReportTimers = () => {
        if (reportTimer != null) {
            window.clearTimeout(reportTimer)
            reportTimer = null
        }

        if (followUpReportTimer != null) {
            window.clearTimeout(followUpReportTimer)
            followUpReportTimer = null
        }
    }

    const scheduleReport = (primaryDelay = 0, followUpDelay?: number) => {
        if (!resolvedConfig.scanEndpoint && !resolvedConfig.reportEndpoint) {
            return
        }

        clearReportTimers()

        reportTimer = window.setTimeout(() => {
            reportTimer = null
            void reportCookieSurface(resolvedConfig)
        }, primaryDelay)

        if (typeof followUpDelay === 'number') {
            followUpReportTimer = window.setTimeout(() => {
                followUpReportTimer = null
                void reportCookieSurface(resolvedConfig)
            }, followUpDelay)
        }
    }

    const sync = (nextState?: CookieConsentState | null) => {
        state = nextState === undefined ? getConsentState(resolvedConfig) : nextState
        syncDocument(state, resolvedConfig)
    }

    sync(state)

    const observer = new MutationObserver((records) => {
        for (const record of records) {
            for (const node of Array.from(record.addedNodes)) {
                if (!(node instanceof Element)) {
                    continue
                }

                for (const element of collectCandidateNodes(node)) {
                    syncNode(element, state, resolvedConfig)
                }
            }
        }
    })

    observer.observe(document.documentElement, {childList: true, subtree: true})

    const handleConsentChange = (event: Event) => {
        const detail = (event as CustomEvent<{state: CookieConsentState | null}>).detail
        sync(detail?.state ?? null)
        scheduleReport(300, 1500)
    }

    window.addEventListener(HONEY_CONSENT_CHANGE_EVENT, handleConsentChange)

    const restoreDom = patchDomInsertion(() => state, resolvedConfig)

    const handleWindowLoad = () => {
        scheduleReport()
    }

    if (document.readyState === 'complete') {
        handleWindowLoad()
    } else {
        window.addEventListener('load', handleWindowLoad, {once: true})
    }

    const handle: CookieBootstrapHandle = {
        config: resolvedConfig,
        destroy: () => {
            observer.disconnect()
            restoreDom()
            clearReportTimers()
            window.removeEventListener('load', handleWindowLoad)
            window.removeEventListener(HONEY_CONSENT_CHANGE_EVENT, handleConsentChange)
            if (window.HoneyCookieConsentBootstrap === handle) {
                delete window.HoneyCookieConsentBootstrap
            }
        },
        getState: () => state,
        sync,
    }

    window.HoneyCookieConsentBootstrap = handle
    return handle
}

/** Convenience wrapper: read the config from `window` (set by the loader script
 *  or a hand-rolled inline snippet) and call `bootstrapCookieConsent`. Returns
 *  null when running in a non-browser context or no config is parked. */
export function autoBootstrapCookieConsent() {
    if (typeof window === 'undefined' || typeof document === 'undefined') {
        return null
    }

    return bootstrapCookieConsent(readCookieBootstrapConfig())
}
