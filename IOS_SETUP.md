# iOS Setup and Test Handoff

Android behavior is frozen. iOS setup must be completed on macOS with Xcode.

## On a Mac

```bash
cd ~/Downloads/OneInChristApp
npm install
npm run build
npx cap add ios
npx cap sync ios
npx cap open ios
```

## Xcode permissions to verify

- Microphone usage description for voice messages.
- Camera/photo-library access if a plugin requests it for gallery uploads.
- Push Notifications capability and Background Modes for remote notifications.
- Firebase `GoogleService-Info.plist` added to the iOS app target.
- Bundle identifier: `org.oneinchristchurch.app`.

## TestFlight checklist

- Sign in and member approval.
- Daily Devotion and Bible Reading.
- Prayer attendance.
- Sunday School gallery and voice communication.
- Danish Language voice communication.
- Push notification tap routing.
- Urdu font rendering.

The iOS platform folder is intentionally not generated on Windows; Capacitor requires Xcode/macOS to create, sign, and run it.
