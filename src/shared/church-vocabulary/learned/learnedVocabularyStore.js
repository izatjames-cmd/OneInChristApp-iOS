import {
  FirebaseFirestore
} from '@capacitor-firebase/firestore'

import {
  getLearnedVocabularyEntries,
  isLearnedVocabularyLoaded,
  setLearnedVocabularyEntries
} from './learnedVocabularyCache.js'

const COLLECTION =
  'learnedChurchVocabulary'


export async function loadLearnedChurchVocabulary({
  force = false
} = {}) {

  if (
    !force &&
    isLearnedVocabularyLoaded()
  ) {
    return getLearnedVocabularyEntries()
  }


  const result =
    await FirebaseFirestore.getCollection({
      reference:
        COLLECTION
    })


  const entries =
    (result?.snapshots || [])
      .map(
        snapshot => ({
          id:
            snapshot.id,
          ...snapshot.data
        })
      )
      .filter(
        entry =>
          entry?.active !== false &&
          entry?.status !== 'rejected'
      )


  setLearnedVocabularyEntries(
    entries
  )


  return entries
}


export async function refreshLearnedChurchVocabulary() {
  return loadLearnedChurchVocabulary({
    force:
      true
  })
}
