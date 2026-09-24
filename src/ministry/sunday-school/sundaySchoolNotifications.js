/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Sunday School
 * File   : sundaySchoolNotifications.js
 *
 * Purpose:
 * Sends Sunday School notifications through the existing system.
 * ============================================================
 */

import {
  createChurchNotification
} from '../../notifications/notificationStore.js'


export async function notifySundaySchoolClassCreated({
  uid,
  title,
  date,
  time
}) {
  await createSundaySchoolNotification({
    uid,
    title: title || 'Sunday School Class',
    message: createClassMessage(date, time),
    targetId: 'classes'
  })
}


export async function notifySundaySchoolAnnouncementCreated({
  uid,
  title,
  message
}) {
  await createSundaySchoolNotification({
    uid,
    title: title || 'Sunday School Announcement',
    message: message || 'A new Sunday School announcement is available.',
    targetId: 'announcements'
  })
}


export async function notifySundaySchoolResourceCreated({
  uid,
  title
}) {
  await createSundaySchoolNotification({
    uid,
    title: title || 'Sunday School Resource',
    message: 'A new Sunday School resource is available.',
    targetId: 'resources'
  })
}

export async function notifySundaySchoolGalleryPublished({ uid, title, date }) {
  await createSundaySchoolNotification({
    uid,
    title: title || 'Sunday School Gallery',
    message: `New Sunday School gallery photos are available${date ? ` from ${date}` : ''}.`,
    targetId: 'gallery'
  })
}


async function createSundaySchoolNotification({
  uid,
  title,
  message,
  targetId
}) {
  await createChurchNotification({
    title,
    message,
    category: 'sundaySchool',
    section: 'sunday-school',
    targetId,
    sendMode: 'now',
    uid
  })
}


function createClassMessage(date, time) {
  const when = `${date || ''} ${time || ''}`.trim()
  if (!when) return 'A new Sunday School class has been created.'
  return `A new Sunday School class has been created for ${when}.`
}
