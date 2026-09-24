import {
  getCurrentMember
} from '../auth/phoneAuth.js'

import {
  getApprovedMember
} from '../auth/appState.js'

import {
  getAdminAccess
} from '../auth/adminAccessStore.js'

import {
  returnToMemberArea
} from '../members/memberNavigation.js'

import {
  getServicePlans,
  getPublishedServicePlans,
  updateServicePlanStatus,
  deleteServicePlan
} from './servicePlanStore.js'

import {
  createNewServicePlan,
  editServicePlan
} from './servicePlanEditor.js'

import {
  notifyServicePlanPublished
} from './servicePlanNotifications.js'

import {
  openHymnLyrics,
  isLocalHymnbookUrl
} from '../shared/hymnbookBrowser.js'

import {
  createScriptureReaderMarkup,
  bindScriptureReaderTabs,
  normalizeScriptureReading
} from '../shared/scripturePassage.js'

import {
  createApostlesCreedMarkup,
  bindApostlesCreed
} from '../shared/apostlesCreed.js'


import {
  bindLiveSermonStatusButton,
  clearLiveSermonStatusListeners,
  openLiveSermonTranslation
} from '../live-sermon/liveSermonTranslation.js'


export async function openServicePlanSection() {

  const overlay =
    document.querySelector(
      '#service-plan-overlay'
    )


  const content =
    document.querySelector(
      '#service-plan-content'
    )


  const adminArea =
    document.querySelector(
      '#service-plan-admin-area'
    )


  if (
    !overlay ||
    !content ||
    !adminArea
  ) {

    console.error(
      'Service Plan screen is missing.'
    )

    return
  }


  overlay.style.display =
    'block'


  content.innerHTML =
    '<p>Loading Service Plan...</p>'


  adminArea.innerHTML =
    ''


  try {

    await clearLiveSermonStatusListeners()


    const user =
      await getCurrentMember()

    const member =
      getApprovedMember()

    const isGuest =
      member?.guest === true


    if (!user?.uid && !isGuest) {

      content.innerHTML =
        `
          <p>
            Please sign in to view the Service Plan.
          </p>
        `

      return
    }


    const adminAccess =
      user?.uid
        ? await getAdminAccess(
            user.uid
          )
        : null


    const isPlanAdmin =
      !isGuest &&
      adminAccess?.planAdmin ===
      true


    const isTranslationAdmin =
      !isGuest &&
      (
        adminAccess?.planAdmin ===
          true ||
        adminAccess?.churchAdmin ===
          true
      )


    const canViewLiveTranslation =
      !isGuest &&
      Boolean(
        user?.uid
      )


    if (isPlanAdmin) {

      renderAdminArea()
    }


    const plans =
      isGuest
        ? (await getPublishedServicePlans()).slice(0, 1)
        : await getServicePlans()


    renderPlanList(
      plans,
      isPlanAdmin,
      isGuest,
      isTranslationAdmin,
      canViewLiveTranslation
    )

  } catch (error) {

    console.error(
      'Unable to load Service Plans:',
      error
    )


    content.innerHTML =
      `
        <p>
          Unable to load Service Plans.
        </p>
      `
  }
}


export function setupServicePlanUI() {

  document
    .querySelector(
      '#close-service-plan-button'
    )
    ?.addEventListener(
      'click',
      () => {

        document
          .querySelector(
            '#service-plan-overlay'
          )
          .style.display =
            'none'

        clearLiveSermonStatusListeners()
          .catch(
            () => {}
          )

        returnToMemberArea()
      }
    )


  document
    .querySelector(
      '#close-service-plan-bottom-button'
    )
    ?.addEventListener(
      'click',
      () => {

        document
          .querySelector(
            '#service-plan-overlay'
          )
          .style.display =
            'none'

        clearLiveSermonStatusListeners()
          .catch(
            () => {}
          )

        returnToMemberArea()
      }
    )
}


function renderAdminArea() {

  const adminArea =
    document.querySelector(
      '#service-plan-admin-area'
    )


  if (!adminArea) {
    return
  }


  const button =
    document.createElement(
      'button'
    )


  button.type =
    'button'


  button.textContent =
    'Create Service Plan'


  button.style.width =
    '100%'

  button.style.padding =
    '12px'

  button.style.fontWeight =
    'bold'

  button.style.fontSize =
    '16px'

  button.style.marginBottom =
    '18px'


  button.addEventListener(
    'click',
    () => {

      createNewServicePlan()
    }
  )


  adminArea.appendChild(
    button
  )
}


