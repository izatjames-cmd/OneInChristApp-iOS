import { Capacitor } from '@capacitor/core'
import { App } from '@capacitor/app'

import {
  returnToMemberArea
} from '../members/memberNavigation.js'


let listenerHandle = null


export async function setupAndroidBackNavigation() {

  if (
    !Capacitor.isNativePlatform() ||
    Capacitor.getPlatform() !== 'android'
  ) {
    return
  }

  if (listenerHandle) {
    return
  }

  listenerHandle =
    await App.addListener(
      'backButton',
      () => {
        handleBackInsideApp()
      }
    )
}


function handleBackInsideApp() {

  /*
   * 1. Close the most deeply nested pop-up/editor first.
   */
  if (clickVisible('[data-picker-cancel]')) return
  if (clickVisible('#oneinchrist-geet-editor [data-action="close"]')) return
  if (clickVisible('[data-close-youth-announcement]')) return
  if (clickVisible('[data-close-prayer-announcement]')) return
  if (clickVisible('[data-close-sunday-school-announcement]')) return
  if (clickVisible('.sunday-school-gallery-viewer [data-close]')) return

  if (clickVisible('#close-service-plan-editor-button')) return
  if (clickVisible('#close-choir-admin-button')) return
  if (clickVisible('#close-food-admin-button')) return
  if (clickVisible('#close-church-admin-button')) return
  if (clickVisible('#close-church-admin-module-button')) return

  /*
   * The hymnbook already has its own Back/Close state machine.
   * Escape invokes its normal close path without duplicating logic.
   */
  if (isVisible(document.getElementById('oneinchrist-hymnbook-overlay'))) {
    if (clickVisible('[data-hymnbook-back]')) return
  }

  /*
   * 2. Close the active app section. Existing close handlers already
   *    return to Member Area, so we reuse them rather than hiding screens
   *    manually.
   */
  const sectionCloseButtons = [
    '#close-scripture-preparation-top-button',
    '#close-service-plan-button',
    '#close-choir-button',
    '#close-food-top-button',
    '#close-church-notifications-top-button',
    '#close-daily-devotion-top-button',
    '#close-ai-bible-reading-top-button',
    '#close-youth-button',
    '#close-prayer-top-button',
    '#close-sunday-school-button',
    '#close-danish-language-top-button'
  ]

  for (const selector of sectionCloseButtons) {
    if (clickVisible(selector)) return
  }

  /*
   * 3. Login is a modal, so Back closes it.
   */
  if (clickVisible('#close-login-button')) return

  /*
   * 4. Member Area is the safe root of the signed-in app.
   *    Back is deliberately consumed here so Android does not exit.
   */
  const memberArea =
    document.getElementById('member-area-overlay')

  if (isVisible(memberArea)) {
    return
  }

  /*
   * If no known screen is visible, return to Member Area when it exists.
   * We never call App.exitApp(), so the hardware Back button cannot
   * unexpectedly throw the member out of the app.
   */
  if (memberArea) {
    returnToMemberArea()
  }
}


function clickVisible(selector) {
  const element =
    document.querySelector(selector)

  if (!isVisible(element)) {
    return false
  }

  element.click()
  return true
}


function isVisible(element) {
  if (!element || !element.isConnected) {
    return false
  }

  const style =
    window.getComputedStyle(element)

  if (
    style.display === 'none' ||
    style.visibility === 'hidden' ||
    Number(style.opacity) === 0
  ) {
    return false
  }

  const rect =
    element.getBoundingClientRect()

  return (
    rect.width > 0 &&
    rect.height > 0
  )
}
