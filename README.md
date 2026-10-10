# Vault V1.2 — Navigation & Spacing Update

This update reorganizes the existing V1.2 app into seven distinct page-like views without changing existing savings records.

## Changes
- Collapsible desktop sidebar (preference saved locally)
- Dashboard, Transactions, Savings Goals, Calendar, Insights, Payday Planner, Settings
- Mobile bottom navigation (Home, Activity, Goals, Insights, More)
- Additional mobile sections under More (Calendar, Payday Planner, Settings)
- Better spacing between sections; no more stacked cards touching
- Existing quick deposit/withdraw buttons still lead to the transaction form
- Legal footer and all V1.2 features preserved
- Updated offline PWA cache to include navigation files

## Installation
1. Export a full JSON backup from your existing Vault app.
2. Extract the ZIP and upload all files to the same GitHub Pages repository root.
3. Replace files with matching names; do not remove legal pages.
4. Commit and wait for GitHub Pages to deploy.
5. Hard refresh, then test navigation on desktop and mobile.

## Safety
All financial records remain in browser localStorage under existing keys. No new bank access or remote storage is introduced. The privacy PIN remains a convenience screen, not encryption.

## Test status
JavaScript syntax and package checks passed. A live browser smoke test could not be completed in this environment; validate tab navigation, layout, deposits, goals, backups, and mobile More menu on the published site before considering this production-ready.
