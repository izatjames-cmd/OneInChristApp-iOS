import {
  createChurchNotification
} from '../notifications/notificationStore.js'


export async function notifyChoirPreparationSubmitted({
  uid,
  planId,
  title,
  date
}) {

  await createChurchNotification({
    title:
      'Choir Plan Ready for Review',
    message:
      date
        ? `Choir plan is ready for ${date}. Please review the hymns and audio message.`
        : 'Choir plan is ready. Please review the hymns and audio message.',
    category:
      'choir',
    section:
      'choir',
    audience:
      'choir',
    targetId:
      planId || null,
    sendMode:
      'now',
    uid
  })
}


export async function notifyChoirFeedbackSubmitted({
  uid,
  planId,
  name
}) {

  await createChurchNotification({
    title:
      'Choir Member Response',
    message:
      name
        ? `${name} sent a response to the choir plan.`
        : 'A choir member sent a response to the choir plan.',
    category:
      'choirFeedback',
    section:
      'choir',
    audience:
      'choirAdmin',
    targetId:
      planId || null,
    sendMode:
      'now',
    uid
  })
}