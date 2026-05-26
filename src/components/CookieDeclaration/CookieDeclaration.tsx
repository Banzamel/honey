import {useMemo, useState, type HTMLAttributes, type ReactNode} from 'react'
import type {CookieDeclarationItem} from '../../types'
import {useOptionalCookieConsent} from '../CookieConsentProvider/CookieConsentContext'
import {cn} from '../../utils/cn'

export interface CookieDeclarationProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
    /** Static list of cookies to render. Falls back to the provider's
     *  `declaration` (populated by `loadDeclaration` or `declaration` prop on
     *  the provider) when omitted. */
    items?: CookieDeclarationItem[]
    /** Group rows by `category` and render a table per category with a heading.
     *  When `false`, all rows share one table that includes a Category column. */
    grouped?: boolean
    /** Render a filter input above the table. Filters across name, category,
     *  provider, purpose, duration, type and domain. */
    searchable?: boolean
    /** Compact row spacing — useful inside drawers / panels. */
    compact?: boolean
    /** Replace the default empty-state message when the filtered list is empty. */
    emptyState?: ReactNode
    loading?: boolean
    title?: ReactNode
    description?: ReactNode
    showCategory?: boolean
    showProvider?: boolean
    showDuration?: boolean
    showType?: boolean
    showDomain?: boolean
    /** Custom node rendered next to the title (e.g. an "Export CSV" button). */
    renderActions?: ReactNode
}

function filterDeclarationItems(items: CookieDeclarationItem[], query: string) {
    const trimmed = query.trim()
    if (!trimmed) {
        return items
    }

    const needle = trimmed.toLowerCase()

    return items.filter((item) =>
        [item.name, item.category, item.provider, item.purpose, item.duration, item.type, item.domain]
            .filter(Boolean)
            .some((value) => String(value).toLowerCase().includes(needle))
    )
}

interface ColumnDef {
    key: keyof CookieDeclarationItem
    label: string
    width?: string
}

/**
 * Public declaration of every cookie / storage technology the site sets, grouped
 * by category by default. Pulls from the provider's `declaration` (populated by
 * the bootstrap loader from the server, or by the consumer through the
 * `declaration` prop) so it stays in sync with the live preferences drawer.
 * Pure presentation — no state on the provider changes when this component
 * mounts.
 */
export function CookieDeclaration({
    items,
    grouped = true,
    searchable = false,
    compact = false,
    emptyState,
    loading = false,
    title,
    description,
    showCategory = true,
    showProvider = true,
    showDuration = true,
    showType = true,
    showDomain = true,
    renderActions,
    className,
    ...rest
}: CookieDeclarationProps) {
    const consent = useOptionalCookieConsent()
    const [query, setQuery] = useState('')

    const resolvedItems = useMemo(
        () => items ?? consent?.declaration ?? [],
        [consent?.declaration, items]
    )
    const filteredItems = useMemo(
        () => filterDeclarationItems(resolvedItems, query),
        [query, resolvedItems]
    )

    const resolvedTitle = title ?? consent?.texts.declarationTitle
    const resolvedDescription = description ?? consent?.texts.declarationDescription
    const emptyLabel = consent?.texts.noDeclarationItems ?? 'No declaration items available.'
    const searchLabel = consent?.texts.searchDeclaration ?? 'Search cookies...'

    const columns = useMemo<ColumnDef[]>(() => {
        const next: ColumnDef[] = []

        if (showCategory && !grouped) {
            next.push({key: 'category', label: 'Category', width: '14%'})
        }

        next.push(
            {key: 'name', label: 'Name', width: '16%'},
            {key: 'purpose', label: 'Purpose', width: '34%'}
        )

        if (showProvider) next.push({key: 'provider', label: 'Provider', width: '16%'})
        if (showDuration) next.push({key: 'duration', label: 'Duration', width: '12%'})
        if (showType) next.push({key: 'type', label: 'Type', width: '12%'})
        if (showDomain) next.push({key: 'domain', label: 'Domain', width: '14%'})

        return next
    }, [grouped, showCategory, showDomain, showDuration, showProvider, showType])

    const groupedItems = useMemo(() => {
        if (!grouped) {
            return [] as Array<[string, CookieDeclarationItem[]]>
        }

        const map = new Map<string, CookieDeclarationItem[]>()

        for (const item of filteredItems) {
            const categoryKey = item.category || 'Other'
            const current = map.get(categoryKey) ?? []
            current.push(item)
            map.set(categoryKey, current)
        }

        return Array.from(map.entries())
    }, [filteredItems, grouped])

    const renderTable = (rows: CookieDeclarationItem[]) => (
        <table
            className={cn(
                'honey-table',
                'honey-cookie-declaration-table',
                compact ? 'honey-cookie-declaration-table-compact' : undefined
            )}
        >
            <thead>
                <tr>
                    {columns.map((column) => (
                        <th key={column.key} style={column.width ? {width: column.width} : undefined}>
                            {column.label}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row) => (
                    <tr key={row.id}>
                        {columns.map((column) => {
                            const value = row[column.key]
                            return (
                                <td key={column.key}>{value != null && value !== '' ? value : '—'}</td>
                            )
                        })}
                    </tr>
                ))}
            </tbody>
        </table>
    )

    return (
        <div className={cn('honey-stack honey-cookie-declaration', className)} {...rest}>
            {resolvedTitle || resolvedDescription || renderActions ? (
                <div className="honey-cookie-declaration-copy">
                    {resolvedTitle ? (
                        <h4 className="honey-heading">{resolvedTitle}</h4>
                    ) : null}
                    {resolvedDescription ? (
                        <p className="honey-text honey-text-muted">{resolvedDescription}</p>
                    ) : null}
                    {renderActions}
                </div>
            ) : null}

            {searchable ? (
                <div className="honey-input honey-cookie-declaration-search">
                    <input
                        type="search"
                        value={query}
                        onChange={(event) => setQuery(event.target.value)}
                        placeholder={searchLabel}
                        aria-label={searchLabel}
                    />
                </div>
            ) : null}

            {!loading && filteredItems.length === 0
                ? (emptyState ?? (
                      <div className="honey-table-empty honey-cookie-declaration-empty">{emptyLabel}</div>
                  ))
                : null}

            {!loading && !grouped && filteredItems.length > 0 ? renderTable(filteredItems) : null}

            {!loading && grouped
                ? groupedItems.map(([category, categoryItems]) => (
                      <div key={category} className="honey-stack honey-cookie-declaration-group">
                          <h5 className="honey-heading honey-heading-sm">{category}</h5>
                          {renderTable(categoryItems)}
                      </div>
                  ))
                : null}
        </div>
    )
}
