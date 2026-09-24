import './style.css'

import {
  renderAppShell
} from './appShell.js'

import {
  renderNotificationShell
} from './notifications/notificationShell.js'

import {
  renderServicePlanShell
} from './service-plan/servicePlanShell.js'

import {
  setupServicePlanEditor
} from './service-plan/servicePlanEditor.js'

import {
  setupServicePlanUI,
  openServicePlanSection
} from './service-plan/servicePlanUI.js'

import {
  setupFoodUI
} from './food/foodUI.js'

import {
  setupChurchNotificationsUI
} from './notifications/churchNotificationsUI.js'

import {
  setupMemberUI
} from './members/memberUI.js'

import {
  setupPushNotifications
} from './notifications/pushNotifications.js'

import {
  createYouthShell
} from './ministry/youth/youthShell.js'

import {
  renderYouthDashboard
} from './ministry/youth/youthDashboard.js'

import {
  renderDesktopAdminApp
} from './admin-desktop/desktopAdminUI.js'


import './config/firebase.js'
import { setupMemberMenuBridge } from './members/memberMenuBridge.js'

import {
  setupAndroidBackNavigation
} from './navigation/androidBackNavigation.js'

function shouldOpenDesktopAdmin() {
  const params =
    new URLSearchParams(
      window.location.search
    )

  return params.get('admin') === 'desktop' ||
    window.location.hash === '#desktop-admin'
}


if (shouldOpenDesktopAdmin()) {
  // The desktop content center can open the shared Service Plan workflow,
  // so its shell must be initialized on the desktop route as well.
  renderServicePlanShell()
  setupServicePlanUI()
  setupServicePlanEditor({
    onSaved: async () => {
      await openServicePlanSection()
    }
  })
  renderDesktopAdminApp()
} else {
renderAppShell()

renderNotificationShell()

renderServicePlanShell()

setupFoodUI()

setupChurchNotificationsUI()

setupServicePlanUI()

setupServicePlanEditor({
  onSaved: async () => {
    await openServicePlanSection()
  }
})

setupMemberUI()

setupMemberMenuBridge()

setupPushNotifications()

setupAndroidBackNavigation()
  .catch(error => {
    console.error(
      'Unable to initialize Android Back navigation:',
      error
    )
  })

// ------------------------------------------------------------
// Youth Module Initialization
// ------------------------------------------------------------

async function initializeYouthModule() {

  const container = document.getElementById('youth-module')

  if (!container) {
    return
  }

  container.innerHTML = createYouthShell()

  const dashboard = document.getElementById('youth-dashboard')

  if (!dashboard) {
    return
  }

  await renderYouthDashboard(dashboard)
}

initializeYouthModule()
}
