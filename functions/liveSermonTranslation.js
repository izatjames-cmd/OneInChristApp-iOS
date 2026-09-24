const {
  onCall,
  HttpsError
} = require(
  'firebase-functions/v2/https'
)

const {
  defineSecret
} = require(
  'firebase-functions/params'
)

const {
  getFirestore
} = require(
  'firebase-admin/firestore'
)


const azureSpeechKey =
  defineSecret(
    'AZURE_SPEECH_KEY'
  )

const azureSpeechRegion =
  defineSecret(
    'AZURE_SPEECH_REGION'
  )


exports.liveSermonSpeechToken =
  onCall(
    {
      region:
        'europe-west1',

      secrets: [
        azureSpeechKey,
        azureSpeechRegion
      ]
    },

    async request => {

      const uid =
        request.auth?.uid


      if (!uid) {

        throw new HttpsError(
          'unauthenticated',
          'Please sign in first.'
        )
      }


      await requireLiveTranslationAdmin(
        uid
      )


      const key =
        String(
          azureSpeechKey.value() ||
          ''
        ).trim()

      const region =
        String(
          azureSpeechRegion.value() ||
          ''
        )
          .trim()
          .toLowerCase()


      if (
        !key ||
        !region
      ) {

        throw new HttpsError(
          'failed-precondition',
          'Azure Speech is not configured. Set AZURE_SPEECH_KEY and AZURE_SPEECH_REGION.'
        )
      }


      if (
        !/^[a-z0-9-]+$/.test(
          region
        )
      ) {

        throw new HttpsError(
          'failed-precondition',
          'AZURE_SPEECH_REGION contains an invalid value.'
        )
      }


      const tokenUrl =
        `https://${region}.api.cognitive.microsoft.com/sts/v1.0/issueToken`


      let response


      try {

        response =
          await fetch(
            tokenUrl,
            {
              method:
                'POST',

              headers: {
                'Ocp-Apim-Subscription-Key':
                  key,
                'Content-Type':
                  'application/x-www-form-urlencoded'
              }
            }
          )

      } catch (error) {

        console.error(
          'Unable to contact Azure Speech token service:',
          error
        )

        throw new HttpsError(
          'unavailable',
          'Unable to contact Azure Speech.'
        )
      }


      if (!response.ok) {

        const details =
          await response
            .text()
            .catch(
              () =>
                ''
            )


        console.error(
          'Azure Speech token request failed:',
          response.status,
          details
        )


        throw new HttpsError(
          'failed-precondition',
          'Azure Speech rejected the configured key or region.'
        )
      }


      const token =
        String(
          await response.text()
        ).trim()


      if (!token) {

        throw new HttpsError(
          'internal',
          'Azure Speech returned an empty authorization token.'
        )
      }


      return {
        token,
        region,
        expiresInSeconds:
          540
      }
    }
  )


async function requireLiveTranslationAdmin(
  uid
) {

  const db =
    getFirestore()


  const snapshot =
    await db
      .collection(
        'adminAccess'
      )
      .doc(
        uid
      )
      .get()


  const access =
    snapshot.exists
      ? snapshot.data() || {}
      : {}


  if (
    access.planAdmin ===
      true ||
    access.churchAdmin ===
      true
  ) {
    return
  }


  throw new HttpsError(
    'permission-denied',
    'Service Plan Admin or Church Admin access is required to start Live Translation.'
  )
}
