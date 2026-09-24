import { Capacitor } from '@capacitor/core'


export function configureIosScrollableOverlay(
  overlay
) {

  if (
    !overlay ||
    Capacitor.getPlatform() !== 'ios'
  ) {
    return
  }


  overlay.style.boxSizing =
    'border-box'

  overlay.style.height =
    '100dvh'

  overlay.style.maxHeight =
    '100dvh'

  overlay.style.overflowX =
    'hidden'

  overlay.style.overflowY =
    'scroll'

  overlay.style.webkitOverflowScrolling =
    'touch'

  overlay.style.overscrollBehaviorY =
    'contain'

  overlay.style.touchAction =
    'pan-y'

  overlay.style.paddingTop =
    'env(safe-area-inset-top)'

  overlay.style.paddingBottom =
    'env(safe-area-inset-bottom)'

  overlay.setAttribute(
    'data-ios-scrollable-overlay',
    'true'
  )
}