function renderPlanList(
  plans,
  isPlanAdmin,
  isGuest = false,
  isTranslationAdmin = false,
  canViewLiveTranslation = true
) {

  const content =
    document.querySelector(
      '#service-plan-content'
    )


  if (!content) {
    return
  }


  content.innerHTML =
    ''


  let visiblePlans =
    isPlanAdmin
      ? plans
      : plans.filter(
          plan =>
            isPlanVisibleToMembers(
              plan
            )
        )


  /* Guest access intentionally shows only the
   * newest/current published Service Plan. */
  if (isGuest) {
    visiblePlans =
      visiblePlans.slice(0, 1)
  }


  if (!visiblePlans.length) {

    content.innerHTML =
      `
        <p>
          No Service Plans are available yet.
        </p>
      `

    return
  }


  visiblePlans.forEach(
    plan => {

      content.appendChild(
        createPlanCard(
          plan,
          isPlanAdmin,
          isTranslationAdmin,
          canViewLiveTranslation
        )
      )
    }
  )
}


function createPlanCard(
  plan,
  isPlanAdmin,
  isTranslationAdmin = false,
  canViewLiveTranslation = true
) {

  const card =
    document.createElement(
      'div'
    )


  card.style.border =
    '1px solid #dddddd'

  card.style.borderRadius =
    '12px'

  card.style.padding =
    '16px'

  card.style.marginBottom =
    '16px'


  card.appendChild(
    createHeading(
      plan,
      isPlanAdmin
    )
  )


  renderServiceOrder(
    card,
    plan,
    {
      isTranslationAdmin,
      canViewLiveTranslation
    }
  )


  if (isPlanAdmin) {

    card.appendChild(
      createAdminActions(
        plan
      )
    )
  }


  return card
}


function createHeading(
  plan,
  isPlanAdmin
) {

  const wrapper =
    document.createElement(
      'div'
    )


  const heading =
    document.createElement(
      'h3'
    )


  heading.textContent =
    plan.title ||
    'Sunday Service'


  heading.style.marginTop =
    '0'

  heading.style.marginBottom =
    '8px'


  const details =
    document.createElement(
      'div'
    )


  details.style.marginBottom =
    '14px'


  details.innerHTML =
    `
      <strong>
        ${escapeHtml(
          formatDate(
            plan.date
          )
        )}
      </strong>

      ${
        plan.serviceTime
          ? ` - ${escapeHtml(
              plan.serviceTime
            )}`
          : ''
      }

      ${
        isPlanAdmin
          ? ` - ${
              plan.active
                ? 'Published'
                : 'Unpublished'
            }`
          : ''
      }

      ${
        isPlanAdmin &&
        plan.status
          ? ` - ${escapeHtml(
              plan.status
            )}`
          : ''
      }
    `


  wrapper.appendChild(
    heading
  )


  wrapper.appendChild(
    details
  )


  return wrapper
}


function renderServiceOrder(
  card,
  plan,
  {
    isTranslationAdmin = false,
    canViewLiveTranslation = true
  } = {}
) {

  addText(
    card,
    'Welcome',
    plan.welcome
  )

  addScriptureReading(
    card,
    'Opening Reading',
    plan.openingReading
  )

  addText(
    card,
    'Prayer',
    plan.openingPrayer
  )

  addHymn(
    card,
    'First Hymn',
    plan.hymn1
  )

  addHymn(
    card,
    'Second Hymn',
    plan.hymn2
  )

  addScriptureReading(
    card,
    'Reading 1',
    plan.reading1
  )

  addText(
    card,
    'Prayer',
    plan.middlePrayer
  )

  addHymn(
    card,
    'Third Hymn',
    plan.hymn3
  )

  addScriptureReading(
    card,
    'Reading 2',
    plan.reading2
  )

  addHymn(
    card,
    'Hymn number four',
    plan.hymn4
  )

  addApostlesCreed(
    card
  )

  addHymn(
    card,
    'Holy Spirit Hymn',
    plan.holySpiritHymn
  )

  addText(
    card,
    'Prayer',
    plan.prayerAfterHolySpirit
  )

  addSermon(
    card,
    plan,
    {
      isTranslationAdmin,
      canViewLiveTranslation
    }
  )

  addExtraReferences(
    card,
    plan.extraReferences,
    plan.referencesForSermonUrdu ||
    plan.referencesForSermon,
    plan.referencesForSermonDanishEnglish
  )

  addHymn(
    card,
    'Hymn number five',
    plan.hymn5 ||
    plan.postSermonHymn
  )

  addTitle(
    card,
    'Closing Prayers'
  )

  addTitle(
    card,
    'Blessings'
  )

  addText(
    card,
    'Information',
    plan.information ||
    plan.messages
  )
}


