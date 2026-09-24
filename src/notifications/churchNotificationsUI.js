import { NOTIFICATION_GROUPS, getNotificationGroupKey } from './notificationGroups.js'
import {
  getCurrentMember
} from '../auth/phoneAuth.js'

import {
  getAdminAccess
} from '../auth/adminAccessStore.js'

import {
  returnToMemberArea
} from '../members/memberNavigation.js'

import {
  getChurchNotifications,
  getChurchNotification,
  createChurchNotification,
  deleteChurchNotification,
  deleteChurchNotificationSection
} from './notificationStore.js'

import {
  getNotificationCategoryForSection
} from './notificationCategory.js'


let statusRefreshRun = 0


function closeChurchNotifications() {

  document
    .querySelector(
      '#church-notifications-overlay'
    )
    .style.display =
      'none'

  returnToMemberArea()
}


export function setupChurchNotificationsUI() {

  document
    .querySelector(
      '#close-church-notifications-button'
    )
    .addEventListener(
      'click',
      closeChurchNotifications
    )


  document
    .querySelector(
      '#close-church-notifications-top-button'
    )
    .addEventListener(
      'click',
      closeChurchNotifications
    )


  document
    .querySelector(
      '#close-church-admin-button'
    )
    .addEventListener(
      'click',
      () => {

        document
          .querySelector(
            '#church-admin-overlay'
          )
          .style.display =
            'none'
      }
    )


  document
    .querySelector(
      '#church-notification-form'
    )
    .addEventListener(
      'submit',
      saveNotification
    )


  document
    .querySelector(
      '#church-notification-send-mode'
    )
    .addEventListener(
      'change',
      updateScheduleFields
    )


  updateScheduleFields()
}


function updateScheduleFields() {

  const sendMode =
    document
      .querySelector(
        '#church-notification-send-mode'
      )
      .value


  const scheduleFields =
    document
      .querySelector(
        '#notification-schedule-fields'
      )


  scheduleFields.style.display =
    sendMode === 'scheduled'
      ? 'block'
      : 'none'
}


const NOTIFICATION_RETENTION_DAYS = 7


function formatNotificationDate(
  notification
) {

  const value =
    notification?.createdAt ||
    notification?.date ||
    ''

  if (!value) {
    return ''
  }


  const date =
    new Date(value)

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return String(value)
  }


  try {

    return date.toLocaleString(
      undefined,
      {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      }
    )

  } catch {
    return date.toLocaleString()
  }
}


function createNotificationCard({
  notification,
  canManageNotifications
}) {

  const card =
    document.createElement(
      'div'
    )


  card.style.border =
    '1px solid #dddddd'

  card.style.borderRadius =
    '10px'

  card.style.background =
    '#ffffff'

  card.style.padding =
    '14px'

  card.style.marginTop =
    '10px'


  const sendInfo =
    notification.sendMode ===
    'scheduled'
      ? `${
          notification.date || ''
        } ${
          notification.time || ''
        }`.trim()
      : formatNotificationDate(
          notification
        )


  const status =
    notification.status ||
    ''


  card.innerHTML = `
    <h3
      style="
        margin-top:0;
        margin-bottom:8px;
        font-size:17px;
      "
    >
      ${escapeHtml(
        notification.title ||
        'Notification'
      )}
    </h3>

    <div
      style="
        font-size:12px;
        margin-bottom:8px;
        color:#666;
      "
    >
      ${sendInfo
        ? escapeHtml(sendInfo)
        : ''
      }

      ${sendInfo
        ? '&nbsp;•&nbsp;'
        : ''
      }

      Opens:
      ${escapeHtml(
        formatSection(
          notification.section
        )
      )}
    </div>

    <div
      style="
        white-space:pre-wrap;
        line-height:1.5;
      "
    >
      ${escapeHtml(
        notification.message ||
        ''
      )}
    </div>
  `


  if (
    canManageNotifications
  ) {

    const adminInfo =
      document.createElement(
        'div'
      )

    adminInfo.style.fontSize =
      '12px'

    adminInfo.style.color =
      '#666'

    adminInfo.style.marginTop =
      '10px'

    adminInfo.innerHTML = `
      Status:
      <strong>
        ${escapeHtml(
          formatStatus(status)
        )}
      </strong>
    `

    card.appendChild(
      adminInfo
    )


    const deleteButton =
      document.createElement(
        'button'
      )

    deleteButton.type =
      'button'

    deleteButton.textContent =
      'Delete Notification'

    deleteButton.style.marginTop =
      '10px'

    deleteButton.style.width =
      '100%'

    deleteButton.style.padding =
      '10px'

    deleteButton.style.border =
      '1px solid #dddddd'

    deleteButton.style.borderRadius =
      '10px'

    deleteButton.style.background =
      '#fff8e8'

    deleteButton.style.color =
      '#202124'

    deleteButton.style.fontWeight =
      '700'


    deleteButton.addEventListener(
      'click',
      async event => {

        event.preventDefault()
        event.stopPropagation()

        await deleteNotification(
          notification.id
        )
      }
    )


    card.appendChild(
      deleteButton
    )
  }


  return card
}


