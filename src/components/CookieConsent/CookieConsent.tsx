import {useEffect, useState, type HTMLAttributes, type ReactNode} from 'react'
import {createPortal} from 'react-dom'
import {cn} from '../../utils/cn'
import {
    CookieConsentProvider,
    type CookieConsentProviderProps,
} from '../CookieConsentProvider/CookieConsentProvider'
import {useCookieConsent} from '../CookieConsentProvider/CookieConsentContext'
import {
    HONEY_COOKIE_RUNTIME_KEY,
    HONEY_COOKIE_RUNTIME_READY_EVENT,
    type HoneyCookieRuntime,
} from '../CookieBootstrap/CookieBootstrap.types'
import {CookiePreferences} from '../CookiePreferences'
import {CookieTrigger} from '../CookieTrigger'

export type CookieConsentPlacement =
    | 'bottom-left'
    | 'bottom-right'
    | 'top-left'
    | 'top-right'
    | 'center'
    | 'top-drawer'
    | 'bottom-drawer'
    | 'left-drawer'
    | 'right-drawer'
    | 'modal'

export type CookieConsentTriggerPlacement =
    | 'none'
    | 'bottom-left'
    | 'bottom-right'
    | 'top-left'
    | 'top-right'

export type CookieConsentTriggerVariant = 'label' | 'icon'

export type CookieConsentTriggerShape = 'default' | 'circle' | 'rounded'

export interface CookieConsentProps
    extends Omit<CookieConsentProviderProps, 'children'>,
        Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'color' | 'children'> {
    /** Where the consent panel sits on the page when open. `'modal'` centres the
     *  panel and dims the rest; `'top-drawer'` / `'bottom-drawer'` stretch
     *  edge-to-edge; `'left-drawer'` / `'right-drawer'` are full-height side
     *  sheets; corner placements anchor to one viewport corner. */
    placement?: CookieConsentPlacement
    /** Where the floating re-open button sits once the user has decided.
     *  `'none'` hides the trigger entirely. */
    triggerPlacement?: CookieConsentTriggerPlacement
    /** Floating trigger appearance. `'label'` (default) shows the text button;
     *  `'icon'` shows a compact cookie-icon button. */
    triggerVariant?: CookieConsentTriggerVariant
    /** Floating trigger shape. `'default'` keeps the standard button radius;
     *  `'circle'` is a round button; `'rounded'` is a soft-cornered square. Pairs
     *  naturally with `triggerVariant='icon'`. */
    triggerShape?: CookieConsentTriggerShape
    /** Lock body scroll while the consent panel is up. Default `true` — the
     *  spec calls this the "opt-in" wall behaviour. */
    blockInteraction?: boolean
    /** Optional rich content rendered below the banner copy (e.g. a link to the
     *  full privacy policy). */
    details?: ReactNode
    /** Children rendered alongside the consent UI — the surrounding page. */
    children?: ReactNode
}

/** Read the runtime that the cookie-consent-bootstrap loader script parks on
 *  `window`. Returns `null` until the script fires its ready event. */
function readCookieRuntime(): HoneyCookieRuntime | null {
    if (typeof window === 'undefined') {
        return null
    }

    return window[HONEY_COOKIE_RUNTIME_KEY] ?? null
}

/** React-friendly wrapper around the global runtime. The CookieConsent
 *  component uses this to inherit the bootstrap's per-site config (categories,
 *  storage, version) and the runtime endpoints (loadConsent / saveConsent /
 *  loadDeclaration) without the consumer wiring anything by hand. */
function useCookieRuntime(): HoneyCookieRuntime | null {
    const [runtime, setRuntime] = useState<HoneyCookieRuntime | null>(() => readCookieRuntime())

    useEffect(() => {
        if (typeof window === 'undefined') {
            return
        }

        const handleReady = () => setRuntime(readCookieRuntime())

        window.addEventListener(HONEY_COOKIE_RUNTIME_READY_EVENT, handleReady)
        // Cover the case where the script attaches the runtime between the
        // initial useState and the effect running.
        handleReady()

        return () => {
            window.removeEventListener(HONEY_COOKIE_RUNTIME_READY_EVENT, handleReady)
        }
    }, [])

    return runtime
}

