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
  getPublishedChoirPlans,
  getChoirGroupPlans,
  getAllChoirPlans
} from './choirStore.js'

import {
  renderChoirShell
} from './choirShell.js'

import {
  renderChoirPlans
} from './choirPlanList.js'

import {
  openHymnLyrics
} from '../shared/hymnbookBrowser.js'

import {
  setupChoirPlanEditor,
  createNewChoirPlan,
  editChoirPlan
} from './choirPlanEditor.js'


let archiveVisible =
  false

let reviewVisible =
  false


export function setupChoirUI() {

  setupChoirPlanEditor({
    onSaved:
      async () => {

        archiveVisible =
          false

        reviewVisible =
          true

        await openChoirSection()
      }
  })


  document
    .querySelector(
      '#close-choir-button'
    )
    ?.addEventListener(
      'click',
      () => {

        document
          .querySelector(
            '#choir-overlay'
          )
          .style.display =
            'none'

        returnToMemberArea()
      }
    )
}


export async function openChoirSection(
  targetId = null
) {

  ensureChoirShell()


  const overlay =
    document.querySelector(
      '#choir-overlay'
    )


  const content =
    document.querySelector(
      '#choir-content'
    )


  const adminArea =
    document.querySelector(
      '#choir-admin-area'
    )


  if (
    !overlay ||
    !content ||
    !adminArea
  ) {

    console.error(
      'Choir screen could not be created.'
    )

    return
  }


  overlay.style.display =
    'block'


  content.innerHTML =
    '<p>Loading Choir...</p>'


  adminArea.innerHTML =
    ''


  try {

    const user =
      await getCurrentMember()


    if (!user?.uid) {

      content.innerHTML =
        `
          <p>
            Please sign in to view Choir.
          </p>
        `

      return
    }


    const adminAccess =
      await getAdminAccess(
        user.uid
      )


    const isAdmin =
      adminAccess?.choirAdmin ===
      true


    const canPrepareChoir =
      isAdmin ||
      adminAccess?.choirPlanning ===
      true


    if (canPrepareChoir) {

      renderAdminButtons()
    }


    if (
      canPrepareChoir &&
      !reviewVisible &&
      !targetId
    ) {

      content.innerHTML =
        '<p>Select Create Sunday Choir Plan or Review Choir Plan.</p>'

      return
    }


    const plans =
      canPrepareChoir
        ? await getAllChoirPlans()
        : await getChoirGroupPlans()


    renderChoirPlans({
      plans,
      isAdmin:
        canPrepareChoir,
      targetId,
      archiveVisible,

      onEdit:
        plan => {

          editChoirPlan(
            plan
          )
        },

      onRefresh:
        async () => {

          await openChoirSection(
            targetId
          )
        },

      onArchiveClosed:
        async () => {

          archiveVisible =
            false

          await openChoirSection()
        }
    })


  } catch (error) {

    console.error(
      'Unable to load Choir:',
      error
    )


    content.innerHTML =
      `
        <p>
          Unable to load Choir.
        </p>
      `
  }
}


function ensureChoirShell() {

  if (
    document.querySelector(
      '#choir-overlay'
    )
  ) {

    return
  }


  renderChoirShell()


  setupChoirUI()
}


function renderAdminButtons() {

  const adminArea =
    document.querySelector(
      '#choir-admin-area'
    )


  if (!adminArea) {
    return
  }


  adminArea.innerHTML =
    ''


  const dashboard =
    document.createElement(
      'div'
    )


  dashboard.style.background =
    '#fff8df'

  dashboard.style.border =
    '1px solid #eadcaa'

  dashboard.style.borderRadius =
    '10px'

  dashboard.style.padding =
    '14px'

  dashboard.style.marginBottom =
    '16px'


  const heading =
    document.createElement(
      'h3'
    )


  heading.textContent =
    'Choir Admin Dashboard'

  heading.style.marginTop =
    '0'


  dashboard.appendChild(
    heading
  )


  const hymnbookButton =
    document.createElement(
      'button'
    )


  hymnbookButton.type =
    'button'


  hymnbookButton.textContent =
    'Hymnbook / Add New Geet'


  hymnbookButton.style.width =
    '100%'

  hymnbookButton.style.padding =
    '12px'

  hymnbookButton.style.fontWeight =
    'bold'

  hymnbookButton.style.fontSize =
    '16px'

  hymnbookButton.style.marginBottom =
    '10px'


  hymnbookButton.addEventListener(
    'click',
    async () => {

      await openHymnLyrics(
        '/hymnbook/index.html',
        'One in Christ Hymnbook'
      )
    }
  )


  dashboard.appendChild(
    hymnbookButton
  )


  const createButton =
    document.createElement(
      'button'
    )


  createButton.type =
    'button'


  createButton.textContent =
    'Create Sunday Choir Plan'


  createButton.style.width =
    '100%'

  createButton.style.padding =
    '12px'

  createButton.style.fontWeight =
    'bold'

  createButton.style.fontSize =
    '16px'

  createButton.style.marginBottom =
    '10px'


  createButton.addEventListener(
    'click',
    () => {

      createNewChoirPlan()
    }
  )


  dashboard.appendChild(
    createButton
  )


  const reviewButton =
    document.createElement(
      'button'
    )


  reviewButton.type =
    'button'


  reviewButton.textContent =
    'Review Choir Plan'


  reviewButton.style.width =
    '100%'

  reviewButton.style.padding =
    '12px'

  reviewButton.style.fontWeight =
    'bold'

  reviewButton.style.fontSize =
    '16px'

  reviewButton.style.marginBottom =
    '10px'


  reviewButton.addEventListener(
    'click',
    async () => {

      reviewVisible =
        true

      await openChoirSection()
    }
  )


  dashboard.appendChild(
    reviewButton
  )


  const archiveButton =
    document.createElement(
      'button'
    )


  archiveButton.type =
    'button'


  archiveButton.textContent =
    archiveVisible
      ? 'Hide Service Archive'
      : 'Service Archive'


  archiveButton.style.width =
    '100%'

  archiveButton.style.padding =
    '11px'


  archiveButton.addEventListener(
    'click',
    async () => {

      archiveVisible =
        !archiveVisible

      reviewVisible =
        true


      await openChoirSection()
    }
  )


  dashboard.appendChild(
    archiveButton
  )


  adminArea.appendChild(
    dashboard
  )
}
