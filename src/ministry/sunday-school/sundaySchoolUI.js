/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Sunday School
 * File   : sundaySchoolUI.js
 *
 * Purpose:
 * Opens and controls the Sunday School overlay.
 * ============================================================
 */

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
  createSundaySchoolShell
} from './sundaySchoolShell.js'

import {
  renderSundaySchoolDashboard
} from './sundaySchoolDashboard.js'

import {
  renderSundaySchoolEvents
} from './sundaySchoolEvents.js'

import {
  renderSundaySchoolAnnouncements
} from './sundaySchoolAnnouncements.js'

import {
  renderSundaySchoolResources
} from './sundaySchoolResources.js'

import {
  renderSundaySchoolGallery
} from './sundaySchoolGallery.js'

import {
  renderSundaySchoolMembers
} from './sundaySchoolMembers.js'

import {
  renderSundaySchoolSettings
} from './sundaySchoolSettings.js'

import {
  renderSundaySchoolCreateGallery
} from './sundaySchoolCreateGallery.js'

import {
  canManageSundaySchool
} from './sundaySchoolPermissions.js'


let currentUser = null
let currentMember = null
let currentAdminAccess = null
let currentViewCleanup = null
let viewRevision = 0


export async function openSundaySchoolSection(initialTab = 'dashboard') {
  disposeSundaySchoolView()
  const openingRevision = viewRevision
  let overlay = document.getElementById('sunday-school-overlay')

  if (!overlay) {
    overlay = document.createElement('div')
    overlay.id = 'sunday-school-overlay'
    overlay.style.position = 'fixed'
    overlay.style.inset = '0'
    overlay.style.background = 'rgba(0,0,0,.55)'
    overlay.style.zIndex = '100000'
    overlay.style.display = 'flex'
    overlay.style.alignItems = 'center'
    overlay.style.justifyContent = 'center'
    overlay.style.padding = '20px'

    overlay.innerHTML = `
      <div style="width:100%; max-width:560px; max-height:88vh; overflow:auto; background:#fffdf8; border-radius:10px; padding:18px;">
        <button id="close-sunday-school-button" type="button" style="float:right;">Close</button>
        <div id="sunday-school-content"></div>
      </div>
    `

    document.body.appendChild(overlay)
    document
      .getElementById('close-sunday-school-button')
      .addEventListener('click', () => {
        disposeSundaySchoolView()
        overlay.style.display = 'none'
        returnToMemberArea()
      })
  } else {
    overlay.style.display = 'flex'
  }

  await loadSundaySchoolContext(openingRevision)
  if (openingRevision !== viewRevision || overlay.style.display === 'none') return
  renderSundaySchoolShell()
  await showSundaySchoolTab(initialTab)
}


async function loadSundaySchoolContext(revision) {
  const user = await getCurrentMember()
  const member = getApprovedMember()
  const adminAccess = user?.uid
    ? await getAdminAccess(user.uid)
    : null
  if (revision !== viewRevision) return
  currentUser = user
  currentMember = member
  currentAdminAccess = adminAccess
}


function renderSundaySchoolShell() {
  disposeSundaySchoolView()
  const content = document.getElementById('sunday-school-content')
  if (!content) return
  content.innerHTML = createSundaySchoolShell(canManageCurrentSundaySchool())
  bindSundaySchoolTabs(content)
}


async function showSundaySchoolTab(tab) {
  const dashboard = document.getElementById('sunday-school-dashboard')
  if (!dashboard) return

  disposeSundaySchoolView()
  const revision = viewRevision
  // Each render owns its element; an old request cannot overwrite a newer tab.
  const container = document.createElement('div')
  dashboard.replaceChildren(container)
  const onRefresh = async () => {
    if (revision === viewRevision) await showSundaySchoolTab(tab)
  }

  container.innerHTML = '<p>Loading Sunday School...</p>'

  try {
    let cleanup = null
    if (tab === 'classes') {
      await renderSundaySchoolEvents(container)
    } else if (tab === 'announcements') {
      await renderSundaySchoolAnnouncements(container)
    } else if (tab === 'resources') {
      await renderSundaySchoolResources(container)
    } else if (tab === 'gallery') {
      cleanup = await renderSundaySchoolGallery({
        container,
        user: currentUser,
        member: currentMember,
        adminAccess: currentAdminAccess,
        onRefresh
      })
    } else if (tab === 'teachers') {
      cleanup = await renderSundaySchoolMembers({
        container,
        user: currentUser,
        member: currentMember,
        adminAccess: currentAdminAccess,
        onRefresh
      })
    } else if (tab === 'create-gallery' && canManageCurrentSundaySchool()) {
      cleanup = renderSundaySchoolCreateGallery({
        container,
        user: currentUser,
        onRefresh: async () => showSundaySchoolTab('gallery')
      })
    } else if (tab === 'admin' && canManageCurrentSundaySchool()) {
      await renderSundaySchoolSettings({
        container,
        user: currentUser,
        member: currentMember,
        adminAccess: currentAdminAccess,
        onRefresh
      })
    } else {
      await renderSundaySchoolDashboard(container)
    }

    if (revision !== viewRevision) {
      if (typeof cleanup === 'function') await cleanup()
      return
    }
    currentViewCleanup = typeof cleanup === 'function' ? cleanup : null
    bindSundaySchoolTabs(document.getElementById('sunday-school-content'))
  } catch (error) {
    console.error('Unable to load Sunday School section:', error)
    if (revision === viewRevision) {
      container.innerHTML = '<p>Unable to load Sunday School section.</p>'
    }
  }
}


function disposeSundaySchoolView() {
  viewRevision += 1
  const cleanup = currentViewCleanup
  currentViewCleanup = null
  if (cleanup) {
    Promise.resolve(cleanup()).catch(error => {
      console.error('Unable to close Sunday School media:', error)
    })
  }
  const dashboard = document.getElementById('sunday-school-dashboard')
  dashboard?.querySelectorAll('audio, video').forEach(media => media.pause())
  dashboard?.replaceChildren()
}


function bindSundaySchoolTabs(container) {
  container
    ?.querySelectorAll('[data-sunday-school-tab]')
    .forEach(button => {
      if (button.dataset.boundSundaySchoolTab === 'true') return
      button.dataset.boundSundaySchoolTab = 'true'
      button.addEventListener('click', async () => {
        await showSundaySchoolTab(button.dataset.sundaySchoolTab)
      })
    })
}


function canManageCurrentSundaySchool() {
  return canManageSundaySchool(currentMember, currentAdminAccess)
}
