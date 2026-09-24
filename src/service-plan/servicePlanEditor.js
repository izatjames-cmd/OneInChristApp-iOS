import {
  getCurrentMember
} from '../auth/phoneAuth.js'

import {
  getPublishedChoirPlans
} from '../choir/choirStore.js'

import {
  getScripturePreparations,
  getScripturePreparationForDate
} from '../scripture-preparation/scripturePreparationStore.js'

import {
  createServicePlan,
  updateServicePlan
} from './servicePlanStore.js'

import {
  notifyServicePlanReadyForApproval
} from './servicePlanNotifications.js'

import {
  scriptureReadingCard,
  bindScriptureReadingCards,
  getScriptureReading,
  setScriptureReading
} from '../shared/scripturePassage.js'


let editingPlanId =
  null

let savedCallback =
  null

let choirPlans =
  []

let scripturePreparations =
  []


export function setupServicePlanEditor({
  onSaved
} = {}) {

  savedCallback =
    onSaved || null


  document
    .querySelector(
      '#close-service-plan-editor-button'
    )
    ?.addEventListener(
      'click',
      closeServicePlanEditor
    )


  document
    .querySelector(
      '#service-plan-form'
    )
    ?.addEventListener(
      'submit',
      saveServicePlan
    )


  document
    .querySelector(
      '#service-plan-date'
    )
    ?.addEventListener(
      'change',
      async event => {

        await loadPreparationForDate(
          event.target.value
        )
      }
    )


  document
    .querySelector(
      '#service-plan-choir-plan'
    )
    ?.addEventListener(
      'change',
      event => {

        loadChoirHymns(
          event.target.value
        )
      }
    )


  document
    .querySelector(
      '#service-plan-scripture-preparation'
    )
    ?.addEventListener(
      'change',
      event => {

        loadScripturePreparation(
          event.target.value
        )
      }
    )


  bindScriptureReadingCards(
    document
  )


  loadChoirPlanOptions()
  loadScripturePreparationOptions()
}


export async function createNewServicePlan() {

  editingPlanId =
    null


  document
    .querySelector(
      '#service-plan-form'
    )
    ?.reset()


  setReading(
    'opening-reading',
    {}
  )

  setReading(
    'reading1',
    {}
  )

  setReading(
    'reading2',
    {}
  )

  setExtraReferences(
    []
  )


  setValue(
    'service-plan-title',
    'Sunday Service'
  )


  setChecked(
    'service-plan-active',
    true
  )


  setValue(
    'service-plan-choir-plan',
    ''
  )

  setValue(
    'service-plan-scripture-preparation',
    ''
  )


  document
    .querySelector(
      '#service-plan-editor-heading'
    )
    .textContent =
      'Create Service Plan'


  setStatus(
    ''
  )


  await loadChoirPlanOptions()
  await loadScripturePreparationOptions()

  openServicePlanEditor()
}


