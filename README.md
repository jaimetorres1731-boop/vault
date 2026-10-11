# Vault V1.5 — Customizable Dashboard

This release builds on Vault V1.4.1 and preserves all existing data, transaction categories, Insights, tutorial, and navigation.

## New features
- Customize Dashboard button on the Dashboard tab.
- Show or hide Financial Overview, Deployment Progress, and Quick Stats.
- Move sections up/down to choose their order.
- Total Savings is always visible and always first.
- Reset layout to the recommended defaults.
- Changes are stored locally under `vault-v15-dashboard-layout` and restored when the app reopens.
- Accessible dialog and controls with keyboard labels; mobile-friendly design.
- No financial records are moved, changed, or deleted.

## Deployment
1. Export your existing Vault JSON backup before upgrading.
2. Extract this ZIP into the root of your existing GitHub Pages repository and replace matching files.
3. Commit, wait for Pages to deploy, then refresh/reopen the installed app.
4. Test Customize Dashboard, hide/show, move up/down, reset, refresh persistence, and mobile layout.

Note: Layout settings are device/browser-local and are not currently included in JSON backup exports. This is separate from financial records.

Validation: JavaScript syntax and ZIP integrity checked. Live browser tests are still required.
