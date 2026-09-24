// The TYPO3 page and the app have different origins. Only exchange menu
// actions and availability; authentication stays in the app.
export function setupMemberMenuBridge() {
  const frame = document.getElementById('church-site')
  const login = document.getElementById('member-login-button')
  const area = document.getElementById('member-area-button')
  const origin = 'https://www.emdrupkirke.dk'
  let menuReady = false
  const canOpenArea = () => area.style.display !== 'none'
  const sendState = () => {
    if (!menuReady) return
    frame.contentWindow?.postMessage({
      type: 'oneinchrist:member-menu-state', version: 1,
      memberAreaAvailable: canOpenArea()
    }, origin)
  }
  const receive = event => {
    if (event.origin !== origin || event.source !== frame.contentWindow) return
    const data = event.data
    if (!data || data.version !== 1) return
    if (data.type === 'oneinchrist:member-menu-ready') {
      menuReady = true
      sendState()
    } else if (menuReady && data.type === 'oneinchrist:member-menu-action') {
      if (data.action === 'login') login.click()
      if (data.action === 'area') (canOpenArea() ? area : login).click()
    }
  }
  const loaded = () => {
    menuReady = false
    frame.contentWindow?.postMessage({ type: 'oneinchrist:member-menu-probe', version: 1 }, origin)
  }
  window.addEventListener('message', receive)
  frame.addEventListener('load', loaded)
  const observer = new MutationObserver(sendState)
  observer.observe(area, { attributes: true, attributeFilter: ['style'] })
  loaded()
  return () => {
    observer.disconnect()
    frame.removeEventListener('load', loaded)
    window.removeEventListener('message', receive)
  }
}
