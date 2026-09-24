import {
  createChurchNotification
} from '../notifications/notificationStore.js'


export async function notifyScripturePreparationSubmitted({
  uid,
  serviceDate
}) {

  await createChurchNotification({
    title:
      'Scripture Preparation Submitted',
    message:
      serviceDate
        ? `Scripture preparation has been submitted for ${serviceDate}.`
        : 'Scripture preparation has been submitted.',
    category:
      'service',
    section:
      'scripture-preparation',
    targetId:
      'dashboard',
    sendMode:
      'now',
    uid
  })
}