function createNotificationGroup({
  group,
  notifications,
  canManageNotifications,
  openByDefault
}) {

  const details =
    document.createElement(
      'details'
    )


  details.open =
    false

  details.style.border =
    '1px solid #dddddd'

  details.style.borderRadius =
    '10px'

  details.style.background =
    '#fff8e8'

  details.style.marginBottom =
    '12px'

  details.style.overflow =
    'hidden'


  const summary =
    document.createElement(
      'summary'
    )

  summary.style.padding =
    '14px'

  summary.style.cursor =
    'pointer'

  summary.style.fontSize =
    '16px'

  summary.style.fontWeight =
    '700'

  summary.style.userSelect =
    'none'

  summary.textContent =
    `${group.label} (${notifications.length})`


  const body =
    document.createElement(
      'div'
    )

  body.style.padding =
    '0 12px 12px'

  if (canManageNotifications) {
    const deleteAll = document.createElement('button')
    deleteAll.type = 'button'
    deleteAll.textContent = 'Delete all notifications in this section'
    deleteAll.setAttribute('aria-label', `Delete all ${group.label} notifications`)
    deleteAll.style.cssText = 'width:100%;min-height:44px;padding:12px;margin:0 0 12px;border:1px solid #b42318;border-radius:8px;background:#fff1f0;color:#b42318;font-weight:600;cursor:pointer'
    deleteAll.addEventListener('click', async () => {
      if (deleteAll.disabled) return
      if (!confirm(`Delete all stored notifications in ${group.label} for everyone? This includes older and scheduled notifications. Other sections will not be affected. This cannot be undone.`)) return
      deleteAll.disabled = true
      deleteAll.textContent = 'Deleting…'
      try {
        const result = await deleteChurchNotificationSection(group.key)
        if (result.failed) {
          alert(`Deleted ${result.deleted} notifications from ${group.label}. ${result.failed} could not be deleted. Please try again.`)
        }
        await openChurchNotifications()
      } catch (error) {
        alert(`Unable to delete ${group.label} notifications: ${error?.message || error}`)
      } finally {
        deleteAll.disabled = false
        deleteAll.textContent = 'Delete all notifications in this section'
      }
    })
    body.appendChild(deleteAll)
  }


  notifications.forEach(
    notification => {

      body.appendChild(
        createNotificationCard({
          notification,
          canManageNotifications
        })
      )
    }
  )


  details.appendChild(
    summary
  )

  details.appendChild(
    body
  )


  return details
}


