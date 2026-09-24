import {
  FirebaseFunctions
} from '@capacitor-firebase/functions'


export async function detectChoirHymnTitle(
  storagePath
) {

  if (!storagePath) {

    return ''
  }


  const result =
    await FirebaseFunctions.callByName({

      name:
        'readChoirLyricsTitle',

      region:
        'europe-west1',

      data: {
        storagePath
      }
    })


  return String(
    result?.data?.title ||
    ''
  ).trim()
}