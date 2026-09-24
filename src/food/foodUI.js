import {
  getActiveFoodEvents,
  getAllFoodEvents,
  updateFoodEvent,
  createFoodEvent,
  deleteFoodEvent
} from './foodStore.js'

import {
  uploadFoodVoiceMessage,
  deleteFoodVoiceMessage
} from './foodVoiceStore.js'

import {
  getFoodRegistrations,
  createFoodRegistration,
  updateFoodRegistrationQuantity,
  updateFoodRegistrationPaid,
  deleteFoodRegistration
} from './foodRegistrationStore.js'

import {
  getCurrentMember
} from '../auth/phoneAuth.js'

import {
  getApprovedMember,
  getAdminFoodEvent,
  setAdminFoodEvent,
  getFoodAdminMode,
  setFoodAdminMode
} from '../auth/appState.js'

import {
  returnToMemberArea
} from '../members/memberNavigation.js'

import {
  notifyFoodEventCreated,
  notifyFoodEventUpdated
} from './foodNotifications.js'


let foodVoiceRecorder = null
let foodVoiceChunks = []
let foodVoiceBlob = null


export function setupFoodUI() {

  document
    .querySelector('#close-food-button')
    .addEventListener(
      'click',
      closeFoodSection
    )


  document
    .querySelector('#close-food-top-button')
    .addEventListener(
      'click',
      closeFoodSection
    )


  document
    .querySelector('#close-food-admin-button')
    .addEventListener(
      'click',
      () => {
        document
          .querySelector('#food-admin-overlay')
          .style.display = 'none'
      }
    )


  document
    .querySelector('#food-admin-form')
    .addEventListener(
      'submit',
      saveFoodAdminForm
    )


  document
    .querySelector('#record-food-voice-button')
    .addEventListener(
      'click',
      startFoodVoiceRecording
    )


  document
    .querySelector('#stop-food-voice-button')
    .addEventListener(
      'click',
      stopFoodVoiceRecording
    )


  document
    .querySelector('#remove-food-voice-button')
    .addEventListener(
      'click',
      removeFoodVoiceMessage
    )
}


function closeFoodSection() {

  document
    .querySelector('#food-overlay')
    .style.display = 'none'

  returnToMemberArea()
}


function isCurrentOrUpcomingFoodEvent(
  foodEvent
) {

  if (!foodEvent?.date) {
    return true
  }


  return String(foodEvent.date) >=
    new Date()
      .toISOString()
      .slice(0, 10)
}


function isFoodAdmin() {

  const member =
    getApprovedMember()

  return member?.foodAdmin === true
}


