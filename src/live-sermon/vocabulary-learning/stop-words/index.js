import {
  DANISH_STOP_WORDS
} from './danish.js'

import {
  ENGLISH_STOP_WORDS
} from './english.js'

import {
  URDU_STOP_WORDS
} from './urdu.js'

export function getStopWords(
  language
) {

  if (language === 'danish') {
    return DANISH_STOP_WORDS
  }

  if (language === 'urdu') {
    return URDU_STOP_WORDS
  }

  return ENGLISH_STOP_WORDS
}
