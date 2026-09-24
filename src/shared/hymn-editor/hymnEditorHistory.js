import {
  restoreAdminGeetRevision
} from '../adminGeetStore.js'

import {
  getBuiltInHymnEdit,
  restoreBuiltInHymnRevision
} from '../hymnEditStore.js'

import {
  getHymnRevisions
} from '../hymnRevisionStore.js'

import {
  formatRevisionDate,
  requireCurrentUser
} from './hymnEditorUtils.js'


export async function renderRevisionHistory({
  historyWrap,
  hymn,
  original,
  sourceType,
  onRestored
}) {

  const revisions =
    await getHymnRevisions({
      sourceType,
      sourcePath:
        hymn?.sourcePath ||
        original?.sourcePath ||
        '',
      sourceId:
        hymn?.id ||
        ''
    })


  historyWrap.innerHTML =
    ''


  const heading =
    document.createElement(
      'strong'
    )

  heading.textContent =
    'Revision History'

  historyWrap.appendChild(
    heading
  )


  if (!revisions.length) {
    const empty =
      document.createElement(
        'div'
      )

    empty.textContent =
      'No earlier saved versions are available yet.'

    empty.style.marginTop =
      '8px'

    historyWrap.appendChild(
      empty
    )

    return
  }


  revisions.forEach(
    revision => {

      const card =
        document.createElement(
          'div'
        )

      Object.assign(
        card.style,
        {
          border: '1px solid #dddddd',
          borderRadius: '8px',
          padding: '10px',
          marginTop: '8px'
        }
      )


      const date =
        document.createElement(
          'div'
        )

      date.style.fontWeight =
        '700'

      date.textContent =
        formatRevisionDate(
          revision.savedAt
        )


      const title =
        document.createElement(
          'div'
        )

      title.style.margin =
        '4px 0 8px'

      title.textContent =
        revision.romanTitle ||
        revision.urduTitle ||
        'Earlier version'


      const restoreButton =
        document.createElement(
          'button'
        )

      restoreButton.type =
        'button'

      restoreButton.textContent =
        'Restore this version'


      restoreButton.addEventListener(
        'click',
        async () => {

          if (
            !window.confirm(
              'Restore this earlier version? The current version will be kept in Revision History.'
            )
          ) {
            return
          }


          restoreButton.disabled =
            true


          try {
            const user =
              await requireCurrentUser()

            let restored =
              null


            if (
              sourceType ===
                'built-in'
            ) {

              const current =
                await getBuiltInHymnEdit(
                  hymn?.sourcePath ||
                  original?.sourcePath ||
                  ''
                ) ||
                hymn

              restored =
                await restoreBuiltInHymnRevision({
                  current: {
                    ...current,
                    sourcePath:
                      hymn?.sourcePath ||
                      original?.sourcePath ||
                      '',
                    type:
                      hymn?.type ||
                      original?.type ||
                      'geet'
                  },
                  revision,
                  uid:
                    user.uid
                })

              restored = {
                ...restored,
                sourceType:
                  'built-in',
                isEdited:
                  true
              }

            } else {

              restored =
                await restoreAdminGeetRevision(
                  hymn.id,
                  revision,
                  user.uid
                )
            }


            onRestored?.(
              restored
            )

          } catch (error) {
            alert(
              `Unable to restore this revision: ${
                error?.message ||
                error
              }`
            )
            restoreButton.disabled =
              false
          }
        }
      )


      card.appendChild(
        date
      )
      card.appendChild(
        title
      )
      card.appendChild(
        restoreButton
      )

      historyWrap.appendChild(
        card
      )
    }
  )
}
