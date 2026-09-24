/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Daily Devotion
 * File   : dailyDevotionAdmin.js
 *
 * Purpose:
 * Provides admin review controls for Daily Devotion.
 * ============================================================
 */

import {
  getAllDailyDevotions,
  requestDailyDevotion,
  updateDailyDevotion,
  approveDailyDevotion,
  rejectDailyDevotion,
  deleteDailyDevotion,
  markDailyDevotionNotificationSent
} from './dailyDevotionStore.js'

import {
  notifyDailyDevotionReady,
  notifyDailyDevotionPublished
} from './dailyDevotionNotifications.js'


let editingDevotionId =
  null


export async function renderDailyDevotionAdmin({
  container,
  user,
  onRefresh
}) {

  const devotions =
    await getAllDailyDevotions()


  container.innerHTML = `
    <section class="daily-devotion-admin">
      <h3>Daily Devotion Admin</h3>

      <section class="dashboard-card">
        <h4>Generate New Devotion</h4>

        <p>
          Create a new AI devotion. You can approve, edit, or delete it after it is generated.
        </p>

        <button type="button" data-daily-devotion-action="suggest">
          Generate Devotion
        </button>

        <div data-daily-devotion-status style="min-height:18px; margin-top:8px;"></div>
      </section>

      <section
        class="dashboard-card"
        data-daily-devotion-edit-card
        hidden
      >
        <h4>Edit Daily Devotion</h4>

        <form data-daily-devotion-edit-form>
          <label>
            Bible Verse
            <input
              type="text"
              name="verseReference"
              required
            />
          </label>

          <label>
            Verse Text
            <textarea
              name="verseText"
              rows="4"
              required
            ></textarea>
          </label>

          <label>
            Explanation
            <textarea
              name="explanation"
              rows="4"
              required
            ></textarea>
          </label>

          <label>
            What Would Jesus Do?
            <textarea
              name="application"
              rows="4"
              required
            ></textarea>
          </label>

          <label>
            Prayer
            <textarea
              name="prayer"
              rows="4"
              required
            ></textarea>
          </label>

          <div style="display:grid; gap:8px;">
            <button type="submit">
              Save Changes
            </button>

            <button type="button" data-daily-devotion-action="cancel-edit">
              Cancel
            </button>
          </div>
        </form>
      </section>

      <section class="dashboard-card">
        <h4>Existing Devotions</h4>

        ${
          devotions.length
            ? createDevotionListMarkup(
                devotions
              )
            : '<p>No devotion has been created yet.</p>'
        }
      </section>
    </section>
  `


  bindDailyDevotionAdmin({
    container,
    devotions,
    user,
    onRefresh
  })
}


function createDevotionListMarkup(
  devotions
) {

  return devotions.map(
    devotion => `
      <article class="dashboard-card">
        <p>
          <strong>Status:</strong>
          ${escapeHtml(
            devotion.status || 'pending'
          )}
        </p>

        ${createDevotionPreviewMarkup(
          devotion
        )}

        <div style="display:grid; gap:8px;">
          ${
            devotion.status !== 'approved'
              ? `
                <button
                  type="button"
                  data-daily-devotion-action="approve"
                  data-daily-devotion-id="${escapeHtml(devotion.id)}"
                >
                  Approve And Publish
                </button>
              `
              : ''
          }

          ${
            devotion.status === 'pending'
              ? `
                <button
                  type="button"
                  data-daily-devotion-action="reject"
                  data-daily-devotion-id="${escapeHtml(devotion.id)}"
                >
                  Reject
                </button>
              `
              : ''
          }

          <button
            type="button"
            data-daily-devotion-action="edit"
            data-daily-devotion-id="${escapeHtml(devotion.id)}"
          >
            Edit
          </button>

          <button
            type="button"
            data-daily-devotion-action="delete"
            data-daily-devotion-id="${escapeHtml(devotion.id)}"
          >
            Delete
          </button>
        </div>
      </article>
    `
  ).join('')
}


function createDevotionPreviewMarkup(
  devotion
) {

  return `
    <p><strong>Bible Verse:</strong> ${escapeHtml(
      devotion.verseReference
    )}</p>
    <p>${escapeHtml(devotion.verseText)}</p>
    <p><strong>Explanation:</strong></p>
    <p>${escapeHtml(devotion.explanation)}</p>
    <p><strong>What Would Jesus Do?</strong></p>
    <p>${escapeHtml(devotion.application)}</p>
    <p><strong>Prayer:</strong></p>
    <p>${escapeHtml(devotion.prayer)}</p>
  `
}