async function renderFoodAdminArea() {

  const area =
    document.querySelector(
      '#food-admin-area'
    )

  area.innerHTML = ''

  if (!isFoodAdmin()) {
    return
  }


  area.innerHTML = `
    <div
      style="
        background:#fff8df;
        border:1px solid #eadcaa;
        border-radius:10px;
        padding:14px;
        margin-bottom:16px;
      "
    >
      <h3
        style="
          margin-top:0;
          margin-bottom:12px;
        "
      >
        Food Admin Dashboard
      </h3>

      <button
        id="create-food-event-dashboard-button"
        type="button"
        style="
          width:100%;
          padding:12px;
          margin-bottom:10px;
          font-size:16px;
          font-weight:bold;
        "
      >
        Create Food Event
      </button>

      <button
        id="manage-food-events-dashboard-button"
        type="button"
        style="
          width:100%;
          padding:12px;
          font-size:16px;
          font-weight:bold;
        "
      >
        Manage Food Events
      </button>

      <div
        id="food-admin-manage-list"
        style="
          display:none;
          margin-top:14px;
        "
      ></div>
    </div>
  `


  document
    .querySelector(
      '#create-food-event-dashboard-button'
    )
    .addEventListener(
      'click',
      () => openFoodAdminCreate()
    )


  document
    .querySelector(
      '#manage-food-events-dashboard-button'
    )
    .addEventListener(
      'click',
      () => {
        const list =
          document.querySelector(
            '#food-admin-manage-list'
          )

        list.style.display =
          list.style.display === 'none'
            ? 'block'
            : 'none'
      }
    )


  const events =
    await getAllFoodEvents()


  const sortedEvents =
    [...events].sort(
      (a, b) =>
        String(b.date || '')
          .localeCompare(
            String(a.date || '')
          )
    )


  if (!sortedEvents.length) {

    const empty =
      document.createElement('p')

    empty.textContent =
      'No food events created yet.'

    document
      .querySelector(
        '#food-admin-manage-list'
      )
      .appendChild(empty)

    return
  }


  const listHeading =
    document.createElement('div')

  listHeading.innerHTML =
    '<strong>Manage Events</strong>'

  listHeading.style.marginBottom =
    '10px'

  document
    .querySelector(
      '#food-admin-manage-list'
    )
    .appendChild(listHeading)


  sortedEvents
    .slice(
      0,
      3
    )
    .forEach(foodEvent => {

    const card =
      document.createElement('div')

    card.style.border =
      '1px solid #dddddd'

    card.style.borderRadius =
      '8px'

    card.style.padding =
      '12px'

    card.style.marginBottom =
      '10px'


    const statusText =
      foodEvent.active === true
        ? 'Active'
        : 'Inactive'


    card.innerHTML = `
      <div
        style="
          font-weight:bold;
          margin-bottom:6px;
        "
      >
        ${escapeHtml(
          foodEvent.title ||
          'Food Event'
        )}
      </div>

      <div
        style="
          font-size:14px;
          margin-bottom:4px;
        "
      >
        ${escapeHtml(
          foodEvent.date || ''
        )}

        ${foodEvent.time
          ? ` • ${escapeHtml(
              foodEvent.time
            )}`
          : ''
        }
      </div>

      <div
        style="
          font-size:14px;
          margin-bottom:10px;
        "
      >
        Status:
        <strong>
          ${statusText}
        </strong>
      </div>
    `


    const editButton =
      document.createElement('button')

    editButton.textContent =
      'Edit'

    editButton.style.width =
      '100%'

    editButton.style.padding =
      '10px'

    editButton.style.marginBottom =
      '8px'

    editButton.addEventListener(
      'click',
      () => {
        openFoodAdminEdit(
          foodEvent
        )
      }
    )


    const deleteButton =
      document.createElement('button')

    deleteButton.textContent =
      'Delete'

    deleteButton.style.width =
      '100%'

    deleteButton.style.padding =
      '10px'

    deleteButton.style.background =
      '#8b1e1e'

    deleteButton.style.color =
      'white'

    deleteButton.addEventListener(
      'click',
      () => deleteFoodAdminEvent(
        foodEvent
      )
    )


    card.appendChild(editButton)
    card.appendChild(deleteButton)

    document
      .querySelector(
        '#food-admin-manage-list'
      )
      .appendChild(card)

    appendFoodPaymentAdmin(
      card,
      foodEvent
    )
  })
}


async function appendFoodPaymentAdmin(
  card,
  foodEvent
) {

  const section =
    document.createElement('div')

  section.style.marginTop =
    '14px'

  section.style.paddingTop =
    '14px'

  section.style.borderTop =
    '1px solid #dddddd'

  section.innerHTML =
    '<strong>Payment status</strong><p style="margin:7px 0 0;">Loading registrations...</p>'

  card.appendChild(section)


  try {

    const registrations =
      await getFoodRegistrations(
        foodEvent.id
      )


    if (!registrations.length) {

      section.innerHTML =
        '<strong>Payment status</strong><p style="margin:7px 0 0;">No registrations yet.</p>'

      return
    }


    section.innerHTML =
      '<strong>Payment status</strong>'


    registrations.forEach(
      registration => {

        const row =
          document.createElement('div')

        row.style.border =
          '1px solid #e2e2e2'

        row.style.borderRadius =
          '8px'

        row.style.padding =
          '10px'

        row.style.marginTop =
          '8px'


        const choice =
          registration.paymentChoice === 'pay_now'
            ? 'Pay Now'
            : 'Pay Later'


        row.innerHTML = `
          <div style="font-weight:bold;">
            ${escapeHtml(
              registration.name ||
              'Member'
            )}
          </div>

          <div style="font-size:13px;margin-top:4px;">
            ${Number(
              registration.quantity ||
              1
            )} attending • ${escapeHtml(choice)}
          </div>

          <div style="font-size:13px;margin-top:4px;">
            Payment:
            <strong>
              ${registration.paid === true
                ? 'Paid'
                : 'Unpaid'
              }
            </strong>
          </div>
        `


        const paymentButton =
          document.createElement('button')

        paymentButton.type =
          'button'

        paymentButton.textContent =
          registration.paid === true
            ? 'Mark as Unpaid'
            : 'Mark as Paid'

        paymentButton.style.width =
          '100%'

        paymentButton.style.padding =
          '9px'

        paymentButton.style.marginTop =
          '8px'


        paymentButton.addEventListener(
          'click',
          async () => {

            paymentButton.disabled =
              true

            try {

              await updateFoodRegistrationPaid({
                registrationId:
                  registration.id,

                paid:
                  registration.paid !== true
              })

              await openFoodSection()

            } catch (error) {

              console.error(error)

              alert(
                'Unable to update payment status.'
              )

            } finally {

              paymentButton.disabled =
                false
            }
          }
        )


        row.appendChild(
          paymentButton
        )

        section.appendChild(
          row
        )
      }
    )

  } catch (error) {

    console.error(
      'Unable to load food payment status:',
      error
    )

    section.innerHTML =
      '<strong>Payment status</strong><p style="margin:7px 0 0;">Unable to load registrations.</p>'
  }
}


