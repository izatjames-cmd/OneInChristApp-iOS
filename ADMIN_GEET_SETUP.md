# Admin-added Geet setup

This version adds a dynamic hymnbook feature for Choir Admin / Church Admin.

## What it does

- Keeps the existing 478 Geet and 116 Zaboor unchanged.
- Adds **+ Add New Geet** inside the One in Christ Hymnbook for authorized admins.
- Admin enters Urdu/Punjabi title and Roman title.
- Admin pastes the complete Urdu/Punjabi + Roman lyrics together in one large box.
- **Preview** shows the hymn with the same visual style as the built-in hymn pages.
- **Save Geet** stores the new hymn in Firestore collection `hymnbookGeet`.
- The hymnbook index automatically includes saved Geet under the Roman title's alphabet letter.
- Admin-added Geet can be selected for Choir Plan exactly like built-in hymns.
- Authorized admins can edit or delete admin-added Geet.
- Built-in hymn HTML files remain protected and unchanged.

## Required one-time Firestore rules deployment

From the project folder on Windows PowerShell:

```powershell
npx.cmd firebase-tools deploy --only firestore:rules
```

If Firebase asks you to sign in, follow the login prompt and run the command again.

## Build and sync Android

```powershell
npm.cmd install
npm.cmd run build
npx.cmd cap sync android
npx.cmd cap open android
```
