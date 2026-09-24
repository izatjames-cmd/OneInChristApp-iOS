import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'

import {
  createHymnRevision
} from './hymnRevisionStore.js'


const COLLECTION =
  'hymnbookGeet'

const BUILT_IN_GEET_COUNT =
  478


function snapshotsToGeet(
  result
) {

  if (!result?.snapshots) {
    return []
  }


  return result.snapshots
    .map(
      snapshot => ({
        id: snapshot.id,
        ...snapshot.data
      })
    )
    .filter(
      item =>
        item?.active !== false
    )
}


function sortGeet(
  items
) {

  return [...items]
    .sort(
      (a, b) => {

        const first =
          String(
            a?.romanTitle || ''
          ).trim()

        const second =
          String(
            b?.romanTitle || ''
          ).trim()


        return first.localeCompare(
          second,
          'en',
          {
            sensitivity: 'base'
          }
        )
      }
    )
}


export async function getAdminGeet() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        COLLECTION
    })


  return sortGeet(
    snapshotsToGeet(
      result
    )
  )
}


export async function getAdminGeetById(
  geetId
) {

  if (!geetId) {
    return null
  }


  const result =
    await FirebaseFirestore.getDocument({
      reference:
        `${COLLECTION}/${geetId}`
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


export async function createAdminGeet({
  urduTitle,
  romanTitle,
  content,
  uid
}) {

  const existing =
    await getAdminGeet()


  const highestNumber =
    existing.reduce(
      (highest, item) => {

        const number =
          Number(
            item?.geetNumber || 0
          )


        return Math.max(
          highest,
          Number.isFinite(number)
            ? number
            : 0
        )
      },
      BUILT_IN_GEET_COUNT
    )


  const geetNumber =
    highestNumber + 1


  const id =
    `GEET_${Date.now()}`


  const now =
    new Date()
      .toISOString()


  await FirebaseFirestore.setDocument({
    reference:
      `${COLLECTION}/${id}`,

    data: {
      type:
        'geet',

      geetNumber,

      urduTitle:
        String(
          urduTitle || ''
        ).trim(),

      romanTitle:
        String(
          romanTitle || ''
        ).trim(),

      content:
        String(
          content || ''
        ).replace(
          /\r\n?/g,
          '\n'
        ).trim(),

      active:
        true,

      createdBy:
        uid || '',

      createdAt:
        now,

      updatedAt:
        now
    },

    merge:
      false
  })


  return {
    id,
    geetNumber
  }
}


export async function updateAdminGeet(
  geetId,
  {
    urduTitle,
    romanTitle,
    content,
    uid = ''
  }
) {

  if (!geetId) {
    throw new Error(
      'Missing Geet ID.'
    )
  }


  const current =
    await getAdminGeetById(
      geetId
    )


  if (current) {
    await createHymnRevision({
      sourceType:
        'admin-geet',
      sourceId:
        geetId,
      hymnType:
        current.type ||
        'geet',
      urduTitle:
        current.urduTitle,
      romanTitle:
        current.romanTitle,
      content:
        current.content,
      uid,
      reason:
        'edit'
    })
  }


  await FirebaseFirestore.updateDocument({
    reference:
      `${COLLECTION}/${geetId}`,

    data: {
      urduTitle:
        String(
          urduTitle || ''
        ).trim(),

      romanTitle:
        String(
          romanTitle || ''
        ).trim(),

      content:
        String(
          content || ''
        ).replace(
          /\r\n?/g,
          '\n'
        ).trim(),

      updatedAt:
        new Date()
          .toISOString()
    }
  })
}


export async function restoreAdminGeetRevision(
  geetId,
  revision,
  uid = ''
) {

  if (
    !geetId ||
    !revision
  ) {
    throw new Error(
      'The Geet revision could not be restored.'
    )
  }


  await updateAdminGeet(
    geetId,
    {
      urduTitle:
        revision.urduTitle,
      romanTitle:
        revision.romanTitle,
      content:
        revision.content,
      uid
    }
  )


  return getAdminGeetById(
    geetId
  )
}


export async function deleteAdminGeet(
  geetId
) {

  if (!geetId) {
    return
  }


  await FirebaseFirestore.deleteDocument({
    reference:
      `${COLLECTION}/${geetId}`
  })
}


export function getBuiltInGeetCount() {
  return BUILT_IN_GEET_COUNT
}
