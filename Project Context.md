OneInChristApp Project Context

Last updated: 2026-09-21

Project

OneInChristApp is an existing mobile app for One in Christ Church. It is not a new project and must be extended carefully without breaking already working modules.

Framework and stack:

Vite

Capacitor 8

Vanilla JavaScript ES Modules

Firebase Authentication

Cloud Firestore

Firebase Storage

Firebase Cloud Functions

Firebase Cloud Messaging / notifications

Android now, iPhone later

VS Code / Android Studio

JDK 21 for Android builds

Main Windows project path:

C:\Users\Jam\Downloads\OneInChristApp

Working Rules

This is an existing app. Do not rebuild it from scratch.

Do not redesign working screens unless specifically requested.

Do not rewrite working modules unnecessarily.

Keep Vanilla JavaScript. Do not introduce React or TypeScript.

Preserve existing data structures and backward compatibility where possible.

Existing saved Choir Plans, Service Plans, members, and notifications must continue to work after updates.

When changing one file, the user prefers the complete file from top to bottom for copy/paste.

When many files change, a complete replacement ZIP is acceptable.

Technical steps should be written in English.

The user often works in PowerShell where npm / npx scripts are blocked, so use npm.cmd and npx.cmd.

Build after meaningful frontend changes:

cd C:\Users\Jam\Downloads\OneInChristApp
npm.cmd run build
npx.cmd cap sync android
npx.cmd cap open android

If dependencies were replaced or node_modules is missing:

npm.cmd install

Firebase deploy commands when relevant:

npx.cmd firebase-tools deploy --only firestore:rules
npx.cmd firebase-tools deploy --only storage

Cloud Functions discovery can time out on this project. Before deploying a function, use:

$env:FUNCTIONS_DISCOVERY_TIMEOUT="60"
npx.cmd firebase-tools deploy --only functions:<functionName>

Example already deployed successfully:

$env:FUNCTIONS_DISCOVERY_TIMEOUT="60"
npx.cmd firebase-tools deploy --only functions:scriptureBibleLookup

Do not upgrade firebase-functions only because Firebase CLI prints the old-version warning unless an upgrade is intentionally planned, because it can introduce breaking changes.

Current Priority

Android/mobile app first.

Do not continue desktop administration work unless the user clearly asks for it.

Core App / Navigation

App runs as Vite + Capacitor.

Firebase is connected.

Android build works with JDK 21.

Main Member Area is permission-based.

Major overlays are mobile-scrollable.

A Close button exists at the top of Member Area.

Android hardware/system Back is intercepted through the Capacitor App plugin.

Back should navigate inside the app instead of immediately exiting.

Nested screens close first, then return to their parent screen.

Examples:

Hymn -> Hymnbook -> Choir -> Member Area.

Bible selector -> Scripture Preparation -> Member Area.

Administration -> Member Area.

At Member Area, Back should not immediately exit the app.

Authentication / Member Access

Normal Member Login

Firebase Authentication is used for normal members.

Sign-up verifies church membership against the church Google Sheet.

Members can be found from the Google Sheet and then wait for admin approval.

Admin can approve, activate/deactivate, and assign permissions.

Guest Login

Guest login is intentionally separate from normal Firebase member login.

Final guest behavior:

Login page has Continue as Guest.

Guest provides no name, phone, email, or password.

Guest session is local app state and does not inherit member/admin permissions.

Guest Member Area has access to Service Plan only.

Guest should see exactly one Service Plan entry/button in Member Area.

Guest Service Plan view shows only the newest/current published Service Plan.

Logout Guest belongs on the Member Login page, not inside Member Area.

Logging Guest out returns to Member Login.

Guest cannot access Choir, Food, Prayer admin, Scripture Preparation, Administration, or other protected modules.

Important implementation note for duplicate Guest buttons:

src/members/memberUI.js uses asynchronous permission loading.

The Member Area list must be cleared after async permission loading, not before, and stale simultaneous renders must not append duplicate buttons.

A render-version/cancellation guard is used so Guest does not get duplicate Service Plan buttons.

Church Administration

Church Administration is available inside the mobile Member Area for authorized admins.

Current tabs include:

Dashboard

Members

Admin

Roles

Notifications

Audit Log

Reports

Close / Android Back must return to Member Area, not exit the app.

Approved Members / Pending Approval Role UI

The old layout with separate visible Member Role, Extra Member Access, and Admin Role controls is being replaced by two compact collapsible sections on each editable member card:

Member Roles

Admin Roles

Behavior:

Both start collapsed.

Tap the heading to open.

Multiple roles can be selected with checkboxes.

Tap heading again to close.

