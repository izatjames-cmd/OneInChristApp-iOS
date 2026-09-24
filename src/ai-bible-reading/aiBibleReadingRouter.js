/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : AI Bible Reading
 * File   : aiBibleReadingRouter.js
 *
 * Purpose:
 * Routes AI Bible Reading notification targets.
 * ============================================================
 */

import {
  openAiBibleReadingSection
} from './aiBibleReadingUI.js'


export async function routeAiBibleReading(
  targetId = 'reading'
) {

  await openAiBibleReadingSection(
    targetId === 'admin'
      ? 'admin'
      : 'reading'
  )
}