function bindDailyDevotionAdmin({
  container,
  devotions,
  user,
  onRefresh
}) {

  const editForm =
    container.querySelector(
      '[data-daily-devotion-edit-form]'
    )


  editForm?.addEventListener(
    'submit',
    async event => {

      event.preventDefault()

      await saveEditedDailyDevotion({
        form:
          editForm,
        user,
        onRefresh
      })
    }
  )


  container
    .querySelectorAll(
      '[data-daily-devotion-action]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          async () => {

            const devotion =
              devotions.find(
                item => item.id === button.dataset.dailyDevotionId
              )


            await handleDailyDevotionAction({
              action:
                button.dataset.dailyDevotionAction,
              devotion,
              container,
              user,
              onRefresh
            })
          }
        )
      }
    )
}


async function saveEditedDailyDevotion({
  form,
  user,
  onRefresh
}) {

  if (!editingDevotionId) {
    return
  }


  const status =
    document.querySelector(
      '[data-daily-devotion-status]'
    )

  const formData =
    new FormData(form)


  status.textContent =
    'Saving...'


  try {

    await updateDailyDevotion({
      id:
        editingDevotionId,
      uid:
        user.uid,
      data: {
        verseReference:
          formData.get('verseReference'),

        verseText:
          formData.get('verseText'),

        explanation:
          formData.get('explanation'),

        application:
          formData.get('application'),

        prayer:
          formData.get('prayer')
      }
    })

    editingDevotionId =
      null

    await onRefresh()

  } catch (error) {

    console.error(
      'Unable to update Daily Devotion:',
      error
    )

    status.textContent =
      `Unable to update Daily Devotion: ${error?.message || error}`
  }
}


async function handleDailyDevotionAction({
  action,
  devotion,
  container,
  user,
  onRefresh
}) {

  const status =
    container.querySelector(
      '[data-daily-devotion-status]'
    )


  status.textContent =
    'Working...'


  try {

    if (action === 'approve' && devotion?.id) {

      await approveDailyDevotion({
        id:
          devotion.id,
        uid:
          user.uid
      })

      await notifyDailyDevotionPublished({
        uid:
          user.uid
      })

      await markDailyDevotionNotificationSent(
        devotion.id
      )

      await onRefresh()

    } else if (action === 'reject' && devotion?.id) {

      await rejectDailyDevotion({
        id:
          devotion.id,
        uid:
          user.uid
      })

      await onRefresh()

    } else if (action === 'edit' && devotion?.id) {

      openEditForm({
        container,
        devotion
      })

      status.textContent =
        ''

    } else if (action === 'delete' && devotion?.id) {

      const shouldDelete =
        window.confirm(
          'Delete this Daily Devotion?'
        )


      if (!shouldDelete) {
        status.textContent =
          ''
        return
      }


      await deleteDailyDevotion(
        devotion.id
      )

      await onRefresh()

    } else if (action === 'cancel-edit') {

      closeEditForm(
        container
      )

      status.textContent =
        ''

    } else {

      await requestDailyDevotion({
        uid:
          user.uid
      })

      await notifyDailyDevotionReady({
        uid:
          user.uid
      })

      await onRefresh()
    }

  } catch (error) {

    console.error(
      'Unable to update Daily Devotion:',
      error
    )

    status.textContent =
      `Unable to update Daily Devotion: ${error?.message || error}`
  }
}


function openEditForm({
  container,
  devotion
}) {

  const editCard =
    container.querySelector(
      '[data-daily-devotion-edit-card]'
    )

  const editForm =
    container.querySelector(
      '[data-daily-devotion-edit-form]'
    )


  if (!editCard || !editForm) {
    return
  }


  editingDevotionId =
    devotion.id

  editForm.elements.verseReference.value =
    devotion.verseReference || ''

  editForm.elements.verseText.value =
    devotion.verseText || ''

  editForm.elements.explanation.value =
    devotion.explanation || ''

  editForm.elements.application.value =
    devotion.application || ''

  editForm.elements.prayer.value =
    devotion.prayer || ''

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
      '[data-daily-devotion-edit-card]'
    )


  editingDevotionId =
    null

  if (editCard) {
    editCard.hidden =
      true
  }
}


function escapeHtml(
  input
) {

  return String(
    input || ''
  )
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
