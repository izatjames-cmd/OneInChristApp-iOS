import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'


const COLLECTION =
  'servicePlans'


export async function createServicePlan(
  plan
) {

  const result =
    await FirebaseFirestore.addDocument({
      reference:
        COLLECTION,

      data: {
        ...plan,

        createdAt:
          new Date()
            .toISOString(),

        updatedAt:
          new Date()
            .toISOString()
      }
    })


  return (
    result?.reference?.id ||
    result?.id ||
    ''
  )
}


export async function updateServicePlan(
  planId,
  plan
) {

  await FirebaseFirestore.updateDocument({
    reference:
      `${COLLECTION}/${planId}`,

    data: {
      ...plan,

      updatedAt:
        new Date()
          .toISOString()
    }
  })
}


export async function updateServicePlanStatus(
  planId,
  data
) {

  await FirebaseFirestore.updateDocument({
    reference:
      `${COLLECTION}/${planId}`,

    data: {
      ...data,

      updatedAt:
        new Date()
          .toISOString()
    }
  })
}


export async function deleteServicePlan(
  planId
) {

  await FirebaseFirestore.deleteDocument({
    reference:
      `${COLLECTION}/${planId}`
  })
}


export async function getServicePlans() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        COLLECTION
    })


  const snapshots =
    result?.snapshots ||
    []


  return snapshots
    .map(
      snapshot => ({
        id:
          snapshot.id,

        ...snapshot.data
      })
    )
    .sort(
      (a, b) =>
        String(
          b.date || ''
        ).localeCompare(
          String(
            a.date || ''
          )
        )
    )
}


export async function getPublishedServicePlans() {

  const result =
    await FirebaseFirestore.getCollection({
      reference: COLLECTION,

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


  const snapshots =
    result?.snapshots ||
    []


  return snapshots
    .map(
      snapshot => ({
        id: snapshot.id,
        ...snapshot.data
      })
    )
    .sort(
      (a, b) =>
        String(b.date || '')
          .localeCompare(
            String(a.date || '')
          )
    )
}


export async function getServicePlan(
  planId
) {

  const result =
    await FirebaseFirestore.getDocument({
      reference:
        `${COLLECTION}/${planId}`
    })


  if (
    !result?.snapshot
  ) {

    return null
  }


  return {
    id:
      result.snapshot.id,

    ...result.snapshot.data
  }
}
