# Honey 🍯

**Cookie consent for React, done right.** Drop in a banner, a preferences drawer and a declaration table — all themable, all RODO / GDPR / ePrivacy friendly, all in one tiny package.

## Quick install

**1. Drop the bootstrap script in `<head>`** — parks third-party trackers until your visitors say yes, and loads ahead of React so the wall is in place from the first paint.

```html
<script
    src="https://api.mineralui.io/cookie/bootstrap.min.js"
    data-site-key="YOUR_SITE_KEY"
    async
></script>
```

**2. Install the package**

```bash
npm install @banzamel/honey
```

**3. Wrap your app**

```tsx
import {HoneySetup} from '@banzamel/honey'

export default function App() {
    return (
        <HoneySetup>
            <YourApp />
        </HoneySetup>
    )
}
```

`HoneySetup` bundles the provider, the banner and the preferences drawer in one tag. That's it — your site is compliant on the next refresh.

Need finer control? Compose the primitives directly:

```tsx
import {CookieConsentProvider, CookieBanner, CookiePreferences} from '@banzamel/honey'

<CookieConsentProvider>
    <YourApp />
    <CookieBanner />
    <CookiePreferences />
</CookieConsentProvider>
```

## What you get

- **Banner** — non-blocking bottom or top bar with Accept all / Reject / Manage actions. Slides in cleanly, never breaks your layout.
- **Full-screen consent** — modal-style variant for strict jurisdictions where browsing should be blocked until the user decides.
- **Preferences drawer** — category-by-category toggles (Necessary, Preferences, Analytics, Marketing) with a "what's actually being set?" reveal under each category.
- **Cookie declaration table** — public, searchable list of every cookie your site uses, ready to embed on your privacy page.
- **Re-open trigger** — a small "Cookie settings" button you can drop in any footer so users can change their mind later.
- **Tracker blocker** — a tiny `<script>` tag that parks every third-party `<script>`, `<iframe>` and `<img>` until the matching category is accepted. No more tracking pixels firing before consent.

Everything is keyboard-friendly, screen-reader labelled and works on phones.

## Theming

Honey reads from CSS variables. Override them anywhere — `:root`, a wrapper class, dark-mode media query — and the whole UI follows.

```css
:root {
    /* Brand colors as RGB triples (so opacity works) */
    --honey-primary-rgb: 255, 179, 0;
    --honey-success-rgb: 34, 197, 94;

    /* Surfaces */
    --honey-bg: #13151a;
    --honey-surface: #1a1d23;
    --honey-text: #f5f5fa;

    /* See src/tokens.css for the full list — spacing, radius, type scale */
}

/* Or flip to a light variant scoped to a wrapper */
[data-honey-theme='light'] {
    --honey-bg: #ffffff;
    --honey-text: #13151a;
}
```

Out of the box Honey ships a dark theme; the `[data-honey-theme='light']` switch is built in.

## License

The npm package itself is MIT. The **hosted compliance backend** — audit logging, server-side consent receipts, multi-domain consent sharing, hosted scan reports, declaration delivery from your honey.mineralui.io portal — requires a one-time license:

1. Buy a license at [honey.mineralui.io/pricing](https://honey.mineralui.io/pricing).
2. Activate the install:
   ```bash
   npx honey activate --license-key=YOUR_LICENSE_KEY
   ```
3. Done. The next page load talks to the backend; your portal at honey.mineralui.io tracks installations, registered domains and consent history.

Without a license the UI components still work — banners render, users can accept/reject, consent is saved locally to their browser. You just don't get the hosted compliance pieces.

## Documentation

Full docs, live examples and the migration guide live at **[honey.mineralui.io/docs](https://honey.mineralui.io/docs)**.

## Support

- Issues: [github.com/Banzamel/honey/issues](https://github.com/Banzamel/honey/issues)
- Contact: [honey.mineralui.io/contact](https://honey.mineralui.io/contact)

Built and maintained by [Banzamel](https://github.com/Banzamel).