Selections remain selected when closed.

Closed section shows a short summary of selected roles.

One Approve and Save / Save Permissions action saves both member and admin permissions together.

Normal Church Member remains the base member state and is shown checked/disabled.

Current extra Member Roles:

Choir Member

Youth Member

Sunday School Member

Pastor / Scripture Preparation

Language School Member

Base normal member permissions currently include:

Food

Prayer

Service Plan

Current Admin Roles:

Food Admin

Choir Admin

Choir Planning

Youth Admin

Prayer Admin

Sunday School Admin

Scripture Preparation Admin

Service Plan Admin

Daily Devotion Admin

Bible Reading Admin

Language School Admin

Church Admin

Chief Administrator

Primary file:

src/church-admin/churchAdminUI.js

Hymnbook

The app now contains its own local One in Christ Hymnbook instead of depending on Geet Ki Kitab for normal hymn selection.

Bundled hymnbook content:

478 Geet

116 Zaboor

Main hymnbook index

Urdu/Punjabi original text is preserved.

Roman transliteration was extensively cleaned and manually spot-checked.

Built-in hymn pages are protected from admin deletion.

Location:

public/hymnbook/

Hymnbook Index Layout

The mobile index was redesigned for readability.

Each Geet and Zaboor entry uses two separate lines:

Urdu title on first line

RTL

right-aligned

Urdu/Nastaliq font

Roman title on second line

LTR

left-aligned

maximum 7 words in the index only

The full Roman title remains unchanged inside the hymn page, Choir Plan, and Service Plan.

All Geet and Zaboor pages now contain both an Urdu title and Roman title so the app does not have to guess the Urdu title.

Hymnbook in Choir

Choir Admin dashboard includes:

Hymnbook / Add New Geet

The local hymnbook opens inside the app. Choir Admin can browse Geet/Zaboor, open a hymn, and select it for a Choir Plan.

Old external Geet Ki Kitab links remain supported for backward compatibility with old saved plans.

Add New Geet

Authorized Choir/Church roles can add a new Geet from the app.

Flow:

Urdu/Punjabi title

Roman title

one large text box where complete Urdu/Punjabi + Roman lyrics are pasted together

Preview

Save Geet

The app recognizes Urdu/Punjabi-script lines versus Roman lines and renders the new Geet in the same visual style as existing hymn pages.

Admin-added Geet are stored in Firestore collection:

hymnbookGeet

New Geet automatically appear in the hymnbook index.

Admin-added Geet can be:

Edited

Deleted

Original built-in 478 Geet / 116 Zaboor cannot be deleted through the admin editor.

The Add New Geet editor is constrained to the mobile viewport and must not horizontally scroll.

Authorized hymnbook managers include:

Choir Admin

Choir Planning

Church Admin

Choir

Choir module is integrated with the local hymnbook.

Choir Admin dashboard includes:

Hymnbook / Add New Geet

Create Sunday Choir Plan

Review Choir Plan

Service Archive

Create Sunday Choir Plan

The form was simplified.

Removed fields:

Musical Key

Service Role

visible hymn/lyrics-link field

The selected hymn path is still stored internally so View Lyrics works.

Keep:

Urdu hymn title

Roman hymn title

hymn selection from local hymnbook

Holy Spirit Hymn

rehearsal notes

hymn ordering

audio/review workflow

Choir Plan displays Urdu hymn title above Roman title.

Choir Review / Archive

Choir Plan goes to the choir group for review before Service Plan use.

Choir members can send note/audio feedback.

Notifications exist for plan updates and feedback.

Plan can be marked ready for Service Plan after review.

Service archive / cleanup logic exists.

Scripture Preparation

Scripture Preparation keeps the existing general workflow but Bible selection was substantially upgraded.

Bible API Architecture

Do not open external Bible websites for normal Scripture Preparation selection.

Use the existing API.Bible configuration through Firebase Functions.

Cloud Function:

scriptureBibleLookup

Secret:

API_BIBLE_KEY

The API key must remain in Firebase Functions and must not be exposed in the Android app.

The function supports the app workflow for:

books

chapters

verses

passage retrieval

English, Danish, and Urdu Bible IDs are already configured in the backend.

Passage Selection

The preparer may find/select a passage using:

Urdu

Danish

English

The passage is selected once using a language-neutral Bible reference internally, for example:

book ID

chapter

first verse

last verse

The same passage is then available in all three languages.

Scripture Preparation Sections

Opening Reading

Reading 1

Reading 2

Extra References

Extra References:

unlimited practical number

automatically numbered 1, 2, 3, ...

can be added/changed/removed by the preparer

same Urdu / Dansk / English reader

