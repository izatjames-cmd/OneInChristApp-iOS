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
  createYouthShell
} from './youthShell.js'

import {
  renderYouthDashboard
} from './youthDashboard.js'

import {
  renderDailyDevotion
} from '../../daily-devotion/dailyDevotionUI.js'

import {
  renderYouthEvents
} from './youthEvents.js'

import {
  renderYouthAnnouncements
} from './youthAnnouncements.js'

import {
  renderYouthAdmin
} from './youthAdmin.js'

import {
  canManageYouth
} from './youthPermissions.js'

import {
  saveYouthEventResponse
} from './youthStore.js'


let currentUser =
  null

let currentMember =
  null

let currentAdminAccess =
  null


export async function openYouthSection(
  initialTab = 'dashboard'
) {

  let overlay =
    document.getElementById(
      'youth-overlay'
    )


  if (!overlay) {

    overlay =
      document.createElement(
        'div'
      )

    overlay.id =
      'youth-overlay'

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
        <div id="youth-content"></div>

        <button
          id="close-youth-button"
          type="button"
          style="
            width:100%;
            margin-top:20px;
            padding:12px;
          "
        >
          Close
        </button>
      </div>
    `

    document.body.appendChild(
      overlay
    )

    document
      .getElementById(
        'close-youth-button'
      )
      .addEventListener(
        'click',
        () => {
          overlay.style.display =
            'none'

          returnToMemberArea()
        }
      )

  } else {

    overlay.style.display =
      'flex'
  }


  await loadYouthContext()
  renderYouthShell()
  await showYouthTab(
    initialTab
  )
}


async function loadYouthContext() {

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


function renderYouthShell() {

  const content =
    document.getElementById(
      'youth-content'
    )

  content.innerHTML =
    createYouthShell(
      canManageCurrentYouth()
    )

  bindYouthTabs(content)
}


async function showYouthTab(
  tab
) {

  const container =
    document.getElementById(
      'youth-dashboard'
    )

  if (!container) {
    return
  }

  container.innerHTML =
    '<p>Loading Youth...</p>'

  try {

    if (tab === 'devotion') {
      await renderDailyDevotion(container)
    } else if (tab === 'events') {
      await renderYouthEvents(container)
      bindYouthEventButtons(container)
    } else if (tab === 'announcements') {
      await renderYouthAnnouncements(container)
    } else if (
      tab === 'admin' &&
      canManageCurrentYouth()
    ) {
      await renderYouthAdmin({
        container,
        user:
          currentUser,
        member:
          currentMember,
        adminAccess:
          currentAdminAccess,
        onRefresh:
          async () => showYouthTab('admin')
      })
    } else {
      await renderYouthDashboard(container)
      bindYouthEventButtons(container)
    }

    bindYouthTabs(
      document.getElementById(
        'youth-content'
      )
    )

  } catch (error) {

    console.error(
      'Unable to load Youth section:',
      error
    )

    container.innerHTML =
      '<p>Unable to load Youth section.</p>'
  }
}


function bindYouthTabs(
  container
) {

  container
    ?.querySelectorAll(
      '[data-youth-tab]'
    )
    .forEach(
      button => {

        if (
          button.dataset.bound ===
          'true'
        ) {
          return
        }

        button.dataset.bound =
          'true'

        button.addEventListener(
          'click',
          async () => {
            await showYouthTab(
              button.dataset.youthTab
            )
          }
        )
      }
    )
}


function bindYouthEventButtons(
  container
) {

  container
    .querySelectorAll(
      '[data-youth-response]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          async () => {

            await saveYouthEventResponse({
              eventId:
                button.dataset.youthEventId,
              uid:
                currentUser?.uid,
              name:
                getMemberName(),
              response:
                button.dataset.youthResponse
            })

            const status =
              button
                .closest(
                  '[data-youth-event-card]'
                )
                ?.querySelector(
                  '[data-youth-event-status]'
                )

            if (status) {
              status.textContent =
                'Response saved.'
            }
          }
        )
      }
    )
}


function canManageCurrentYouth() {

  return canManageYouth(
    currentMember,
    currentAdminAccess
  )
}


function getMemberName() {

  return currentMember?.name ||
    currentUser?.email ||
    'Member'
}
