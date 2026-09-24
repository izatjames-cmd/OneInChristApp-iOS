# Version 9 — Hymnbook Editor

Version 9 is based on the working Version 8 project and adds safe editing for the One in Christ local hymnbook.

## What was added

- Admin Edit button for built-in Geet and Zaboor pages.
- Existing admin-added Geet remain editable.
- One large combined editor for the complete hymn: Urdu/Punjabi and Roman text stay together.
- Preview renders the final hymnbook layout before saving.
- Urdu/Punjabi is rendered RTL with the hymnbook Nastaliq styling; Roman remains LTR.
- Cancel discards the temporary draft. If the draft changed, the admin must confirm before discarding it.
- Built-in HTML files are never overwritten. Corrections are stored in Firestore and layered over the original hymn when opened.
- Revision History stores previous saved versions and can restore an earlier version.
- Built-in hymns can be restored to the original bundled version.
- Admin hymnbook search supports song/Zaboor title, number, and filename text while preserving the existing hymnbook dropdown/index structure.
- Desktop Administration opens the same editor with admin controls enabled.

## Firestore collections

- `hymnbookGeet` — existing admin-added Geet.
- `hymnbookEdits` — corrections to built-in Geet and Zaboor.
- `hymnbookRevisions` — previous versions for restoration.

## Important behavior

The bundled hymnbook remains the permanent fallback. A built-in correction is stored separately in Firestore. If there is no correction, the original bundled HTML is displayed. This means Cancel cannot damage a saved hymn and an admin correction does not rewrite the APK asset.

## Deployment

Version 9 adds Firestore rules for `hymnbookEdits` and `hymnbookRevisions`, so deploy Firestore rules before testing editing on mobile or desktop administration.