export async function editServicePlan(
  plan
) {

  editingPlanId =
    plan.id


  const storedExtraReferences =
    Array.isArray(
      plan.extraReferences
    )
      ? plan.extraReferences
      : []


  document
    .querySelector(
      '#service-plan-editor-heading'
    )
    .textContent =
      'Edit Service Plan'


  setValue(
    'service-plan-title',
    plan.title
  )


  setValue(
    'service-plan-date',
    plan.date
  )


  setValue(
    'service-plan-time',
    plan.serviceTime
  )


  setChecked(
    'service-plan-active',
    plan.active === true
  )


  setValue(
    'welcome',
    plan.welcome
  )


  setReading(
    'opening-reading',
    plan.openingReading
  )


  setValue(
    'opening-prayer',
    plan.openingPrayer
  )


  setHymn(
    'hymn1',
    plan.hymn1
  )


  setHymn(
    'hymn2',
    plan.hymn2
  )


  setReading(
    'reading1',
    plan.reading1
  )


  setValue(
    'middle-prayer',
    plan.middlePrayer
  )


  setHymn(
    'hymn3',
    plan.hymn3
  )


  setReading(
    'reading2',
    plan.reading2
  )


  setHymn(
    'hymn4',
    plan.hymn4
  )


  setHymn(
    'holy-spirit-hymn',
    plan.holySpiritHymn
  )


  setValue(
    'prayer-after-holy-spirit',
    plan.prayerAfterHolySpirit
  )


  setValue(
    'sermon-title',
    plan.sermon?.title
  )


  setValue(
    'sermon-preacher',
    plan.sermon?.preacher
  )


  setExtraReferences(
    storedExtraReferences
  )


  setHymn(
    'hymn5',
    plan.hymn5 ||
    plan.postSermonHymn
  )


  setValue(
    'closing-prayers',
    plan.closingPrayers ||
    plan.closing
  )


  setValue(
    'blessings',
    plan.blessings
  )


  setValue(
    'information',
    plan.information ||
    plan.messages
  )


  setStatus(
    ''
  )


  await loadChoirPlanOptions()
  await loadScripturePreparationOptions()


  setValue(
    'service-plan-choir-plan',
    plan.choirPreparationId ||
    ''
  )


  setValue(
    'service-plan-scripture-preparation',
    plan.scripturePreparationId ||
    ''
  )


  if (
    !storedExtraReferences.length &&
    plan.scripturePreparationId
  ) {

    const linkedPreparation =
      scripturePreparations.find(
        preparation =>
          preparation.id ===
          plan.scripturePreparationId
      )


    const linkedReferences =
      Array.isArray(
        linkedPreparation
          ?.additionalReferences
      )
        ? linkedPreparation
            .additionalReferences
        : []


    if (linkedReferences.length) {
      setExtraReferences(
        linkedReferences
      )
    }
  }


  openServicePlanEditor()
}


async function loadChoirPlanOptions() {

  const select =
    document.querySelector(
      '#service-plan-choir-plan'
    )


  if (!select) {
    return
  }


  try {

    choirPlans =
      await getPublishedChoirPlans()


    select.innerHTML =
      '<option value="">Choose a choir plan</option>' +
      choirPlans
        .map(
          plan =>
            `<option value="${escapeHtml(
              plan.id
            )}">${escapeHtml(
              formatChoirPlanLabel(
                plan
              )
            )}</option>`
        )
        .join('')

  } catch (error) {

    console.error(
      'Unable to load choir plans:',
      error
    )
  }
}


async function loadScripturePreparationOptions() {

  const select =
    document.querySelector(
      '#service-plan-scripture-preparation'
    )


  if (!select) {
    return
  }


  try {

    scripturePreparations =
      await getScripturePreparations()


    select.innerHTML =
      '<option value="">Choose scripture preparation</option>' +
      scripturePreparations
        .map(
          preparation =>
            `<option value="${escapeHtml(
              preparation.id
            )}">${escapeHtml(
              formatScripturePreparationLabel(
                preparation
              )
            )}</option>`
        )
        .join('')

  } catch (error) {

    console.error(
      'Unable to load scripture preparations:',
      error
    )
  }
}


async function loadPreparationForDate(
  serviceDate
) {

  if (!serviceDate) {
    return
  }


  const choirPlan =
    choirPlans.find(
      plan =>
        plan.date === serviceDate
    )


  if (choirPlan) {

    setValue(
      'service-plan-choir-plan',
      choirPlan.id
    )

    loadChoirHymns(
      choirPlan.id
    )
  }


  try {

    const scripturePreparation =
      await getScripturePreparationForDate(
        serviceDate
      )


    if (scripturePreparation) {

      scripturePreparations =
        [
          scripturePreparation,
          ...scripturePreparations.filter(
            item =>
              item.id !==
              scripturePreparation.id
          )
        ]

      await loadScripturePreparationOptions()

      setValue(
        'service-plan-scripture-preparation',
        scripturePreparation.id
      )

      loadScripturePreparation(
        scripturePreparation.id
      )
    }

  } catch (error) {

    console.error(
      'Unable to load scripture preparation for date:',
      error
    )
  }
}


