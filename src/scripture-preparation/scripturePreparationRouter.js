import {
  openScripturePreparationSection
} from './scripturePreparationUI.js'


export async function routeScripturePreparation(
  targetId = 'dashboard'
) {

  await openScripturePreparationSection(
    targetId || 'dashboard'
  )
}
