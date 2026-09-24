import {
  getDanishLanguageClasses,
  createDanishLanguageClass,
  updateDanishLanguageClass,
  deleteDanishLanguageClass,
  getDanishLanguageAnnouncements,
  createDanishLanguageAnnouncement,
  updateDanishLanguageAnnouncement,
  deleteDanishLanguageAnnouncement,
  getDanishLanguageMaterials,
  createDanishLanguageMaterial,
  updateDanishLanguageMaterial,
  deleteDanishLanguageMaterial,
  getDanishLanguageStudents,
  createDanishLanguageStudent,
  updateDanishLanguageStudent,
  deleteDanishLanguageStudent
} from './danishLanguageStore.js'

import {
  notifyDanishLanguageClassCreated,
  notifyDanishLanguageAnnouncementCreated,
  notifyDanishLanguageMaterialCreated
} from './danishLanguageNotifications.js'

import {
  chooseDanishLanguageMaterialFile,
  deleteDanishLanguageMaterialFile
} from './danishLanguageMaterialUpload.js'

import {
  escapeHtml
} from './danishLanguageFormat.js'


let editingClassId =
  null

let editingAnnouncementId =
  null

let editingMaterialId =
  null

let editingStudentId =
  null

let selectedMaterialFile =
  null


export async function renderDanishLanguageAdmin({
  container,
  user,
  onRefresh
}) {

  const [
    classes,
    announcements,
    materials,
    students
  ] =
    await Promise.all([
      getDanishLanguageClasses(),
      getDanishLanguageAnnouncements(),
      getDanishLanguageMaterials(),
      getDanishLanguageStudents()
    ])

  container.innerHTML =
    `
      <section class="danish-language-admin">
        <header class="danish-language-page-header">
          <h2>Danish Language Admin</h2>
          <p>Manage classes, announcements, materials, and students.</p>
        </header>

        <section class="danish-language-admin-panel">
          <div class="danish-language-admin-grid">
            ${createClassFormMarkup()}
            ${createAnnouncementFormMarkup()}
            ${createMaterialFormMarkup()}
            ${createStudentFormMarkup()}
          </div>
        </section>

        ${createListPanel('Classes', classes, item => createItemMarkup(item, 'class'))}
        ${createListPanel('Announcements', announcements, item => createItemMarkup(item, 'announcement'))}
        ${createListPanel('Materials', materials, item => createItemMarkup(item, 'material'))}
        ${createListPanel('Students', students, item => createItemMarkup(item, 'student'))}
      </section>
    `

  bindAdminForms({
    container,
    user,
    onRefresh,
    classes,
    announcements,
    materials,
    students
  })
}


function createClassFormMarkup() {

  return `
    <section class="dashboard-card danish-language-form-card">
      <h3>Class</h3>
      <form id="danish-language-class-form">
        <input id="danish-language-class-title" placeholder="Course / class title" required>
        <input id="danish-language-class-teacher" placeholder="Teacher">
        <input id="danish-language-class-date" type="date" required>
        <input id="danish-language-class-time" type="time">
        <input id="danish-language-class-room" placeholder="Classroom">
        <input id="danish-language-class-zoom" type="url" placeholder="Zoom link optional">
        <input id="danish-language-class-topic" placeholder="Lesson topic">
        <textarea id="danish-language-class-description" rows="3" placeholder="Description"></textarea>
        <label><input id="danish-language-class-active" type="checkbox" checked> Published</label>
        <button type="submit">Save Class</button>
        <button type="button" id="cancel-danish-language-class-button" style="display:none;">Cancel Edit</button>
      </form>
    </section>
  `
}


function createAnnouncementFormMarkup() {

  return `
    <section class="dashboard-card danish-language-form-card">
      <h3>Announcement</h3>
      <form id="danish-language-announcement-form">
        <input id="danish-language-announcement-title" placeholder="Title" required>
        <textarea id="danish-language-announcement-message" rows="4" placeholder="Announcement" required></textarea>
        <label><input id="danish-language-announcement-pinned" type="checkbox"> Pin announcement</label>
        <label><input id="danish-language-announcement-active" type="checkbox" checked> Published</label>
        <button type="submit">Save Announcement</button>
        <button type="button" id="cancel-danish-language-announcement-button" style="display:none;">Cancel Edit</button>
      </form>
    </section>
  `
}


