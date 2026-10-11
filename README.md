# Vault V1.4.1 — Transaction Categories & Filters

Includes all V1.4 features, with optional categories for deposits and withdrawals.

## Added
- Deposit categories: Paycheck, Bonus, Gift, Transfer, Other
- Withdrawal categories: Bills, Shopping, Emergency, Transfer, Other
- Uncategorized remains the default
- Category shown in transaction history and included in search
- Category filter on Transactions tab
- Edit a transaction to assign/change its category
- Insights breakdown by category, separated into deposits and withdrawals
- CSV export includes Category
- Existing JSON backups retain category fields
- Older records automatically appear as Uncategorized (no data migration)

## Deploy
1. Export a JSON backup of your existing data.
2. Extract ZIP and upload all files to the existing GitHub Pages repository root, replacing matching files.
3. Commit and refresh the published site.
4. Test deposit, withdrawal, edit category, filter, CSV export, backup and restore, and Insights.

This is a local-only tracker. No financial information is sent to a server.
JavaScript syntax and ZIP integrity were checked; browser testing is still required.
