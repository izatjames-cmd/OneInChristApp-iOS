/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Prayer
 * File   : prayerStore.js
 *
 * Purpose:
 * Handles Firestore operations for the Prayer module.
 * ============================================================
 */

import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'


const REQUESTS_COLLECTION =
  'prayerRequests'

const MEETINGS_COLLECTION =
  'prayerMeetings'

const ANNOUNCEMENTS_COLLECTION =
  'prayerAnnouncements'

const RESOURCES_COLLECTION =
  'prayerResources'

const RESPONSES_COLLECTION =
  'prayerMeetingResponses'


function snapshotsToItems(result) {

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


function newestFirst(items) {

  return items.sort(
    (a, b) =>
      String(b.createdAt || b.date || '')
        .localeCompare(
          String(a.createdAt || a.date || '')
        )
  )
}


function soonestFirst(items) {

  return items.sort(
    (a, b) =>
      `${a.date || ''} ${a.time || ''}`
        .localeCompare(
          `${b.date || ''} ${b.time || ''}`
        )
  )
}


function isUpcoming(item) {

  if (!item?.date) {
    return true
  }


  const date =
    new Date(
      `${item.date}T${item.time || '23:59'}:00`
    )


  if (Number.isNaN(date.getTime())) {
    return true
  }


  return date.getTime() >= Date.now()
}


function isWithinLastMonth(
  item
) {

  const createdAt =
    item.createdAt ||
    item.date ||
    ''


  if (!createdAt) {
    return true
  }


  const created =
    new Date(
      createdAt
    )


  if (
    Number.isNaN(
      created.getTime()
    )
  ) {
    return true
  }


  const cutoff =
    new Date()

  cutoff.setMonth(
    cutoff.getMonth() - 1
  )


  return created >= cutoff
}


export async function getPrayerRequests() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        REQUESTS_COLLECTION
    })


  return newestFirst(
    snapshotsToItems(result)
      .filter(
        request =>
          request.archived !== true &&
          isWithinLastMonth(
            request
          )
      )
  )
}


export async function getMemberPrayerRequests() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        REQUESTS_COLLECTION,

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
              'visibility',

            opStr:
              '==',

            value:
              'church'
          }
        ]
      }
    })


  return newestFirst(
    snapshotsToItems(result)
      .filter(
        request =>
          request.archived !== true &&
          isWithinLastMonth(
            request
          )
      )
  )
}


export async function getLatestApprovedPrayerRequest() {

  const requests =
    await getMemberPrayerRequests()


  return requests[0] || null
}


export async function createPrayerRequest(data) {

  const id =
    `PRAYER_REQUEST_${Date.now()}`


  await FirebaseFirestore.setDocument({
    reference:
      `${REQUESTS_COLLECTION}/${id}`,

    data: {
      ...data,

      status:
        'pending',

      archived:
        false,

      answered:
        false,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()
    },

    merge:
      false
  })


  return id
}


export async function updatePrayerRequest(id, data) {

  await FirebaseFirestore.updateDocument({
    reference:
      `${REQUESTS_COLLECTION}/${id}`,

    data: {
      ...data,

      updatedAt:
        new Date().toISOString()
    }
  })
}


export async function deletePrayerRequest(id) {

  await FirebaseFirestore.deleteDocument({
    reference:
      `${REQUESTS_COLLECTION}/${id}`
  })
}


export async function getPrayerMeetings() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        MEETINGS_COLLECTION
    })


  return soonestFirst(
    snapshotsToItems(result)
      .filter(
        meeting =>
          meeting.archived !== true
      )
  )
}


export async function getUpcomingPrayerMeeting() {

  const meetings =
    await getPrayerMeetings()


  return meetings.find(
    meeting =>
      meeting.active !== false &&
      isUpcoming(meeting)
  ) || null
}


export async function getPrayerMeetingResponses(
  meetingId
) {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        RESPONSES_COLLECTION
    })


  return snapshotsToItems(result)
    .filter(
      item =>
        item.meetingId === meetingId
    )
}

export async function savePrayerMeetingResponse({
  meetingId,
  uid,
  name,
  response
}) {

  await FirebaseFirestore.setDocument({
    reference:
      `${RESPONSES_COLLECTION}/${meetingId}_${uid}`,

    data: {
      meetingId,
      uid,
      name,
      response,
      updatedAt:
        new Date().toISOString()
    },

    merge:
      true
  })
}


export async function createPrayerMeeting(data) {

  return await createItem(
    MEETINGS_COLLECTION,
    'PRAYER_MEETING',
    data
  )
}


export async function updatePrayerMeeting(id, data) {

  await updateItem(
    MEETINGS_COLLECTION,
    id,
    data
  )
}


export async function deletePrayerMeeting(id) {

  await deleteItem(
    MEETINGS_COLLECTION,
    id
  )
}


export async function getPrayerAnnouncements() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        ANNOUNCEMENTS_COLLECTION
    })


  return newestFirst(
    snapshotsToItems(result)
  )
}


export async function getLatestPrayerAnnouncement() {

  const announcements =
    await getPrayerAnnouncements()


  return announcements.find(
    announcement =>
      announcement.active !== false
  ) || null
}


export async function createPrayerAnnouncement(data) {

  return await createItem(
    ANNOUNCEMENTS_COLLECTION,
    'PRAYER_ANNOUNCEMENT',
    data
  )
}


export async function updatePrayerAnnouncement(id, data) {

  await updateItem(
    ANNOUNCEMENTS_COLLECTION,
    id,
    data
  )
}


export async function deletePrayerAnnouncement(id) {

  await deleteItem(
    ANNOUNCEMENTS_COLLECTION,
    id
  )
}


export async function getPrayerResources() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        RESOURCES_COLLECTION
    })


  return newestFirst(
    snapshotsToItems(result)
  )
}


export async function getLatestPrayerResource() {

  const resources =
    await getPrayerResources()


  return resources.find(
    resource =>
      resource.active !== false
  ) || null
}


export async function createPrayerResource(data) {

  return await createItem(
    RESOURCES_COLLECTION,
    'PRAYER_RESOURCE',
    data
  )
}


export async function updatePrayerResource(id, data) {

  await updateItem(
    RESOURCES_COLLECTION,
    id,
    data
  )
}


export async function deletePrayerResource(id) {

  await deleteItem(
    RESOURCES_COLLECTION,
    id
  )
}


async function createItem(collection, prefix, data) {

  const id =
    `${prefix}_${Date.now()}`


  await FirebaseFirestore.setDocument({
    reference:
      `${collection}/${id}`,

    data: {
      ...data,

      archived:
        false,

      createdAt:
        new Date().toISOString(),

      updatedAt:
        new Date().toISOString()
    },

    merge:
      false
  })


  return id
}


async function updateItem(collection, id, data) {

  await FirebaseFirestore.updateDocument({
    reference:
      `${collection}/${id}`,

    data: {
      ...data,

      updatedAt:
        new Date().toISOString()
    }
  })
}


async function deleteItem(collection, id) {

  await FirebaseFirestore.deleteDocument({
    reference:
      `${collection}/${id}`
  })
}
