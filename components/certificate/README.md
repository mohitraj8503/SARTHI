# ATOOT KADI — The Unbreakable Certificate Rendering Chain

> **Certificate Studio is the only place in the entire codebase that knows how to render a certificate. Everything else in the product only ever displays a frozen snapshot that Studio produced. No other file, component, page, or script is ever allowed to independently draw, re-render, or reconstruct certificate visuals or determine certificate validity.**

---

## Core Rules for Developers and AI Agents

1. **NEVER** re-implement certificate JSX/HTML markup in new pages, components, or scripts.
2. **NEVER** inline custom status or payment checks. Always import and use `getCertificateDisplayState(certificate)` from `@/lib/certificate/getCertificateDisplayState`.
3. **NEVER** create alternative public verification routes. The single canonical route is `/verify/[id]`.
4. **ALWAYS** render the frozen snapshot string (`certificate.htmlSnapshot`) inside a sandboxed `<iframe>` with `sandbox="allow-same-origin allow-popups"`.

---

## Architectural Links

1. **Design / Issuance:** Certificate Studio (`/admin/certificates/studio`).
2. **Payment Confirmation:** Razorpay webhook status transition to `VALID`.
3. **Snapshot Capture:** `captureCertificateSnapshot.ts` saves `htmlSnapshot` and `pdfUrl` at issuance / payment time.
4. **Display Surfaces:** Fetch record -> `getCertificateDisplayState` -> render `<iframe srcDoc={displayState.htmlSnapshot}>`.