/** Built-in cookie glyph for the `triggerVariant='icon'` floating button.
 *  Inherits the button text colour through `currentColor`. */
function CookieGlyph() {
    return (
        <svg
            width="20"
            height="20"
            viewBox="0 0 24 24"
            fill="none"
            aria-hidden="true"
            focusable="false"
        >
            <path
                d="M12 2.5a9.5 9.5 0 1 0 9.5 9.5.8.8 0 0 0-.9-.8 3.5 3.5 0 0 1-3.8-3.8.8.8 0 0 0-.8-.9 2.6 2.6 0 0 1-2.4-2.4.8.8 0 0 0-.9-.6Z"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinejoin="round"
            />
            <circle cx="9" cy="10" r="1" fill="currentColor" />
            <circle cx="14.5" cy="13.5" r="1" fill="currentColor" />
            <circle cx="9.5" cy="15" r="0.9" fill="currentColor" />
        </svg>
    )
}

interface ContentProps {
    placement: CookieConsentPlacement
    triggerPlacement: CookieConsentTriggerPlacement
    triggerVariant: CookieConsentTriggerVariant
    triggerShape: CookieConsentTriggerShape
    blockInteraction: boolean
    details?: ReactNode
}

function CookieConsentContent({
    placement,
    triggerPlacement,
    triggerVariant,
    triggerShape,
    blockInteraction,
    details,
}: ContentProps) {
    const consent = useCookieConsent()
    const showPanel = consent.ready && (consent.bannerOpen || consent.preferencesOpen)

    // Lock body scroll while the panel is up so the user can't keep browsing
    // around the consent wall. Restored to its previous value on close.
    useEffect(() => {
        if (!blockInteraction || !showPanel) {
            return
        }

        const previous = document.body.style.overflow
        document.body.style.overflow = 'hidden'

        return () => {
            document.body.style.overflow = previous
        }
    }, [blockInteraction, showPanel])

    if (typeof document === 'undefined') {
        return null
    }

    const isDrawer = placement === 'top-drawer' || placement === 'bottom-drawer'
    const sheetPlacement = placement === 'modal' ? 'center' : placement
    const showFloatingTrigger = consent.ready && triggerPlacement !== 'none' && !showPanel

    return (
        <>
            {showPanel
                ? createPortal(
                      <>
                          {blockInteraction && consent.pending ? (
                              <div className="honey-cookie-consent-backdrop" aria-hidden="true" />
                          ) : null}
                          <div className="honey-cookie-consent-layer">
                              <div
                                  className={cn(
                                      'honey-cookie-consent-panel',
                                      `honey-cookie-consent-panel-${sheetPlacement}`,
                                      isDrawer ? 'honey-cookie-consent-sheet' : undefined
                                  )}
                              >
                                  <div className="honey-card honey-cookie-consent-card">
                                      <div className="honey-card-body honey-cookie-consent-body">
                                          <div className="honey-cookie-consent-copy">
                                              <h4 className="honey-heading">{consent.texts.bannerTitle}</h4>
                                              <p className="honey-text honey-text-muted">
                                                  {consent.texts.bannerDescription}
                                              </p>
                                              {details ? (
                                                  <div className="honey-cookie-consent-details">{details}</div>
                                              ) : null}
                                          </div>
                                          {!consent.preferencesOpen ? (
                                              <div className="honey-cookie-consent-actions">
                                                  <button
                                                      type="button"
                                                      className="honey-btn honey-btn-ghost"
                                                      onClick={consent.openPreferences}
                                                  >
                                                      {consent.texts.manage}
                                                  </button>
                                                  <button
                                                      type="button"
                                                      className="honey-btn honey-btn-outlined"
                                                      onClick={() => consent.rejectAll('banner')}
                                                  >
                                                      {consent.texts.rejectAll}
                                                  </button>
                                                  <button
                                                      type="button"
                                                      className="honey-btn honey-btn-filled"
                                                      onClick={() => consent.acceptAll('banner')}
                                                  >
                                                      {consent.texts.acceptAll}
                                                  </button>
                                              </div>
                                          ) : null}
                                          <div
                                              className={cn(
                                                  'honey-cookie-consent-preferences-wrap',
                                                  consent.preferencesOpen
                                                      ? 'honey-cookie-consent-preferences-open'
                                                      : undefined
                                              )}
                                              aria-hidden={!consent.preferencesOpen}
                                          >
                                              <CookiePreferences
                                                  variant="inline"
                                                  embedded
                                                  showAcceptAll={false}
                                                  showRejectAll={false}
                                              />
                                          </div>
                                      </div>
                                  </div>
                              </div>
                          </div>
                      </>,
                      document.body
                  )
                : null}

            {showFloatingTrigger
                ? createPortal(
                      <div
                          className={cn(
                              'honey-cookie-consent-trigger-wrap',
                              `honey-cookie-consent-trigger-wrap-${triggerPlacement}`
                          )}
                      >
                          <CookieTrigger
                              variant="button"
                              color="primary"
                              aria-label={consent.texts.triggerLabel}
                              className={cn(
                                  'honey-cookie-consent-trigger',
                                  triggerVariant === 'icon'
                                      ? 'honey-cookie-consent-trigger-icon'
                                      : undefined,
                                  triggerShape !== 'default'
                                      ? `honey-cookie-consent-trigger-${triggerShape}`
                                      : undefined
                              )}
                          >
                              {triggerVariant === 'icon' ? (
                                  <CookieGlyph />
                              ) : (
                                  consent.texts.triggerLabel
                              )}
                          </CookieTrigger>
                      </div>,
                      document.body
                  )
                : null}
        </>
    )
}