function openFoodAdminCreate() {

  setFoodAdminMode('create')
  setAdminFoodEvent(null)
  resetFoodVoiceControls()

  document
    .querySelector(
      '#food-admin-heading'
    )
    .textContent =
      'Create New Food Event'

  document
    .querySelector(
      '#food-admin-status'
    )
    .textContent = ''

  document
    .querySelector(
      '#save-food-admin-button'
    )
    .textContent =
      'Create Event'

  document
    .querySelector(
      '#admin-food-title'
    )
    .value = ''

  document
    .querySelector(
      '#admin-food-date'
    )
    .value = ''

  document
    .querySelector(
      '#admin-food-time'
    )
    .value = ''

  document
    .querySelector(
      '#admin-food-price'
    )
    .value = ''

  document
    .querySelector(
      '#admin-food-deadline'
    )
    .value = ''

  document
    .querySelector(
      '#admin-food-info'
    )
    .value = ''

  document
    .querySelector(
      '#admin-food-mobilepay-link'
    )
    .value = ''

  document
    .querySelector(
      '#admin-food-active'
    )
    .checked = true

  document
    .querySelector(
      '#food-admin-overlay'
    )
    .style.display = 'flex'
}


function openFoodAdminEdit(foodEvent) {

  setFoodAdminMode('edit')
  setAdminFoodEvent(foodEvent)
  resetFoodVoiceControls(
    foodEvent
  )

  document
    .querySelector(
      '#food-admin-heading'
    )
    .textContent =
      'Edit Food Event'

  document
    .querySelector(
      '#food-admin-status'
    )
    .textContent = ''

  document
    .querySelector(
      '#save-food-admin-button'
    )
    .textContent =
      'Save Changes'

  document
    .querySelector(
      '#admin-food-title'
    )
    .value =
      foodEvent.title || ''

  document
    .querySelector(
      '#admin-food-date'
    )
    .value =
      foodEvent.date || ''

  document
    .querySelector(
      '#admin-food-time'
    )
    .value =
      foodEvent.time || ''

  document
    .querySelector(
      '#admin-food-price'
    )
    .value =
      foodEvent.price ?? ''

  document
    .querySelector(
      '#admin-food-deadline'
    )
    .value =
      foodEvent.deadline || ''

  document
    .querySelector(
      '#admin-food-info'
    )
    .value =
      foodEvent.info || ''

  document
    .querySelector(
      '#admin-food-mobilepay-link'
    )
    .value =
      foodEvent.mobilePayLink || ''

  document
    .querySelector(
      '#admin-food-active'
    )
    .checked =
      foodEvent.active === true

  document
    .querySelector(
      '#food-admin-overlay'
    )
    .style.display = 'flex'
}


