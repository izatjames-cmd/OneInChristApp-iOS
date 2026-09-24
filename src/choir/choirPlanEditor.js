import {
  getCurrentMember
} from '../auth/phoneAuth.js'

import {
  notifyChoirPreparationSubmitted
} from './choirNotifications.js'

import {
  createChoirPlan,
  updateChoirPlan
} from './choirStore.js'

import {
  saveChoirVoiceMessage
} from './choirVoiceStore.js'

import {
  resetChoirSongs,
  setChoirSongs,
  getChoirSongs,
  setHolySpiritHymn,
  getHolySpiritHymn,
  renderChoirSongEditor,
  renderHolySpiritHymnEditor,
  addChoirSong
} from './choirSongEditor.js'


let editingPlanId =
  null

let onSavedCallback =
  null

let choirAudioRecorder =
  null

let choirAudioChunks = []

let choirAudioBlob =
  null

let currentChoirAudioMessageUrl =
  ''


export function setupChoirPlanEditor({
  onSaved
} = {}) {

  onSavedCallback =
    onSaved ||
    null


  document
    .querySelector(
      '#close-choir-admin-button'
    )
    ?.addEventListener(
      'click',
      closeEditor
    )


  document
    .querySelector(
      '#add-choir-song-button'
    )
    ?.addEventListener(
      'click',
      () => {

        addChoirSong()
      }
    )



  document
    .querySelector(
      '#record-choir-audio-button'
    )
    ?.addEventListener(
      'click',
      startChoirAudioRecording
    )


  document
    .querySelector(
      '#stop-choir-audio-button'
    )
    ?.addEventListener(
      'click',
      stopChoirAudioRecording
    )


  document
    .querySelector(
      '#remove-choir-audio-button'
    )
    ?.addEventListener(
      'click',
      removeChoirAudioMessage
    )



  document
    .querySelector(
      '#choir-plan-form'
    )
    ?.addEventListener(
      'submit',
      saveChoirPlan
    )
}


export function createNewChoirPlan() {

  editingPlanId =
    null


  resetChoirSongs()


  setHolySpiritHymn()


  document
    .querySelector(
      '#choir-admin-heading'
    )
    .textContent =
      'Create Sunday Choir Plan'


  document
    .querySelector(
      '#choir-plan-title'
    )
    .value =
      'Sunday Worship'


  document
    .querySelector(
      '#choir-plan-date'
    )
    .value =
      ''


  document
    .querySelector(
      '#choir-plan-service-time'
    )
    .value =
      ''


  document
    .querySelector(
      '#choir-plan-active'
    )
    .checked =
      true
document
    .querySelector(
      '#choir-admin-status'
    )
    .textContent =
      ''


  renderChoirSongEditor()

  renderHolySpiritHymnEditor()

  resetChoirAudioControls()

  openEditor()
}


export function editChoirPlan(
  plan
) {

  editingPlanId =
    plan.id


  setChoirSongs(
    plan.songs
  )


  setHolySpiritHymn(
    plan.holySpiritHymn
  )


  document
    .querySelector(
      '#choir-admin-heading'
    )
    .textContent =
      'Edit Sunday Choir Plan'


  document
    .querySelector(
      '#choir-plan-title'
    )
    .value =
      plan.title || ''


  document
    .querySelector(
      '#choir-plan-date'
    )
    .value =
      plan.date || ''


  document
    .querySelector(
      '#choir-plan-service-time'
    )
    .value =
      plan.serviceTime || ''


  document
    .querySelector(
      '#choir-plan-active'
    )
    .checked =
      plan.active === true
document
    .querySelector(
      '#choir-admin-status'
    )
    .textContent =
      ''


  renderChoirSongEditor()

  renderHolySpiritHymnEditor()

  resetChoirAudioControls(
    plan
  )

  openEditor()
}


function openEditor() {

  document
    .querySelector(
      '#choir-admin-overlay'
    )
    .style.display =
      'block'
}


function closeEditor() {

  document
    .querySelector(
      '#choir-admin-overlay'
    )
    .style.display =
      'none'
}


function resetChoirAudioControls(
  plan = null
) {

  choirAudioRecorder =
    null

  choirAudioChunks = []

  choirAudioBlob =
    null

  currentChoirAudioMessageUrl =
    plan?.choirAudioMessageUrl || ''


  const status =
    document.querySelector(
      '#choir-audio-status'
    )

  const preview =
    document.querySelector(
      '#choir-audio-preview'
    )

  const indicator =
    document.querySelector(
      '#choir-audio-recording-indicator'
    )

  const recordButton =
    document.querySelector(
      '#record-choir-audio-button'
    )

  const stopButton =
    document.querySelector(
      '#stop-choir-audio-button'
    )

  const removeButton =
    document.querySelector(
      '#remove-choir-audio-button'
    )


  if (!status || !preview) {
    return
  }


  status.textContent =
    currentChoirAudioMessageUrl
      ? 'Existing choir audio message is attached.'
      : 'No audio message recorded.'

  preview.innerHTML =
    currentChoirAudioMessageUrl
      ? `
        <audio
          controls
          src="${currentChoirAudioMessageUrl}"
          style="
            width:100%;
            margin-top:8px;
          "
        ></audio>
      `
      : ''

  if (indicator) {
    indicator.style.display =
      'none'
  }

  if (recordButton) {
    recordButton.disabled =
      false
  }

  if (stopButton) {
    stopButton.disabled =
      true
  }

  if (removeButton) {
    removeButton.disabled =
      !currentChoirAudioMessageUrl
  }
}


