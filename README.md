# Vault V3 — Deployment Savings Tracker

A standalone dark-blue deployment savings tracker, designed for GitHub Pages. No bank integration, account, or backend is required.

## Deploy
1. Create a GitHub repository.
2. Upload `index.html` to the repository root.
3. Under Settings → Pages, select Deploy from a branch, `main`, `/ (root)`.
4. Open the published URL.

## Features
- Savings goal, starting balance, and deployment dates entered by the user
- Deposits, withdrawals, transaction deletion, and history
- Deployment countdown and savings progress
- Dynamic savings chart, monthly stats, and a pace-based projection
- JSON backup export/import
- Responsive desktop sidebar and mobile bottom navigation

## Data and privacy
Records are stored in the browser's localStorage, not synchronized across devices. Export backups frequently. Clearing site data, using private browsing, or switching browsers/devices can lose your records. The app does not send notifications or access bank accounts.

## Upgrade from V2
V3 attempts to read the existing `deployment-savings-v1` localStorage key on the same site origin if V3 has no saved data yet. Moving to a different GitHub Pages domain does **not** migrate localStorage. Use V2's JSON export and V3's Restore feature instead.

Projections are informational estimates only. All amounts start blank or at zero; no user's personal details are embedded.
