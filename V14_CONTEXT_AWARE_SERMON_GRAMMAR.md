# Version 14 — Context-Aware Live Sermon Grammar

This release keeps Version 13 as the base and improves Urdu live-sermon translation when Urdu pronouns depend on earlier sentences.

## What changed
- Added a small modular context system under `src/live-sermon/context/`.
- Keeps the last five completed sermon sentences as short-term context.
- Tracks a recent clear subject such as Jesus Christ, God, the Holy Spirit, Mary, a biblical person, or an explicitly plural group.
- Understands Urdu respectful/honorific plural grammar so a single respected person such as Jesus is not automatically translated as `they`.
- Corrects English pronoun number and case when context is clear:
  - He / Him / His
  - She / Her / Hers
  - They / Them / Their
- Corrects Danish equivalents when context is clear:
  - han / ham / hans
  - hun / hende / hendes
  - de / dem / deres
- Adds basic English subject-verb agreement after a pronoun correction, for example `They love` -> `He loves` and `He has` -> `They have`.
- Uses source-pronoun roles so a sentence such as `He gives them salvation` does not incorrectly turn the object `them` into `Him` merely because the remembered subject is Jesus.
- Stops making automatic corrections when a previous sentence contains more than one plausible antecedent. In ambiguous cases Azure's original translation is preserved rather than guessing.
- Context resets whenever a new live-sermon session starts or stops.

## Existing systems preserved
- Shared Christian vocabulary and learned vocabulary
- Christian Urdu terminology protection
- Live transcript oldest-to-newest reading order with newest line bold at the bottom
- Daily Devotion
- Bible Reading six-month passage lock
- Hymnbook Editor
- Firestore/Firebase Functions behavior

## Deployment
This is an app-side translation post-processing improvement only. No Firebase Functions or Firestore rules deployment is required.

On Windows:

```powershell
npm.cmd install
npm.cmd run build
npx.cmd cap sync android
npx.cmd cap open android
```
