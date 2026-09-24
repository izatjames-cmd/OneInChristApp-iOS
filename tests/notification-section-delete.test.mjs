import test from 'node:test'
import assert from 'node:assert/strict'
import { readFile } from 'node:fs/promises'
import { SourceTextModule, SyntheticModule, createContext } from 'node:vm'

async function loadStore(snapshots, rejectId = '') {
  const deleted = []
  const writes = []
  let reads = 0
  const context = createContext({})
  const plugin = new SyntheticModule(['FirebaseFirestore'], function () {
    this.setExport('FirebaseFirestore', {
      getCollection: async () => { reads++; return { snapshots } },
      deleteDocument: async ({ reference }) => {
        if (reference.endsWith(`/${rejectId}`)) throw new Error('permission denied')
        deleted.push(reference)
      },
      setDocument: async payload => writes.push(payload)
    })
  }, { context })
  const groups = new SourceTextModule(await readFile(new URL('../src/notifications/notificationGroups.js', import.meta.url), 'utf8'), { context })
  await groups.link(() => {})
  const store = new SourceTextModule(await readFile(new URL('../src/notifications/notificationStore.js', import.meta.url), 'utf8'), { context })
  await store.link(name => name.includes('notificationGroups') ? groups : plugin)
  await store.evaluate()
  return { store: store.namespace, deleted, writes, reads: () => reads }
}

test('section deletion includes old and scheduled records but isolates other groups', async () => {
  const { store, deleted } = await loadStore([
    { id: 'old', data: { section: 'prayer', createdAt: '2020-01-01' } },
    { id: 'scheduled', data: { category: 'prayer', status: 'scheduled' } },
    { id: 'food', data: { section: 'food', category: 'prayer' } },
    { id: 'actual', data: { section: 'prayer', id: 'food' } }
  ])
  const result = await store.deleteChurchNotificationSection('prayer')
  assert.equal(result.deleted, 3)
  assert.equal(result.failed, 0)
  assert.deepEqual(deleted, ['churchNotifications/old', 'churchNotifications/scheduled', 'churchNotifications/actual'])
})

test('partial failures are reported and invalid groups never read or delete', async () => {
  const { store, deleted, reads } = await loadStore([
    { id: 'blocked', data: { section: 'food' } },
    { id: 'allowed', data: { section: 'food' } }
  ], 'blocked')
  await assert.rejects(store.deleteChurchNotificationSection(''), /Unknown/)
  assert.equal(reads(), 0)
  const result = await store.deleteChurchNotificationSection('food')
  assert.equal(result.failed, 1)
  assert.equal(result.deleted, 1)
  assert.deepEqual(deleted, ['churchNotifications/allowed'])
  const empty = await store.deleteChurchNotificationSection('choir')
  assert.equal(empty.deleted, 0)
})


test('device token storage preserves the native platform supplied by registration', async () => {
  const { store, writes } = await loadStore([])
  await store.saveDeviceToken({ uid: 'member-1', token: 'ios-token', platform: 'ios' })
  assert.equal(writes.length, 1)
  assert.equal(writes[0].reference, 'deviceTokens/member-1')
  assert.equal(writes[0].data.platform, 'ios')
  assert.equal(writes[0].data.token, 'ios-token')
})
