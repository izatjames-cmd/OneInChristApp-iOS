import {
  saveScripturePreparation,
  getLatestScripturePreparation,
  getScripturePreparations,
  deleteScripturePreparation
} from './scripturePreparationStore.js'

import {
  notifyScripturePreparationSubmitted
} from './scripturePreparationNotifications.js'

import {
  inputField,
  textareaField
} from './scripturePreparationFormFields.js'

import {
  additionalReferenceRow,
  getAdditionalReferences,
  getReading
} from './scripturePreparationReferences.js'

import {
  scriptureReadingCard,
  bindScriptureReadingCards,
  normalizeScriptureReading
} from '../shared/scripturePassage.js'


export async function renderScripturePreparationEditor({
  container,
  user,
  canDelete,
  onSaved
}) {

  const latest =
    await getLatestScripturePreparation()


  container.innerHTML =
    createForm(
      latest
    )


  bindEditorControls(
    container
  )


  container
    .querySelector(
      '#scripture-preparation-form'
    )
    ?.addEventListener(
      'submit',
      async event => {

        await saveForm({
          event,
          user,
          current:
            latest,
          onSaved
        })
      }
    )


  if (canDelete) {
    await renderExistingPreparations({
      container,
      onSaved
    })
  }
}


function createForm(
  preparation = {}
) {

  const references =
    Array.isArray(
      preparation?.additionalReferences
    )
      ? preparation.additionalReferences
      : []


  const openingReading =
    normalizeScriptureReading(
      preparation?.openingReading ||
      {}
    )


  const reading1 =
    normalizeScriptureReading({
      ...(
        preparation?.reading1 ||
        preparation?.mainReading ||
        {}
      ),

      english:
        preparation?.reading1?.english ||
        preparation?.englishReading ||
        '',

      englishReference:
        preparation?.reading1?.englishReference ||
        ''
    })


  const reading2 =
    normalizeScriptureReading(
      preparation?.reading2 ||
      {}
    )


  return `
    <form id="scripture-preparation-form">
      <input
        id="scripture-preparation-id"
        type="hidden"
        value="${escapeHtml(preparation?.id || '')}"
      >

      ${inputField(
        'Service Date',
        'scripture-service-date',
        'date',
        preparation?.serviceDate || ''
      )}

      ${scriptureReadingCard({
        label:
          'Opening Reading',
        id:
          'scripture-opening-reading',
        reading:
          openingReading,
        allowSelect:
          true
      })}

      ${scriptureReadingCard({
        label:
          'Reading 1',
        id:
          'scripture-reading1',
        reading:
          reading1,
        allowSelect:
          true
      })}

      ${scriptureReadingCard({
        label:
          'Reading 2',
        id:
          'scripture-reading2',
        reading:
          reading2,
        allowSelect:
          true
      })}

      <h3 style="margin-top:22px;">
        Extra References
      </h3>

      <p style="margin-top:-6px; color:#666; font-size:13px;">
        Add as many supporting Bible references as you need.
        Each reference is automatically available in Urdu, Danish and English.
      </p>

      <div id="additional-references">
        ${
          references.length
            ? references
                .map(
                  (reference, index) =>
                    additionalReferenceRow(
                      reference,
                      index
                    )
                )
                .join('')
            : ''
        }
      </div>

      <button
        id="add-scripture-reference"
        type="button"
        style="width:100%; padding:10px; margin:8px 0 18px;"
      >
        + Add Extra Reference
      </button>

      ${inputField(
        'Sermon Title (optional)',
        'scripture-sermon-title',
        'text',
        preparation?.sermonTitle || ''
      )}

      ${inputField(
        'Service Theme (optional)',
        'scripture-service-theme',
        'text',
        preparation?.serviceTheme || ''
      )}

      ${textareaField(
        'Additional Notes (optional)',
        'scripture-notes',
        preparation?.notes || ''
      )}

      <div
        id="scripture-preparation-status"
        style="min-height:20px; margin:12px 0;"
      ></div>

      <button
        id="save-scripture-preparation"
        type="submit"
        style="
          width:100%;
          padding:13px;
          font-weight:bold;
          font-size:16px;
        "
      >
        Save Scripture Preparation
      </button>
    </form>

    <div id="scripture-preparation-list"></div>
  `
}


function bindEditorControls(
  container
) {

  bindScriptureReadingCards(
    container
  )


  bindRemoveReferenceButtons(
    container
  )


  renumberAdditionalReferences(
    container
  )


  container
    .querySelector(
      '#add-scripture-reference'
    )
    ?.addEventListener(
      'click',
      () => {

        const referenceId =
          `new-${Date.now()}-${Math.random()
            .toString(36)
            .slice(2, 7)}`


        container
          .querySelector(
            '#additional-references'
          )
          ?.insertAdjacentHTML(
            'beforeend',
            additionalReferenceRow(
              {},
              referenceId
            )
          )


        bindScriptureReadingCards(
          container
        )

        bindRemoveReferenceButtons(
          container
        )

        renumberAdditionalReferences(
          container
        )
      }
    )
}


