# Vault V1.1 — Deployment Savings Tracker

Update the existing Vault GitHub Pages site by uploading all files to the repository root. Export a JSON backup of the current app before updating.

## Features
- Edit existing transactions; search, filter, add, and withdraw
- Primary savings goal with optional subgoals sharing the same balance
- Savings calendar, monthly reports, checkpoints and milestone indicators
- Payday-labeled deposit insights and configurable in-app reminders
- Conservative/expected/optimistic estimates after enough transaction history
- JSON backups with V1.1 goal/reminder metadata; CSV transaction export
- Optional PIN privacy screen (not encryption)
- Installable PWA with offline cache on HTTPS

## Data migration
The original data key `vault-deployment-v3` is preserved. V1.1 extension data uses `vault-v11-extras`. No records are uploaded to GitHub. Browser localStorage is not encrypted and does not sync between devices.

## Limitations
Reminders are shown when Vault is opened, not pushed to closed devices. PIN lock is only a privacy screen. Predictions are estimates. A deployment savings calendar is not a bank statement.

## Testing
Verify on GitHub Pages (HTTPS): original savings data, edit, calendar, goals, JSON backup and restore, offline reload after first visit, and PIN behavior. Do not delete the current working release until testing is complete.

## V1.1 legal and backup patch
- Persistent footer with Privacy Policy, Terms of Use, and Financial & Security Disclaimers pages.
- JSON backup now includes optional goals and reminder settings; supports legacy V1 backups.
- Restore validates backup and prompts before replacing local data.
- These policies are templates tailored to this static app, not a substitute for legal review. Add a support/privacy contact before public distribution.