function createMaterialFormMarkup() {

  return `
    <section class="dashboard-card danish-language-form-card">
      <h3>Material</h3>
      <form id="danish-language-material-form">
        <input id="danish-language-material-title" placeholder="Title" required>
        <select id="danish-language-material-type">
          <option>Vocabulary</option>
          <option>Grammar</option>
          <option>Pronunciation</option>
          <option>Listening</option>
          <option>Speaking</option>
          <option>Reading</option>
          <option>Writing</option>
          <option>Danish Healthcare Vocabulary</option>
          <option>Hospital Communication</option>
          <option>Medical Terminology</option>
          <option>PDF</option>
          <option>Picture</option>
          <option>Document</option>
          <option>External link</option>
        </select>
        <input id="danish-language-material-link" type="url" placeholder="Material link">
        <div class="danish-language-upload-box">
          <button type="button" id="choose-danish-language-material-file-button">
            Choose File
          </button>
          <p id="danish-language-material-file-name">
            No file selected.
          </p>
        </div>
        <textarea id="danish-language-material-description" rows="3" placeholder="Description"></textarea>
        <label><input id="danish-language-material-active" type="checkbox" checked> Published</label>
        <button type="submit">Save Material</button>
        <button type="button" id="cancel-danish-language-material-button" style="display:none;">Cancel Edit</button>
      </form>
    </section>
  `
}


function createStudentFormMarkup() {

  return `
    <section class="dashboard-card danish-language-form-card">
      <h3>Student</h3>
      <form id="danish-language-student-form">
        <input id="danish-language-student-name" placeholder="Full name" required>
        <input id="danish-language-student-phone" placeholder="Telephone">
        <input id="danish-language-student-email" type="email" placeholder="Email">
        <button type="submit">Save Student</button>
        <button type="button" id="cancel-danish-language-student-button" style="display:none;">Cancel Edit</button>
      </form>
    </section>
  `
}


function createListPanel(
  title,
  items,
  createMarkup
) {

  return `
    <section class="danish-language-admin-panel">
      <h3>${escapeHtml(title)}</h3>
      <div class="danish-language-list">
        ${
          items.length
            ? items.map(createMarkup).join('')
            : '<p>Nothing has been created yet.</p>'
        }
      </div>
    </section>
  `
}


function createItemMarkup(
  item,
  type
) {

  return `
    <article class="dashboard-card danish-language-admin-item">
      <h4>${escapeHtml(item.title || item.name || item.course || 'Item')}</h4>
      <p>${escapeHtml(item.description || item.message || item.teacher || item.email || '')}</p>
      <div class="danish-language-action-grid">
        <button type="button" data-danish-edit="${type}" data-id="${escapeHtml(item.id)}">
          Edit
        </button>
        <button type="button" data-danish-delete="${type}" data-id="${escapeHtml(item.id)}">
          Delete
        </button>
      </div>
    </article>
  `
}


function bindAdminForms({
  container,
  user,
  onRefresh,
  classes,
  announcements,
  materials,
  students
}) {

  bindClassForm({ container, user, onRefresh })
  bindAnnouncementForm({ container, user, onRefresh })
  bindMaterialForm({ container, user, onRefresh })
  bindStudentForm({ container, user, onRefresh })
  bindEditButtons({ container, classes, announcements, materials, students })
  bindDeleteButtons({ container, onRefresh })
}