async function saveFoodAdminForm(event) {

  event.preventDefault()

  const status =
    document.querySelector(
      '#food-admin-status'
    )

  const saveButton =
    document.querySelector(
      '#save-food-admin-button'
    )


  const eventData = {

    title:
      document.querySelector(
        '#admin-food-title'
      ).value.trim(),

    date:
      document.querySelector(
        '#admin-food-date'
      ).value,

    time:
      document.querySelector(
        '#admin-food-time'
      ).value,

    price:
      Number(
        document.querySelector(
          '#admin-food-price'
        ).value
      ),

    deadline:
      document.querySelector(
        '#admin-food-deadline'
      ).value,

    info:
      document.querySelector(
        '#admin-food-info'
      ).value.trim(),

    mobilePayLink:
      document.querySelector(
        '#admin-food-mobilepay-link'
      ).value.trim(),

    active:
      document.querySelector(
        '#admin-food-active'
      ).checked
  }


  if (
    !eventData.title ||
    !eventData.date ||
    !eventData.time ||
    !eventData.deadline
  ) {

    status.textContent =
      'Please complete all required fields.'

    return
  }


  if (
    Number.isNaN(eventData.price) ||
    eventData.price < 0
  ) {

    status.textContent =
      'Please enter a valid price.'

    return
  }


  const mode =
    getFoodAdminMode()


  const currentUser =
    await getCurrentMember()


  if (!currentUser?.uid) {
    status.textContent =
      'Please sign in again.'

    return
  }


  saveButton.disabled = true

  saveButton.textContent =
    mode === 'create'
      ? 'Creating...'
      : 'Saving...'


  try {

    const currentEvent =
      getAdminFoodEvent()

    if (foodVoiceBlob) {

      const uploaded =
        await uploadFoodVoiceMessage({
          uid:
            currentUser.uid,

          audioBlob:
            foodVoiceBlob
        })

      if (uploaded) {
        eventData.voiceMessageUrl =
          uploaded.voiceMessageUrl

        eventData.voiceMessagePath =
          uploaded.voiceMessagePath

        if (currentEvent?.voiceMessagePath) {
          await deleteFoodVoiceMessage(
            currentEvent.voiceMessagePath
          )
        }
      }

    } else {

      eventData.voiceMessageUrl =
        currentEvent?.voiceMessageUrl || ''

      eventData.voiceMessagePath =
        currentEvent?.voiceMessagePath || ''
    }


    let notificationWarning =
      ''


    if (mode === 'create') {

      const eventId =
        await createFoodEvent(
          eventData
        )


      try {
        await notifyFoodEventCreated({
          uid:
            currentUser.uid,
          eventId,
          title:
            eventData.title,
          date:
            eventData.date,
          time:
            eventData.time
        })
      } catch (notificationError) {
        console.error(
          'Food event created, but notification failed:',
          notificationError
        )

        notificationWarning =
          ' Event was saved, but the member notification could not be sent.'
      }


      status.textContent =
        `New food event created successfully.${notificationWarning}`

    } else {

      if (!currentEvent) {

        status.textContent =
          'No food event selected.'

        return
      }


      await updateFoodEvent(
        currentEvent.id,
        eventData
      )


      try {
        await notifyFoodEventUpdated({
          uid:
            currentUser.uid,
          eventId:
            currentEvent.id,
          title:
            eventData.title,
          date:
            eventData.date,
          time:
            eventData.time
        })
      } catch (notificationError) {
        console.error(
          'Food event updated, but notification failed:',
          notificationError
        )

        notificationWarning =
          ' Event was saved, but the member notification could not be sent.'
      }


      status.textContent =
        `Food event updated successfully.${notificationWarning}`
    }


    await openFoodSection()


    setTimeout(
      () => {

        document
          .querySelector(
            '#food-admin-overlay'
          )
          .style.display =
            'none'
      },
      600
    )


  } catch (error) {

    console.error(error)

    status.textContent =
      `Unable to save: ${
        error?.message || error
      }`

  } finally {

    saveButton.disabled =
      false

    saveButton.textContent =
      mode === 'create'
        ? 'Create Event'
        : 'Save Changes'
  }
}


async function deleteFoodAdminEvent(
  foodEvent
) {

  const confirmed =
    confirm(
      `Delete "${
        foodEvent.title ||
        'this food event'
      }"?`
    )

  if (!confirmed) {
    return
  }


  try {

    await deleteFoodEvent(
      foodEvent.id
    )


    if (foodEvent.voiceMessagePath) {
      await deleteFoodVoiceMessage(
        foodEvent.voiceMessagePath
      )
    }


    await openFoodSection()

  } catch (error) {

    console.error(error)

    alert(
      'Unable to delete food event.'
    )
  }
}


function resetFoodVoiceControls(
  foodEvent = null
) {

  foodVoiceRecorder = null
  foodVoiceChunks = []
  foodVoiceBlob = null


  const status =
    document.querySelector(
      '#food-voice-status'
    )

  const preview =
    document.querySelector(
      '#food-voice-preview'
    )

  const recordButton =
    document.querySelector(
      '#record-food-voice-button'
    )

  const stopButton =
    document.querySelector(
      '#stop-food-voice-button'
    )

  const removeButton =
    document.querySelector(
      '#remove-food-voice-button'
    )

  const recordingIndicator =
    document.querySelector(
      '#food-voice-recording-indicator'
    )


  recordingIndicator.style.display =
    'none'

  status.textContent =
    foodEvent?.voiceMessageUrl
      ? 'Existing voice message is attached.'
      : 'No voice message recorded.'

  preview.innerHTML =
    foodEvent?.voiceMessageUrl
      ? `
        <audio
          controls
          src="${escapeHtml(
            foodEvent.voiceMessageUrl
          )}"
          style="
            width:100%;
            margin-top:8px;
          "
        ></audio>
      `
      : ''

  recordButton.disabled =
    false

  stopButton.disabled =
    true

  removeButton.disabled =
    !foodEvent?.voiceMessageUrl
}