export async function openChurchNotifications() {

  const overlay =
    document.querySelector(
      '#church-notifications-overlay'
    )

  const adminArea =
    document.querySelector(
      '#church-notification-admin-area'
    )

  const content =
    document.querySelector(
      '#church-notification-content'
    )


  overlay.style.display =
    'flex'


  adminArea.innerHTML =
    ''


  content.innerHTML =
    '<p>Loading notifications...</p>'


  try {

    const user =
      await getCurrentMember()


    const access =
      await getAdminAccess(
        user?.uid
      )


    const canManageNotifications =
      access?.churchAdmin ===
      true


    if (
      canManageNotifications
    ) {

      const button =
        document.createElement(
          'button'
        )


      button.textContent =
        'Create Notification'


      button.style.width =
        '100%'

      button.style.padding =
        '12px'

      button.style.border =
        '1px solid #dddddd'

      button.style.borderRadius =
        '10px'

      button.style.background =
        '#fff8e8'

      button.style.color =
        '#202124'

      button.style.fontSize =
        '16px'

      button.style.fontWeight =
        'bold'

      button.style.marginBottom =
        '18px'


      button.addEventListener(
        'click',
        openNotificationForm
      )


      adminArea.appendChild(
        button
      )
    }


    const notifications =
      await getChurchNotifications(
        NOTIFICATION_RETENTION_DAYS
      )


    if (!notifications.length) {

      content.innerHTML = `
        <p>
          No notifications from the last ${NOTIFICATION_RETENTION_DAYS} days.
        </p>

        <p
          style="
            font-size:13px;
            color:#666;
            line-height:1.45;
          "
        >
          Church notifications are kept for ${NOTIFICATION_RETENTION_DAYS} days and are then removed automatically.
        </p>
      `

      return
    }


    content.innerHTML = `
      <div
        style="
          margin-bottom:14px;
          font-size:13px;
          color:#666;
          line-height:1.45;
        "
      >
        Notifications are grouped by section. They remain here for ${NOTIFICATION_RETENTION_DAYS} days.
      </div>
    `


    const grouped =
      new Map()


    notifications.forEach(
      notification => {

        const key =
          getNotificationGroupKey(
            notification
          )

        if (!grouped.has(key)) {
          grouped.set(
            key,
            []
          )
        }

        grouped
          .get(key)
          .push(notification)
      }
    )


    NOTIFICATION_GROUPS.forEach(
      group => {

        const groupNotifications =
          grouped.get(
            group.key
          ) || []


        if (!groupNotifications.length) {
          return
        }


        content.appendChild(
          createNotificationGroup({
            group,
            notifications:
              groupNotifications,
            canManageNotifications,
            openByDefault:
              false
          })
        )
      }
    )

  } catch (error) {

    console.error(
      'Unable to load notifications:',
      error
    )


    content.innerHTML =
      '<p>Unable to load notifications.</p>'
  }
}


function openNotificationForm() {

  document
    .querySelector(
      '#church-notification-title'
    )
    .value = ''


  document
    .querySelector(
      '#church-notification-message'
    )
    .value = ''


  document
    .querySelector(
      '#church-notification-section'
    )
    .value = 'church'


  document
    .querySelector(
      '#church-notification-send-mode'
    )
    .value = 'now'


  document
    .querySelector(
      '#church-notification-date'
    )
    .value = ''


  document
    .querySelector(
      '#church-notification-time'
    )
    .value = ''


  document
    .querySelector(
      '#church-admin-status'
    )
    .textContent = ''


  updateScheduleFields()


  document
    .querySelector(
      '#church-admin-overlay'
    )
    .style.display =
      'flex'
}


async function saveNotification(
  event
) {

  event.preventDefault()


  const title =
    document
      .querySelector(
        '#church-notification-title'
      )
      .value
      .trim()


  const message =
    document
      .querySelector(
        '#church-notification-message'
      )
      .value
      .trim()


  const section =
    document
      .querySelector(
        '#church-notification-section'
      )
      .value


  const category =
    getNotificationCategoryForSection(
      section
    )


  const sendMode =
    document
      .querySelector(
        '#church-notification-send-mode'
      )
      .value


  const date =
    document
      .querySelector(
        '#church-notification-date'
      )
      .value


  const time =
    document
      .querySelector(
        '#church-notification-time'
      )
      .value


  const status =
    document.querySelector(
      '#church-admin-status'
    )


  const button =
    document.querySelector(
      '#save-church-notification-button'
    )


  if (
    !title ||
    !message
  ) {

    status.textContent =
      'Please enter a title and message.'

    return
  }


  if (
    sendMode === 'scheduled' &&
    (!date || !time)
  ) {

    status.textContent =
      'Please choose the scheduled date and time.'

    return
  }


  button.disabled =
    true


  button.textContent =
    sendMode === 'now'
      ? 'Sending...'
      : 'Scheduling...'


  try {

    const user =
      await getCurrentMember()


    if (!user?.uid) {

      status.textContent =
        'Please sign in again.'

      return
    }


    const notificationId =
      await createChurchNotification({
        title,
        message,
        category,
        section,
        targetId:
          null,
        sendMode,
        date:
          sendMode ===
          'scheduled'
            ? date
            : '',
        time:
          sendMode ===
          'scheduled'
            ? time
            : '',
        uid:
          user.uid
      })


    if (
      sendMode ===
      'scheduled'
    ) {

      status.textContent =
        'Notification scheduled successfully.'

      await openChurchNotifications()

    } else {

      status.textContent =
        'Notification queued. Waiting for Firebase...'

      await openChurchNotifications()

      watchNotificationStatus(
        notificationId
      )
    }


    setTimeout(
      () => {

        document
          .querySelector(
            '#church-admin-overlay'
          )
          .style.display =
            'none'
      },
      700
    )


  } catch (error) {

    console.error(
      'Unable to create notification:',
      error
    )


    status.textContent =
      `Unable to save: ${
        error?.message || error
      }`


  } finally {

    button.disabled =
      false


    button.textContent =
      'Create Notification'
  }
}


