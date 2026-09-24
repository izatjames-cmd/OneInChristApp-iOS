import { FirebaseFirestore } from '@capacitor-firebase/firestore'

export async function getFoodRegistrations(eventId) {
  const result = await FirebaseFirestore.getCollection({
    reference: 'foodRegistrations',

    compositeFilter: {
      type: 'and',
      queryConstraints: [
        {
          type: 'where',
          fieldPath: 'eventId',
          opStr: '==',
          value: eventId
        }
      ]
    }
  })

  if (!result.snapshots) {
    return []
  }

  return result.snapshots.map((snapshot) => ({
    id: snapshot.id,
    ...snapshot.data
  }))
}


export async function createFoodRegistration({
  eventId,
  uid,
  perid,
  name,
  quantity = 1,
  paymentChoice = 'pay_later'
}) {
  const documentId =
    `${eventId}_${uid}`

  await FirebaseFirestore.setDocument({
    reference:
      `foodRegistrations/${documentId}`,

    data: {
      eventId,
      uid,
      perid,
      name,
      quantity,
      paymentChoice,
      paid: false
    },

    merge: false
  })

  return documentId
}


export async function updateFoodRegistrationQuantity({
  eventId,
  uid,
  quantity,
  paymentChoice
}) {
  const documentId =
    `${eventId}_${uid}`

  await FirebaseFirestore.updateDocument({
    reference:
      `foodRegistrations/${documentId}`,

    data: {
      quantity,
      ...(paymentChoice
        ? { paymentChoice }
        : {})
    }
  })
}


export async function deleteFoodRegistration({
  eventId,
  uid
}) {
  const documentId =
    `${eventId}_${uid}`

  await FirebaseFirestore.deleteDocument({
    reference:
      `foodRegistrations/${documentId}`
  })
}

export async function updateFoodRegistrationPaid({
  registrationId,
  paid
}) {

  await FirebaseFirestore.updateDocument({
    reference:
      `foodRegistrations/${registrationId}`,

    data: {
      paid: paid === true
    }
  })
}
