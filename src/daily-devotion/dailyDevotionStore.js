/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Daily Devotion
 * File   : dailyDevotionStore.js
 *
 * Purpose:
 * Handles Firestore operations for the church-wide Daily Devotion.
 * ============================================================
 */

import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'

import {
  generateDailyDevotionDraft
} from './dailyDevotionService.js'


const DEVOTIONS_COLLECTION =
  'dailyDevotions'


function getTodayString() {

  return new Date()
    .toISOString()
    .slice(0, 10)
}


function snapshotsToDevotions(
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


function sortDevotionsNewestFirst(
  devotions
) {

  return devotions.sort(
    (first, second) => {

      const firstDate =
        first.approvedAt ||
        first.createdAt ||
        first.date ||
        ''

      const secondDate =
        second.approvedAt ||
        second.createdAt ||
        second.date ||
        ''


      return secondDate.localeCompare(
        firstDate
      )
    }
  )
}


export async function getAllDailyDevotions() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        DEVOTIONS_COLLECTION
    })


  return sortDevotionsNewestFirst(
    snapshotsToDevotions(result)
  )
}


export async function getPublishedDailyDevotions() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        DEVOTIONS_COLLECTION,

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


  return sortDevotionsNewestFirst(
    snapshotsToDevotions(result)
  )
}


export async function getApprovedDailyDevotion() {

  const devotions =
    await getPublishedDailyDevotions()


  return devotions[0] || null
}


export async function getPendingDailyDevotion() {

  const devotions =
    await getAllDailyDevotions()


  return devotions.find(
    devotion => devotion.status === 'pending'
  ) || null
}


export async function requestDailyDevotion({
  uid
}) {

  const date =
    getTodayString()

  const id =
    `DAILY_DEVOTION_${Date.now()}`

  const devotion =
    await generateDailyDevotionDraft({
      uid,
      date
    })


  await FirebaseFirestore.setDocument({
    reference:
      `${DEVOTIONS_COLLECTION}/${id}`,

    data: {
      date,

      status:
        'pending',

      passageId:
        devotion.passageId || '',

      verseReference:
        devotion.verseReference || '',

      verseText:
        devotion.verseText || '',

      explanation:
        devotion.explanation || '',

      application:
        devotion.application || '',

      prayer:
        devotion.prayer || '',

      translations:
        devotion.translations || {},

      published:
        false,

      notificationSent:
        false,

      generatedByAI:
        true,

      createdBy:
        uid,

      createdAt:
        new Date().toISOString(),

      approvedAt:
        '',

      approvedBy:
        '',

      updatedAt:
        new Date().toISOString()
    },

    merge:
      false
  })


  return id
}


export async function updateDailyDevotion({
  id,
  data,
  uid
}) {

  const updateData = {
    verseReference:
      data.verseReference || '',

    verseText:
      data.verseText || '',

    explanation:
      data.explanation || '',

    application:
      data.application || '',

    prayer:
      data.prayer || '',

    updatedBy:
      uid,

    updatedAt:
      new Date().toISOString()
  }


  if (data.translations) {
    updateData.translations =
      data.translations
  }


  await FirebaseFirestore.updateDocument({
    reference:
      `${DEVOTIONS_COLLECTION}/${id}`,

    data:
      updateData
  })
}


export async function approveDailyDevotion({
  id,
  uid
}) {

  await FirebaseFirestore.updateDocument({
    reference:
      `${DEVOTIONS_COLLECTION}/${id}`,

    data: {
      status:
        'approved',

      published:
        true,

      approvedBy:
        uid,

      approvedAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()
    }
  })
}


export async function rejectDailyDevotion({
  id,
  uid
}) {

  await FirebaseFirestore.updateDocument({
    reference:
      `${DEVOTIONS_COLLECTION}/${id}`,

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


export async function deleteDailyDevotion(
  id
) {

  await FirebaseFirestore.deleteDocument({
    reference:
      `${DEVOTIONS_COLLECTION}/${id}`
  })
}


export async function markDailyDevotionNotificationSent(
  id
) {

  await FirebaseFirestore.updateDocument({
    reference:
      `${DEVOTIONS_COLLECTION}/${id}`,

    data: {
      notificationSent:
        true,

      updatedAt:
        new Date().toISOString()
    }
  })
}
