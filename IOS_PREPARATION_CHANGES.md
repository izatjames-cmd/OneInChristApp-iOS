# OneInChristApp iOS Preparation

Prepared from the latest uploaded Android project. The original baseline was not modified.

## Changes made

- Added `@capacitor/ios` version `8.5.0` to `package.json` and `package-lock.json`.
- Added Capacitor 8 Swift Package Manager symlink options for the existing Capacitor Firebase plugins:
  - Authentication
  - Firestore
  - Functions
  - Storage
- Device push-token storage now records the platform supplied by Capacitor (`android` or `ios`) instead of always saving `android`.
- Android notification channel creation is now guarded so it only executes on Android.
- Added a regression test confirming iOS device tokens preserve `platform: ios`.

## Intentionally not done yet

- No `ios/` folder has been generated yet. This should be generated in the macOS/Codemagic stage.
- No `GoogleService-Info.plist` has been added yet.
- No Apple signing, APNs, capabilities, or TestFlight configuration has been added yet.
- No multi-device push-token migration has been performed yet. The current one-token-per-user Firestore structure remains unchanged for compatibility.
- No Android native files were modified.

## Validation

- JavaScript syntax checks pass for the modified notification modules.
- All existing Node tests pass when the repository's VM-module tests are run with `NODE_OPTIONS=--experimental-vm-modules`.
- The production Vite build could not be regenerated in the Linux inspection environment because the uploaded ZIP contains Windows-installed `node_modules` native bindings. Reinstall dependencies on Windows/macOS/Codemagic before building.

## Next Windows check

From PowerShell in the project folder:

```powershell
npm.cmd install
$env:NODE_OPTIONS="--experimental-vm-modules"
node --test tests/*.test.mjs
npm.cmd run build
npx.cmd cap sync android
```

Confirm Android still builds/opens normally before the Codemagic iOS stage.
