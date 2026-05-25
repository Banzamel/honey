import type {ReactNode} from 'react'
import {cn} from '../../utils/cn'
import './HoneyJar.css'

export interface HoneyJarProps {
    children?: ReactNode
    className?: string
}

/**
 * Smoke-test component used to validate the Phase 1 scaffold — verifies that
 * `tokens.css`, the CSS auto-inject runtime and the TypeScript build all wire
 * up. Will be removed once `CookieBanner` ships with real styling.
 */
export function HoneyJar({children, className}: HoneyJarProps) {
    return (
        <div className={cn('honey-root', 'honey-jar', className)}>
            <strong className="honey-jar-label">@banzamel/honey scaffold</strong>
            <span className="honey-jar-body">{children ?? 'cookie components will land in Phase 2'}</span>
        </div>
    )
}
