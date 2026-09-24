import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'

import {
  notifyChoirFeedbackSubmitted
} from './choirNotifications.js'


function blobToDataUrl(
  audioBlob
) {

  return new Promise(
    (
      resolve,
      reject
    ) => {

      const reader =
        new FileReader()

      reader.addEventListener(
        'load',
        () => resolve(
          reader.result
        )
      )

      reader.addEventListener(
        'error',
        () => reject(
          reader.error
        )
      )

      reader.readAsDataURL(
        audioBlob
      )
    }
  )
}


export async function createChoirPlanFeedback({
  planId,
  uid,
  name,
  note,
  audioBlob
}) {

  if (!planId || !uid) {
    throw new Error(
      'Please sign in again.'
    )
  }


  let audioMessageUrl =
    ''


  if (audioBlob) {

    const maximumSize =
      700 *
      1024

    if (audioBlob.size > maximumSize) {
      throw new Error(
        'The audio reply is too long. Please record a shorter message.'
      )
    }


    audioMessageUrl =
      await blobToDataUrl(
        audioBlob
      )
  }


  const documentId =
    `CHOIR_FEEDBACK_${Date.now()}_${uid}`


  await FirebaseFirestore.setDocument({
    reference:
      `choirPlanFeedback/${documentId}`,

    data: {
      planId,
      uid,
      name:
        name || '',
      note:
        note || '',
      audioMessageUrl,
      createdAt:
        new Date()
          .toISOString()
    },

    merge:
      false
  })


  await notifyChoirFeedbackSubmitted({
    uid,
    planId,
    name
  })
}
