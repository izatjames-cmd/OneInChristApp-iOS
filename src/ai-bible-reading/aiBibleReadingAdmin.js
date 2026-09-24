/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : AI Bible Reading
 * File   : aiBibleReadingAdmin.js
 *
 * Purpose:
 * Provides admin review controls for AI Bible Reading.
 * ============================================================
 */

import {
  getAllAiBibleReadings,
  requestAiBibleReading,
  updateAiBibleReading,
  approveAiBibleReading,
  rejectAiBibleReading,
  deleteAiBibleReading
} from './aiBibleReadingStore.js'

import {
  notifyAiBibleReadingReady
} from './aiBibleReadingNotifications.js'

import {
  escapeHtml
} from './aiBibleReadingFormat.js'

import {
  createLanguageEditFields,
  fillLanguageFields,
  createReadingDataFromForm
} from './aiBibleReadingAdminForm.js'


let editingReadingId =
  null


export async function renderAiBibleReadingAdmin({
  container,
  user,
  onRefresh
}) {

  const readings =
    await getAllAiBibleReadings()


  container.innerHTML = `
    <section class="ai-bible-reading-admin">
      <h3>Bible Reading Admin</h3>

      <section class="dashboard-card">
        <h4>Generate New Reading</h4>

        <p>
          Create a new AI Bible Reading. It stays waiting for approval until an admin publishes it.
        </p>

        <button type="button" data-ai-bible-reading-action="generate">
          Generate Bible Reading
        </button>

        <div data-ai-bible-reading-status style="min-height:18px; margin-top:8px;"></div>
      </section>

      <section
        class="dashboard-card"
        data-ai-bible-reading-edit-card
        hidden
      >
        <h4>Edit Bible Reading</h4>

        <form data-ai-bible-reading-edit-form>
          <label>
            Date
            <input type="date" name="date" required />
          </label>

          ${createLanguageEditFields({
            language:
              'english',
            title:
              'English'
          })}

          ${createLanguageEditFields({
            language:
              'danish',
            title:
              'Danish'
          })}

          ${createLanguageEditFields({
            language:
              'urdu',
            title:
              'Urdu'
          })}

          <div style="display:grid; gap:8px;">
            <button type="submit">
              Save Changes
            </button>

            <button type="button" data-ai-bible-reading-action="cancel-edit">
              Cancel
            </button>
          </div>
        </form>
      </section>

      <section class="dashboard-card">
        <h4>Existing Bible Readings</h4>

        ${
          readings.length
            ? createReadingListMarkup(
                readings
              )
            : '<p>No Bible Reading has been created yet.</p>'
        }
      </section>
    </section>
  `


  bindAiBibleReadingAdmin({
    container,
    readings,
    user,
    onRefresh
  })
}


function createReadingListMarkup(
  readings
) {

  return readings.map(
    reading => `
      <article class="dashboard-card">
        <p>
          <strong>Status:</strong>
          ${escapeHtml(reading.status || 'pending')}
        </p>

        <p>
          <strong>Date:</strong>
          ${escapeHtml(reading.date)}
        </p>

        ${createReadingPreviewMarkup(reading)}

        <div style="display:grid; gap:8px;">
          ${
            reading.status !== 'approved'
              ? `
                <button
                  type="button"
                  data-ai-bible-reading-action="approve"
                  data-ai-bible-reading-id="${escapeHtml(reading.id)}"
                >
                  Approve And Publish
                </button>
              `
              : ''
          }

          ${
            reading.status === 'pending'
              ? `
                <button
                  type="button"
                  data-ai-bible-reading-action="reject"
                  data-ai-bible-reading-id="${escapeHtml(reading.id)}"
                >
                  Reject
                </button>
              `
              : ''
          }

          <button
            type="button"
            data-ai-bible-reading-action="edit"
            data-ai-bible-reading-id="${escapeHtml(reading.id)}"
          >
            Edit
          </button>

          <button
            type="button"
            data-ai-bible-reading-action="delete"
            data-ai-bible-reading-id="${escapeHtml(reading.id)}"
          >
            Delete
          </button>
        </div>
      </article>
    `
  ).join('')
}


