/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Daily Devotion
 * File   : dailyDevotionService.js
 *
 * Purpose:
 * Requests generated Daily Devotion content.
 * ============================================================
 */

import {
  FirebaseFunctions
} from '@capacitor-firebase/functions'


import {
  loadLearnedChurchVocabulary
} from '../shared/church-vocabulary/churchVocabulary.js'


import {
  applyDailyDevotionVocabulary
} from './dailyDevotionVocabulary.js'


export async function generateDailyDevotionDraft({
  uid,
  date
}) {

  const result =
    await FirebaseFunctions.callByName({
      name:
        'generateDailyDevotion',

      region:
        'europe-west1',

      data: {
        uid,
        date,
        forceDifferent:
          true,
        bibleScope:
          'all'
      }
    })


  const devotion =
    result?.data ||
    {}


  try {
    await loadLearnedChurchVocabulary()
  } catch (error) {
    console.warn(
      'Unable to load learned church vocabulary:',
      error
    )
  }


  return applyDailyDevotionVocabulary({
    passageId:
      devotion.passageId || '',

    verseReference:
      devotion.verseReference ||
      devotion.reference ||
      '',

    verseText:
      devotion.verseText ||
      devotion.verse ||
      '',

    explanation:
      devotion.explanation || '',

    application:
      devotion.application ||
      devotion.whatWillJesusDo ||
      '',

    prayer:
      devotion.prayer || '',

    translations:
      devotion.translations || {}
  })
}
