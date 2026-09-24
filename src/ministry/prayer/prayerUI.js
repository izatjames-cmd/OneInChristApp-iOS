import {
  getCurrentMember
} from '../../auth/phoneAuth.js'

import {
  getApprovedMember
} from '../../auth/appState.js'

import {
  getAdminAccess
} from '../../auth/adminAccessStore.js'

import {
  returnToMemberArea
} from '../../members/memberNavigation.js'

import {
  createPrayerShell
} from './prayerShell.js'

import {
  renderPrayerDashboard
} from './prayerDashboard.js'

import {
  renderPrayerRequests
} from './prayerRequests.js'

import {
  renderPrayerMeetings
} from './prayerMeetings.js'

import {
  renderPrayerAnnouncements
} from './prayerAnnouncements.js'

import {
  renderPrayerResources
} from './prayerResources.js'

import {
  renderPrayerSettings
} from './prayerSettings.js'

import {
  canManagePrayer
} from './prayerPermissions.js'

import {
  savePrayerMeetingResponse
} from './prayerStore.js'


let currentUser =
  null

let currentMember =
  null

let currentAdminAccess =
  null


export async function openPrayerSection(
  initialTab = 'dashboard'
) {

  let overlay =
    document.getElementById(
      'prayer-overlay'
    )


  if (!overlay) {

    overlay =
      document.createElement('div')

    overlay.id =
      'prayer-overlay'
    overlay.style.position =
      'fixed'
    overlay.style.inset =
      '0'
    overlay.style.background =
      'rgba(0,0,0,.55)'
    overlay.style.zIndex =
      '100000'
    overlay.style.display =
      'flex'
    overlay.style.alignItems =
      'center'
    overlay.style.justifyContent =
      'center'
    overlay.style.padding =
      '20px'

    overlay.innerHTML = `
      <div
        style="
          width:100%;
          max-width:520px;
          max-height:90vh;
          overflow-y:auto;
          background:#fffdf8;
          border-radius:12px;
          padding:22px;
          box-sizing:border-box;
          font-family:Arial,sans-serif;
        "
      >
        <button
          id="close-prayer-top-button"
          type="button"
          style="
            float:right;
            padding:7px 10px;
            margin-bottom:10px;
            line-height:1;
          "
        >
          Close
        </button>

        <div id="prayer-content"></div>

        <button id="close-prayer-button" type="button" style="width:100%; margin-top:20px; padding:12px;">
          Close
        </button>
      </div>
    `

    document.body.appendChild(
      overlay
    )

    document
      .getElementById('close-prayer-button')
      .addEventListener(
        'click',
        closePrayerSection
      )


    document
      .getElementById('close-prayer-top-button')
      .addEventListener(
        'click',
        closePrayerSection
      )

  } else {

    overlay.style.display =
      'flex'
  }


  await loadPrayerContext()
  renderPrayerShell()
  await showPrayerTab(
    initialTab
  )
}


function closePrayerSection() {

  document
    .getElementById('prayer-overlay')
    .style.display =
      'none'

  returnToMemberArea()
}


async function loadPrayerContext() {

  currentUser =
    await getCurrentMember()

  currentMember =
    getApprovedMember()

  currentAdminAccess =
    currentUser?.uid
      ? await getAdminAccess(
          currentUser.uid
        )
      : null
}


function renderPrayerShell() {

  const content =
    document.getElementById(
      'prayer-content'
    )

  content.innerHTML =
    createPrayerShell(
      canManageCurrentPrayer()
    )

  bindPrayerTabs(content)
}


async function showPrayerTab(
  tab
) {

  const container =
    document.getElementById(
      'prayer-dashboard'
    )

  if (!container) {
    return
  }


  container.innerHTML =
    '<p>Loading Prayer...</p>'


  try {

    if (tab === 'requests') {
      await renderPrayerRequests({
        container,
        user:
          currentUser,
        member:
          currentMember,
        onRefresh:
          async () => showPrayerTab('requests')
      })
    } else if (tab === 'meetings') {
      await renderPrayerMeetings(container)
      bindPrayerMeetingButtons(container)
    } else if (tab === 'announcements') {
      await renderPrayerAnnouncements(container)
    } else if (tab === 'resources') {
      await renderPrayerResources(container)
    } else if (
      tab === 'admin' &&
      canManageCurrentPrayer()
    ) {
      await renderPrayerSettings({
        container,
        user:
          currentUser,
        member:
          currentMember,
        adminAccess:
          currentAdminAccess,
        onRefresh:
          async () => showPrayerTab('admin')
      })
    } else {
      await renderPrayerDashboard(container)
      bindPrayerMeetingButtons(container)
    }

    bindPrayerTabs(
      document.getElementById(
        'prayer-content'
      )
    )

  } catch (error) {

    console.error(
      'Unable to load Prayer section:',
      error
    )

    container.innerHTML =
      '<p>Unable to load Prayer section.</p>'
  }
}


function bindPrayerTabs(
  container
) {

  container
    ?.querySelectorAll('[data-prayer-tab]')
    .forEach(
      button => {

        if (button.dataset.bound === 'true') {
          return
        }

        button.dataset.bound =
          'true'

        button.addEventListener(
          'click',
          async () => {
            await showPrayerTab(
              button.dataset.prayerTab
            )
          }
        )
      }
    )
}


function bindPrayerMeetingButtons(
  container
) {

  container
    .querySelectorAll('[data-prayer-response]')
    .forEach(
      button => {

        button.addEventListener(
          'click',
          async () => {

            await savePrayerMeetingResponse({
              meetingId:
                button.dataset.prayerMeetingId,
              uid:
                currentUser?.uid,
              name:
                getMemberName(),
              response:
                button.dataset.prayerResponse
            })

            const status =
              button
                .closest('[data-prayer-meeting-card]')
                ?.querySelector('[data-prayer-meeting-status]')

            if (status) {
              status.textContent =
                'Response saved.'
            }

            await showPrayerTab(
              'meetings'
            )
          }
        )
      }
    )
}


function canManageCurrentPrayer() {

  return canManagePrayer(
    currentMember,
    currentAdminAccess
  )
}


function getMemberName() {

  return currentMember?.name ||
    currentUser?.email ||
    'Member'
}
