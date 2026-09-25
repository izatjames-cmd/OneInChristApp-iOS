import {
  Capacitor
} from '@capacitor/core'

import {
  FirebaseMessaging
} from '@capacitor-firebase/messaging'

import {
  LocalNotifications
} from '@capacitor/local-notifications'

import {
  getCurrentMember
} from '../auth/phoneAuth.js'

import {
  saveDeviceToken
} from './notificationStore.js'

import {
  routeNotification
} from './notificationRouter.js'


let currentPushToken =
  null


async function loadCurrentFcmToken() {

  if (
    !Capacitor.isNativePlatform()
  ) {
    return null
  }


  try {

    const result =
      await FirebaseMessaging.getToken()


    const token =
      result?.token ||
      null


    if (token) {
      currentPushToken =
        token
    }


    return token


  } catch (error) {

    console.error(
      'Unable to get Firebase messaging token:',
      error
    )


    return null
  }
}


async function saveTokenForSignedInUser() {

  if (!currentPushToken) {
    return
  }


  try {

    const user =
      await getCurrentMember()


    if (!user?.uid) {
      return
    }


    await saveDeviceToken({
      uid:
        user.uid,

      token:
        currentPushToken,

      platform:
        Capacitor.getPlatform()
    })


    console.log(
      'Push token saved for member.'
    )


  } catch (error) {

    console.error(
      'Unable to save push token:',
      error
    )
  }
}


export async function syncPushTokenForCurrentUser() {

  if (!currentPushToken) {
    await loadCurrentFcmToken()
  }


  await saveTokenForSignedInUser()
}


function createLocalNotificationId() {

  return Math.floor(
    Date.now() %
    2147483647
  )
}


async function showSystemNotification(
  notification
) {

  try {

    const title =
      notification?.title ||
      'One in Christ Church'


    const body =
      notification?.body ||
      ''


    const data =
      notification?.data ||
      {}


    await LocalNotifications.schedule({

      notifications: [
        {
          id:
            createLocalNotificationId(),

          title,

          body,

          channelId:
            'church_notifications',

          autoCancel:
            true,

          foreground:
            true,

          extra: {
            section:
              String(
                data.section ||
                'church'
              ),

            category:
              String(
                data.category ||
                'general'
              ),

            targetId:
              String(
                data.targetId ||
                ''
              ),

            notificationId:
              String(
                data.notificationId ||
                ''
              )
          }
        }
      ]
    })


  } catch (error) {

    console.error(
      'Unable to display system notification:',
      error
    )
  }
}


async function setupNotificationChannel() {

  try {

    await LocalNotifications.createChannel({

      id:
        'church_notifications',

      name:
        'Church Notifications',

      description:
        'Notifications from One in Christ Church',

      importance:
        5,

      visibility:
        1,

      vibration:
        true
    })


  } catch (error) {

    console.error(
      'Unable to create local notification channel:',
      error
    )
  }


  try {

    await FirebaseMessaging.createChannel({

      id:
        'church_notifications',

      name:
        'Church Notifications',

      description:
        'Notifications from One in Christ Church',

      importance:
        5,

      visibility:
        1,

      vibration:
        true
    })


  } catch (error) {

    console.error(
      'Unable to create Firebase messaging channel:',
      error
    )
  }
}


export async function setupPushNotifications() {

  if (
    !Capacitor.isNativePlatform()
  ) {
    return
  }


  /*
   * FirebaseMessaging is used on BOTH
   * Android and iOS so the stored token
   * is always an FCM token.
   *
   * @capacitor/push-notifications is not
   * used together with this plugin.
   */
  FirebaseMessaging.addListener(
    'notificationReceived',

    async event => {

      const notification =
        event?.notification ||
        null


      console.log(
        'Foreground push received:',
        notification
      )


      /*
       * On iOS, FirebaseMessaging uses the
       * presentationOptions configured in
       * capacitor.config.json to display a
       * foreground notification.
       *
       * Android still needs the local
       * system notification used by the
       * existing app, so only create it on
       * Android. This prevents duplicate
       * alerts on iPhone.
       */
      if (
        Capacitor.getPlatform() ===
        'android'
      ) {

        await showSystemNotification(
          notification
        )
      }
    }
  )


  FirebaseMessaging.addListener(
    'notificationActionPerformed',

    async event => {

      const data =
        event
          ?.notification
          ?.data ||
        {}


      console.log(
        'Push notification tapped:',
        data
      )


      await routeNotification(
        data
      )
    }
  )


  LocalNotifications.addListener(
    'localNotificationActionPerformed',

    async action => {

      const data =
        action
          ?.notification
          ?.extra ||
        action
          ?.notification
          ?.data ||
        {}


      console.log(
        'Foreground system notification tapped:',
        data
      )


      await routeNotification(
        data
      )
    }
  )


  FirebaseMessaging.addListener(
    'tokenReceived',

    async event => {

      currentPushToken =
        event?.token ||
        null


      if (!currentPushToken) {
        return
      }


      console.log(
        'FCM token refreshed.'
      )


      await saveTokenForSignedInUser()
    }
  )


  let permission


  try {

    permission =
      await FirebaseMessaging
        .checkPermissions()


    if (
      permission.receive ===
        'prompt' ||
      permission.receive ===
        'prompt-with-rationale'
    ) {

      permission =
        await FirebaseMessaging
          .requestPermissions()
    }


  } catch (error) {

    console.error(
      'Unable to check notification permissions:',
      error
    )


    return
  }


  if (
    permission.receive !==
    'granted'
  ) {

    console.warn(
      'Notification permission not granted.'
    )


    return
  }


  if (
    Capacitor.getPlatform() ===
    'android'
  ) {

    await setupNotificationChannel()
  }


  await loadCurrentFcmToken()


  await saveTokenForSignedInUser()
}
