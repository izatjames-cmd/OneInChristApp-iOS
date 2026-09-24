import {
  FirebaseFunctions
} from '@capacitor-firebase/functions'


export async function verifyMemberFromSheet({
  email,
  phone = ''
}) {

  const result =
    await FirebaseFunctions.callByName({
      name:
        'verifyMemberFromSheet',

      region:
        'europe-west1',

      data: {
        email,
        phone
      }
    })


  return result?.data || {}
}
