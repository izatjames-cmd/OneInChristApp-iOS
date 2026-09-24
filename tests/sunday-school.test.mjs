import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import { createContext, SourceTextModule, SyntheticModule } from 'node:vm'

// Exercise the real modules with Firebase/device boundaries replaced.
async function loadModule(relativePath, mocks, globals = {}) {
  const context = createContext({ console, Date, setTimeout, clearTimeout, Blob, URL, ...globals })
  const modules = new Map()
  async function load(path) {
    if (modules.has(path)) return modules.get(path)
    const module = new SourceTextModule(await readFile(path, 'utf8'), { context, identifier: path })
    modules.set(path, module)
    await module.link(async (specifier, referencingModule) => {
      if (specifier in mocks) {
        const values = mocks[specifier]
        return new SyntheticModule(Object.keys(values), function () {
          for (const [key, value] of Object.entries(values)) this.setExport(key, value)
        }, { context })
      }
      return load(fileURLToPath(new URL(specifier, `file:///${referencingModule.identifier.replaceAll('\\', '/')}`)))
    })
    return module
  }
  const module = await load(fileURLToPath(new URL(relativePath, import.meta.url)))
  await module.evaluate()
  return module.namespace
}

test('staff messages support text-only and voice-only; reject empty or unsigned sends', async () => {
  const writes = []
  const store = await loadModule('../src/ministry/sunday-school/sundaySchoolStore.js', {
    '@capacitor-firebase/firestore': { FirebaseFirestore: { setDocument: async data => writes.push(data) } },
    '@capacitor-firebase/storage': { FirebaseStorage: {} }
  })
  await store.createSundaySchoolTeacherMessage({ uid: 'teacher', message: 'Lesson ready.' })
  await store.createSundaySchoolTeacherMessage({ uid: 'admin', message: '', audioBase64: 'data:audio/webm;base64,YQ==' })
  const messageWrites = writes.filter(item => item.reference.startsWith('sundaySchoolTeacherMessages/'))
  const notificationWrites = writes.filter(item => item.reference.startsWith('churchNotifications/'))
  assert.equal(messageWrites.length, 2)
  assert.equal(notificationWrites.length, 2)
  assert.equal(messageWrites[0].data.message, 'Lesson ready.')
  assert.equal(messageWrites[1].data.audioBase64, 'data:audio/webm;base64,YQ==')
  assert.notEqual(messageWrites[0].reference, messageWrites[1].reference)
  assert.ok(messageWrites[0].data.createdAt)
  await assert.rejects(store.createSundaySchoolTeacherMessage({ uid: 'teacher', message: ' ' }), /Write a message/)
  await assert.rejects(store.createSundaySchoolTeacherMessage({ message: 'Hello' }), /sign in/)
  assert.equal(writes.length, 4)
})

test('conversation delivers chronological messages, handles errors, and stops after cleanup', async () => {
  let callback
  let query
  const removed = []
  const received = []
  const failures = []
  const store = await loadModule('../src/ministry/sunday-school/sundaySchoolStore.js', {
    '@capacitor-firebase/firestore': { FirebaseFirestore: {
      addCollectionSnapshotListener: async (options, listener) => {
        query = options
        callback = listener
        return 'staff-chat-listener'
      },
      removeSnapshotListener: async options => removed.push(options.callbackId)
    } },
    '@capacitor-firebase/storage': { FirebaseStorage: {} }
  })
  const dispose = await store.subscribeSundaySchoolTeacherMessages(items => received.push(items), error => failures.push(error))
  assert.equal(query.reference, 'sundaySchoolTeacherMessages')
  assert.equal(query.queryConstraints.find(item => item.type === 'limit').limit, 50)
  callback({ snapshots: [
    { id: 'new', data: { createdAt: '2026-09-15T12:00:00Z', message: 'Reply' } },
    { id: 'archived', data: { createdAt: '2026-09-15T11:30:00Z', archived: true } },
    { id: 'old', data: { createdAt: '2026-09-15T11:00:00Z', message: 'Hello' } }
  ] })
  assert.equal(Array.from(received[0], item => item.id).join(','), 'old,new')
  callback(null, new Error('Permission denied'))
  assert.equal(failures[0].message, 'Permission denied')
  await dispose()
  await dispose()
  callback({ snapshots: [] })
  assert.equal(received.length, 1)
  assert.deepEqual(removed, ['staff-chat-listener'])
})