function getSupportedFoodVoiceMimeType() {

  if (!window.MediaRecorder?.isTypeSupported) {
    return ''
  }


  const types = [
    'audio/webm;codecs=opus',
    'audio/webm',
    'audio/ogg;codecs=opus',
    'audio/mp4'
  ]


  return types.find(
    type => MediaRecorder.isTypeSupported(
      type
    )
  ) || ''
}


async function startFoodVoiceRecording() {

  const status =
    document.querySelector(
      '#food-voice-status'
    )


  if (
    !navigator.mediaDevices ||
    !window.MediaRecorder
  ) {
    status.textContent =
      'Voice recording is not available on this device.'

    return
  }


  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio:
          true
      })

    foodVoiceChunks = []

    const mimeType =
      getSupportedFoodVoiceMimeType()

    const recorderOptions =
      mimeType
        ? { mimeType }
        : undefined

    foodVoiceRecorder =
      new MediaRecorder(
        stream,
        recorderOptions
      )

    foodVoiceRecorder.addEventListener(
      'dataavailable',
      event => {
        if (event.data?.size) {
          foodVoiceChunks.push(
            event.data
          )
        }
      }
    )

    foodVoiceRecorder.addEventListener(
      'stop',
      () => {
        foodVoiceBlob =
          new Blob(
            foodVoiceChunks,
            {
              type:
                foodVoiceRecorder.mimeType ||
                mimeType ||
                'audio/webm'
            }
          )

        stream
          .getTracks()
          .forEach(
            track => track.stop()
          )

        const preview =
          document.querySelector(
            '#food-voice-preview'
          )

        preview.innerHTML = `
          <audio
            controls
            src="${URL.createObjectURL(
              foodVoiceBlob
            )}"
            style="
              width:100%;
              margin-top:8px;
            "
          ></audio>
        `

        status.textContent =
          'Voice message recorded. It will upload when you save the event.'

        document
          .querySelector(
            '#food-voice-recording-indicator'
          )
          .style.display = 'none'

        document
          .querySelector(
            '#record-food-voice-button'
          )
          .disabled = false

        document
          .querySelector(
            '#stop-food-voice-button'
          )
          .disabled = true

        document
          .querySelector(
            '#remove-food-voice-button'
          )
          .disabled = false
      }
    )

    foodVoiceRecorder.start()

    status.textContent =
      'Recording voice message...'

    document
      .querySelector(
        '#food-voice-recording-indicator'
      )
      .style.display = 'flex'

    document
      .querySelector(
        '#record-food-voice-button'
      )
      .disabled = true

    document
      .querySelector(
        '#stop-food-voice-button'
      )
      .disabled = false

  } catch (error) {

    console.error(error)

    document
      .querySelector(
        '#food-voice-recording-indicator'
      )
      .style.display = 'none'

    status.textContent =
      `Unable to start voice recording: ${
        error?.name || 'Error'
      } ${
        error?.message || ''
      }`.trim()
  }
}


function stopFoodVoiceRecording() {

  if (
    foodVoiceRecorder &&
    foodVoiceRecorder.state !== 'inactive'
  ) {
    foodVoiceRecorder.stop()
  }
}


async function removeFoodVoiceMessage() {

  const currentEvent =
    getAdminFoodEvent()

  foodVoiceBlob = null
  foodVoiceChunks = []


  if (
    currentEvent?.voiceMessagePath &&
    confirm(
      'Remove the voice message from this food event?'
    )
  ) {

    try {

      await deleteFoodVoiceMessage(
        currentEvent.voiceMessagePath
      )

      await updateFoodEvent(
        currentEvent.id,
        {
          ...currentEvent,
          voiceMessageUrl:
            '',
          voiceMessagePath:
            ''
        }
      )

      const updatedEvent = {
        ...currentEvent,
        voiceMessageUrl:
          '',
        voiceMessagePath:
          ''
      }

      setAdminFoodEvent(
        updatedEvent
      )

      resetFoodVoiceControls(
        updatedEvent
      )

      return

    } catch (error) {

      console.error(error)

      alert(
        'Unable to remove voice message.'
      )

      return
    }
  }


  resetFoodVoiceControls(
    getAdminFoodEvent()
  )
}


