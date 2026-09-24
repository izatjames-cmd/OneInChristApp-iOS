import {
  FirebaseFunctions
} from '@capacitor-firebase/functions'


export async function getLiveSermonSpeechToken() {

  const result =
    await FirebaseFunctions.callByName({
      name:
        'liveSermonSpeechToken',

      region:
        'europe-west1',

      data: {}
    })


  const data =
    result?.data || {}


  if (
    !data.token ||
    !data.region
  ) {

    throw new Error(
      'Live translation is not configured yet.'
    )
  }


  return data
}
