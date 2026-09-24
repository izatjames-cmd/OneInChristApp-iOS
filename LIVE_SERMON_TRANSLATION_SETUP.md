# Live Sermon Translation - First Setup

This version adds live written sermon translation to the Sermon area of the Service Plan.

## Languages

The preacher can speak one of these three languages:

- Danish
- English
- Urdu

The app automatically translates into the other two languages.

## How the first test works

1. A Service Plan Admin or Church Admin opens the published Service Plan.
2. Under **Sermon**, tap **Live Translation - Not Started**.
3. Select the language the preacher is speaking.
4. Tap **Start Live Translation**.
5. The Samsung S22 Ultra microphone is used for the first test.
6. Azure Speech performs the speech recognition and translation.
7. Only translated text is written to Firebase. Raw sermon audio is not stored in Firebase by this feature.
8. Signed-in church members open the same Live Translation button and choose either of the two translated languages.

Later, the Samsung phone can receive its audio from the church sound mixer instead of using the built-in microphone.

## One-time Azure setup

Create an Azure Speech resource in the Azure portal. Keep these two values from the resource:

- Speech key
- Azure region, for example `northeurope` or whichever region the Speech resource actually uses

Do not put the Azure Speech key inside the mobile app.

## Save the Azure values securely in Firebase

Open PowerShell in the OneInChristApp folder and run:

```powershell
npx.cmd firebase-tools functions:secrets:set AZURE_SPEECH_KEY
```

When Firebase asks for the value, paste the Azure Speech key.

Then run:

```powershell
npx.cmd firebase-tools functions:secrets:set AZURE_SPEECH_REGION
```

When Firebase asks for the value, enter the exact Azure Speech resource region, such as `northeurope` only if that is the region shown by Azure.

## Deploy the backend

If the `functions` dependencies have not already been installed on this computer, run:

```powershell
npm.cmd --prefix functions install
```

Then run:

```powershell
$env:FUNCTIONS_DISCOVERY_TIMEOUT="60"
npx.cmd firebase-tools deploy --only functions:liveSermonSpeechToken
npx.cmd firebase-tools deploy --only firestore:rules
```

## Build and install the updated Android app

Run:

```powershell
npm.cmd run build
npx.cmd cap sync android
npx.cmd cap open android
```

Connect the Samsung S22 Ultra and press **Run** in Android Studio.

## Test

For the first test, keep the Samsung S22 Ultra in the foreground with internet access. The app requests microphone permission when Live Translation starts.

Use another signed-in member phone to open the same Service Plan and confirm that translated text appears live.

## Important

Live translation is machine-generated and can contain mistakes. For church use, the translated text is shown with a notice that it is automatic translation.