function bindRemoveReferenceButtons(
  container
) {

  container
    .querySelectorAll(
      '[data-remove-scripture-reading]'
    )
    .forEach(
      button => {

        if (
          button.dataset.bound ===
          'true'
        ) {
          return
        }


        button.dataset.bound =
          'true'


        button.addEventListener(
          'click',
          () => {

            button
              .closest(
                '[data-additional-reference-row]'
              )
              ?.remove()

            renumberAdditionalReferences(
              container
            )
          }
        )
      }
    )
}


function renumberAdditionalReferences(
  container
) {

  container
    ?.querySelectorAll(
      '[data-additional-reference-row]'
    )
    .forEach(
      (row, index) => {

        const heading =
          row.querySelector(
            '[data-scripture-reading-card] h3'
          )


        if (heading) {
          heading.textContent =
            `Extra Reference ${index + 1}`
        }
      }
    )
}


async function saveForm({
  event,
  user,
  current,
  onSaved
}) {

  event.preventDefault()


  const serviceDate =
    getValue(
      'scripture-service-date'
    )


  if (!serviceDate) {
    setStatus(
      'Please enter the service date.'
    )

    return
  }


  const openingReading =
    getReading(
      'scripture-opening-reading'
    )

  const reading1 =
    getReading(
      'scripture-reading1'
    )

  const reading2 =
    getReading(
      'scripture-reading2'
    )


  const preparation = {
    id:
      getValue(
        'scripture-preparation-id'
      ),

    serviceDate,

    openingReading,

    reading1,

    reading2,

    mainReading:
      reading1,

    additionalReferences:
      getAdditionalReferences(),

    // Backward-compatible fields for older app versions.
    urduReading:
      reading1.urdu || '',

    urduReference:
      reading1.urduReference || '',

    danishReading:
      reading1.danish || '',

    danishReference:
      reading1.danishReference || '',

    englishReading:
      reading1.english || '',

    sermonTitle:
      getValue(
        'scripture-sermon-title'
      ),

    serviceTheme:
      getValue(
        'scripture-service-theme'
      ),

    notes:
      getValue(
        'scripture-notes'
      ),

    createdBy:
      current?.createdBy ||
      user?.uid,

    createdAt:
      current?.createdAt
  }


  try {

    setStatus(
      'Saving Scripture preparation...'
    )


    await saveScripturePreparation(
      preparation
    )


    await notifyScripturePreparationSubmitted({
      uid:
        user?.uid,
      serviceDate
    })


    setStatus(
      'Scripture preparation saved.'
    )


    if (
      typeof onSaved === 'function'
    ) {
      await onSaved()
    }

  } catch (error) {

    console.error(
      'Unable to save Scripture Preparation:',
      error
    )


    setStatus(
      `Unable to save: ${
        error?.message ||
        error
      }`
    )
  }
}


async function renderExistingPreparations({
  container,
  onSaved
}) {

  const list =
    container.querySelector(
      '#scripture-preparation-list'
    )


  if (!list) {
    return
  }


  const preparations =
    await getScripturePreparations()


  list.innerHTML =
    '<h3>Existing Preparations</h3>'


  preparations.forEach(
    preparation => {

      const item =
        document.createElement(
          'div'
        )

      item.style.border =
        '1px solid #dddddd'
      item.style.borderRadius =
        '8px'
      item.style.padding =
        '12px'
      item.style.marginTop =
        '10px'

      item.innerHTML = `
        <strong>
          ${escapeHtml(preparation.serviceDate)}
        </strong>

        <button
          type="button"
          data-delete-scripture-preparation="${escapeHtml(preparation.id)}"
          style="float:right;"
        >
          Delete
        </button>
      `

      list.appendChild(
        item
      )
    }
  )


  list
    .querySelectorAll(
      '[data-delete-scripture-preparation]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          async () => {

            if (
              !confirm(
                'Delete this Scripture preparation?'
              )
            ) {
              return
            }


            await deleteScripturePreparation(
              button.dataset
                .deleteScripturePreparation
            )


            if (
              typeof onSaved === 'function'
            ) {
              await onSaved()
            }
          }
        )
      }
    )
}


function getValue(
  id
) {

  return document
    .getElementById(id)
    ?.value
    .trim() || ''
}


function setStatus(
  text
) {

  const status =
    document.getElementById(
      'scripture-preparation-status'
    )


  if (status) {
    status.textContent =
      text
  }
}


function escapeHtml(
  value
) {

  return String(
    value ||
    ''
  )
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
