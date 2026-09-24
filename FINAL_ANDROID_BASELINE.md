# OneInChristApp — Final Android Baseline (Version 14)

This archive is the cleaned Android project baseline after the tested Hymnbook Editor release, the Bible Reading six-month no-repeat correction, the Christian Urdu terminology guardrails, the Live Sermon transcript reading-order correction, and the context-aware Urdu sermon grammar correction.

## Preserved
- Complete application source under `src/`
- Firebase Functions and rules
- Public hymnbook and app assets
- Android native project source
- Capacitor/Firebase configuration
- Package manifests and lockfiles
- Hymnbook editor, Live Sermon Translation, shared church vocabulary, sermon vocabulary learning, Daily Devotion, Bible Reading, notifications, administration, and other working app features
- iOS setup notes for the next development phase

## Version 11 Bible Reading correction
- Bible Reading passage repeat lock increased to six calendar months
- Expanded Old Testament and New Testament passage pools
- Server-side passage reservation prevents immediate reuse
- Older Firestore Timestamp history is handled correctly
- Rejected Bible Reading drafts disappear from the normal admin screen but remain stored to protect against reselection


## Version 12 Christian Urdu terminology correction
- Shared church vocabulary remains the single terminology source for Live Sermon Translation, Daily Devotion, and Bible Reading generated content
- Urdu generated/translated text now normalizes Islamic-style wording around Jesus to established Christian Urdu terminology
- Examples include حضرت عیسیٰ / عیسیٰ -> یسوع / یسوع مسیح and حضور یسوع -> خداوند یسوع
- Islamic honorific علیہ السلام is removed from generated Christian content
- Core Christian terminology is re-applied after learned vocabulary as a final protection
- Daily Devotion and Bible Reading generation prompts explicitly require Christian Urdu terminology
- Scripture Preparation and all Bible-source verse text remain untouched


## Version 13 Live Sermon transcript reading-order correction
- Live translated sermon text is now shown in normal reading order from oldest to newest
- The newest translated sentence appears at the bottom and remains bold
- When a new sentence arrives, the previous sentence moves upward and becomes normal text
- The transcript automatically follows the newest line by scrolling downward inside the transcript panel
- The transcript panel uses a bounded mobile-friendly height so older lines move upward instead of pushing the page downward
- No Firebase Functions or Firestore rules deployment is required for this Version 13 UI-only change


## Version 14 context-aware Live Sermon grammar
- Live Sermon Translation keeps a short five-sentence context window for Urdu speech
- Urdu respectful plural forms no longer automatically force English/Danish plural pronouns when the remembered subject is singular
- Context-aware corrections cover He/Him/His, She/Her/Hers, They/Them/Their and Danish equivalents
- English subject-verb agreement is corrected after a number change where the context rule changes the pronoun
- Pronoun roles are handled conservatively so a different object in the same sentence is not rewritten from the remembered subject
- When multiple antecedents are plausible, the app does not guess and leaves Azure's original translation unchanged
- The context engine is split into small modules under `src/live-sermon/context/`
- No Firebase deployment is required for Version 14

## Removed because they are reproducible or machine-specific
- `node_modules/`
- `dist/`
- generated Android copied web assets
- generated Capacitor Android asset/config files
- Android `local.properties`
- Android build/cache directories
- temporary/log/backup files

## Restore/build on Windows
From the project folder:

```powershell
npm.cmd install
npm.cmd run build
npx.cmd cap sync android
npx.cmd cap open android
```

## Required Firebase deployment for Version 12

```powershell
$env:FUNCTIONS_DISCOVERY_TIMEOUT="60"
npx.cmd firebase-tools deploy --only functions:generateDailyDevotion
npx.cmd firebase-tools deploy --only functions:generateAiBibleReading
npx.cmd firebase-tools deploy --only functions:scheduleAiBibleReading
```

No Firestore rules deployment is required for the Version 12 terminology change.
