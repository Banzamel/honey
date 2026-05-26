import {useEffect, useMemo, useState, type HTMLAttributes, type ReactNode} from 'react'
import {createPortal} from 'react-dom'
import {useOptionalCookieConsent} from '../CookieConsentProvider/CookieConsentContext'
import type {CookieCategoryDefinition, CookieDeclarationItem} from '../../types'
import {cn} from '../../utils/cn'

export type CookiePreferencesVariant = 'drawer' | 'inline'

export interface CookiePreferencesProps
    extends Omit<HTMLAttributes<HTMLDivElement>, 'title' | 'color'> {
    /** Force the panel open/closed; defaults to the provider's `preferencesOpen`. */
    open?: boolean
    /** `'drawer'` (default) renders a right-side slide-in over a backdrop;
     *  `'inline'` renders flat content the consumer can place anywhere — e.g.
     *  embedded inside the CookieConsent banner once the user clicks Manage. */
    variant?: CookiePreferencesVariant
    /** When `variant='inline'`, strip the surrounding card chrome so the body
     *  fits naturally inside an existing panel. */
    embedded?: boolean
    title?: ReactNode
    description?: ReactNode
    showAcceptAll?: boolean
    showRejectAll?: boolean
    showSave?: boolean
    acceptLabel?: ReactNode
    rejectLabel?: ReactNode
    saveLabel?: ReactNode
    closeLabel?: string
    categories?: CookieCategoryDefinition[]
    onClose?: () => void
    onAcceptAll?: () => void
    onRejectAll?: () => void
    onSave?: (next: Record<string, boolean>) => void
    /** Render extra content under each category description — e.g. a link to
     *  the privacy policy for that category. */
    renderCategoryDetails?: (category: CookieCategoryDefinition) => ReactNode
}

/** Declaration items with one of these storage types appear under each
 *  category's "Detected storage and trackers" reveal. Pixel/script entries
 *  are declarations only — they're tracked elsewhere. */
const STORAGE_DECLARATION_TYPES = new Set(['cookie', 'localStorage', 'sessionStorage'])

function normalizeDraft(
    categories: CookieCategoryDefinition[],
    values?: Record<string, boolean> | null
) {
    return categories.reduce<Record<string, boolean>>((acc, category) => {
        acc[category.key] = category.required ? true : values?.[category.key] === true
        return acc
    }, {})
}

function resolveCategoryDeclaration(
    items: CookieDeclarationItem[] | undefined,
    categoryKey: string
) {
    if (!items || items.length === 0) {
        return []
    }

    return items
        .filter((item) => {
            if (item.category !== categoryKey) {
                return false
            }
            return item.type == null || STORAGE_DECLARATION_TYPES.has(item.type)
        })
        .sort((left, right) => left.name.localeCompare(right.name))
}

