import {
  Capacitor
} from '@capacitor/core'

import {
  PushNotifications
} from '@capacitor/push-notifications'

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
      'Unable to create notification channel:',
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
   * When Firebase receives a message
   * while the app is OPEN, display it
   * as a normal Android system
   * notification.
   */
  PushNotifications.addListener(
    'pushNotificationReceived',

    async notification => {

      console.log(
        'Foreground push received:',
        notification
      )


      await showSystemNotification(
        notification
      )
    }
  )


  /*
   * Firebase notification tapped while
   * app was backgrounded or closed.
   */
  PushNotifications.addListener(
    'pushNotificationActionPerformed',

    async action => {

      const data =
        action
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


  /*
   * System notification created locally
   * while the app was already open.
   */
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


  PushNotifications.addListener(
    'registration',

    async token => {

      currentPushToken =
        token.value


      console.log(
        'Push token:',
        token.value
      )


      await saveTokenForSignedInUser()
    }
  )


  PushNotifications.addListener(
    'registrationError',

    error => {

      console.error(
        'Push registration error:',
        error
      )
    }
  )


  let permission =
    await PushNotifications
      .checkPermissions()


  if (
    permission.receive ===
    'prompt'
  ) {

    permission =
      await PushNotifications
        .requestPermissions()
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


    /*
     * Android notification channels are
     * required for Firebase notifications
     * while the app is backgrounded or
     * closed. iOS does not use channels.
     */
    await PushNotifications.createChannel({

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
  }


  await PushNotifications.register()
}