function addTitle(
  card,
  title
) {

  card.appendChild(
    createSection(
      title
    )
  )
}


function addScriptureReading(
  card,
  title,
  reading = {}
) {

  const normalized =
    normalizeScriptureReading(
      reading
    )

  const markup =
    createScriptureReaderMarkup({
      id:
        `service-${title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`,
      title,
      reading:
        normalized,
      defaultLanguage:
        'urdu',
      collapsible:
        true,
      collapsedInitially:
        true
    })


  if (!markup) {
    return
  }


  const wrapper =
    document.createElement(
      'div'
    )

  wrapper.innerHTML =
    markup


  const element =
    wrapper.firstElementChild


  if (!element) {
    return
  }


  card.appendChild(
    element
  )

  bindScriptureReaderTabs(
    element
  )
}


function addApostlesCreed(
  card
) {

  const wrapper =
    document.createElement(
      'div'
    )

  wrapper.innerHTML =
    createApostlesCreedMarkup({
      id: 'service-apostles-creed',
      collapsedInitially: true,
      sectionTitle: "Apostles' Creed"
    })

  const element =
    wrapper.firstElementChild

  if (!element) {
    return
  }

  card.appendChild(
    element
  )

  bindApostlesCreed(
    element
  )
}


function addExtraReferences(
  card,
  references = [],
  legacyUrdu = '',
  legacyDanishEnglish = ''
) {

  const items =
    Array.isArray(references)
      ? references
      : []


  if (!items.length) {

    if (
      legacyUrdu ||
      legacyDanishEnglish
    ) {

      addText(
        card,
        'Extra References',
        [
          legacyUrdu,
          legacyDanishEnglish
        ]
          .filter(Boolean)
          .join('\n\n'),
        Boolean(legacyUrdu)
      )
    }

    return
  }


  const section =
    createSection(
      'Extra References'
    )


  items.forEach(
    (reference, index) => {

      const normalized =
        normalizeScriptureReading(
          reference
        )


      const wrapper =
        document.createElement(
          'div'
        )

      wrapper.innerHTML =
        createScriptureReaderMarkup({
          id:
            `service-extra-reference-${index}`,
          title:
            `${index + 1}. Extra Reference`,
          reading:
            normalized,
          defaultLanguage:
            'urdu',
          collapsible:
            true,
          collapsedInitially:
            true
        })


      section.appendChild(
        wrapper
      )

      bindScriptureReaderTabs(
        wrapper
      )
    }
  )


  card.appendChild(
    section
  )
}

function addReading(
  card,
  title,
  reading = {},
  language
) {

  const reference =
    reading?.[`${language}Reference`] ||
    reading?.reference ||
    ''


  const text =
    reading?.[language] ||
    ''


  if (
    !reference &&
    !text
  ) {
    return
  }


  const section =
    createSection(
      title
    )


  if (
    language ===
    'urdu'
  ) {

    section.classList.add(
      'service-plan-urdu-section'
    )
  }


  if (reference) {

    const referenceElement =
      document.createElement(
        'div'
      )


    referenceElement.textContent =
      reference


    referenceElement.style.fontWeight =
      'bold'


    if (
      language ===
      'urdu'
    ) {

      referenceElement.className =
        'urdu-text'
    }


    section.appendChild(
      referenceElement
    )
  }


  if (text) {

    const textElement =
      document.createElement(
        'div'
      )


    textElement.textContent =
      text


    textElement.style.whiteSpace =
      'pre-wrap'


    if (
      language ===
      'urdu'
    ) {

      textElement.className =
        'urdu-text'
    }


    section.appendChild(
      textElement
    )
  }


  card.appendChild(
    section
  )
}


