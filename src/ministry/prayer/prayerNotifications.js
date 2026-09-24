/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Prayer
 * File   : prayerNotifications.js
 *
 * Purpose:
 * Sends Prayer notifications through the existing system.
 * ============================================================
 */

import {
  createChurchNotification
} from '../../notifications/notificationStore.js'


export async function notifyPrayerMeetingCreated({
  uid,
  meetingId,
  title,
  date,
  time
}) {

  await createChurchNotification({
    title:
      title || 'Prayer Meeting',
    message:
      createMeetingMessage(
        date,
        time
      ),
    category:
      'prayer',
    section:
      'prayer',
    targetId:
      'meetings',
    sendMode:
      'now',
    uid
  })
}


export async function notifyPrayerAnnouncementCreated({
  uid,
  announcementId,
  title,
  message
}) {

  await createChurchNotification({
    title:
      title || 'Prayer Announcement',
    message:
      message || 'A new Prayer announcement is available.',
    category:
      'prayer',
    section:
      'prayer',
    targetId:
      'announcements',
    sendMode:
      'now',
    uid
  })
}


function createMeetingMessage(
  date,
  time
) {

  const when =
    `${date || ''} ${time || ''}`
      .trim()


  if (!when) {
    return 'A new Prayer meeting has been created.'
  }


  return `A new Prayer meeting has been created for ${when}.`
}
