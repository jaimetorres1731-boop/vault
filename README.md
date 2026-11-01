# Vault V2.1 — Military Pay and Stability Release Candidate

Includes previous Vault V2 features plus military pay and entitlements planner, full/reduced per diem periods, recurring monthly bills, savings forecasts, CSV export, and complete backup/restore integration.

## Important limitations
- Official rates are **not automatically retrieved**. Enter verified amounts from DFAS, the DoD BAH lookup, orders, LES, or travel authorization. ZIP, pay grade, and rate year are reference fields only.
- Per diem is a travel reimbursement estimate and is deliberately separate from recurring monthly pay.
- Estimated deductions are manually entered. FSA eligibility is not inferred.
- The planner saves to this device only, and a PIN does not encrypt data. Export a full backup before upgrading.
- Browser/device acceptance testing remains necessary before calling this production-ready.

## Deploy
1. Export your complete backup from the live app.
2. Upload all ZIP contents (inside `vault-main/`) to the GitHub Pages repository root.
3. After deployment, reload the installed app, and test the Military pay tab, backup/restore, transactions, and offline loading.
4. Compare every calculated estimate to your actual LES/orders.
