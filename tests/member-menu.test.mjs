import { test } from 'node:test'
import assert from 'node:assert/strict'
import { readFileSync } from 'node:fs'
import vm from 'node:vm'
import { setupMemberMenuBridge } from '../src/members/memberMenuBridge.js'

test('app accepts only its own website frame and keeps member-area access gated', () => {
  const messages = []
  const clicks = []
  let receive, changed
  const frame = { contentWindow: { postMessage: (...args) => messages.push(args) }, addEventListener() {}, removeEventListener() {} }
  const login = { click: () => clicks.push('login') }
  const area = { style: { display: 'none' }, click: () => clicks.push('area') }
  const saved = { window: globalThis.window, document: globalThis.document, MutationObserver: globalThis.MutationObserver }
  try {
    globalThis.window = { addEventListener: (_, fn) => { receive = fn }, removeEventListener() {} }
    globalThis.document = { getElementById: id => ({ 'church-site': frame, 'member-login-button': login, 'member-area-button': area })[id] }
    globalThis.MutationObserver = class { constructor(fn) { changed = fn } observe() {} disconnect() {} }
    const cleanup = setupMemberMenuBridge()
    const send = (type, extra = {}, origin = 'https://www.emdrupkirke.dk', source = frame.contentWindow) => receive({ origin, source, data: { type, version: 1, ...extra } })
    send('oneinchrist:member-menu-ready', {}, 'https://example.com')
    send('oneinchrist:member-menu-ready', {}, undefined, {})
    assert.equal(messages.length, 1)
    send('oneinchrist:member-menu-ready')
    assert.equal(messages.at(-1)[0].memberAreaAvailable, false)
    send('oneinchrist:member-menu-action', { action: 'area' })
    assert.deepEqual(clicks, ['login'])
    area.style.display = 'block'; changed()
    assert.equal(messages.at(-1)[0].memberAreaAvailable, true)
    send('oneinchrist:member-menu-action', { action: 'area' })
    assert.deepEqual(clicks, ['login', 'area'])
    cleanup()
  } finally { Object.assign(globalThis, saved) }
})

test('TYPO3 add-on is invisible on the public site and only opens for trusted app handshake', () => {
  const code = readFileSync(new URL('../typo3/member-menu.js', import.meta.url), 'utf8')
  for (const language of ['en', 'da', 'ur']) {
    let receive
    const element = () => ({ style: { setProperty(key, value) { this[key] = value } }, dataset: {}, children: [], appendChild(child) { this.children.push(child) }, addEventListener() {} })
    const dropdown = { ...element(), querySelector: () => null }
    const parent = { postMessage() {} }
    const window = { parent, addEventListener: (_, fn) => { receive = fn } }
    const document = { currentScript: { dataset: { memberLanguage: language } }, readyState: 'complete', querySelector: () => dropdown, createElement: element }
    vm.runInNewContext(code, { window, document })
    const group = dropdown.children[0]
    assert.equal(group.style.display, 'none')
    receive({ source: parent, origin: 'https://example.com', data: { version: 1, type: 'oneinchrist:member-menu-state', memberAreaAvailable: true } })
    assert.equal(group.style.display, 'none')
    receive({ source: parent, origin: 'https://localhost', data: { version: 1, type: 'oneinchrist:member-menu-state', memberAreaAvailable: false } })
    assert.equal(group.style.display, 'block')
    assert.equal(group.children[1].style.display, 'none')
    const standalone = { addEventListener() {} }; standalone.parent = standalone
    vm.runInNewContext(code, { window: standalone, document: { ...document, querySelector() { assert.fail('Public page must not add links') } } })
  }
})