function createReadingPreviewMarkup(
  reading
) {

  return `
    <p><strong>Bible Verse:</strong> ${escapeHtml(reading.verseReference)}</p>
    <p>${escapeHtml(reading.verseText)}</p>
    <p><strong>Reflection:</strong></p>
    <p>${escapeHtml(reading.reflection)}</p>
    <p><strong>Thinking Questions:</strong></p>
    <ul>
      ${(reading.questions || []).map(
        question => `<li>${escapeHtml(question)}</li>`
      ).join('')}
    </ul>
  `
}


function bindAiBibleReadingAdmin({
  container,
  readings,
  user,
  onRefresh
}) {

  const editForm =
    container.querySelector(
      '[data-ai-bible-reading-edit-form]'
    )


  editForm?.addEventListener(
    'submit',
    async event => {

      event.preventDefault()

      await saveEditedAiBibleReading({
        form:
          editForm,
        user,
        onRefresh
      })
    }
  )


  container
    .querySelectorAll(
      '[data-ai-bible-reading-action]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          async () => {

            const reading =
              readings.find(
                item => item.id === button.dataset.aiBibleReadingId
              )


            await handleAiBibleReadingAction({
              action:
                button.dataset.aiBibleReadingAction,
              reading,
              container,
              user,
              onRefresh
            })
          }
        )
      }
    )
}


async function saveEditedAiBibleReading({
  form,
  user,
  onRefresh
}) {

  if (!editingReadingId) {
    return
  }


  const status =
    document.querySelector(
      '[data-ai-bible-reading-status]'
    )

  const data =
    createReadingDataFromForm(
      form
    )


  status.textContent =
    'Saving...'


  try {

    await updateAiBibleReading({
      id:
        editingReadingId,
      uid:
        user.uid,
      data
    })

    editingReadingId =
      null

    await onRefresh()

  } catch (error) {

    console.error(
      'Unable to update Bible Reading:',
      error
    )

    status.textContent =
      `Unable to update Bible Reading: ${error?.message || error}`
  }
}


async function handleAiBibleReadingAction({
  action,
  reading,
  container,
  user,
  onRefresh
}) {

  const status =
    container.querySelector(
      '[data-ai-bible-reading-status]'
    )


  status.textContent =
    'Working...'


  try {

    if (action === 'approve' && reading?.id) {

      await approveAiBibleReading({
        id:
          reading.id,
        uid:
          user.uid
      })

      await onRefresh()

    } else if (action === 'reject' && reading?.id) {

      await rejectAiBibleReading({
        id:
          reading.id,
        uid:
          user.uid
      })

      await onRefresh()

    } else if (action === 'edit' && reading?.id) {

      openEditForm({
        container,
        reading
      })

      status.textContent =
        ''

    } else if (action === 'delete' && reading?.id) {

      const shouldDelete =
        window.confirm(
          'Delete this Bible Reading?'
        )


      if (!shouldDelete) {
        status.textContent =
          ''
        return
      }


      await deleteAiBibleReading(
        reading.id
      )

      await onRefresh()

    } else if (action === 'cancel-edit') {

      closeEditForm(
        container
      )

      status.textContent =
        ''

    } else {

      await requestAiBibleReading({
        uid:
          user.uid
      })

      await notifyAiBibleReadingReady({
        uid:
          user.uid
      })

      await onRefresh()
    }

  } catch (error) {

    console.error(
      'Unable to update Bible Reading:',
      error
    )

    status.textContent =
      `Unable to update Bible Reading: ${error?.message || error}`
  }
}


function openEditForm({
  container,
  reading
}) {

  const editCard =
    container.querySelector(
      '[data-ai-bible-reading-edit-card]'
    )

  const editForm =
    container.querySelector(
      '[data-ai-bible-reading-edit-form]'
    )


  if (!editCard || !editForm) {
    return
  }


  editingReadingId =
    reading.id

  editForm.elements.date.value =
    reading.date || ''

  fillLanguageFields({
    form:
      editForm,
    language:
      'english',
    content:
      reading
  })

  fillLanguageFields({
    form:
      editForm,
    language:
      'danish',
    content:
      reading.translations?.danish
  })

  fillLanguageFields({
    form:
      editForm,
    language:
      'urdu',
    content:
      reading.translations?.urdu
  })

  editCard.hidden =
    false

  editCard.scrollIntoView({
    behavior:
      'smooth',
    block:
      'start'
  })
}


function closeEditForm(
  container
) {

  const editCard =
    container.querySelector(
      '[data-ai-bible-reading-edit-card]'
    )


  editingReadingId =
    null

  if (editCard) {
    editCard.hidden =
      true
  }
}
