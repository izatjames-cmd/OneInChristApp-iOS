/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Daily Devotion
 * File   : dailyDevotionRouter.js
 *
 * Purpose:
 * Routes Daily Devotion notification targets.
 * ============================================================
 */

import {
  openDailyDevotionSection
} from './dailyDevotionUI.js'


export async function routeDailyDevotion(
  targetId = 'devotion'
) {

  await openDailyDevotionSection(
    targetId === 'admin'
      ? 'admin'
      : 'devotion'
  )
}
