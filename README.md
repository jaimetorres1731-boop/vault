# Vault V1.2 — Experience Update

Includes all previous V1.2 functionality and adds:
- Prominent **Install Vault** dashboard button with browser-specific fallback instructions
- Seven-step first-use walkthrough and replay button
- Five locally saved accent themes: electric blue, violet, emerald, gold, rose
- Optional browser notification permission and test notification; payday alerts while the app is open
- Updated service worker cache for offline installation

**Important:** True push notifications when the app is closed are NOT included. They require a secure backend, push subscription management, and a notification service. The application still stores savings records locally; bank integration remains deferred.

## Deployment
Export a full JSON backup first. Upload every file from the ZIP to the root of the existing GitHub Pages repository. Replace matching files. Test the install button, walkthrough, themes, and notifications on the live HTTPS site. No financial records should be committed to GitHub.

## QA
JavaScript syntax and ZIP integrity were checked. Live interactive browser tests still need to be completed. Browser install prompts and notifications vary by platform.