function getSupportedChoirAudioMimeType() {

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


async function startChoirAudioRecording() {

  const status =
    document.querySelector(
      '#choir-audio-status'
    )


  if (
    !navigator.mediaDevices ||
    !window.MediaRecorder
  ) {
    status.textContent =
      'Audio recording is not available on this device.'

    return
  }


  try {

    const stream =
      await navigator.mediaDevices.getUserMedia({
        audio:
          true
      })

    choirAudioChunks = []

    const mimeType =
      getSupportedChoirAudioMimeType()

    const recorderOptions =
      mimeType
        ? { mimeType }
        : undefined

    choirAudioRecorder =
      new MediaRecorder(
        stream,
        recorderOptions
      )

    choirAudioRecorder.addEventListener(
      'dataavailable',
      event => {
        if (event.data?.size) {
          choirAudioChunks.push(
            event.data
          )
        }
      }
    )

    choirAudioRecorder.addEventListener(
      'stop',
      () => {
        choirAudioBlob =
          new Blob(
            choirAudioChunks,
            {
              type:
                choirAudioRecorder.mimeType ||
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
            '#choir-audio-preview'
          )

        preview.innerHTML = `
          <audio
            controls
            src="${URL.createObjectURL(
              choirAudioBlob
            )}"
            style="
              width:100%;
              margin-top:8px;
            "
          ></audio>
        `

        status.textContent =
          'Choir audio message recorded. It will save with the plan.'

        document
          .querySelector(
            '#choir-audio-recording-indicator'
          )
          .style.display = 'none'

        document
          .querySelector(
            '#record-choir-audio-button'
          )
          .disabled = false

        document
          .querySelector(
            '#stop-choir-audio-button'
          )
          .disabled = true

        document
          .querySelector(
            '#remove-choir-audio-button'
          )
          .disabled = false
      }
    )

    choirAudioRecorder.start()

    status.textContent =
      'Recording choir audio message...'

    document
      .querySelector(
        '#choir-audio-recording-indicator'
      )
      .style.display = 'flex'

    document
      .querySelector(
        '#record-choir-audio-button'
      )
      .disabled = true

    document
      .querySelector(
        '#stop-choir-audio-button'
      )
      .disabled = false

  } catch (error) {

    console.error(
      'Unable to start Choir audio recording:',
      error
    )

    document
      .querySelector(
        '#choir-audio-recording-indicator'
      )
      .style.display = 'none'

    status.textContent =
      `Unable to start audio recording: ${
        error?.name || 'Error'
      } ${
        error?.message || ''
      }`.trim()
  }
}


function stopChoirAudioRecording() {

  if (
    choirAudioRecorder &&
    choirAudioRecorder.state !== 'inactive'
  ) {
    choirAudioRecorder.stop()
  }
}


function removeChoirAudioMessage() {

  choirAudioBlob =
    null

  choirAudioChunks = []

  currentChoirAudioMessageUrl =
    ''

  resetChoirAudioControls()
}


async function saveChoirPlan(
  event
) {

  event.preventDefault()


  const status =
    document.querySelector(
      '#choir-admin-status'
    )


  const button =
    document.querySelector(
      '#save-choir-plan-button'
    )


  const title =
    document
      .querySelector(
        '#choir-plan-title'
      )
      .value
      .trim()


  const date =
    document
      .querySelector(
        '#choir-plan-date'
      )
      .value


  const serviceTime =
    document
      .querySelector(
        '#choir-plan-service-time'
      )
      .value


  const active =
    document
      .querySelector(
        '#choir-plan-active'
      )
      .checked


  const congregationShare =
    false


  const notificationDate =
    ''


  const notificationTime =
    ''


  const songs =
    getChoirSongs()


  const holySpiritHymn =
    getHolySpiritHymn()


  if (
    !title ||
    !date
  ) {

    status.textContent =
      'Please enter the service title and date.'

    return
  }


  if (!songs.length) {

    status.textContent =
      'Please add at least one hymn.'

    return
  }




  button.disabled =
    true


  status.textContent =
    'Saving...'


  try {

    const user =
      await getCurrentMember()


    if (!user?.uid) {

      throw new Error(
        'Please sign in again.'
      )
    }


    const data = {

      title,

      date,

      serviceTime,

      active,

      songs,

      holySpiritHymn,

      congregationShare,

      notificationDate:
        congregationShare
          ? notificationDate
          : '',

      notificationTime:
        congregationShare
          ? notificationTime
          : '',

      choirAudioMessageUrl:
        choirAudioBlob
          ? await saveChoirVoiceMessage(
              choirAudioBlob
            )
          : currentChoirAudioMessageUrl,

      uid:
        user.uid
    }


    let savedPlanId =
      editingPlanId


    if (editingPlanId) {

      await updateChoirPlan(
        editingPlanId,
        data
      )

    } else {

      savedPlanId =
        await createChoirPlan(
        data
      )
    }


    await notifyChoirPreparationSubmitted({
      uid:
        user.uid,
      planId:
        savedPlanId,
      title,
      date
    })


    status.textContent =
      'Sunday plan saved successfully.'


    setTimeout(
      async () => {

        closeEditor()


        if (
          typeof onSavedCallback ===
          'function'
        ) {

          await onSavedCallback()
        }

      },
      500
    )


  } catch (error) {

    console.error(
      'Unable to save Choir plan:',
      error
    )


    status.textContent =
      `Unable to save: ${
        error?.message ||
        error
      }`


  } finally {

    button.disabled =
      false
  }
}
