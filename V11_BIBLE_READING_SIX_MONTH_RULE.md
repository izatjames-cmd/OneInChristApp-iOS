# Version 11 — Bible Reading Six-Month No-Repeat Rule

## Changes

- Bible Reading now blocks a selected passage for six calendar months.
- The selection pool has been expanded to more than 160 Old Testament passages and more than 160 New Testament passages so the six-month rule can work with daily alternating readings.
- Passage selection is randomized among currently eligible passages.
- Each selected Bible Reading passage is reserved server-side in `aiBibleReadingPassageUsage` so concurrent/manual generation cannot immediately select the same passage again.
- Existing Daily Devotion and Bible Reading history from the previous six months is also checked before selection.
- Firestore Timestamp dates and ISO date strings are both handled when reading passage history.
- The history query now checks up to 500 recent records instead of 120.
- Rejected Bible Reading drafts remain stored for passage-history protection, but they are hidden from the normal Bible Reading Admin screen after rejection.

## Rejection behavior

When an admin presses **Reject**, the draft is marked `rejected`, unpublished, and disappears from the normal admin list after refresh. It remains in Firestore so that the rejected passage is not immediately selected again.

## Deployment

Because Firebase Function code changed, redeploy:

```powershell
$env:FUNCTIONS_DISCOVERY_TIMEOUT="60"
npx.cmd firebase-tools deploy --only functions:generateAiBibleReading,functions:scheduleAiBibleReading
```

Then rebuild/sync the Android app because the client-side admin list also changed:

```powershell
npm.cmd run build
npx.cmd cap sync android
npx.cmd cap open android
```

No Firestore rule deployment is required for this change. The new `aiBibleReadingPassageUsage` collection is server-side only.
