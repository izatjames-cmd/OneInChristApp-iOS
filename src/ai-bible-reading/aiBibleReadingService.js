/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : AI Bible Reading
 * File   : aiBibleReadingService.js
 *
 * Purpose:
 * Requests generated AI Bible Reading content.
 * ============================================================
 */

import {
  FirebaseFunctions
} from '@capacitor-firebase/functions'


import {
  loadLearnedChurchVocabulary
} from '../shared/church-vocabulary/churchVocabulary.js'


import {
  applyAiBibleReadingVocabulary
} from './aiBibleReadingVocabulary.js'


export async function generateAiBibleReadingDraft({
  uid,
  date
}) {

  const result =
    await FirebaseFunctions.callByName({
      name:
        'generateAiBibleReading',

      region:
        'europe-west1',

      data: {
        uid,
        date
      }
    })


  try {
    await loadLearnedChurchVocabulary()
  } catch (error) {
    console.warn(
      'Unable to load learned church vocabulary:',
      error
    )
  }


  return applyAiBibleReadingVocabulary(
    result?.data || {}
  )
}
