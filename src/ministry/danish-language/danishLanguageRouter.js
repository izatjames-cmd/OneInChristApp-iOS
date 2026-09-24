import {
  openDanishLanguageSection
} from './danishLanguageUI.js'


export async function routeDanishLanguage(
  target = 'dashboard'
) {

  await openDanishLanguageSection(
    normalizeDanishLanguageTarget(
      target
    )
  )
}


function normalizeDanishLanguageTarget(
  target
) {

  switch (
    String(target || '')
      .trim()
      .toLowerCase()
  ) {

    case 'classes':
    case 'class':
      return 'classes'

    case 'announcements':
    case 'announcement':
      return 'announcements'

    case 'materials':
    case 'material':
      return 'materials'

    case 'students':
    case 'student':
      return 'students'

    case 'admin':
      return 'admin'

    default:
      return 'dashboard'
  }
}
