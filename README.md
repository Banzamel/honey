# Honey 🍯

Honey is a React package for cookie consent. Drop a script tag in `<head>`, wrap your app in `<CookieConsent>`, and your visitors get a consent panel, a preferences drawer, a declaration table and a floating re-open trigger out of the box. RODO, GDPR and ePrivacy compatible.

`<CookieConsent>` is the one all-in-one entry point: pick where the panel sits with `placement` — `modal`, `top-drawer`, `bottom-drawer`, `left-drawer`, `right-drawer`, the four corners or `center` — and where the re-open button lands with `triggerPlacement`. (`<HoneySetup>` stays exported as a backward-compatible alias.)

```tsx
import {CookieConsent} from '@banzamel/honey'

<CookieConsent placement="modal" triggerPlacement="bottom-left">
    <App />
</CookieConsent>
```

Sensible defaults, themable through CSS variables, customizable through provider props. Pair with the hosted backend for audit logs, consent receipts and multi-domain sharing.

## License

The npm package itself is MIT. The hosted compliance backend — audit logging, server-side consent receipts, multi-domain consent sharing, hosted scan reports, declaration delivery from your honey.mineralui.io portal — requires a one-time license:

1. Buy a license at [honey.mineralui.io/pricing](https://honey.mineralui.io/pricing).
2. Activate the install:
   ```bash
   npx honey activate --license-key=YOUR_LICENSE_KEY
   ```
3. Done. The next page load talks to the backend; your portal at honey.mineralui.io tracks installations, registered domains and consent history.

Without a license the UI components still work — banners render, users can accept/reject, consent is saved locally to their browser. You just don't get the hosted compliance pieces.

## Documentation

Full documentation, live examples and API reference at [honey.mineralui.io/docs](https://honey.mineralui.io/docs).

## Support

- Contact: [honey.mineralui.io/contact](https://honey.mineralui.io/contact)
- Issues: [github.com/Banzamel/honey/issues](https://github.com/Banzamel/honey/issues)

Built by [Banzamel](https://github.com/Banzamel).
