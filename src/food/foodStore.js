import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'


function snapshotsToEvents(result) {
  if (!result.snapshots) {
    return []
  }

  return result.snapshots.map(
    snapshot => ({
      id: snapshot.id,
      ...snapshot.data
    })
  )
}


export async function getActiveFoodEvents() {

  const result =
    await FirebaseFirestore.getCollection({
      reference: 'foodEvents',

      compositeFilter: {
        type: 'and',

        queryConstraints: [
          {
            type: 'where',
            fieldPath: 'active',
            opStr: '==',
            value: true
          }
        ]
      }
    })

  return snapshotsToEvents(result)
}


export async function getAllFoodEvents() {

  const result =
    await FirebaseFirestore.getCollection({
      reference: 'foodEvents'
    })

  return snapshotsToEvents(result)
}


export async function updateFoodEvent(
  eventId,
  data
) {

  await FirebaseFirestore.updateDocument({
    reference:
      `foodEvents/${eventId}`,

    data: {
      title: data.title,
      date: data.date,
      time: data.time,
      price: Number(data.price),
      deadline: data.deadline,
      info: data.info,
      mobilePayLink: data.mobilePayLink || '',
      voiceMessageUrl: data.voiceMessageUrl || '',
      voiceMessagePath: data.voiceMessagePath || '',
      active: data.active
    }
  })
}


export async function createFoodEvent(data) {

  const documentId =
    `FOOD_${Date.now()}`

  await FirebaseFirestore.setDocument({
    reference:
      `foodEvents/${documentId}`,

    data: {
      title: data.title,
      date: data.date,
      time: data.time,
      price: Number(data.price),
      deadline: data.deadline,
      info: data.info,
      mobilePayLink: data.mobilePayLink || '',
      voiceMessageUrl: data.voiceMessageUrl || '',
      voiceMessagePath: data.voiceMessagePath || '',
      active: data.active
    },

    merge: false
  })

  return documentId
}


export async function deleteFoodEvent(
  eventId
) {

  await FirebaseFirestore.deleteDocument({
    reference:
      `foodEvents/${eventId}`
  })
}
