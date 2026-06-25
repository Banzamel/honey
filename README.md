# Honey 🍯

Honey is a React package for cookie consent. It ships five components — banner, modal wall, preferences drawer, declaration table and a footer trigger — plus a head-script that parks third-party trackers until the matching category is accepted. Compatible with RODO, GDPR and ePrivacy.

Compose the parts yourself or use `<HoneySetup>` for a one-tag drop-in. Style with CSS variables. Pair with the hosted backend for audit logs, consent receipts and multi-domain sharing.

## What's in the package

- **CookieBanner** — non-blocking top or bottom bar with Accept all / Reject / Manage actions.
- **CookieConsent** — modal-wall variant for jurisdictions that require an explicit decision before any page interaction.
- **CookiePreferences** — per-category drawer with a "Detected on this site" reveal under each category.
- **CookieDeclaration** — searchable cookie table for the privacy page.
- **CookieTrigger** — footer button to reopen the preferences drawer.
- **cookie-consent-bootstrap** — head-script that holds back `<script>`, `<iframe>` and `<img>` tags marked with `data-cookie-category` until the matching category is accepted.

All components are keyboard-navigable, screen-reader labelled and responsive.

## License

The npm package is MIT. The hosted compliance backend — audit logs, consent receipts, multi-domain consent sharing, scan reports — is a paid add-on. License and activation flow at [honey.mineralui.io/pricing](https://honey.mineralui.io/pricing).

Without a license the UI components and the head-script behave the same. Only the backend pieces are gated.

## Documentation

Full documentation, live examples and API reference at [honey.mineralui.io/docs](https://honey.mineralui.io/docs).

## Support

- Contact: [honey.mineralui.io/contact](https://honey.mineralui.io/contact)
- Issues: [github.com/Banzamel/honey/issues](https://github.com/Banzamel/honey/issues)

Built by [Banzamel](https://github.com/Banzamel).
