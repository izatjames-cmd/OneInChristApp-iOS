import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'


function snapshotsToPlans(result) {

  if (!result?.snapshots) {
    return []
  }


  return result.snapshots.map(
    snapshot => ({
      id: snapshot.id,
      ...snapshot.data
    })
  )
}


function sortPlansNewestFirst(plans) {

  return plans.sort(
    (a, b) => {

      const first =
        `${a.date || ''} ${a.serviceTime || ''}`

      const second =
        `${b.date || ''} ${b.serviceTime || ''}`


      return second.localeCompare(
        first
      )
    }
  )
}


export async function getPublishedChoirPlans() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        'choirPlans',

      compositeFilter: {
        type:
          'and',

        queryConstraints: [
          {
            type:
              'where',

            fieldPath:
              'active',

            opStr:
              '==',

            value:
              true
          },
          {
            type:
              'where',

            fieldPath:
              'choirReviewStatus',

            opStr:
              '==',

            value:
              'readyForServicePlan'
          }
        ]
      }
    })


  return sortPlansNewestFirst(
    snapshotsToPlans(result)
  )
}


export async function getChoirGroupPlans() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        'choirPlans',

      compositeFilter: {
        type:
          'and',

        queryConstraints: [
          {
            type:
              'where',

            fieldPath:
              'active',

            opStr:
              '==',

            value:
              true
          }
        ]
      }
    })


  return sortPlansNewestFirst(
    snapshotsToPlans(result)
      .filter(
        plan =>
          plan.choirReviewStatus === 'sentToChoir' ||
          plan.choirReviewStatus === 'readyForServicePlan' ||
          !plan.choirReviewStatus
      )
  )
}


export async function getAllChoirPlans() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        'choirPlans'
    })


  return sortPlansNewestFirst(
    snapshotsToPlans(result)
  )
}


export async function getChoirPlan(
  planId
) {

  if (!planId) {
    return null
  }


  const result =
    await FirebaseFirestore.getDocument({
      reference:
        `choirPlans/${planId}`
    })


  if (!result?.snapshot?.data) {
    return null
  }


  return {
    id:
      result.snapshot.id,

    ...result.snapshot.data
  }
}


export async function createChoirPlan(
  data
) {

  const id =
    `CHOIR_${Date.now()}`


  await FirebaseFirestore.setDocument({

    reference:
      `choirPlans/${id}`,

    data: {

      title:
        data.title,

      date:
        data.date,

      serviceTime:
        data.serviceTime,

      active:
        Boolean(
          data.active
        ),

      archived:
        false,

      archivedAt:
        '',

      archivedBy:
        '',

      songs:
        data.songs || [],

      holySpiritHymn:
        data.holySpiritHymn || {},

      choirAudioMessageUrl:
        data.choirAudioMessageUrl || '',

      choirReviewStatus:
        data.choirReviewStatus || 'sentToChoir',

      congregationShare:
        Boolean(
          data.congregationShare
        ),

      notificationDate:
        data.notificationDate || '',

      notificationTime:
        data.notificationTime || '',

      notificationStatus:
        data.congregationShare
          ? 'notScheduled'
          : 'disabled',

      createdBy:
        data.uid,

      createdAt:
        new Date()
          .toISOString(),

      updatedAt:
        new Date()
          .toISOString()
    },

    merge:
      false
  })


  return id
}


export async function updateChoirPlan(
  planId,
  data
) {

  await FirebaseFirestore.updateDocument({

    reference:
      `choirPlans/${planId}`,

    data: {

      title:
        data.title,

      date:
        data.date,

      serviceTime:
        data.serviceTime,

      active:
        Boolean(
          data.active
        ),

      songs:
        data.songs || [],

      holySpiritHymn:
        data.holySpiritHymn || {},

      choirAudioMessageUrl:
        data.choirAudioMessageUrl || '',

      choirReviewStatus:
        data.choirReviewStatus || 'sentToChoir',

      congregationShare:
        Boolean(
          data.congregationShare
        ),

      notificationDate:
        data.notificationDate || '',

      notificationTime:
        data.notificationTime || '',

      notificationStatus:
        data.congregationShare
          ? 'notScheduled'
          : 'disabled',

      updatedAt:
        new Date()
          .toISOString()
    }
  })
}


export async function closeChoirService({
  planId,
  uid
}) {

  await FirebaseFirestore.updateDocument({

    reference:
      `choirPlans/${planId}`,

    data: {

      archived:
        true,

      archivedAt:
        new Date()
          .toISOString(),

      archivedBy:
        uid,

      updatedAt:
        new Date()
          .toISOString()
    }
  })
}


export async function reopenChoirService(
  planId
) {

  await FirebaseFirestore.updateDocument({

    reference:
      `choirPlans/${planId}`,

    data: {

      archived:
        false,

      archivedAt:
        '',

      archivedBy:
        '',

      updatedAt:
        new Date()
          .toISOString()
    }
  })
}


export async function markChoirPlanReadyForServicePlan(
  planId
) {

  await FirebaseFirestore.updateDocument({

    reference:
      `choirPlans/${planId}`,

    data: {
      choirReviewStatus:
        'readyForServicePlan',

      readyForServicePlanAt:
        new Date()
          .toISOString(),

      updatedAt:
        new Date()
          .toISOString()
    }
  })
}
