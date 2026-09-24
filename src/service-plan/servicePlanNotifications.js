import {
  createChurchNotification
} from '../notifications/notificationStore.js'


export async function notifyServicePlanPublished({
  uid,
  planId,
  title,
  date
}) {

  await createChurchNotification({
    title:
      title || 'Service Plan Published',
    message:
      date
        ? `The Service Plan for ${date} is ready.`
        : 'The Service Plan is ready.',
    category:
      'service',
    section:
      'plan',
    targetId:
      planId || null,
    sendMode:
      'now',
    uid
  })
}


export async function notifyServicePlanReadyForApproval({
  uid,
  title,
  date
}) {

  await createChurchNotification({
    title:
      'Service Plan Ready for Approval',
    message:
      date
        ? `A Service Plan for ${date} is ready for approval.`
        : 'A Service Plan is ready for approval.',
    category:
      'service',
    section:
      'plan',
    targetId:
      'admin',
    sendMode:
      'now',
    uid
  })
}