function addHymn(
  card,
  title,
  hymn = {}
) {

  const romanTitle =
    hymn?.romanTitle ||
    hymn?.title ||
    ''


  const url =
    hymn?.lyricsUrl ||
    hymn?.lyricsImageUrl ||
    ''


  if (
    !romanTitle &&
    !hymn?.urduTitle &&
    !url
  ) {
    return
  }


  const section =
    createSection(
      title
    )


  const titleArea =
    document.createElement(
      'div'
    )

  titleArea.dataset.hymnTitleArea =
    'true'


  const addUrduTitle =
    urduTitle => {

      const value =
        String(
          urduTitle ||
          ''
        ).trim()


      if (!value) {
        return
      }


      let urduBody =
        titleArea.querySelector(
          '[data-service-hymn-urdu-title]'
        )


      if (!urduBody) {

        urduBody =
          document.createElement(
            'div'
          )

        urduBody.dataset.serviceHymnUrduTitle =
          'true'

        urduBody.className =
          'urdu-text'

        urduBody.dir =
          'rtl'

        urduBody.style.textAlign =
          'right'

        urduBody.style.fontSize =
          '20px'

        urduBody.style.lineHeight =
          '1.8'

        urduBody.style.marginBottom =
          romanTitle
            ? '4px'
            : '0'


        titleArea.insertBefore(
          urduBody,
          titleArea.firstChild
        )
      }


      urduBody.textContent =
        value
    }


  addUrduTitle(
    hymn?.urduTitle
  )


  if (romanTitle) {

    const body =
      document.createElement(
        'div'
      )


    body.dir =
      'ltr'

    body.style.direction =
      'ltr'

    body.style.textAlign =
      'left'

    body.style.whiteSpace =
      'pre-wrap'

    body.textContent =
      romanTitle


    titleArea.appendChild(
      body
    )
  }


  section.appendChild(
    titleArea
  )


  /*
   * Older saved Service Plans may only
   * contain the Roman title. When the
   * hymn is one of our bundled local
   * HTML hymns, recover the Urdu title
   * from that local page so old plans
   * also display both titles.
   */
  if (
    !hymn?.urduTitle &&
    hymn?.lyricsUrl &&
    isLocalHymnbookUrl(
      hymn.lyricsUrl
    ) &&
    !String(
      hymn.lyricsUrl
    ).startsWith(
      '/hymnbook/admin-geet/'
    )
  ) {

    hydrateLocalHymnUrduTitle(
      hymn.lyricsUrl,
      addUrduTitle
    )
  }


  if (url) {

    const button =
      document.createElement(
        'button'
      )


    button.type =
      'button'


    button.className =
      'service-plan-hymn-button'


    button.textContent =
      'Open Hymn'


    button.addEventListener(
      'click',
      () => openHymnUrl(
        url
      )
    )


    section.appendChild(
      button
    )
  }


  card.appendChild(
    section
  )
}


async function hydrateLocalHymnUrduTitle(
  url,
  onTitle
) {

  try {

    const response =
      await fetch(
        url
      )


    if (!response.ok) {
      return
    }


    const html =
      await response.text()


    const doc =
      new DOMParser()
        .parseFromString(
          html,
          'text/html'
        )


    const urduTitle =
      doc.querySelector(
        '.urdu-title'
      )
        ?.textContent
        ?.replace(
          /\s+/g,
          ' '
        )
        ?.trim() ||
      ''


    if (urduTitle) {
      onTitle?.(
        urduTitle
      )
    }

  } catch (error) {

    console.warn(
      'Unable to recover Urdu hymn title:',
      error
    )
  }
}

async function openHymnUrl(
  url
) {

  await openHymnLyrics(
    url
  )
}



function addSermon(
  card,
  plan = {},
  {
    isTranslationAdmin = false,
    canViewLiveTranslation = true
  } = {}
) {

  const sermon =
    plan?.sermon ||
    {}


  const section =
    createSection(
      'Sermon'
    )


  ;[
    sermon.title,
    sermon.reference,
    sermon.preacher
  ]
    .filter(Boolean)
    .forEach(
      value => {

        const item =
          document.createElement(
            'div'
          )


        item.textContent =
          value


        section.appendChild(
          item
        )
      }
    )


  const liveButton =
    document.createElement(
      'button'
    )


  liveButton.type =
    'button'

  liveButton.textContent =
    'Live Translation'


  liveButton.addEventListener(
    'click',
    () => {

      openLiveSermonTranslation({
        plan,
        isTranslationAdmin,
        canViewLiveTranslation
      })
    }
  )


  section.appendChild(
    liveButton
  )


  bindLiveSermonStatusButton(
    liveButton,
    {
      planId:
        plan.id,
      canViewLiveTranslation
    }
  )
    .catch(
      error => {
        console.warn(
          'Unable to bind Live Translation button:',
          error
        )
      }
    )


  card.appendChild(
    section
  )
}


function addText(
  card,
  title,
  value,
  isUrdu = false
) {

  if (!value) {
    return
  }


  const section =
    createSection(
      title
    )


  if (isUrdu) {

    section.classList.add(
      'service-plan-urdu-section'
    )
  }


  const body =
    document.createElement(
      'div'
    )


  body.textContent =
    value


  body.style.whiteSpace =
    'pre-wrap'


  if (isUrdu) {

    body.className =
      'urdu-text'
  }


  section.appendChild(
    body
  )


  card.appendChild(
    section
  )
}