Reader UI

Shared compact reader style:

blue language buttons: Urdu / Dansk / English

active language button visually selected

one normal line of spacing between language buttons, passage heading, and Bible text

heading changes together with active language

Urdu heading/text RTL and right-aligned

Danish/English heading/text LTR and left-aligned

Examples of localized heading behavior:

Urdu: Urdu book name + chapter + verses

Danish: Danish book name + chapter + verses

English: English book name + chapter + verses

Scripture Preparation has a Close button at the top. Close returns to Member Area.

Service Plan Integration / Edit Compatibility

Scripture Preparation is the source for Service Plan readings.

When a Service Plan is created or edited:

Opening Reading, Reading 1, Reading 2 are loaded from the linked Scripture Preparation.

Extra References are also loaded.

Edit mode must restore the linked Scripture Preparation.

If an older plan has no stored extraReferences, Edit mode must fall back to the linked Scripture Preparation's additional references.

This fixed the earlier issue where Extra References appeared in a new Service Plan but not while editing an existing plan.

Service Plan / Church Plan

The existing Service Plan order and general layout must remain unchanged except where explicitly described below.

Multilingual Scripture Reader

The following use the compact multilingual reader:

Opening Reading

Reading 1

Reading 2

Extra References

Language buttons:

Urdu

Dansk

English

Opening Reading, Reading 1, and Reading 2:

collapsed by default

tap a language -> open that language

tap the same language again -> close

tap another language -> switch directly

Extra References:

numbered 1, 2, 3, ...

currently use the same tap-to-open / tap-again-to-close language behavior as the main readings

Hymn Titles in Service Plan

All hymn positions should display both:

Urdu title

Roman title underneath

This applies to Geet and Zaboor.

Older saved plans may contain only Roman titles; local hymnbook data can be used as a fallback where possible.

Apostles' Creed

The Apostles' Creed is a permanent built-in section in every Service Plan.

Fixed position:

Hymn 4 -> Apostles' Creed -> Holy Spirit Hymn

It is not something the Service Plan creator manually adds or removes.

It uses the same compact language-tab behavior as the readings:

Urdu

Dansk

English

Initially collapsed. Tap a language to open; tap same language again to close; tap another language to switch.

Language headings:

Urdu: رسولوں کا عقیدہ

Danish: Den apostolske Trosbekendelse

English: Apostles’ Creed

The Creed text is fixed local app content, not fetched through the Bible API.

Approved Urdu terminology follows the supplied church screenshot, including:

پنطس پیلاطس

پاک کلیہ کلیسیا

The English text is the ELCA wording supplied by the user.

The Danish text is the official Folkekirken Danish Apostles' Creed wording selected for the app.

Food

Food module works for event creation and member registration.

Payment Choice

The church currently uses an ordinary MobilePay Box, not a MobilePay merchant/API integration.

Food registration includes:

Do you want to pay now?

Options:

Yes / Pay Now

No / Pay Later

If Pay Now:

reveal/open the Food Event's MobilePay Box link

If Pay Later:

hide/skip the payment link

Important payment rule:

Opening a MobilePay Box link does not prove payment.

The app must NOT automatically mark the registration paid.

Registrations remain Unpaid until Food Admin manually confirms them.

Food Admin controls include:

Mark as Paid

Mark as Unpaid

Automatic payment confirmation would require a future MobilePay/Vipps merchant API + webhook integration, which the church does not currently have.

Notifications

Push notifications work.

Existing notification areas include:

Church notifications

Prayer

Sunday School

Danish Language

Daily Devotion

Bible Reading

Choir

Scripture Preparation communication

Notification routing should preserve the intended audience for each module.

Daily Devotion

Daily Devotion works.

Admin can generate, review, edit, approve/publish, and delete.

Uses OpenAI through Firebase Functions.

Uses API.Bible where exact Bible text is required.

Supports English, Danish, and Urdu.

Urdu reference/title RTL problems were corrected.

Urdu AI wording should use respectful church language.

Member morning notification / admin reminder behavior exists.

AI Bible Reading

AI Bible Reading works.

Generates a short daily Bible reading with reflection/thinking questions.

Admin review/publish flow exists.

Avoids recently reused passages according to existing rules.

Uses respectful Urdu language.

Prayer

Prayer module works.

Prayer requests, meetings, announcements, resources exist.

Prayer meeting attendance shows count and names of members who chose I'm Coming.

Notifications work.

Youth

Youth module exists and works.

Dashboard, Events, Announcements, Admin.

Youth event responses work.

Announcement Read More was fixed.

Sunday School

Sunday School module exists and works.

Admin/member views work.

