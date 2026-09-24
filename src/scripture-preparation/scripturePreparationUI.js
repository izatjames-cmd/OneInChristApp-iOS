import {
  getCurrentMember
} from '../auth/phoneAuth.js'

import {
  getApprovedMember
} from '../auth/appState.js'

import {
  getAdminAccess
} from '../auth/adminAccessStore.js'

import {
  createScripturePreparationShell
} from './scripturePreparationShell.js'

import {
  renderScripturePreparationDashboard
} from './scripturePreparationDashboard.js'

import {
  renderScripturePreparationEditor
} from './scripturePreparationEditor.js'

import {
  canManageScripturePreparation,
  canPrepareScripture,
  canCommunicateScripturePreparation
} from './scripturePreparationPermissions.js'

import {
  renderScripturePreparationCommunication
} from './scripturePreparationCommunication.js'

import {
  returnToMemberArea
} from '../members/memberNavigation.js'


let currentUser =
  null

let currentMember =
  null

let currentAdminAccess =
  null


export async function openScripturePreparationSection(
  initialTab = 'dashboard'
) {

  let overlay =
    document.getElementById(
      'scripture-preparation-overlay'
    )


  if (!overlay) {

    overlay =
      document.createElement(
        'div'
      )

    overlay.id =
      'scripture-preparation-overlay'
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

    overlay.innerHTML =
      `
        <div
          style="
            width:100%;
            max-width:560px;
            max-height:90vh;
            overflow-y:auto;
            background:#fffdf8;
            border-radius:12px;
            padding:14px;
            box-sizing:border-box;
            font-family:Arial,sans-serif;
          "
        >
          <div
            style="
              display:flex;
              justify-content:flex-end;
              margin-bottom:8px;
            "
          >
            <button
              id="close-scripture-preparation-top-button"
              type="button"
              style="padding:8px 12px; font-weight:700;"
            >
              Close
            </button>
          </div>

          <div id="scripture-preparation-content"></div>

          <button
            id="close-scripture-preparation-button"
            type="button"
            style="width:100%; margin-top:16px; padding:12px;"
          >
            Close
          </button>
        </div>
      `

    document.body.appendChild(
      overlay
    )

    const closeScripturePreparation =
      () => {
        overlay.style.display =
          'none'

        returnToMemberArea()
      }


    document
      .getElementById(
        'close-scripture-preparation-top-button'
      )
      ?.addEventListener(
        'click',
        closeScripturePreparation
      )


    document
      .getElementById(
        'close-scripture-preparation-button'
      )
      ?.addEventListener(
        'click',
        closeScripturePreparation
      )

  } else {

    overlay.style.display =
      'flex'
  }


  await loadScripturePreparationContext()
  renderScripturePreparationShell()
  await showScripturePreparationTab(
    initialTab
  )
}


async function loadScripturePreparationContext() {

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


function renderScripturePreparationShell() {

  const content =
    document.getElementById(
      'scripture-preparation-content'
    )

  if (!content) {
    return
  }


  content.innerHTML =
    createScripturePreparationShell(
      canManageCurrentScripturePreparation(),
      canCommunicateCurrentScripturePreparation()
    )

  bindScripturePreparationTabs(
    content
  )
}


async function showScripturePreparationTab(
  tab
) {

  const container =
    document.getElementById(
      'scripture-preparation-dashboard'
    )

  if (!container) {
    return
  }


  container.innerHTML =
    '<p>Loading Scripture Preparation...</p>'


  try {

    if (tab === 'communication' && canCommunicateCurrentScripturePreparation()) {
      await renderScripturePreparationCommunication({
        container,
        user: currentUser,
        member: currentMember,
        adminAccess: currentAdminAccess
      })
      bindScripturePreparationTabs(document.getElementById('scripture-preparation-content'))
      return
    }

    if (
      tab === 'prepare' ||
      (
        tab === 'admin' &&
        canManageCurrentScripturePreparation()
      )
    ) {

      if (!canPrepareCurrentScripture()) {

        container.innerHTML =
          '<p>You do not have Scripture Preparation permission.</p>'

        return
      }


      await renderScripturePreparationEditor({
        container,
        user:
          currentUser,
        canDelete:
          canManageCurrentScripturePreparation(),
        onSaved:
          async () => showScripturePreparationTab(
            tab
          )
      })

    } else {

      await renderScripturePreparationDashboard({
        container,
        onQuickEdit:
          async () => showScripturePreparationTab(
            'prepare'
          )
      })
    }


    bindScripturePreparationTabs(
      document.getElementById(
        'scripture-preparation-content'
      )
    )

  } catch (error) {

    console.error(
      'Unable to load Scripture Preparation:',
      error
    )

    container.innerHTML =
      '<p>Unable to load Scripture Preparation.</p>'
  }
}


function bindScripturePreparationTabs(
  container
) {

  container
    ?.querySelectorAll(
      '[data-scripture-preparation-tab]'
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
            await showScripturePreparationTab(
              button.dataset
                .scripturePreparationTab
            )
          }
        )
      }
    )
}


function canPrepareCurrentScripture() {

  return canPrepareScripture(
    currentMember,
    currentAdminAccess
  )
}


function canManageCurrentScripturePreparation() {

  return canManageScripturePreparation(
    currentMember,
    currentAdminAccess
  )
}

function canCommunicateCurrentScripturePreparation() {
  return canCommunicateScripturePreparation(currentMember, currentAdminAccess)
}