async function deleteNotification(
  notificationId
) {

  if (
    !notificationId
  ) {
    return
  }


  if (
    !confirm(
      'Delete this church notification?'
    )
  ) {
    return
  }


  try {

    await deleteChurchNotification(
      notificationId
    )


    await openChurchNotifications()

  } catch (error) {

    console.error(
      'Unable to delete notification:',
      error
    )


    alert(
      `Unable to delete notification: ${
        error?.message || error
      }`
    )
  }
}


async function watchNotificationStatus(
  notificationId
) {

  const thisRun =
    ++statusRefreshRun


  const maximumChecks =
    10


  for (
    let check = 0;
    check < maximumChecks;
    check++
  ) {

    await delay(
      1500
    )


    if (
      thisRun !==
      statusRefreshRun
    ) {
      return
    }


    try {

      const notification =
        await getChurchNotification(
          notificationId
        )


      if (!notification) {
        continue
      }


      if (
        notification.status ===
          'sent' ||
        notification.status ===
          'failed'
      ) {

        await openChurchNotifications()

        return
      }


    } catch (error) {

      console.error(
        'Status refresh failed:',
        error
      )
    }
  }


  await openChurchNotifications()
}


function delay(milliseconds) {

  return new Promise(
    resolve =>
      setTimeout(
        resolve,
        milliseconds
      )
  )
}


function formatStatus(status) {

  switch (status) {

    case 'pending':
      return 'Pending'

    case 'sent':
      return 'Sent'

    case 'scheduled':
      return 'Scheduled'

    case 'failed':
      return 'Failed'

    default:
      return status || 'Unknown'
  }
}


function formatSection(section) {

  switch (section) {

    case 'church':
      return 'Church'

    case 'food':
      return 'Food'

    case 'choir':
      return 'Choir'

    case 'youth':
      return 'Youth'

    case 'prayer':
      return 'Prayer'

    case 'sunday-school':
    case 'sundaySchool':
      return 'Sunday School'

    case 'scripture-preparation':
    case 'scripturePreparation':
      return 'Scripture Preparation'

    case 'danish-language':
    case 'danishLanguage':
    case 'language-school':
    case 'languageSchool':
      return 'Language School'

    case 'daily-devotion':
    case 'dailyDevotion':
      return 'Daily Devotion'

    case 'ai-bible-reading':
    case 'aiBibleReading':
      return 'Daily Bible Reading'

    case 'plan':
      return 'Service Plan'

    case 'board':
      return 'Board'

    default:
      return section || 'Church'
  }
}


function formatCategory(category) {

  const categories = {
    general:
      'General',

    service:
      'Service',

    sermon:
      'Sermon',

    sundaySchool:
      'Sunday School',

    danishClass:
      'Danish Class',

    danishLanguage:
      'Language School',

    prayer:
      'Prayer Meeting',

    choir:
      'Choir',

    youth:
      'Youth',

    food:
      'Food',

    dailyDevotion:
      'Daily Devotion',

    aiBibleReading:
      'Daily Bible Reading',

    holiday:
      'Holiday',

    news:
      'News'
  }


  return (
    categories[category] ||
    category ||
    'General'
  )
}


function escapeHtml(value) {

  return String(value)
    .replaceAll(
      '&',
      '&amp;'
    )
    .replaceAll(
      '<',
      '&lt;'
    )
    .replaceAll(
      '>',
      '&gt;'
    )
    .replaceAll(
      '"',
      '&quot;'
    )
    .replaceAll(
      "'",
      '&#039;'
    )
}
