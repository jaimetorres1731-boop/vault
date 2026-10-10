# Vault V1.2 — Savings Dashboard Update

Deploy to the existing GitHub Pages `vault` repository by uploading every file from this ZIP to the repository root, replacing matching filenames. Back up V1.1 first.

## Added
- New savings command center with total balance, monthly net, required monthly pace, and progress against deployment timeline
- Recent activity timeline
- Payday planning for 1st/15th, biweekly or monthly schedules; projections are *planning only*, not recorded deposits
- Monthly savings health indicators
- Backup readiness display and structural record check
- Mobile layout improvements, faster lightweight rendering, updated offline PWA cache
- Full JSON backup and restore now includes payday planner settings in addition to transactions, goals and reminders

## Preserved
V1.1 transactions, primary goal, optional goals, calendar, reports, projections, privacy PIN, reminders, legal pages and approved Vault branding.

## Data and privacy
The original localStorage keys are preserved. V1.2 uses `vault-v12-payplan` for payday plans. No bank access, backend or account creation. Privacy PIN does not encrypt records. A JSON backup is essential before updating. A local validation check is not equivalent to testing restoration.

## QA
JavaScript syntax checks and ZIP checks were performed. Interactive browser testing is still needed. Test existing data, all new dashboard sections, backup/restore in a separate browser profile, mobile, and offline reload before treating V1.2 as a production release.
