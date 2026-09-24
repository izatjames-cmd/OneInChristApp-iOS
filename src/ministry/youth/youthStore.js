/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Youth
 * File   : youthStore.js
 *
 * Purpose:
 * Handles all Firestore operations for the Youth module.
 * ============================================================
 */

import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'

const EVENTS_COLLECTION =
  'youthEvents'

const ANNOUNCEMENTS_COLLECTION =
  'youthAnnouncements'

const RESPONSES_COLLECTION =
  'youthEventResponses'


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


function newestFirst(
  items
) {

  return items.sort(
    (a, b) =>
      String(
        b.createdAt ||
        b.date ||
        ''
      ).localeCompare(
        String(
          a.createdAt ||
          a.date ||
          ''
        )
      )
  )
}


function eventsSoonestFirst(
  items
) {

  return items.sort(
    (a, b) =>
      `${a.date || ''} ${a.time || ''}`
        .localeCompare(
          `${b.date || ''} ${b.time || ''}`
        )
  )
}


function isUpcoming(
  item
) {

  if (!item?.date) {
    return true
  }


  const date =
    new Date(
      `${item.date}T${item.time || '23:59'}:00`
    )


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return true
  }


  return date.getTime() >=
    Date.now()
}


export async function getYouthEvents() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        EVENTS_COLLECTION
    })


  return eventsSoonestFirst(
    snapshotsToItems(result)
      .filter(
        event =>
          event.archived !== true
      )
  )
}


export async function getUpcomingEvent() {

  const events =
    await getYouthEvents()


  return events.find(
    event =>
      event.active !== false &&
      isUpcoming(event)
  ) || null
}


export async function createYouthEvent(
  data
) {

  const id =
    `YOUTH_EVENT_${Date.now()}`


  await FirebaseFirestore.setDocument({
    reference:
      `${EVENTS_COLLECTION}/${id}`,

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


export async function updateYouthEvent(
  id,
  data
) {

  await FirebaseFirestore.updateDocument({
    reference:
      `${EVENTS_COLLECTION}/${id}`,

    data: {
      ...data,

      updatedAt:
        new Date().toISOString()
    }
  })
}


export async function archiveYouthEvent(
  id
) {

  await updateYouthEvent(
    id,
    {
      archived:
        true
    }
  )
}


export async function deleteYouthEvent(
  id
) {

  await FirebaseFirestore.deleteDocument({
    reference:
      `${EVENTS_COLLECTION}/${id}`
  })
}


export async function saveYouthEventResponse({
  eventId,
  uid,
  name,
  response
}) {

  await FirebaseFirestore.setDocument({
    reference:
      `${RESPONSES_COLLECTION}/${eventId}_${uid}`,

    data: {
      eventId,
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


export async function getYouthAnnouncements() {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        ANNOUNCEMENTS_COLLECTION
    })


  return newestFirst(
    snapshotsToItems(result)
  )
}


export async function getLatestAnnouncement() {

  const announcements =
    await getYouthAnnouncements()


  return announcements.find(
    announcement =>
      announcement.active !== false
  ) || null
}


export async function createYouthAnnouncement(
  data
) {

  const id =
    `YOUTH_ANNOUNCEMENT_${Date.now()}`


  await FirebaseFirestore.setDocument({
    reference:
      `${ANNOUNCEMENTS_COLLECTION}/${id}`,

    data: {
      ...data,

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


export async function updateYouthAnnouncement(
  id,
  data
) {

  await FirebaseFirestore.updateDocument({
    reference:
      `${ANNOUNCEMENTS_COLLECTION}/${id}`,

    data: {
      ...data,

      updatedAt:
        new Date().toISOString()
    }
  })
}


export async function deleteYouthAnnouncement(
  id
) {

  await FirebaseFirestore.deleteDocument({
    reference:
      `${ANNOUNCEMENTS_COLLECTION}/${id}`
  })
}
