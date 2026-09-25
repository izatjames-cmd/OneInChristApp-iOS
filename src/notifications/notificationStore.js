import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'
import { NOTIFICATION_GROUPS, getNotificationGroupKey } from './notificationGroups.js'

export async function deleteChurchNotificationSection(groupKey) {
  if (!NOTIFICATION_GROUPS.some(group => group.key === groupKey)) {
    throw new Error('Unknown notification section.')
  }
  // Read all stored notifications, not just the seven-day display window.
  // Freeze the IDs so notifications arriving during deletion are not swept up.
  const result = await FirebaseFirestore.getCollection({ reference: 'churchNotifications' })
  const targets = snapshotsToNotifications(result).filter(item => getNotificationGroupKey(item) === groupKey)
  let deleted = 0
  let failed = 0
  for (const notification of targets) {
    try {
      await deleteChurchNotification(notification.id)
      deleted++
    } catch {
      failed++
    }
  }
  return { deleted, failed }
}


function snapshotsToNotifications(result) {

  if (!result.snapshots) {
    return []
  }

  return result.snapshots.map(
    snapshot => ({
      ...snapshot.data,
      id: snapshot.id
    })
  )
}


function isWithinLastDays(
  notification,
  days
) {

  const timestamp =
    notification.createdAt ||
    notification.date ||
    ''

  if (!timestamp) {
    return false
  }

  const created =
    new Date(
      timestamp
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

  cutoff.setDate(
    cutoff.getDate() - days
  )

  return created >= cutoff
}


export async function getChurchNotifications(
  days = 7
) {

  const result =
    await FirebaseFirestore.getCollection({
      reference:
        'churchNotifications'
    })


  const notifications =
    snapshotsToNotifications(result)
      .filter(
        notification =>
          isWithinLastDays(
            notification,
            days
          )
      )


  return notifications.sort(
    (a, b) => {

      const first =
        a.createdAt || ''

      const second =
        b.createdAt || ''

      return second.localeCompare(
        first
      )
    }
  )
}


export async function getChurchNotification(
  notificationId
) {

  const result =
    await FirebaseFirestore.getDocument({
      reference:
        `churchNotifications/${notificationId}`
    })


  if (
    !result?.snapshot
  ) {
    return null
  }


  return {
    id:
      result.snapshot.id,

    ...result.snapshot.data
  }
}


export async function createChurchNotification({
  title,
  message,
  category,
  section,
  audience = '',
  targetId = null,
  sendMode,
  date = '',
  time = '',
  uid
}) {

  const documentId =
    `NOTIFICATION_${Date.now()}`


  const status =
    sendMode === 'now'
      ? 'pending'
      : 'scheduled'


  await FirebaseFirestore.setDocument({

    reference:
      `churchNotifications/${documentId}`,

    data: {
      title,
      message,
      category,
      section,
      audience,
      targetId,
      sendMode,
      date,
      time,
      status,
      createdBy:
        uid,
      createdAt:
        new Date().toISOString()
    },

    merge:
      false
  })


  return documentId
}


export async function deleteChurchNotification(
  notificationId
) {

  await FirebaseFirestore.deleteDocument({
    reference:
      `churchNotifications/${notificationId}`
  })
}


export async function saveDeviceToken({
  uid,
  token,
  platform
}) {

  const normalizedPlatform =
    platform === 'ios'
      ? 'ios'
      : platform === 'android'
        ? 'android'
        : 'unknown'


  const updatedAt =
    new Date().toISOString()


  const data = {
    uid,
    lastPlatform:
      normalizedPlatform,
    updatedAt
  }


  /*
   * Keep the legacy Android token fields
   * so existing Android installations and
   * the currently deployed Cloud Function
   * continue to work during migration.
   *
   * Store iOS separately so signing in on
   * an iPhone never overwrites the user's
   * Android registration token.
   */
  if (
    normalizedPlatform ===
    'android'
  ) {

    data.token =
      token

    data.platform =
      'android'

    data.androidToken =
      token

    data.androidUpdatedAt =
      updatedAt
  }


  if (
    normalizedPlatform ===
    'ios'
  ) {

    data.iosToken =
      token

    data.iosUpdatedAt =
      updatedAt
  }


  if (
    normalizedPlatform ===
    'unknown'
  ) {

    data.token =
      token

    data.platform =
      'unknown'
  }


  await FirebaseFirestore.setDocument({

    reference:
      `deviceTokens/${uid}`,

    data,

    merge:
      true
  })
}