function loadChoirHymns(
  planId
) {

  const plan =
    choirPlans.find(
      item =>
        item.id === planId
    )


  const songs =
    Array.isArray(
      plan?.songs
    )
      ? plan.songs
      : []


  ;[
    'hymn1',
    'hymn2',
    'hymn3',
    'hymn4',
    'hymn5'
  ].forEach(
    (id, index) => {

      setHymn(
        id,
        songs[index]
      )
    }
  )


  setHymn(
    'holy-spirit-hymn',
    plan?.holySpiritHymn
  )
}


function loadScripturePreparation(
  preparationId
) {

  const preparation =
    scripturePreparations.find(
      item =>
        item.id === preparationId
    )


  if (!preparation) {
    return
  }


  setReading(
    'opening-reading',
    preparation.openingReading ||
    {}
  )


  setReading(
    'reading1',
    preparation.reading1 ||
    preparation.mainReading ||
    {
      urduReference:
        preparation.urduReference || '',
      urdu:
        preparation.urduReading || '',
      danishReference:
        preparation.danishReference || '',
      danish:
        preparation.danishReading || '',
      english:
        preparation.englishReading || ''
    }
  )


  setReading(
    'reading2',
    preparation.reading2 ||
    {}
  )


  setExtraReferences(
    preparation.additionalReferences ||
    []
  )


  setValue(
    'sermon-title',
    preparation.sermonTitle ||
    preparation.serviceTheme
  )


  appendInformation(
    createScriptureInformation(
      preparation
    )
  )
}


function formatChoirPlanLabel(
  plan
) {

  return [
    plan.title ||
    'Choir Plan',
    plan.date ||
    '',
    plan.serviceTime ||
    ''
  ]
    .filter(Boolean)
    .join(' - ')
}


function formatScripturePreparationLabel(
  preparation
) {

  return [
    'Scripture Preparation',
    preparation.serviceDate ||
    '',
    formatReference(
      preparation.mainReading
    )
  ]
    .filter(Boolean)
    .join(' - ')
}


function formatReference(
  reference = {}
) {

  if (
    reference.urduReference ||
    reference.danishReference
  ) {

    return (
      reference.urduReference ||
      reference.danishReference ||
      ''
    )
  }


  return [
    reference.book,
    reference.chapter,
    reference.verse
  ]
    .filter(Boolean)
    .join(' ')
}


function createScriptureInformation(
  preparation
) {

  return [
    preparation.serviceTheme
      ? `Theme: ${preparation.serviceTheme}`
      : '',
    preparation.notes
      ? `Scripture Notes: ${preparation.notes}`
      : ''
  ]
    .filter(Boolean)
    .join('\n\n')
}


function appendInformation(
  text
) {

  if (!text) {
    return
  }


  const current =
    getValue(
      'information'
    )


  setValue(
    'information',
    current
      ? `${current}\n\n${text}`
      : text
  )
}


