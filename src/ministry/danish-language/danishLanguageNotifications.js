import {
  createChurchNotification
} from '../../notifications/notificationStore.js'


export async function notifyDanishLanguageClassCreated({
  uid,
  title,
  date,
  time
}) {

  await createDanishLanguageNotification({
    uid,
    title:
      title || 'Danish Language Class',
    message:
      createClassMessage(
        date,
        time
      ),
    targetId:
      'classes'
  })
}


export async function notifyDanishLanguageAnnouncementCreated({
  uid,
  title,
  message
}) {

  await createDanishLanguageNotification({
    uid,
    title:
      title || 'Danish Language Announcement',
    message:
      message || 'A new Danish Language announcement is available.',
    targetId:
      'announcements'
  })
}


export async function notifyDanishLanguageMaterialCreated({
  uid,
  title
}) {

  await createDanishLanguageNotification({
    uid,
    title:
      title || 'Danish Language Material',
    message:
      'New Danish Language course material is available.',
    targetId:
      'materials'
  })
}


async function createDanishLanguageNotification({
  uid,
  title,
  message,
  targetId
}) {

  await createChurchNotification({
    title,
    message,
    category:
      'danishLanguage',
    section:
      'danish-language',
    targetId,
    sendMode:
      'now',
    uid
  })
}


function createClassMessage(
  date,
  time
) {

  const when =
    `${date || ''} ${time || ''}`
      .trim()


  if (!when) {
    return 'A new Danish Language class has been created.'
  }


  return `A new Danish Language class has been created for ${when}.`
}