export async function openFoodSection() {

  const overlay =
    document.querySelector(
      '#food-overlay'
    )

  const content =
    document.querySelector(
      '#food-content'
    )

  overlay.style.display =
    'flex'

  content.innerHTML =
    '<p>Loading food information...</p>'


  try {

    await renderFoodAdminArea()


    const events =
      await getActiveFoodEvents()

    const currentUser =
      await getCurrentMember()


    if (!events.length) {

      content.innerHTML =
        '<p>No active food event is available.</p>'

      return
    }


    const sortedEvents =
      [...events]
        .filter(
          isCurrentOrUpcomingFoodEvent
        )
        .sort(
        (a, b) =>
          String(a.date || '')
            .localeCompare(
              String(b.date || '')
            )
        )


    if (!sortedEvents.length) {

      content.innerHTML =
        '<p>No active food event is available.</p>'

      return
    }


    const visibleEvents =
      sortedEvents.slice(
        0,
        1
      )


    content.innerHTML = ''


    for (
      const foodEvent
      of visibleEvents
    ) {

      const registrations =
        await getFoodRegistrations(
          foodEvent.id
        )


      const myRegistration =
        registrations.find(
          registration =>
            registration.uid ===
            currentUser?.uid
        )


      const totalRegistered =
        registrations.reduce(
          (total, registration) =>
            total +
            Number(
              registration.quantity ||
              1
            ),
          0
        )


      const namesHtml =
        registrations.length
          ? `
            <ul>
              ${
                registrations
                  .map(
                    registration => `
                      <li>
                        ${escapeHtml(
                          registration.name ||
                          'Member'
                        )}

                        ${
                          Number(
                            registration.quantity ||
                            1
                          ) > 1
                            ? ` (${Number(
                                registration.quantity
                              )} people)`
                            : ''
                        }
                      </li>
                    `
                  )
                  .join('')
              }
            </ul>
          `
          : '<p>No registrations yet.</p>'


      const selectedQuantity =
        Number(
          myRegistration?.quantity ||
          1
        )

      const selectedTotal =
        selectedQuantity *
        Number(
          foodEvent.price || 0
        )


      const selectedPaymentChoice =
        myRegistration?.paymentChoice ||
        ''


      const card =
        document.createElement(
          'div'
        )

      card.style.border =
        '1px solid #dddddd'

      card.style.borderRadius =
        '10px'

      card.style.padding =
        '16px'

      card.style.marginBottom =
        '14px'


      card.innerHTML = `
        <h3 style="margin-top:0;">
          ${escapeHtml(
            foodEvent.title ||
            'Sunday Dinner'
          )}
        </h3>

        <p>
          <strong>Date:</strong>
          ${escapeHtml(
            foodEvent.date || ''
          )}
        </p>

        <p>
          <strong>Time:</strong>
          ${escapeHtml(
            foodEvent.time || ''
          )}
        </p>

        <p>
          <strong>Price:</strong>
          ${escapeHtml(
            String(
              foodEvent.price ?? ''
            )
          )} kr.
        </p>

        <p>
          <strong>
            Registration deadline:
          </strong>

          ${escapeHtml(
            foodEvent.deadline || ''
          )}
        </p>

        <p>
          ${escapeHtml(
            foodEvent.info || ''
          )}
        </p>

        ${
          foodEvent.voiceMessageUrl
            ? `
              <div
                style="
                  background:#fff8df;
                  border:1px solid #eadcaa;
                  border-radius:10px;
                  padding:12px;
                  margin-bottom:14px;
                "
              >
                <strong>
                  Food voice message
                </strong>

                <audio
                  controls
                  src="${escapeHtml(
                    foodEvent.voiceMessageUrl
                  )}"
                  style="
                    width:100%;
                    margin-top:8px;
                  "
                ></audio>
              </div>
            `
            : ''
        }

        <hr>

        <p>
          <strong>
            Total people registered:
          </strong>

          ${totalRegistered}
        </p>

        <strong>
          Registered members:
        </strong>

        ${namesHtml}

        <hr>

        <label>
          <strong>
            Number attending:
          </strong>
        </label>

        <select
          class="food-quantity"
          data-event-id="${escapeHtml(
            foodEvent.id
          )}"
          data-price="${escapeHtml(
            String(
              foodEvent.price || 0
            )
          )}"
          style="
            width:100%;
            padding:10px;
            margin-top:8px;
            margin-bottom:12px;
            font-size:16px;
          "
        >

          ${
            [1,2,3,4,5,6,7,8,9,10]
              .map(
                number => `
                  <option
                    value="${number}"
                    ${
                      number ===
                      selectedQuantity
                        ? 'selected'
                        : ''
                    }
                  >
                    ${number}
                  </option>
                `
              )
              .join('')
          }

        </select>

        <div
          class="food-payment-box"
          data-event-id="${escapeHtml(
            foodEvent.id
          )}"
          data-payment-choice="${escapeHtml(
            selectedPaymentChoice
          )}"
          data-has-mobilepay="${foodEvent.mobilePayLink
            ? 'true'
            : 'false'
          }"
          style="
            background:#fff8df;
            border:1px solid #eadcaa;
            border-radius:10px;
            padding:12px;
            margin-bottom:12px;
          "
        >
          <div>
            <strong>
              Amount to pay:
            </strong>

            <span
              class="food-payment-total"
              data-event-id="${escapeHtml(
                foodEvent.id
              )}"
            >
              ${selectedTotal}
            </span>
            kr.
          </div>

          <div
            style="
              margin-top:14px;
              font-weight:bold;
            "
          >
            Do you want to pay now?
          </div>

          <div
            style="
              display:grid;
              grid-template-columns:1fr 1fr;
              gap:8px;
              margin-top:9px;
            "
          >
            <button
              type="button"
              class="food-payment-choice"
              data-event-id="${escapeHtml(
                foodEvent.id
              )}"
              data-choice="pay_now"
              ${foodEvent.mobilePayLink
                ? ''
                : 'disabled'
              }
              style="
                padding:10px;
                ${foodEvent.mobilePayLink
                  ? ''
                  : 'opacity:.55;cursor:not-allowed;'
                }
              "
            >
              Yes, Pay Now
            </button>

            <button
              type="button"
              class="food-payment-choice"
              data-event-id="${escapeHtml(
                foodEvent.id
              )}"
              data-choice="pay_later"
              style="padding:10px;"
            >
              No, Pay Later
            </button>
          </div>

          ${
            foodEvent.mobilePayLink
              ? `
                <div
                  class="food-mobilepay-area"
                  data-event-id="${escapeHtml(
                    foodEvent.id
                  )}"
                  style="
                    display:${selectedPaymentChoice === 'pay_now'
                      ? 'block'
                      : 'none'
                    };
                    margin-top:10px;
                  "
                >
                  <a
                    class="food-mobilepay-link"
                    href="${escapeHtml(
                      foodEvent.mobilePayLink
                    )}"
                    target="_blank"
                    rel="noopener noreferrer"
                    style="
                      display:block;
                      text-align:center;
                      padding:11px;
                      background:#1f7a4d;
                      color:white;
                      text-decoration:none;
                      border-radius:8px;
                      font-weight:bold;
                    "
                  >
                    Open MobilePay Box
                  </a>

                  <p
                    style="
                      margin:8px 0 0;
                      font-size:12px;
                      line-height:1.4;
                    "
                  >
                    After paying, return to the app and complete your registration. Payment is confirmed manually by Food Admin.
                  </p>
                </div>
              `
              : `
                <div
                  style="
                    margin-top:10px;
                    padding:10px;
                    border:1px solid #eadcaa;
                    border-radius:8px;
                    background:#ffffff;
                    font-size:13px;
                    line-height:1.45;
                  "
                >
                  <strong>Pay Now is unavailable for this event.</strong><br>
                  Food Admin has not added a MobilePay payment link. Please choose <strong>No, Pay Later</strong> to register.
                </div>
              `
          }
        </div>

        ${
          myRegistration
            ? `
              <button
                class="update-registration"
                data-event-id="${escapeHtml(
                  foodEvent.id
                )}"
                style="
                  width:100%;
                  padding:12px;
                  margin-bottom:10px;
                "
              >
                Update Registration
              </button>

              <button
                class="cancel-registration"
                data-event-id="${escapeHtml(
                  foodEvent.id
                )}"
                style="
                  width:100%;
                  padding:12px;
                "
              >
                Cancel Registration
              </button>
            `
            : `
              <button
                class="create-registration"
                data-event-id="${escapeHtml(
                  foodEvent.id
                )}"
                style="
                  width:100%;
                  padding:12px;
                "
              >
                Register
              </button>
            `
        }
      `


      content.appendChild(card)
    }


    attachRegistrationButtons(
      currentUser
    )


  } catch (error) {

    console.error(error)

    content.innerHTML =
      '<p>Unable to load food information.</p>'
  }
}


