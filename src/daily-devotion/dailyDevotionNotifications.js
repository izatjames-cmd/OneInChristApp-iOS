/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Daily Devotion
 * File   : dailyDevotionNotifications.js
 *
 * Purpose:
 * Sends Daily Devotion notifications through the existing system.
 * ============================================================
 */

import {
  createChurchNotification
} from '../notifications/notificationStore.js'


export async function notifyDailyDevotionReady({
  uid
}) {

  await createChurchNotification({
    title:
      'Daily Devotion Ready',
    message:
      "Review today's devotion.",
    category:
      'Daily Devotion',
    section:
      'daily-devotion',
    targetId:
      'admin',
    sendMode:
      'now',
    uid
  })
}


export async function notifyDailyDevotionPublished({
  uid
}) {

  await createChurchNotification({
    title:
      'Verse of the Day',
    message:
      "Today's devotion is now available.",
    category:
      'Daily Devotion',
    section:
      'daily-devotion',
    targetId:
      'devotion',
    sendMode:
      'now',
    uid
  })
}
