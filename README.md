# Vault V1.3 — Transaction Modal Update

## Features
- Banking-style modal for deposits and withdrawals, launched from dashboard shortcuts or Transactions tab
- Withdrawal confirmation before saving; deposits save immediately
- Undo newly saved transaction for 10 seconds
- Focus management, Escape key, outside-click close, and mobile bottom sheet
- Keeps existing data key, edit/history features, goals, backups, themes, tutorial, and collapsible navigation

## Install
1. Export your Vault JSON backup first.
2. Upload the entire ZIP contents to your existing GitHub Pages repository root, replacing matching files.
3. Commit and refresh the app; installed PWAs may need a second refresh for the updated service worker.
4. Test deposits, withdrawals, canceled withdrawals, Undo, balances, history, and mobile layout.

## Notes
- Undo reverses only the newly saved transaction, not older records.
- Data remains in the browser; the PIN is not encryption.
- JavaScript syntax checks passed, but this update has not undergone a live browser integration test.
