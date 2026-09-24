/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : AI Bible Reading
 * File   : aiBibleReadingNotifications.js
 *
 * Purpose:
 * Sends AI Bible Reading notifications through the existing system.
 * ============================================================
 */

import {
  createChurchNotification
} from '../notifications/notificationStore.js'


export async function notifyAiBibleReadingReady({
  uid
}) {

  await createChurchNotification({
    title:
      'Bible Reading Ready',
    message:
      "Review today's Bible Reading.",
    category:
      'aiBibleReading',
    section:
      'ai-bible-reading',
    audience:
      'aiBibleReadingAdmin',
    targetId:
      'admin',
    sendMode:
      'now',
    uid
  })
}


export async function notifyAiBibleReadingPublished({
  uid
}) {

  await createChurchNotification({
    title:
      'Bible Reading',
    message:
      "Today's Bible Reading is now available.",
    category:
      'aiBibleReading',
    section:
      'ai-bible-reading',
    targetId:
      'reading',
    sendMode:
      'now',
    uid
  })
}
