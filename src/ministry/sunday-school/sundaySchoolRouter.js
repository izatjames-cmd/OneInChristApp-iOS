/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Sunday School
 * File   : sundaySchoolRouter.js
 *
 * Purpose:
 * Routes Sunday School notification targets.
 * ============================================================
 */

import {
  openSundaySchoolSection
} from './sundaySchoolUI.js'


export async function routeSundaySchool(target = 'dashboard') {
  const tab = normalizeTarget(target)
  await openSundaySchoolSection(tab)
}


function normalizeTarget(target) {
  const value = String(target || 'dashboard').trim()

  switch (value) {
    case 'class':
    case 'classes':
    case 'events':
      return 'classes'

    case 'announcement':
    case 'announcements':
      return 'announcements'

    case 'resource':
    case 'resources':
      return 'resources'

    case 'gallery':
    case 'photos':
      return 'gallery'

    case 'teacher':
    case 'teachers':
      return 'teachers'

    case 'admin':
      return 'admin'

    default:
      return 'dashboard'
  }
}