function attachRegistrationButtons(
  currentUser
) {

  document
    .querySelectorAll(
      '.food-quantity'
    )
    .forEach(selector => {

      selector.addEventListener(
        'change',
        () => {
          const eventId =
            selector.dataset.eventId

          const price =
            Number(
              selector.dataset.price || 0
            )

          const total =
            Number(selector.value) *
            price

          const totalElement =
            document.querySelector(
              `.food-payment-total[data-event-id="${eventId}"]`
            )

          if (totalElement) {
            totalElement.textContent =
              String(total)
          }
        }
      )
    })


  document
    .querySelectorAll(
      '.food-payment-choice'
    )
    .forEach(button => {

      const eventId =
        button.dataset.eventId

      const box =
        document.querySelector(
          `.food-payment-box[data-event-id="${eventId}"]`
        )

      if (
        box?.dataset.paymentChoice ===
        button.dataset.choice
      ) {
        setPaymentChoiceButtonState(
          button,
          true
        )
      }


      button.addEventListener(
        'click',
        () => {

          const choice =
            button.dataset.choice

          if (!box) {
            return
          }

          box.dataset.paymentChoice =
            choice

          document
            .querySelectorAll(
              `.food-payment-choice[data-event-id="${eventId}"]`
            )
            .forEach(item => {

              setPaymentChoiceButtonState(
                item,
                item.dataset.choice ===
                  choice
              )
            })

          const mobilePayArea =
            document.querySelector(
              `.food-mobilepay-area[data-event-id="${eventId}"]`
            )

          if (mobilePayArea) {
            mobilePayArea.style.display =
              choice === 'pay_now'
                ? 'block'
                : 'none'
          }
        }
      )
    })


  document
    .querySelectorAll(
      '.create-registration'
    )
    .forEach(button => {

      button.addEventListener(
        'click',
        async () => {

          const eventId =
            button.dataset.eventId

          const selector =
            document.querySelector(
              `.food-quantity[data-event-id="${eventId}"]`
            )

          const member =
            getApprovedMember()

          const paymentBox =
            document.querySelector(
              `.food-payment-box[data-event-id="${eventId}"]`
            )

          const paymentChoice =
            paymentBox?.dataset.paymentChoice ||
            ''

          if (!paymentChoice) {
            alert(
              'Please choose Pay Now or Pay Later.'
            )
            return
          }


          try {

            await createFoodRegistration({
              eventId,

              uid:
                currentUser.uid,

              perid:
                member?.perid ||
                member?.id ||
                '',

              name:
                member?.name ||
                currentUser.email,

              quantity:
                Number(
                  selector.value
                ),

              paymentChoice
            })

            await openFoodSection()


          } catch (error) {

            console.error(error)

            alert(
              'Unable to register.'
            )
          }
        }
      )
    })


  document
    .querySelectorAll(
      '.update-registration'
    )
    .forEach(button => {

      button.addEventListener(
        'click',
        async () => {

          const eventId =
            button.dataset.eventId

          const selector =
            document.querySelector(
              `.food-quantity[data-event-id="${eventId}"]`
            )

          const paymentBox =
            document.querySelector(
              `.food-payment-box[data-event-id="${eventId}"]`
            )

          const paymentChoice =
            paymentBox?.dataset.paymentChoice ||
            ''

          if (!paymentChoice) {
            alert(
              'Please choose Pay Now or Pay Later.'
            )
            return
          }


          try {

            await updateFoodRegistrationQuantity({
              eventId,

              uid:
                currentUser.uid,

              quantity:
                Number(
                  selector.value
                ),

              paymentChoice
            })

            await openFoodSection()


          } catch (error) {

            console.error(error)

            alert(
              'Unable to update registration.'
            )
          }
        }
      )
    })


  document
    .querySelectorAll(
      '.cancel-registration'
    )
    .forEach(button => {

      button.addEventListener(
        'click',
        async () => {

          const confirmed =
            confirm(
              'Do you want to cancel your registration?'
            )

          if (!confirmed) {
            return
          }


          try {

            await deleteFoodRegistration({
              eventId:
                button.dataset.eventId,

              uid:
                currentUser.uid
            })

            await openFoodSection()


          } catch (error) {

            console.error(error)

            alert(
              'Unable to cancel registration.'
            )
          }
        }
      )
    })
}


function setPaymentChoiceButtonState(
  button,
  selected
) {

  button.style.background =
    selected
      ? '#2f5ea8'
      : '#ffffff'

  button.style.color =
    selected
      ? '#ffffff'
      : '#222222'

  button.style.border =
    selected
      ? '1px solid #2f5ea8'
      : '1px solid #bbbbbb'

  button.style.borderRadius =
    '7px'
}


function escapeHtml(value) {

  return String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;')
}