Gallery supports event media with up to 20 pictures or one video.

Text + optional voice communication exists.

Notifications exist for communication.

Danish Language Course

Separate from normal church membership because students may be non-members.

Student profile is intentionally simple:

Name

Telephone

Email

Materials support PDFs/images through Firebase Storage.

Text + optional voice communication exists.

Notifications route to Materials.

Desktop Administration

Desktop admin route exists at:

http://127.0.0.1:5173/?admin=desktop

Desktop work is secondary. Do not expand it until mobile is stable unless specifically requested.

The desktop debug box should not be removed unless requested.

Firebase / Security Notes

Firestore rules include special access for:

normal signed-in members

admins by module

hymnbookGeet

Guest read access to published/current Service Plans

Food Admin payment-status updates

Guest rules must not expose unrelated member/admin data.

hymnbookGeet:

signed-in members can read

Choir Planning / Choir Admin / Church Admin can create/update/delete according to current rules

When Firestore rules change, deploy once with:

npx.cmd firebase-tools deploy --only firestore:rules

Important Troubleshooting Notes

PowerShell npm/npx script policy

Use:

npm.cmd

npx.cmd

instead of bare npm / npx when PowerShell blocks .ps1 scripts.

Android project path

Current Android project should be opened from:

C:\Users\Jam\Downloads\OneInChristApp\android

Do not reopen old extracted project paths such as older OneInChristApp_Hymnbook_Integrated folders.

Capacitor Firebase Functions plugin

A previous Android Studio Gradle failure occurred because this directory was missing:

node_modules\@capacitor-firebase\functions\android

If that happens again:

Close Android Studio.

Reinstall dependencies / plugin.

Confirm the Android plugin directory exists.

Run npx.cmd cap sync android again.

Fresh project ZIPs should preferably avoid carrying broken old node_modules; run npm.cmd install after extraction.

Important User Preferences

User prefers complete file contents from top to bottom when a single source file must be replaced.

Avoid telling the user to find and replace many small fragments in a large file when a full-file replacement is practical.

For many-file changes, a full app ZIP is acceptable.

Do not unnecessarily create a ZIP for a one-file fix.

Keep technical instructions in English.

Do not use Hindi.

Preserve Urdu/Punjabi source lyrics exactly; do not guess unreadable words.

For Roman transliteration cleanup, do not invent text where the source is unclear.

Recently Important Files

Core/member/navigation:

src/members/memberUI.js

src/members/memberNavigation.js

src/appShell.js

Church Administration:

src/church-admin/churchAdminUI.js

src/church-admin/churchAdminService.js

src/church-admin/churchAdminRoles.js

Hymnbook / Choir:

src/shared/hymnbookBrowser.js

public/hymnbook/index.html

