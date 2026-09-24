import {
  createChurchNotification
} from '../notifications/notificationStore.js'


export async function notifyFoodEventCreated({
  uid,
  eventId,
  title,
  date,
  time
}) {

  await createChurchNotification({
    title:
      'New Food Event',
    message:
      buildFoodEventMessage({
        title,
        date,
        time,
        updated: false
      }),
    category:
      'food',
    section:
      'food',
    targetId:
      eventId || null,
    sendMode:
      'now',
    uid
  })
}


export async function notifyFoodEventUpdated({
  uid,
  eventId,
  title,
  date,
  time
}) {

  await createChurchNotification({
    title:
      'Food Event Updated',
    message:
      buildFoodEventMessage({
        title,
        date,
        time,
        updated: true
      }),
    category:
      'food',
    section:
      'food',
    targetId:
      eventId || null,
    sendMode:
      'now',
    uid
  })
}


function buildFoodEventMessage({
  title,
  date,
  time,
  updated
}) {

  const eventTitle =
    String(
      title || 'Food event'
    ).trim()


  const when =
    [
      date,
      time
    ]
      .filter(Boolean)
      .join(' at ')


  if (updated) {
    return when
      ? `${eventTitle} has been updated. The current date/time is ${when}. Please check the Food section for the latest details.`
      : `${eventTitle} has been updated. Please check the Food section for the latest details.`
  }


  return when
    ? `${eventTitle} has been created for ${when}. Open the Food section for details and registration.`
    : `${eventTitle} has been created. Open the Food section for details and registration.`
}