export function CookiePreferences({
    open,
    variant = 'drawer',
    embedded = false,
    title,
    description,
    showAcceptAll = true,
    showRejectAll = true,
    showSave = true,
    acceptLabel,
    rejectLabel,
    saveLabel,
    closeLabel,
    categories: categoriesProp,
    onClose,
    onAcceptAll,
    onRejectAll,
    onSave,
    renderCategoryDetails,
    className,
    ...rest
}: CookiePreferencesProps) {
    const consent = useOptionalCookieConsent()
    const categories = useMemo(
        () => categoriesProp ?? consent?.categories ?? [],
        [categoriesProp, consent?.categories]
    )
    const isOpen = open ?? consent?.preferencesOpen ?? false
    const [draft, setDraft] = useState<Record<string, boolean>>(() =>
        normalizeDraft(categories, consent?.state?.categories ?? null)
    )
    const [expanded, setExpanded] = useState<Record<string, boolean>>({})

    // Whenever the provider's stored consent changes (e.g. the user accepts
    // all from the banner elsewhere on the page), pull those values back into
    // the local draft so toggles stay in sync without manual reconciliation.
    useEffect(() => {
        setDraft(normalizeDraft(categories, consent?.state?.categories ?? null))
    }, [categories, consent?.state])

    useEffect(() => {
        setExpanded({})
    }, [categories, isOpen])

    // Re-scan document.cookie + storage so the per-category "Detected" list is
    // fresh every time the drawer opens.
    useEffect(() => {
        if (isOpen) {
            consent?.refreshInventory()
        }
    }, [consent, isOpen])

    if (!isOpen && variant !== 'inline') {
        return null
    }

    const resolvedTitle = title ?? consent?.texts.preferencesTitle ?? 'Cookie preferences'
    const resolvedDescription = description ?? consent?.texts.preferencesDescription
    const resolvedAcceptLabel = acceptLabel ?? consent?.texts.acceptAll ?? 'Accept all'
    const resolvedRejectLabel = rejectLabel ?? consent?.texts.rejectAll ?? 'Reject optional'
    const resolvedSaveLabel = saveLabel ?? consent?.texts.savePreferences ?? 'Save preferences'
    const resolvedCloseLabel = closeLabel ?? consent?.texts.close ?? 'Close'
    const resolvedRequiredLabel = consent?.texts.requiredLabel ?? 'Required'
    const resolvedDetectedLabel = consent?.texts.detectedCookiesLabel ?? 'Detected storage and trackers'
    const resolvedNoDetected =
        consent?.texts.noDetectedCookies ?? 'No storage or trackers detected in this category yet.'

    const handleClose = onClose ?? (() => consent?.closePreferences())
    const handleAcceptAll = onAcceptAll ?? (() => consent?.acceptAll('preferences'))
    const handleRejectAll = onRejectAll ?? (() => consent?.rejectAll('preferences'))
    const handleSave =
        onSave ?? ((next: Record<string, boolean>) => consent?.savePreferences(next, 'preferences'))

    const body = (
        <div className="honey-stack honey-cookie-preferences-body">
            {categories.map((category) => {
                const detected = resolveCategoryDeclaration(consent?.declaration, category.key)
                const isExpanded = expanded[category.key] === true
                const detailId = `honey-cookie-preferences-${category.key}-detected`
                const toggled = category.required ? true : draft[category.key] === true

                return (
                    <div key={category.key} className="honey-cookie-preferences-category">
                        <div className="honey-cookie-preferences-copy">
                            <div className="honey-cookie-preferences-label">
                                <span>{category.label}</span>
                                {category.required ? (
                                    <span className="honey-badge honey-badge-neutral">
                                        {resolvedRequiredLabel}
                                    </span>
                                ) : null}
                            </div>
                            <div className="honey-text honey-text-muted honey-cookie-preferences-description">
                                {category.description}
                            </div>
                            {renderCategoryDetails?.(category)}
                            <div className="honey-cookie-preferences-detected">
                                <div className="honey-cookie-preferences-detected-header">
                                    <div className="honey-text honey-text-xs honey-text-muted">
                                        {resolvedDetectedLabel}
                                    </div>
                                    <button
                                        type="button"
                                        className="honey-link honey-cookie-trigger-link"
                                        aria-expanded={isExpanded}
                                        aria-controls={detailId}
                                        onClick={() =>
                                            setExpanded((prev) => ({
                                                ...prev,
                                                [category.key]: !isExpanded,
                                            }))
                                        }
                                    >
                                        {isExpanded ? 'Hide' : 'Show'}
                                        {detected.length > 0 ? ` (${detected.length})` : ''}
                                    </button>
                                </div>
                                {isExpanded && detected.length > 0 ? (
                                    <div id={detailId} className="honey-cookie-preferences-cookie-list">
                                        {detected.map((item) => (
                                            <div key={item.id} className="honey-cookie-preferences-cookie-item">
                                                <div className="honey-cookie-preferences-cookie-row">
                                                    <span className="honey-cookie-preferences-cookie-chip">
                                                        {item.name}
                                                    </span>
                                                    {item.type ? (
                                                        <span className="honey-text honey-text-xs honey-text-muted">
                                                            {item.type}
                                                        </span>
                                                    ) : null}
                                                    {item.provider ? (
                                                        <span className="honey-text honey-text-xs honey-text-muted">
                                                            {item.provider}
                                                        </span>
                                                    ) : null}
                                                </div>
                                                <div className="honey-text honey-text-xs honey-text-muted">
                                                    {item.purpose}
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                ) : isExpanded ? (
                                    <div className="honey-text honey-text-xs honey-text-muted">
                                        {resolvedNoDetected}
                                    </div>
                                ) : null}
                            </div>
                        </div>
                        <label className="honey-toggle honey-cookie-preferences-toggle">
                            <input
                                type="checkbox"
                                checked={toggled}
                                disabled={category.required}
                                onChange={(event) => {
                                    const checked = event.target.checked
                                    setDraft((prev) => ({
                                        ...prev,
                                        [category.key]: category.required ? true : checked,
                                    }))
                                }}
                            />
                            <span className="honey-toggle-track" />
                            <span className="honey-toggle-thumb" />
                        </label>
                    </div>
                )
            })}
        </div>
    )

    const footer = (
        <div className="honey-cookie-preferences-footer-inner">
            <div className="honey-cookie-preferences-actions">
                <button
                    type="button"
                    className="honey-btn honey-btn-ghost"
                    onClick={handleClose}
                >
                    {resolvedCloseLabel}
                </button>
                {showRejectAll ? (
                    <button
                        type="button"
                        className="honey-btn honey-btn-outlined"
                        onClick={handleRejectAll}
                    >
                        {resolvedRejectLabel}
                    </button>
                ) : null}
                {showAcceptAll ? (
                    <button
                        type="button"
                        className="honey-btn honey-btn-ghost"
                        onClick={handleAcceptAll}
                    >
                        {resolvedAcceptLabel}
                    </button>
                ) : null}
                {showSave ? (
                    <button
                        type="button"
                        className="honey-btn honey-btn-filled"
                        onClick={() => handleSave(draft)}
                    >
                        {resolvedSaveLabel}
                    </button>
                ) : null}
            </div>
        </div>
    )

    if (variant === 'inline') {
        if (embedded) {
            return (
                <div className={cn('honey-cookie-preferences honey-cookie-preferences-embedded', className)} {...rest}>
                    {resolvedTitle || resolvedDescription ? (
                        <div className="honey-cookie-preferences-heading">
                            {resolvedTitle ? (
                                <div className="honey-cookie-preferences-title">{resolvedTitle}</div>
                            ) : null}
                            {resolvedDescription ? (
                                <div className="honey-text honey-text-muted">{resolvedDescription}</div>
                            ) : null}
                        </div>
                    ) : null}
                    {body}
                    <div className="honey-cookie-preferences-footer">{footer}</div>
                </div>
            )
        }

        return (
            <div className={cn('honey-card honey-cookie-preferences', className)} {...rest}>
                {resolvedTitle || resolvedDescription ? (
                    <div className="honey-card-header">
                        {resolvedTitle ? (
                            <div className="honey-cookie-preferences-title">{resolvedTitle}</div>
                        ) : null}
                        {resolvedDescription ? (
                            <div className="honey-text honey-text-muted">{resolvedDescription}</div>
                        ) : null}
                    </div>
                ) : null}
                <div className="honey-card-body">{body}</div>
                <div className="honey-card-footer">{footer}</div>
            </div>
        )
    }

    // Drawer variant — slide-in side panel rendered via portal so the fixed
    // backdrop covers the full viewport even from inside transformed parents.
    if (typeof document === 'undefined') {
        return null
    }

    return createPortal(
        <>
            <div
                className="honey-drawer-backdrop"
                onClick={handleClose}
                aria-hidden="true"
            />
            <aside
                className={cn('honey-drawer honey-cookie-preferences', className)}
                role="dialog"
                aria-modal="true"
                aria-label={typeof resolvedTitle === 'string' ? resolvedTitle : 'Cookie preferences'}
                {...rest}
            >
                <div className="honey-drawer-header">
                    {resolvedTitle ? (
                        <div className="honey-cookie-preferences-title">{resolvedTitle}</div>
                    ) : null}
                    {resolvedDescription ? (
                        <div className="honey-text honey-text-muted">{resolvedDescription}</div>
                    ) : null}
                    <button
                        type="button"
                        className="honey-drawer-close"
                        onClick={handleClose}
                        aria-label={resolvedCloseLabel}
                    >
                        ×
                    </button>
                </div>
                <div className="honey-drawer-body">{body}</div>
                <div className="honey-drawer-footer">{footer}</div>
            </aside>
        </>,
        document.body
    )
}
