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
  createDanishLanguageShell
} from './danishLanguageShell.js'

import {
  renderDanishLanguageDashboard
} from './danishLanguageDashboard.js'

import {
  renderDanishLanguageClasses
} from './danishLanguageClasses.js'

import {
  renderDanishLanguageAnnouncements
} from './danishLanguageAnnouncements.js'

import {
  renderDanishLanguageMaterials
} from './danishLanguageMaterials.js'

import {
  renderDanishLanguageStudents
} from './danishLanguageStudents.js'

import {
  renderDanishLanguageAdmin
} from './danishLanguageAdmin.js'

import {
  canManageDanishLanguage
} from './danishLanguagePermissions.js'


let currentUser =
  null

let currentMember =
  null

let currentAdminAccess =
  null


export async function openDanishLanguageSection(
  initialTab = 'dashboard'
) {

  let overlay =
    document.getElementById(
      'danish-language-overlay'
    )


  if (!overlay) {

    overlay =
      document.createElement(
        'div'
      )

    overlay.id =
      'danish-language-overlay'

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
            overflow:auto;
            background:#fffdf8;
            border-radius:10px;
            padding:18px;
            box-sizing:border-box;
            font-family:Arial,sans-serif;
          "
        >
          <button
            id="close-danish-language-top-button"
            type="button"
            style="float:right; padding:7px 10px; margin-bottom:10px;"
          >
            Close
          </button>

          <div id="danish-language-content"></div>

          <button
            id="close-danish-language-button"
            type="button"
            style="width:100%; margin-top:20px; padding:12px;"
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
        'close-danish-language-top-button'
      )
      .addEventListener(
        'click',
        closeDanishLanguageSection
      )

    document
      .getElementById(
        'close-danish-language-button'
      )
      .addEventListener(
        'click',
        closeDanishLanguageSection
      )

  } else {

    overlay.style.display =
      'flex'
  }


  await loadDanishLanguageContext()
  renderDanishLanguageShell()
  await showDanishLanguageTab(
    initialTab
  )
}


function closeDanishLanguageSection() {

  document
    .getElementById(
      'danish-language-overlay'
    )
    .style.display =
      'none'

  returnToMemberArea()
}


async function loadDanishLanguageContext() {

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


function renderDanishLanguageShell() {

  const content =
    document.getElementById(
      'danish-language-content'
    )

  if (!content) {
    return
  }


  content.innerHTML =
    createDanishLanguageShell(
      canManageCurrentDanishLanguage()
    )

  bindDanishLanguageTabs(
    content
  )
}


async function showDanishLanguageTab(
  tab
) {

  const container =
    document.getElementById(
      'danish-language-dashboard'
    )

  if (!container) {
    return
  }


  container.innerHTML =
    '<p>Loading Danish Language...</p>'


  try {

    if (tab === 'classes') {
      await renderDanishLanguageClasses(container)
    } else if (tab === 'announcements') {
      await renderDanishLanguageAnnouncements(container)
    } else if (tab === 'materials') {
      await renderDanishLanguageMaterials({
        container,
        user: currentUser,
        member: currentMember,
        adminAccess: currentAdminAccess
      })
    } else if (
      tab === 'students' &&
      canManageCurrentDanishLanguage()
    ) {
      await renderDanishLanguageStudents(container)
    } else if (
      tab === 'admin' &&
      canManageCurrentDanishLanguage()
    ) {
      await renderDanishLanguageAdmin({
        container,
        user:
          currentUser,
        member:
          currentMember,
        adminAccess:
          currentAdminAccess,
        onRefresh:
          async () => showDanishLanguageTab('admin')
      })
    } else {
      await renderDanishLanguageDashboard(container)
    }

    bindDanishLanguageTabs(
      document.getElementById(
        'danish-language-content'
      )
    )

  } catch (error) {

    console.error(
      'Unable to load Danish Language section:',
      error
    )

    container.innerHTML =
      '<p>Unable to load Danish Language section.</p>'
  }
}


function bindDanishLanguageTabs(
  container
) {

  container
    ?.querySelectorAll(
      '[data-danish-language-tab]'
    )
    .forEach(
      button => {

        if (
          button.dataset.boundDanishLanguageTab ===
          'true'
        ) {
          return
        }


        button.dataset.boundDanishLanguageTab =
          'true'

        button.addEventListener(
          'click',
          async () => {

            await showDanishLanguageTab(
              button.dataset.danishLanguageTab
            )
          }
        )
      }
    )
}


function canManageCurrentDanishLanguage() {

  return canManageDanishLanguage(
    currentMember,
    currentAdminAccess
  )
}