function bindClassForm({
  container,
  user,
  onRefresh
}) {

  container.querySelector('#danish-language-class-form')
    .addEventListener('submit', async event => {
      event.preventDefault()

      const data = {
        title: value('danish-language-class-title'),
        teacher: value('danish-language-class-teacher'),
        date: value('danish-language-class-date'),
        time: value('danish-language-class-time'),
        classroom: value('danish-language-class-room'),
        zoomLink: value('danish-language-class-zoom'),
        lessonTopic: value('danish-language-class-topic'),
        description: value('danish-language-class-description'),
        active: checked('danish-language-class-active'),
        createdBy: user?.uid || ''
      }

      if (editingClassId) {
        await updateDanishLanguageClass(editingClassId, data)
      } else {
        await createDanishLanguageClass(data)
        await notifyDanishLanguageClassCreated({
          uid: user?.uid,
          title: data.title,
          date: data.date,
          time: data.time
        })
      }

      editingClassId = null
      await onRefresh()
    })
}


function bindAnnouncementForm({
  container,
  user,
  onRefresh
}) {

  container.querySelector('#danish-language-announcement-form')
    .addEventListener('submit', async event => {
      event.preventDefault()

      const data = {
        title: value('danish-language-announcement-title'),
        message: value('danish-language-announcement-message'),
        pinned: checked('danish-language-announcement-pinned'),
        active: checked('danish-language-announcement-active'),
        createdBy: user?.uid || ''
      }

      if (editingAnnouncementId) {
        await updateDanishLanguageAnnouncement(editingAnnouncementId, data)
      } else {
        await createDanishLanguageAnnouncement(data)
        await notifyDanishLanguageAnnouncementCreated({
          uid: user?.uid,
          title: data.title,
          message: data.message
        })
      }

      editingAnnouncementId = null
      await onRefresh()
    })
}


function bindMaterialForm({
  container,
  user,
  onRefresh
}) {

  container.querySelector('#choose-danish-language-material-file-button')
    .addEventListener('click', async () => {
      const button =
        document.getElementById(
          'choose-danish-language-material-file-button'
        )

      try {
        button.disabled =
          true

        setText(
          'danish-language-material-file-name',
          'Choose a file, then wait while it uploads...'
        )

        const file =
          await chooseDanishLanguageMaterialFile({
            uid:
              user?.uid
          })

        if (!file) {
          setText(
            'danish-language-material-file-name',
            'No file selected.'
          )

          return
        }

        selectedMaterialFile =
          file

        setText(
          'danish-language-material-file-name',
          `Selected: ${file.fileName}`
        )

        setValue(
          'danish-language-material-link',
          file.fileUrl
        )

      } catch (error) {
        console.error(
          'Unable to upload Danish Language material:',
          error
        )

        setText(
          'danish-language-material-file-name',
          'File upload failed.'
        )

        alert(
          error?.message ||
          'Unable to upload this file.'
        )

      } finally {
        button.disabled =
          false
      }
    })

  container.querySelector('#danish-language-material-form')
    .addEventListener('submit', async event => {
      event.preventDefault()

      const data = {
        title: value('danish-language-material-title'),
        type: value('danish-language-material-type'),
        link: value('danish-language-material-link'),
        description: value('danish-language-material-description'),
        active: checked('danish-language-material-active'),
        createdBy: user?.uid || '',
        fileName: selectedMaterialFile?.fileName || '',
        filePath: selectedMaterialFile?.filePath || '',
        fileUrl: selectedMaterialFile?.fileUrl || '',
        fileMimeType: selectedMaterialFile?.fileMimeType || '',
        fileSize: selectedMaterialFile?.fileSize || 0
      }

      if (editingMaterialId) {
        await updateDanishLanguageMaterial(editingMaterialId, data)
      } else {
        await createDanishLanguageMaterial(data)
        await notifyDanishLanguageMaterialCreated({
          uid: user?.uid,
          title: data.title
        })
      }

      editingMaterialId = null
      selectedMaterialFile = null
      await onRefresh()
    })
}


function bindStudentForm({
  container,
  user,
  onRefresh
}) {

  container.querySelector('#danish-language-student-form')
    .addEventListener('submit', async event => {
      event.preventDefault()

      const data = {
        name: value('danish-language-student-name'),
        phone: value('danish-language-student-phone'),
        email: value('danish-language-student-email'),
        createdBy: user?.uid || ''
      }

      if (editingStudentId) {
        await updateDanishLanguageStudent(editingStudentId, data)
      } else {
        await createDanishLanguageStudent(data)
      }

      editingStudentId = null
      await onRefresh()
    })
}