async function saveServicePlan(
  event
) {

  event.preventDefault()


  const button =
    document.querySelector(
      '#save-service-plan-button'
    )


  const title =
    getValue(
      'service-plan-title'
    )


  const date =
    getValue(
      'service-plan-date'
    )


  if (
    !title ||
    !date
  ) {

    setStatus(
      'Please enter the service title and date.'
    )

    return
  }


  button.disabled =
    true


  setStatus(
    'Saving...'
  )


  try {

    const user =
      await getCurrentMember()


    if (!user?.uid) {

      throw new Error(
        'Please sign in again.'
      )
    }


    const hymn5 =
      getHymn(
        'hymn5'
      )


    const plan = {

      title,
      date,

      serviceTime:
        getValue(
          'service-plan-time'
        ),

      active:
        document
          .querySelector(
            '#service-plan-active'
          )
          ?.checked === true,

      welcome:
        getValue(
          'welcome'
        ),

      openingReading:
        getReading(
          'opening-reading'
        ),

      openingPrayer:
        getValue(
          'opening-prayer'
        ),

      hymn1:
        getHymn(
          'hymn1'
        ),

      hymn2:
        getHymn(
          'hymn2'
        ),

      reading1:
        getReading(
          'reading1'
        ),

      middlePrayer:
        getValue(
          'middle-prayer'
        ),

      hymn3:
        getHymn(
          'hymn3'
        ),

      reading2:
        getReading(
          'reading2'
        ),

      hymn4:
        getHymn(
          'hymn4'
        ),

      holySpiritHymn:
        getHymn(
          'holy-spirit-hymn'
        ),

      prayerAfterHolySpirit:
        getValue(
          'prayer-after-holy-spirit'
        ),

      sermon: {
        title:
          getValue(
            'sermon-title'
          ),

        preacher:
          getValue(
            'sermon-preacher'
          )
      },

      extraReferences:
        getExtraReferences(),

      // Backward-compatible text fields for older app versions.
      referencesForSermonUrdu:
        createLegacyUrduReferences(
          getExtraReferences()
        ),

      referencesForSermonDanishEnglish:
        createLegacyDanishEnglishReferences(
          getExtraReferences()
        ),

      hymn5,

      postSermonHymn:
        hymn5,

      closingPrayers:
        getValue(
          'closing-prayers'
        ),

      closing:
        getValue(
          'closing-prayers'
        ),

      blessings:
        getValue(
          'blessings'
        ),

      information:
        getValue(
          'information'
        ),

      messages:
        getValue(
          'information'
        ),

      choirPreparationId:
        getValue(
          'service-plan-choir-plan'
        ),

      scripturePreparationId:
        getValue(
          'service-plan-scripture-preparation'
        ),

      status:
        document
          .querySelector(
            '#service-plan-active'
          )
          ?.checked === true
          ? 'published'
          : 'pending',

      createdBy:
        user.uid
    }


    if (
      editingPlanId
    ) {

      await updateServicePlan(
        editingPlanId,
        plan
      )

    } else {

      await createServicePlan(
        plan
      )

      await notifyServicePlanReadyForApproval({
        uid:
          user.uid,
        title,
        date
      })
    }


    setStatus(
      'Service Plan saved successfully.'
    )


    setTimeout(
      async () => {

        closeServicePlanEditor()


        if (
          typeof savedCallback ===
          'function'
        ) {

          await savedCallback()
        }

      },
      500
    )

  } catch (error) {

    console.error(
      'Unable to save Service Plan:',
      error
    )


    setStatus(
      `Unable to save: ${
        error?.message ||
        error
      }`
    )

  } finally {

    button.disabled =
      false
  }
}


function getReading(
  id
) {

  return getScriptureReading(
    id
  )
}


function getHymn(
  id
) {

  return {
    title:
      getValue(
        `${id}-title`
      ),

    urduTitle:
      getValue(
        `${id}-urdu-title`
      ),

    lyricsUrl:
      getValue(
        `${id}-lyrics-url`
      ),

    lyricsImageUrl:
      getValue(
        `${id}-lyrics-image-url`
      ),

    lyricsImagePath:
      getValue(
        `${id}-lyrics-image-path`
      ),

    sourceType:
      getValue(
        `${id}-source-type`
      )
  }
}


function setReading(
  id,
  reading = {}
) {

  setScriptureReading(
    id,
    reading || {}
  )
}


function getExtraReferences() {

  const field =
    document.querySelector(
      '#service-plan-extra-references-data'
    )


  if (!field) {
    return []
  }


  try {

    const value =
      JSON.parse(
        field.value ||
        '[]'
      )


    return Array.isArray(value)
      ? value
      : []

  } catch {
    return []
  }
}