function createSection(
  title
) {

  const section =
    document.createElement(
      'section'
    )


  section.className =
    'service-plan-section'


  const heading =
    document.createElement(
      'h3'
    )


  heading.textContent =
    title


  section.appendChild(
    heading
  )


  return section
}


function createAdminActions(
  plan
) {

  const wrapper =
    document.createElement(
      'div'
    )


  wrapper.style.display =
    'grid'

  wrapper.style.gridTemplateColumns =
    '1fr 1fr'

  wrapper.style.gap =
    '10px'

  wrapper.style.marginTop =
    '14px'


  const approveButton =
    createActionButton(
      'Approve'
    )


  approveButton.addEventListener(
    'click',
    async () => {

      await setPlanStatus(
        plan,
        'approved',
        false
      )
    }
  )


  const rejectButton =
    createActionButton(
      'Reject'
    )


  rejectButton.addEventListener(
    'click',
    async () => {

      await setPlanStatus(
        plan,
        'rejected',
        false
      )
    }
  )


  const publishButton =
    createActionButton(
      'Publish'
    )


  publishButton.addEventListener(
    'click',
    async () => {

      await setPlanStatus(
        plan,
        'published',
        true
      )
    }
  )


  const editButton =
    createActionButton(
      'Edit Service Plan'
    )


  editButton.addEventListener(
    'click',
    () => {

      editServicePlan(
        plan
      )
    }
  )


  const deleteButton =
    createActionButton(
      'Delete Service Plan'
    )


  deleteButton.style.background =
    '#b42318'

  deleteButton.style.color =
    '#ffffff'

  deleteButton.style.border =
    '0'


  deleteButton.addEventListener(
    'click',
    async () => {

      await deletePlan(
        plan
      )
    }
  )


  ;[
    approveButton,
    rejectButton,
    publishButton,
    editButton,
    deleteButton
  ].forEach(
    button => {
      wrapper.appendChild(
        button
      )
    }
  )


  return wrapper
}


function createActionButton(
  label
) {

  const button =
    document.createElement(
      'button'
    )

  button.type =
    'button'

  button.textContent =
    label

  button.style.padding =
    '10px'

  return button
}


async function setPlanStatus(
  plan,
  status,
  active
) {

  try {

    await updateServicePlanStatus(
      plan.id,
      {
        status,
        active
      }
    )


    if (
      status === 'published'
    ) {

      const user =
        await getCurrentMember()

      await notifyServicePlanPublished({
        uid:
          user?.uid,
        planId:
          plan.id,
        title:
          plan.title,
        date:
          plan.date
      })
    }


    await openServicePlanSection()

  } catch (error) {

    console.error(
      'Unable to update Service Plan status:',
      error
    )

    alert(
      `Unable to update Service Plan: ${
        error?.message ||
        error
      }`
    )
  }
}


async function deletePlan(
  plan
) {

  const confirmed =
    window.confirm(
      `Delete "${
        plan.title ||
        'Service Plan'
      }"?`
    )


  if (!confirmed) {
    return
  }


  try {

    await deleteServicePlan(
      plan.id
    )


    await openServicePlanSection()

  } catch (error) {

    console.error(
      'Unable to delete Service Plan:',
      error
    )


    alert(
      `Unable to delete Service Plan: ${
        error?.message ||
        error
      }`
    )
  }
}


function isPlanVisibleToMembers(
  plan
) {

  if (
    plan.active !== true
  ) {

    return false
  }


  const serviceDate =
    getServiceDate(
      plan
    )


  if (!serviceDate) {
    return true
  }


  const visibleUntil =
    new Date(
      serviceDate.getTime() +
      12 * 60 * 60 * 1000
    )


  return Date.now() <=
    visibleUntil.getTime()
}


function getServiceDate(
  plan
) {

  if (!plan?.date) {
    return null
  }


  const serviceTime =
    plan.serviceTime ||
    '23:59'


  const date =
    new Date(
      `${plan.date}T${serviceTime}:00`
    )


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return null
  }


  return date
}


function formatDate(
  value
) {

  if (!value) {
    return ''
  }


  const date =
    new Date(
      `${value}T12:00:00`
    )


  if (
    Number.isNaN(
      date.getTime()
    )
  ) {

    return value
  }


  return date.toLocaleDateString(
    'en-GB',
    {
      weekday:
        'long',

      day:
        'numeric',

      month:
        'long',

      year:
        'numeric'
    }
  )
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
