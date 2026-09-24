import {
  restoreBuiltInHymnOriginal
} from './hymnEditStore.js'

import {
  buildDynamicGeetHtml
} from './dynamicHymnRenderer.js'

import {
  renderRevisionHistory
} from './hymn-editor/hymnEditorHistory.js'

import {
  normalizeComparableData,
  normalizeContent,
  requireCurrentUser
} from './hymn-editor/hymnEditorUtils.js'

import {
  buildHymnEditorMarkup
} from './hymn-editor/hymnEditorTemplate.js'

import {
  saveHymnDraft
} from './hymn-editor/hymnEditorSave.js'


const EDITOR_ID =
  'oneinchrist-hymn-editor'


export function showHymnEditor({
  hymn = null,
  original = null,
  sourceType = 'admin-geet',
  onSaved
}) {

  document
    .getElementById(
      EDITOR_ID
    )
    ?.remove()


  const isNew =
    !hymn

  const hymnType =
    hymn?.type === 'zaboor'
      ? 'zaboor'
      : 'geet'

  const typeLabel =
    hymnType === 'zaboor'
      ? 'Zaboor'
      : 'Geet'


  const editor =
    document.createElement(
      'div'
    )

  editor.id =
    EDITOR_ID


  Object.assign(
    editor.style,
    {
      position: 'fixed',
      inset: '0',
      zIndex: '2147483647',
      background: 'rgba(0,0,0,0.5)',
      overflowY: 'auto',
      overflowX: 'hidden',
      boxSizing: 'border-box',
      width: '100vw',
      maxWidth: '100vw',
      padding:
        'max(12px, env(safe-area-inset-top)) 10px max(12px, env(safe-area-inset-bottom))'
    }
  )


  const panel =
    document.createElement(
      'div'
    )


  Object.assign(
    panel.style,
    {
      width: '100%',
      maxWidth: '980px',
      minWidth: '0',
      boxSizing: 'border-box',
      overflowX: 'hidden',
      margin: '0 auto',
      background: '#ffffff',
      borderRadius: '12px',
      padding: 'clamp(12px, 4vw, 20px)',
      boxShadow:
        '0 12px 36px rgba(0,0,0,0.28)'
    }
  )


  panel.innerHTML =
    buildHymnEditorMarkup({
      hymn,
      isNew,
      typeLabel,
      sourceType
    })

  editor.appendChild(
    panel
  )

  document.body.appendChild(
    editor
  )


  const urduTitleInput =
    panel.querySelector(
      '[data-editor-field="urduTitle"]'
    )

  const romanTitleInput =
    panel.querySelector(
      '[data-editor-field="romanTitle"]'
    )

  const contentInput =
    panel.querySelector(
      '[data-editor-field="content"]'
    )

  const status =
    panel.querySelector(
      '[data-editor-status]'
    )

  const previewWrap =
    panel.querySelector(
      '[data-editor-preview-wrap]'
    )

  const previewFrame =
    panel.querySelector(
      '[data-editor-preview]'
    )

  const historyWrap =
    panel.querySelector(
      '[data-editor-history-wrap]'
    )

  const saveButton =
    panel.querySelector(
      '[data-editor-action="save"]'
    )


  const readForm =
    () => ({
      type:
        hymnType,

      urduTitle:
        urduTitleInput.value.trim(),

      romanTitle:
        romanTitleInput.value.trim(),

      content:
        normalizeContent(
          contentInput.value
        ),

      sourcePath:
        hymn?.sourcePath ||
        original?.sourcePath ||
        ''
    })


  const initialData =
    normalizeComparableData({
      type:
        hymnType,
      urduTitle:
        hymn?.urduTitle || '',
      romanTitle:
        hymn?.romanTitle || '',
      content:
        hymn?.content || '',
      sourcePath:
        hymn?.sourcePath ||
        original?.sourcePath ||
        ''
    })


  const validate =
    data => {

      if (!data.urduTitle) {
        return 'Please enter the Urdu/Punjabi title.'
      }


      if (!data.romanTitle) {
        return 'Please enter the Roman title.'
      }


      if (!data.content) {
        return `Please paste the ${typeLabel} text.`
      }


      return ''
    }


  const hasChanges =
    () =>
      JSON.stringify(
        normalizeComparableData(
          readForm()
        )
      ) !==
      JSON.stringify(
        initialData
      )


  const cancel =
    () => {

      if (
        hasChanges() &&
        !window.confirm(
          'Discard your unsaved changes? The saved hymn will stay exactly as it was before.'
        )
      ) {
        return
      }


      editor.remove()
    }


  panel
    .querySelector(
      '[data-editor-action="cancel"]'
    )
    ?.addEventListener(
      'click',
      cancel
    )


  panel
    .querySelector(
      '[data-editor-action="cancel-bottom"]'
    )
    ?.addEventListener(
      'click',
      cancel
    )


  panel
    .querySelector(
      '[data-editor-action="preview"]'
    )
    ?.addEventListener(
      'click',
      () => {

        const data =
          readForm()

        const problem =
          validate(
            data
          )


        if (problem) {
          status.textContent =
            problem
          return
        }


        status.textContent =
          'Preview only — nothing has been saved yet.'

        previewWrap.style.display =
          'block'

        previewFrame.srcdoc =
          buildDynamicGeetHtml({
            id:
              hymn?.id ||
              'PREVIEW',
            ...data
          })
      }
    )


  panel
    .querySelector(
      '[data-editor-action="history"]'
    )
    ?.addEventListener(
      'click',
      async () => {

        historyWrap.style.display =
          'block'

        historyWrap.innerHTML =
          '<strong>Loading revision history...</strong>'


        try {
          await renderRevisionHistory({
            historyWrap,
            hymn,
            original,
            sourceType,
            onRestored:
              saved => {
                editor.remove()
                onSaved?.(
                  saved
                )
              }
          })
        } catch (error) {
          historyWrap.textContent =
            `Unable to load revision history: ${
              error?.message ||
              error
            }`
        }
      }
    )


  panel
    .querySelector(
      '[data-editor-action="restore-original"]'
    )
    ?.addEventListener(
      'click',
      async event => {

        if (!original) {
          return
        }


        const confirmed =
          window.confirm(
            'Restore the original bundled hymn? The current edited version will be kept in Revision History.'
          )


        if (!confirmed) {
          return
        }


        const button =
          event.currentTarget

        button.disabled =
          true

        status.textContent =
          'Restoring original hymn...'


        try {
          const user =
            await requireCurrentUser()

          const restored =
            await restoreBuiltInHymnOriginal({
              current:
                hymn,
              original,
              uid:
                user.uid
            })

          editor.remove()
          onSaved?.(
            restored
          )
        } catch (error) {
          status.textContent =
            `Unable to restore original: ${
              error?.message ||
              error
            }`
          button.disabled =
            false
        }
      }
    )


  saveButton
    ?.addEventListener(
      'click',
      async () => {

        const data =
          readForm()

        const problem =
          validate(
            data
          )


        if (problem) {
          status.textContent =
            problem
          return
        }


        saveButton.disabled =
          true

        status.textContent =
          isNew
            ? 'Adding Geet to the hymnbook...'
            : 'Saving changes...'


        try {
          const saved =
            await saveHymnDraft({
              sourceType,
              hymn,
              original,
              data
            })


          editor.remove()

          onSaved?.(
            saved ||
            data
          )

        } catch (error) {

          console.error(
            'Unable to save hymn:',
            error
          )

          status.textContent =
            `Unable to save hymn: ${
              error?.message ||
              error
            }`

        } finally {
          saveButton.disabled =
            false
        }
      }
    )


  const onKeyDown =
    event => {

      if (
        event.key ===
        'Escape'
      ) {
        event.preventDefault()
        cancel()
      }
    }


  document.addEventListener(
    'keydown',
    onKeyDown
  )


  const observer =
    new MutationObserver(
      () => {
        if (
          !document.body.contains(
            editor
          )
        ) {
          document.removeEventListener(
            'keydown',
            onKeyDown
          )
          observer.disconnect()
        }
      }
    )


  observer.observe(
    document.body,
    {
      childList:
        true
    }
  )
}