function bindEditButtons({
  container,
  classes,
  announcements,
  materials,
  students
}) {

  container.querySelectorAll('[data-danish-edit]')
    .forEach(button => {
      button.addEventListener('click', () => {
        const type = button.dataset.danishEdit
        const id = button.dataset.id

        if (type === 'class') fillClassForm(classes.find(item => item.id === id))
        if (type === 'announcement') fillAnnouncementForm(announcements.find(item => item.id === id))
        if (type === 'material') fillMaterialForm(materials.find(item => item.id === id))
        if (type === 'student') fillStudentForm(students.find(item => item.id === id))
      })
    })
}


function bindDeleteButtons({
  container,
  onRefresh
}) {

  container.querySelectorAll('[data-danish-delete]')
    .forEach(button => {
      button.addEventListener('click', async () => {
        if (!confirm('Delete this item?')) return

        const type = button.dataset.danishDelete
        const id = button.dataset.id

        if (type === 'class') await deleteDanishLanguageClass(id)
        if (type === 'announcement') await deleteDanishLanguageAnnouncement(id)
        if (type === 'material') {
          const material =
            await getDanishLanguageMaterials()
              .then(items => items.find(item => item.id === id))

          await deleteDanishLanguageMaterialFile(
            material?.filePath
          )

          await deleteDanishLanguageMaterial(id)
        }
        if (type === 'student') await deleteDanishLanguageStudent(id)

        await onRefresh()
      })
    })
}


function fillClassForm(item) {
  if (!item) return
  editingClassId = item.id
  setValue('danish-language-class-title', item.title)
  setValue('danish-language-class-teacher', item.teacher)
  setValue('danish-language-class-date', item.date)
  setValue('danish-language-class-time', item.time)
  setValue('danish-language-class-room', item.classroom)
  setValue('danish-language-class-zoom', item.zoomLink)
  setValue('danish-language-class-topic', item.lessonTopic)
  setValue('danish-language-class-description', item.description)
  setChecked('danish-language-class-active', item.active !== false)
}


function fillAnnouncementForm(item) {
  if (!item) return
  editingAnnouncementId = item.id
  setValue('danish-language-announcement-title', item.title)
  setValue('danish-language-announcement-message', item.message)
  setChecked('danish-language-announcement-pinned', item.pinned === true)
  setChecked('danish-language-announcement-active', item.active !== false)
}


function fillMaterialForm(item) {
  if (!item) return
  editingMaterialId = item.id
  selectedMaterialFile = {
    fileName:
      item.fileName || '',

    filePath:
      item.filePath || '',

    fileUrl:
      item.fileUrl || '',

    fileMimeType:
      item.fileMimeType || '',

    fileSize:
      item.fileSize || 0
  }
  setValue('danish-language-material-title', item.title)
  setValue('danish-language-material-type', item.type)
  setValue('danish-language-material-link', item.fileUrl || item.link)
  setValue('danish-language-material-description', item.description)
  setChecked('danish-language-material-active', item.active !== false)
  setText(
    'danish-language-material-file-name',
    item.fileName
      ? `Selected: ${item.fileName}`
      : 'No file selected.'
  )
}


function fillStudentForm(item) {
  if (!item) return
  editingStudentId = item.id
  setValue('danish-language-student-name', item.name)
  setValue('danish-language-student-phone', item.phone)
  setValue('danish-language-student-email', item.email)
}


function value(id) {
  return document.getElementById(id)?.value?.trim() || ''
}


function checked(id) {
  return document.getElementById(id)?.checked === true
}


function setValue(id, valueToSet) {
  const element = document.getElementById(id)
  if (element) element.value = valueToSet || ''
}


function setChecked(id, valueToSet) {
  const element = document.getElementById(id)
  if (element) element.checked = valueToSet === true
}


function setText(id, valueToSet) {
  const element = document.getElementById(id)
  if (element) element.textContent = valueToSet || ''
}
