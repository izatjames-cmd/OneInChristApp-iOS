import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'

import { createChurchNotification } from '../notifications/notificationStore.js'


const COLLECTION =
  'scripturePreparations'

const COMMUNICATION_COLLECTION = 'scripturePreparationMessages'


function snapshotsToPreparations(result) {

  if (!result?.snapshots) {
    return []
  }


  return result.snapshots.map(
    snapshot => ({
      id:
        snapshot.id,

      ...snapshot.data
    })
  )
}


function newestFirst(preparations) {

  return preparations.sort(
    (a, b) =>
      String(
        b.updatedAt ||
        b.createdAt ||
        b.serviceDate ||
        ''
      )
        .localeCompare(
          String(
            a.updatedAt ||
            a.createdAt ||
            a.serviceDate ||
            ''
          )
        )
  )
}


export async function getScripturePreparations() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        COLLECTION
    })


  return newestFirst(
    snapshotsToPreparations(result)
  )
}


export async function getLatestScripturePreparation() {

  const preparations =
    await getScripturePreparations()


  return preparations[0] || null
}


export async function getScripturePreparationForDate(
  serviceDate
) {

  if (!serviceDate) {
    return null
  }


  const result =
    await FirebaseFirestore.getCollection({
      reference:
        COLLECTION,

      compositeFilter: {
        type:
          'and',

        queryConstraints: [
          {
            type:
              'where',

            fieldPath:
              'serviceDate',

            opStr:
              '==',

            value:
              serviceDate
          }
        ]
      }
    })


  return newestFirst(
    snapshotsToPreparations(result)
  )[0] || null
}


export async function saveScripturePreparation(
  preparation
) {

  const id =
    preparation.id ||
    `SCRIPTURE_PREPARATION_${Date.now()}`


  const now =
    new Date()
      .toISOString()


  await FirebaseFirestore.setDocument({
    reference:
      `${COLLECTION}/${id}`,

    data: {
      serviceDate:
        preparation.serviceDate,

      openingReading:
        preparation.openingReading || {},

      mainReading:
        preparation.mainReading || {},

      reading1:
        preparation.reading1 || {},

      reading2:
        preparation.reading2 || {},

      additionalReferences:
        preparation.additionalReferences || [],

      urduReading:
        preparation.urduReading || '',

      urduReference:
        preparation.urduReference || '',

      danishReading:
        preparation.danishReading || '',

      danishReference:
        preparation.danishReference || '',

      englishReading:
        preparation.englishReading || '',

      sermonTitle:
        preparation.sermonTitle || '',

      serviceTheme:
        preparation.serviceTheme || '',

      notes:
        preparation.notes || '',

      status:
        preparation.status || 'submitted',

      createdBy:
        preparation.createdBy,

      createdAt:
        preparation.createdAt || now,

      updatedAt:
        now
    },

    merge:
      false
  })


  return id
}


export async function deleteScripturePreparation(
  preparationId
) {

  await FirebaseFirestore.deleteDocument({
    reference:
      `${COLLECTION}/${preparationId}`
  })
}

export async function createScripturePreparationMessage(data) {
  if (!data?.uid) throw new Error('Please sign in again.')
  if (!String(data.message || '').trim() && !data.audioBase64) {
    throw new Error('Write a message or record a voice message before sending.')
  }
  const result = await FirebaseFirestore.setDocument({
    reference: `${COMMUNICATION_COLLECTION}/MESSAGE_${data.uid}_${Date.now()}`,
    data: {
      uid: data.uid,
      senderName: data.senderName || '',
      message: String(data.message || '').trim(),
      audioBase64: data.audioBase64 || '',
      audioDurationSeconds: Number(data.audioDurationSeconds || 0),
      createdAt: new Date().toISOString()
    },
    merge: false
  })
  await createChurchNotification({ title: 'New Scripture Preparation Message', message: `${data.senderName || 'A preacher or admin'} sent a message.`, category: 'service', section: 'scripture-preparation', targetId: 'communication', sendMode: 'now', uid: data.uid })
  return result
}

export async function subscribeScripturePreparationMessages(onMessages, onError) {
  let active = true
  const callbackId = await FirebaseFirestore.addCollectionSnapshotListener({
    reference: COMMUNICATION_COLLECTION,
    queryConstraints: [
      { type: 'orderBy', fieldPath: 'createdAt', directionStr: 'desc' },
      { type: 'limit', limit: 50 }
    ]
  }, (result, error) => {
    if (!active) return
    if (error) { onError?.(error); return }
    const messages = (result?.snapshots || []).map(snapshot => ({ id: snapshot.id, ...snapshot.data }))
      .filter(item => item.archived !== true)
      .sort((a, b) => String(a.createdAt || '').localeCompare(String(b.createdAt || '')))
    onMessages(messages)
  })
  return async () => {
    if (!active) return
    active = false
    await FirebaseFirestore.removeSnapshotListener({ callbackId })
  }
}