function setExtraReferences(
  references = []
) {

  const safeReferences =
    Array.isArray(references)
      ? references
      : []

  const field =
    document.querySelector(
      '#service-plan-extra-references-data'
    )

  const container =
    document.querySelector(
      '#service-plan-extra-references'
    )


  if (field) {
    field.value =
      JSON.stringify(
        safeReferences
      )
  }


  if (!container) {
    return
  }


  if (!safeReferences.length) {

    container.innerHTML =
      '<p style="color:#666;">No extra references have been added.</p>'

    return
  }


  container.innerHTML =
    safeReferences
      .map(
        (reference, index) =>
          scriptureReadingCard({
            label:
              `Extra Reference ${index + 1}`,
            id:
              `service-plan-extra-reference-${index}`,
            reading:
              reference,
            allowSelect:
              false
          })
      )
      .join('')


  bindScriptureReadingCards(
    container
  )
}


function createLegacyUrduReferences(
  references = []
) {

  return references
    .map(
      reference => [
        reference?.urduReference ||
        reference?.translations?.urdu?.reference ||
        '',
        reference?.urdu ||
        reference?.translations?.urdu?.text ||
        ''
      ]
        .filter(Boolean)
        .join('\n')
    )
    .filter(Boolean)
    .join('\n\n')
}


function createLegacyDanishEnglishReferences(
  references = []
) {

  return references
    .map(
      reference => [
        reference?.danishReference ||
        reference?.translations?.danish?.reference ||
        '',
        reference?.danish ||
        reference?.translations?.danish?.text ||
        '',
        reference?.englishReference ||
        reference?.translations?.english?.reference ||
        '',
        reference?.english ||
        reference?.translations?.english?.text ||
        ''
      ]
        .filter(Boolean)
        .join('\n')
    )
    .filter(Boolean)
    .join('\n\n')
}


function setHymn(
  id,
  hymn = {}
) {

  setValue(
    `${id}-title`,
    hymn?.title ||
    hymn?.romanTitle
  )


  setValue(
    `${id}-urdu-title`,
    hymn?.urduTitle
  )


  setValue(
    `${id}-lyrics-url`,
    hymn?.lyricsUrl
  )


  setValue(
    `${id}-lyrics-image-url`,
    hymn?.lyricsImageUrl
  )


  setValue(
    `${id}-lyrics-image-path`,
    hymn?.lyricsImagePath
  )


  setValue(
    `${id}-source-type`,
    hymn?.sourceType
  )
}


function getValue(
  id
) {

  return String(
    document
      .querySelector(
        `#${id}`
      )
      ?.value ||
    ''
  ).trim()
}


function setValue(
  id,
  value
) {

  const element =
    document.querySelector(
      `#${id}`
    )


  if (element) {

    element.value =
      value || ''


    if (
      id.endsWith(
        '-urdu-reference'
      )
    ) {

      element.dir =
        'auto'
    }


    if (
      id.endsWith(
        '-urdu'
      ) ||
      id ===
        'faith-declaration-urdu'
    ) {

      element.dir =
        'rtl'
    }
  }
}


function setChecked(
  id,
  checked
) {

  const element =
    document.querySelector(
      `#${id}`
    )


  if (element) {

    element.checked =
      checked
  }
}


function setStatus(
  text
) {

  const status =
    document.querySelector(
      '#service-plan-status'
    )


  if (status) {

    status.textContent =
      text
  }
}


function setElementText(
  id,
  text
) {

  const element =
    document.querySelector(
      `#${id}`
    )


  if (element) {

    element.textContent =
      text
  }
}


function openServicePlanEditor() {

  document
    .querySelector(
      '#service-plan-editor-overlay'
    )
    .style.display =
      'block'
}


function closeServicePlanEditor() {

  document
    .querySelector(
      '#service-plan-editor-overlay'
    )
    .style.display =
      'none'
}


function escapeHtml(
  value
) {

  return String(
    value || ''
  )
    .replaceAll(
      '&',
      '&amp;'
    )
    .replaceAll(
      '<',
      '&lt;'
    )
    .replaceAll(
      '>',
      '&gt;'
    )
    .replaceAll(
      '"',
      '&quot;'
    )
    .replaceAll(
      "'",
      '&#039;'
    )
}
