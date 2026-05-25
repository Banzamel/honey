import type {CookieConsentPersistence, CookieConsentState} from '../../types'

interface CookieConsentStorageOptions {
    storage: CookieConsentPersistence
    storageKey: string
    cookieName: string
    cookieMaxAgeDays: number
}

function isCookieConsentState(value: unknown): value is CookieConsentState {
    if (!value || typeof value !== 'object') {
        return false
    }

    const candidate = value as CookieConsentState

    return (
        typeof candidate.version === 'string' &&
        typeof candidate.decidedAt === 'string' &&
        typeof candidate.source === 'string' &&
        candidate.categories != null &&
        typeof candidate.categories === 'object'
    )
}

function readCookieValue(name: string): string | null {
    if (typeof document === 'undefined') {
        return null
    }

    const prefix = `${encodeURIComponent(name)}=`

    for (const chunk of document.cookie.split(';')) {
        const trimmed = chunk.trim()
        if (trimmed.startsWith(prefix)) {
            return decodeURIComponent(trimmed.slice(prefix.length))
        }
    }

    return null
}

function writeCookieValue(name: string, value: string, maxAgeDays: number) {
    if (typeof document === 'undefined') {
        return
    }

    document.cookie = `${encodeURIComponent(name)}=${encodeURIComponent(value)}; path=/; max-age=${Math.floor(
        maxAgeDays * 24 * 60 * 60
    )}; samesite=lax`
}

function clearCookieValue(name: string) {
    if (typeof document === 'undefined') {
        return
    }

    document.cookie = `${encodeURIComponent(name)}=; path=/; max-age=0; samesite=lax`
}

export function readStoredCookieConsent({
    storage,
    storageKey,
    cookieName,
}: Pick<CookieConsentStorageOptions, 'storage' | 'storageKey' | 'cookieName'>): CookieConsentState | null {
    try {
        const raw = storage === 'cookie' ? readCookieValue(cookieName) : localStorage.getItem(storageKey)
        if (!raw) {
            return null
        }

        const parsed = JSON.parse(raw) as unknown
        return isCookieConsentState(parsed) ? parsed : null
    } catch {
        return null
    }
}

export function writeStoredCookieConsent(
    {storage, storageKey, cookieName, cookieMaxAgeDays}: CookieConsentStorageOptions,
    state: CookieConsentState
) {
    try {
        const serialized = JSON.stringify(state)

        if (storage === 'cookie') {
            writeCookieValue(cookieName, serialized, cookieMaxAgeDays)
            return
        }

        localStorage.setItem(storageKey, serialized)
    } catch {
        /* noop */
    }
}

export function clearStoredCookieConsent({
    storage,
    storageKey,
    cookieName,
}: Pick<CookieConsentStorageOptions, 'storage' | 'storageKey' | 'cookieName'>) {
    try {
        if (storage === 'cookie') {
            clearCookieValue(cookieName)
            return
        }

        localStorage.removeItem(storageKey)
    } catch {
        /* noop */
    }
}
