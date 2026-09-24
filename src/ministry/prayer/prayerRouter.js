/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Prayer
 * File   : prayerRouter.js
 *
 * Purpose:
 * Routes notification deep links into the Prayer module.
 * ============================================================
 */

import {
  openPrayerSection
} from './prayerUI.js'


export async function routePrayer(
  target = 'dashboard'
) {

  await openPrayerSection(
    normalizePrayerTarget(
      target
    )
  )
}


function normalizePrayerTarget(
  target
) {

  switch (
    String(target || '')
      .trim()
      .toLowerCase()
  ) {

    case 'requests':
    case 'request':
      return 'requests'

    case 'meetings':
    case 'meeting':
      return 'meetings'

    case 'announcements':
    case 'announcement':
      return 'announcements'

    case 'resources':
    case 'resource':
      return 'resources'

    case 'admin':
      return 'admin'

    default:
      return 'dashboard'
  }
}
