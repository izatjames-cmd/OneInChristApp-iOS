# OneInChristApp iOS Push Preparation v4

This update prepares the existing notification system for Firebase Cloud Messaging on both Android and iOS without changing the notification screens or routing.

## Code changes

- Replaces `@capacitor/push-notifications` with `@capacitor-firebase/messaging`.
- Android continues to use Firebase Cloud Messaging.
- iOS now requests and stores an FCM token instead of storing a raw APNs token.
- Android and iOS tokens can coexist in the same `deviceTokens/{uid}` document:
  - legacy `token` remains for Android backward compatibility
  - `androidToken`
  - `iosToken`
- Cloud Functions collect and de-duplicate all available tokens for each member.
- iOS foreground notifications use Firebase Messaging presentation options.
- Android foreground notifications keep the existing local-notification behavior.
- The Codemagic-generated iOS `AppDelegate.swift` is patched automatically for Firebase Messaging.
- No Firestore rule change is required because the existing `deviceTokens/{uid}` document is retained.

## Still required before real iPhone push notifications can work

1. An Apple Developer account capable of using Push Notifications.
2. Enable Push Notifications for bundle ID `org.oneinchristchurch.app`.
3. Create an APNs authentication key (`.p8`) in Apple Developer.
4. Upload that APNs key in Firebase Console > Project settings > Cloud Messaging > Apple app configuration.
5. Build/sign a real-device or TestFlight version with the Push Notifications capability.
6. Test on a physical iPhone.

Do not use Appetize as the final push-notification test.
