/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : AI Bible Reading
 * File   : aiBibleReadingStore.js
 *
 * Purpose:
 * Handles Firestore operations for AI Bible Readings.
 * ============================================================
 */

import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'

import {
  generateAiBibleReadingDraft
} from './aiBibleReadingService.js'


const READINGS_COLLECTION =
  'aiBibleReadings'


function getTodayString() {

  return new Date()
    .toISOString()
    .slice(0, 10)
}


function snapshotsToReadings(
  result
) {

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


function sortReadingsNewestFirst(
  readings
) {

  return readings.sort(
    (first, second) => {

      const firstDate =
        first.publishedAt ||
        first.createdAt ||
        first.date ||
        ''

      const secondDate =
        second.publishedAt ||
        second.createdAt ||
        second.date ||
        ''


      return secondDate.localeCompare(
        firstDate
      )
    }
  )
}


export async function getAllAiBibleReadings() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        READINGS_COLLECTION
    })


  return sortReadingsNewestFirst(
    snapshotsToReadings(result)
      .filter(
        reading =>
          reading.status !==
          'rejected'
      )
  )
}


export async function getPublishedAiBibleReadings() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        READINGS_COLLECTION,

      compositeFilter: {
        type:
          'and',

        queryConstraints: [
          {
            type:
              'where',

            fieldPath:
              'status',

            opStr:
              '==',

            value:
              'approved'
          },
          {
            type:
              'where',

            fieldPath:
              'published',

            opStr:
              '==',

            value:
              true
          }
        ]
      }
    })


  return sortReadingsNewestFirst(
    snapshotsToReadings(result)
  )
}


export async function requestAiBibleReading({
  uid
}) {

  const date =
    getTodayString()

  const id =
    `AI_BIBLE_READING_${Date.now()}`

  const reading =
    await generateAiBibleReadingDraft({
      uid,
      date
    })


  await FirebaseFirestore.setDocument({
    reference:
      `${READINGS_COLLECTION}/${id}`,

    data: {
      date,

      status:
        'pending',

      passageId:
        reading.passageId || '',

      verseReference:
        reading.verseReference || '',

      verseText:
        reading.verseText || '',

      reflection:
        reading.reflection || '',

      questions:
        reading.questions || [],

      translations:
        reading.translations || {},

      published:
        false,

      memberNotificationSent:
        false,

      generatedByAI:
        true,

      createdBy:
        uid,

      createdAt:
        new Date().toISOString(),

      publishedAt:
        '',

      publishedBy:
        '',

      updatedAt:
        new Date().toISOString()
    },

    merge:
      false
  })


  return id
}


export async function updateAiBibleReading({
  id,
  data,
  uid
}) {

  await FirebaseFirestore.updateDocument({
    reference:
      `${READINGS_COLLECTION}/${id}`,

    data: {
      date:
        data.date || '',

      verseReference:
        data.verseReference || '',

      verseText:
        data.verseText || '',

      reflection:
        data.reflection || '',

      questions:
        data.questions || [],

      translations:
        data.translations || {},

      updatedBy:
        uid,

      updatedAt:
        new Date().toISOString()
    }
  })
}


export async function approveAiBibleReading({
  id,
  uid
}) {

  await FirebaseFirestore.updateDocument({
    reference:
      `${READINGS_COLLECTION}/${id}`,

    data: {
      status:
        'approved',

      published:
        true,

      publishedBy:
        uid,

      publishedAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()
    }
  })
}


export async function rejectAiBibleReading({
  id,
  uid
}) {

  await FirebaseFirestore.updateDocument({
    reference:
      `${READINGS_COLLECTION}/${id}`,

    data: {
      status:
        'rejected',

      published:
        false,

      rejectedBy:
        uid,

      rejectedAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()
    }
  })
}


export async function deleteAiBibleReading(
  id
) {

  await FirebaseFirestore.deleteDocument({
    reference:
      `${READINGS_COLLECTION}/${id}`
  })
}