public/hymnbook/Songs/*

public/hymnbook/zaboor/*

src/choir/choirUI.js

src/choir/choirPlanEditor.js

src/choir/choirPlanList.js

src/choir/choirStore.js

Scripture:

functions/scriptureBible.js

functions/index.js

src/shared/scriptureBibleApi.js

src/shared/scripturePassage.js

src/scripture-preparation/scripturePreparationEditor.js

src/scripture-preparation/scripturePreparationReferences.js

src/scripture-preparation/scripturePreparationStore.js

src/scripture-preparation/scripturePreparationUI.js

Service Plan:

src/service-plan/servicePlanShell.js

src/service-plan/servicePlanEditor.js

src/service-plan/servicePlanUI.js

Food:

src/food/*

Security:

firestore.rules

storage.rules

Current Mobile Testing Status

Known working / recently tested:

Normal member login

Guest login

Guest logout placement on Member Login

Guest Service Plan-only access

Local hymnbook browsing

Geet/Zaboor opening

Hymn selection into Choir Plan

Add/Edit/Delete admin-added Geet

Choir Plan -> Service Plan integration

Scripture Preparation multilingual API selector

Opening Reading / Reading 1 / Reading 2 language tabs

Extra References and Service Plan Edit fallback

Apostles' Creed multilingual section

Urdu + Roman hymn title display

Android internal Back navigation in major flows

Food Pay Now / Pay Later UI with manual payment confirmation

Latest active UI work:

Approved Members / Pending Approval page role controls were redesigned into two collapsible sections: Member Roles and Admin Roles.

The final complete src/church-admin/churchAdminUI.js should be treated as the current role-management UI implementation.

Next Suggested Work

Continue testing the new Approved Members role dropdown UI on Android.

Verify selecting/saving multiple Member Roles and Admin Roles persists correctly after reload.

Verify Administration Android Back returns to Member Area.

Continue normal regression testing of Guest and Service Plan after admin changes.

Later complete iOS setup on a Mac and TestFlight testing.

App icon/logo change is still pending and was intentionally postponed.
---

# Final Clean Release Validation — 2026-09-22

The current working test version was cleaned without redesigning or removing active features.

Final desktop administration includes the current shared workflows for:

- Daily Devotion
- Bible Reading
- Scripture Preparation
- Choir
- Service Plan
- Local Hymnbook

The Apostles' Creed Urdu view now uses the same existing `urdu-text` / Jameel Noori Nastaliq styling as the rest of the app.

Cleanup removed only superseded or proven-unused material, including old `START_HERE` files, the nested old backup ZIP, temporary source files, five source modules no longer reachable from `src/main.js`, duplicate TYPO3 `.txt` copies whose `.html` counterparts are identical, unused starter assets, Android IDE/build caches, and default Android sample tests.

Validation performed on the final cleaned source:

- 135 JavaScript/module files syntax-checked: 0 failures
- 281 relative imports checked: 0 missing
- all 130 production `src/*.js` modules reachable from `src/main.js`
- 1,301 local public HTML references checked: 0 missing
- root Vite entry references: 0 missing
- CSS local asset references: 0 missing
- 593 hymnbook song links checked: 0 missing
- Member-menu regression tests: pass
- Sunday School message/conversation regression tests: pass
- installed top-level package tree: consistent
- 10 Android Capacitor plugin directories checked: 0 missing
- current `dist` and Android web assets: 608/608 files identical
- `google-services.json` and Gradle wrapper are present

The final package keeps the current tested `dist`, Android web assets, project source, Firebase configuration/rules/functions, local hymnbook, and installed Windows dependencies so it remains practical to continue on the existing Windows development machine.

---

# Final Notification Corrections — 2026-09-22

- Food Admin creating a Food Event now also creates a church notification routed to the Food section.
- Editing/saving an existing Food Event now creates a `Food Event Updated` notification so members are told that details changed.
- Firestore rules now explicitly permit Food Admin to create only Food notifications (`section: food`, `category: food`).
- The Create Notification form no longer asks for a separate Category. Category is derived automatically from the selected `Open section when tapped` destination.
- `Language School` was added to the notification destination list and routes through the existing Danish Language module (`danish-language`, category `danishLanguage`).
- Desktop notification creation uses the same automatic category mapping and displays the destination as `Language School`.
- Scripture Preparation deletion behavior was not changed in this correction set.


---

# Notification Categories + 7-Day Retention — 2026-09-22

- Church Notifications now shows the last 7 days instead of today's notifications only.
- Notifications are grouped into collapsible category boxes: Food, Daily Bible Reading, Daily Devotion, Choir, Prayer, Youth, Sunday School, Language School, Scripture Preparation, Service Plan, Board, General Church, and Other.
- Each category heading shows the number of notifications currently stored in that category; newest notifications remain first inside each category.
- A scheduled Firebase function `cleanupExpiredChurchNotifications` runs daily at 03:15 Europe/Copenhagen and removes church notifications older than 7 days. This requires Functions deployment after installing this version.
- New notifications without a separate manual Category continue to derive their category from the destination section.
- The manual Create Notification destination list also includes Daily Devotion and Daily Bible Reading.
- Food registration now clearly explains why `Yes, Pay Now` is disabled when a Food Event has no MobilePay payment link.
- Food Admin now sees an explanation beside the MobilePay link field that the link is required to enable `Yes, Pay Now` for members.

## LIVE SERMON TRANSLATION - OPTION 1 (LIVE TEXT)
- Added to Service Plan directly inside the Sermon section.
- Spoken sermon language is selected by the admin: Danish, English, or Urdu.
- The other two languages are produced as live written translations.
- First test input is the Samsung Galaxy S22 Ultra microphone.
- Later input can be changed to a direct feed from the church mixer without changing the member-side workflow.
- Service Plan Admin or Church Admin can start/stop a live translation session.
- Signed-in members can open the Live Translation button and select either translated language.
- Urdu translation uses the existing `.urdu-text` app font styling.
- Azure Speech credentials are kept in Firebase secrets (`AZURE_SPEECH_KEY`, `AZURE_SPEECH_REGION`).
- App receives only a short-lived Azure Speech authorization token from callable function `liveSermonSpeechToken`.
- Live session state and translated text are distributed through Firestore collection `liveSermonSessions` and its `segments` subcollection.
- Raw sermon audio is not written to Firebase by this feature.
- Android already includes RECORD_AUDIO and INTERNET permissions.
- Azure Speech browser SDK is loaded on demand only when an admin starts Live Translation.
