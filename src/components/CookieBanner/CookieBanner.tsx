import type {HTMLAttributes, ReactNode} from 'react'
import {createPortal} from 'react-dom'
import type {HoneyColor} from '../../types'
import {useOptionalCookieConsent} from '../CookieConsentProvider/CookieConsentContext'
import {cn} from '../../utils/cn'

export type CookieBannerPosition = 'top' | 'bottom'
export type CookieBannerVariant = 'bar' | 'card'

export interface CookieBannerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'color' | 'title'> {
    /** Force the banner open/closed; defaults to the provider's `bannerOpen`. */
    open?: boolean
    /** Anchor edge for the fixed banner. Default `'bottom'`. */
    position?: CookieBannerPosition
    /** Visual variant. `'bar'` is denser (padded 16px), `'card'` is roomier (24px). Default `'bar'`. */
    variant?: CookieBannerVariant
    /** Accent color applied to the primary CTA. Default `'primary'`. */
    color?: HoneyColor
    title?: ReactNode
    description?: ReactNode
    showRejectAll?: boolean
    showPreferences?: boolean
    acceptLabel?: ReactNode
    rejectLabel?: ReactNode
    preferencesLabel?: ReactNode
    closeLabel?: string
    /** Add an explicit close button alongside the CTAs. Off by default — most
     *  designs use Accept/Reject for dismissal. */
    dismissible?: boolean
    /** Render through a portal pinned to `document.body`. On by default so the
     *  banner escapes parent stacking contexts. Disable when you want to embed
     *  the banner inside a specific layout slot. */
    sticky?: boolean
    fullWidth?: boolean
    onAcceptAll?: () => void
    onRejectAll?: () => void
    onOpenPreferences?: () => void
    onDismiss?: () => void
    /** Replace the default CTA cluster while keeping the title/description block. */
    actions?: ReactNode
    /** Replace the entire body (title + description + actions) with custom JSX. */
    children?: ReactNode
}

interface BannerBodyProps {
    title?: ReactNode
    description?: ReactNode
    showRejectAll: boolean
    showPreferences: boolean
    acceptLabel?: ReactNode
    rejectLabel?: ReactNode
    preferencesLabel?: ReactNode
    dismissible: boolean
    closeLabel: string
    onAcceptAll: () => void
    onRejectAll: () => void
    onOpenPreferences: () => void
    onDismiss: () => void
    actions?: ReactNode
    children?: ReactNode
    color: HoneyColor
}

function BannerBody({
    title,
    description,
    showRejectAll,
    showPreferences,
    acceptLabel,
    rejectLabel,
    preferencesLabel,
    dismissible,
    closeLabel,
    onAcceptAll,
    onRejectAll,
    onOpenPreferences,
    onDismiss,
    actions,
    children,
    color,
}: BannerBodyProps) {
    if (children) {
        return <>{children}</>
    }

    return (
        <>
            <div className="honey-cookie-banner-content">
                {title ? <div className="honey-cookie-banner-title">{title}</div> : null}
                {description ? <div className="honey-cookie-banner-description">{description}</div> : null}
            </div>
            <div className="honey-cookie-banner-actions">
                {actions ?? (
                    <>
                        {showPreferences ? (
                            <button
                                type="button"
                                className={cn('honey-btn', 'honey-btn-ghost', `honey-btn-color-${color}`)}
                                onClick={onOpenPreferences}
                            >
                                {preferencesLabel}
                            </button>
                        ) : null}
                        {showRejectAll ? (
                            <button
                                type="button"
                                className={cn('honey-btn', 'honey-btn-outlined', `honey-btn-color-${color}`)}
                                onClick={onRejectAll}
                            >
                                {rejectLabel}
                            </button>
                        ) : null}
                        <button
                            type="button"
                            className={cn('honey-btn', 'honey-btn-filled', `honey-btn-color-${color}`)}
                            onClick={onAcceptAll}
                        >
                            {acceptLabel}
                        </button>
                    </>
                )}
                {dismissible ? (
                    <button
                        type="button"
                        className={cn('honey-btn', 'honey-btn-ghost', 'honey-cookie-banner-dismiss')}
                        onClick={onDismiss}
                        aria-label={closeLabel}
                    >
                        {closeLabel}
                    </button>
                ) : null}
            </div>
        </>
    )
}

/**
 * Bottom-pinned (or top-pinned) cookie banner. When mounted inside a
 * `CookieConsentProvider` it auto-binds to `bannerOpen`, default texts and the
 * three handlers (`acceptAll` / `rejectAll` / `openPreferences`); every binding
 * is overridable via props. Renders nothing when `open` is false. Portaled to
 * `document.body` by default so parent overflow/transform contexts don't clip
 * the fixed position.
 */
export function CookieBanner({
    open,
    position = 'bottom',
    variant = 'bar',
    color = 'primary',
    title,
    description,
    showRejectAll = true,
    showPreferences = true,
    acceptLabel,
    rejectLabel,
    preferencesLabel,
    closeLabel,
    dismissible = false,
    sticky = true,
    fullWidth = true,
    onAcceptAll,
    onRejectAll,
    onOpenPreferences,
    onDismiss,
    actions,
    className,
    children,
    ...rest
}: CookieBannerProps) {
    const consent = useOptionalCookieConsent()
    const isOpen = open ?? consent?.bannerOpen ?? false

    if (!isOpen) {
        return null
    }

    const resolvedTitle = title ?? consent?.texts.bannerTitle
    const resolvedDescription = description ?? consent?.texts.bannerDescription
    const resolvedAcceptLabel = acceptLabel ?? consent?.texts.acceptAll ?? 'Accept all'
    const resolvedRejectLabel = rejectLabel ?? consent?.texts.rejectAll ?? 'Reject optional'
    const resolvedPreferencesLabel = preferencesLabel ?? consent?.texts.preferences ?? 'Preferences'
    const resolvedCloseLabel = closeLabel ?? consent?.texts.close ?? 'Close'
    const handleAccept = onAcceptAll ?? (() => consent?.acceptAll())
    const handleReject = onRejectAll ?? (() => consent?.rejectAll())
    const handleOpenPreferences = onOpenPreferences ?? (() => consent?.openPreferences())
    const handleDismiss = onDismiss ?? (() => consent?.hideBanner())

    const body = (
        <BannerBody
            title={resolvedTitle}
            description={resolvedDescription}
            showRejectAll={showRejectAll}
            showPreferences={showPreferences}
            acceptLabel={resolvedAcceptLabel}
            rejectLabel={resolvedRejectLabel}
            preferencesLabel={resolvedPreferencesLabel}
            closeLabel={resolvedCloseLabel}
            dismissible={dismissible}
            onAcceptAll={handleAccept}
            onRejectAll={handleReject}
            onOpenPreferences={handleOpenPreferences}
            onDismiss={handleDismiss}
            actions={actions}
            children={children}
            color={color}
        />
    )

    const banner = (
        <div
            className={cn(
                'honey-cookie-banner',
                `honey-cookie-banner-${variant}`,
                fullWidth ? 'honey-cookie-banner-full' : undefined,
                className
            )}
            role="region"
            aria-label="Cookie consent"
            {...rest}
        >
            <div className={cn('honey-card', 'honey-cookie-banner-surface')}>
                <div className="honey-card-body">{body}</div>
            </div>
        </div>
    )

    if (!sticky) {
        return banner
    }

    if (typeof document === 'undefined') {
        return banner
    }

    return createPortal(
        <div className={cn('honey-cookie-banner-portal', `honey-cookie-banner-portal-${position}`)}>{banner}</div>,
        document.body
    )
}
