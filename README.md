# @banzamel/honey

Standalone, themable cookie-consent for React — banner, preferences drawer, declaration table, RODO/GDPR-friendly. Works on its own; sweet alongside [MineralUI](https://mineralui.io).

> **Status:** 0.1.0 — package scaffold. Components are placeholders. Real implementation lands as the cookie sources move out of `@banzamel/mineralui-pro@1.x` into here for the `@banzamel/mineralui-pro@2.0.0` release.

## What's in the jar

- `CookieBanner` — non-blocking bottom banner with "Accept all", "Reject" and "Customize" CTAs.
- `CookieConsent` — full-screen overlay variant for strict-consent regions.
- `CookieConsentProvider` — context provider that tracks consent state, persists it to storage, and exposes `useCookieConsent()`.
- `CookieDeclaration` — table of all cookies the site sets, grouped by category.
- `CookiePreferences` — drawer/modal for category-level toggles.
- `CookieTrigger` — re-open-preferences button you can drop in a footer.
- `cookie-consent-bootstrap` — tiny bootstrap script for blocking trackers until consent is given.

## Why a separate package

`@banzamel/mineralui-pro` shipped cookie components from day one. In `2.0.0` they move out so the rest of the framework stays focused on UI, and so projects that just need cookie consent (no React framework reuse) can install a slim package.

Honey is **standalone** — it doesn't depend on MineralUI. Styling is driven by `--honey-*` CSS tokens with sensible defaults; if you're using MineralUI, alias `--honey-primary-rgb: var(--mineral-primary-rgb)` (etc.) and Honey inherits the live theme.

## Install

```bash
npm install @banzamel/honey
```

```tsx
import {CookieConsentProvider, CookieBanner} from '@banzamel/honey'

<CookieConsentProvider>
    <App />
    <CookieBanner />
</CookieConsentProvider>
```

## Theming

Honey reads from a small set of CSS variables — override them on `:root` or any scope to retheme.

```css
:root {
    --honey-bg: #13151a;
    --honey-surface: #1a1d23;
    --honey-text: #f5f5fa;
    --honey-primary-rgb: 0, 165, 222;
    /* …see src/tokens.css for the full list */
}
```

## License & activation

Honey is open source (MIT) but the production-grade Cookie Compliance backend (audit logging, server-side consent receipts, regional rule packs) requires a license activated via the Banzamel license portal. See `/honey/pricing` on mineralui.io.
