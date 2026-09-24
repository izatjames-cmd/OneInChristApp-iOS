import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'


export async function getAdminAccess(uid) {

  if (!uid) {
    return null
  }

  try {

    const result =
      await FirebaseFirestore.getDocument({
        reference:
          `adminAccess/${uid}`
      })

    if (!result?.snapshot?.data) {
      return null
    }

    return {
      id: result.snapshot.id,
      ...result.snapshot.data
    }

  } catch (error) {

    console.error(
      'Unable to read admin access:',
      error
    )

    return null
  }
}