/**
 * All-in-one wrapper that mounts a `CookieConsentProvider`, picks up
 * config + runtime from the loader script on `window` (if present), renders
 * the consent panel using the placement of your choice, and drops a floating
 * trigger button so users can re-open preferences after they've decided.
 *
 * Use this when you want zero-glue compliance — mount `<CookieConsent />`
 * inside the app root and call it done. Use `CookieConsentProvider` +
 * `CookieBanner` + `CookieTrigger` separately when you need finer control
 * over where each piece renders.
 */
export function CookieConsent({
    placement = 'bottom-left',
    triggerPlacement = 'bottom-left',
    triggerVariant = 'label',
    triggerShape = 'default',
    blockInteraction = true,
    details,
    children,
    ...providerProps
}: CookieConsentProps) {
    const runtime = useCookieRuntime()
    const runtimeConfig = runtime?.config

    return (
        <CookieConsentProvider
            version={providerProps.version ?? runtimeConfig?.version}
            storageKey={providerProps.storageKey ?? runtimeConfig?.storageKey}
            persist={providerProps.persist}
            storage={providerProps.storage ?? runtimeConfig?.storage}
            cookieName={providerProps.cookieName ?? runtimeConfig?.cookieName}
            cookieMaxAgeDays={providerProps.cookieMaxAgeDays ?? runtimeConfig?.cookieMaxAgeDays}
            categories={providerProps.categories ?? runtimeConfig?.categories}
            declaration={providerProps.declaration}
            defaultConsent={providerProps.defaultConsent}
            mode={providerProps.mode}
            hideOnAccept={providerProps.hideOnAccept ?? runtimeConfig?.hideOnAccept}
            autoShow={providerProps.autoShow ?? runtimeConfig?.autoShow}
            reopenOnVersionChange={
                providerProps.reopenOnVersionChange ?? runtimeConfig?.reopenOnVersionChange
            }
            texts={providerProps.texts}
            loadDeclaration={providerProps.loadDeclaration ?? runtime?.getDeclaration}
            loadConsent={providerProps.loadConsent ?? runtime?.getConsent}
            saveConsent={providerProps.saveConsent ?? runtime?.saveConsent}
            requiredCookies={providerProps.requiredCookies ?? runtimeConfig?.requiredCookies}
            categoryRules={providerProps.categoryRules ?? runtimeConfig?.categoryRules}
            onDetectedCookies={providerProps.onDetectedCookies}
            onConsentChange={providerProps.onConsentChange}
            onAcceptAll={providerProps.onAcceptAll}
            onRejectAll={providerProps.onRejectAll}
            onWithdraw={providerProps.onWithdraw}
        >
            <CookieConsentContent
                placement={placement}
                triggerPlacement={triggerPlacement}
                triggerVariant={triggerVariant}
                triggerShape={triggerShape}
                blockInteraction={blockInteraction}
                details={details}
            />
            {children}
        </CookieConsentProvider>
    )
}
