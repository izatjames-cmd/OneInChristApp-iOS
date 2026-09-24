import {
  createAdminGeet,
  getAdminGeetById,
  updateAdminGeet
} from '../adminGeetStore.js'

import {
  saveBuiltInHymnEdit
} from '../hymnEditStore.js'

import {
  requireCurrentUser
} from './hymnEditorUtils.js'


export async function saveHymnDraft({
  sourceType,
  hymn,
  original,
  data
}) {

  const user =
    await requireCurrentUser()


  if (
    sourceType ===
      'built-in'
  ) {

    const saved =
      await saveBuiltInHymnEdit({
        original:
          original ||
          hymn,
        updated: {
          ...data,
          sourcePath:
            hymn?.sourcePath ||
            original?.sourcePath ||
            ''
        },
        uid:
          user.uid
      })


    return {
      ...saved,
      sourceType:
        'built-in',
      isEdited:
        true
    }
  }


  if (hymn?.id) {

    await updateAdminGeet(
      hymn.id,
      {
        ...data,
        uid:
          user.uid
      }
    )


    return getAdminGeetById(
      hymn.id
    )
  }


  const created =
    await createAdminGeet({
      ...data,
      uid:
        user.uid
    })


  return getAdminGeetById(
    created.id
  )
}
