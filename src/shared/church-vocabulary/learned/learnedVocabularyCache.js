let learnedEntries = []
let loaded = false

export function setLearnedVocabularyEntries(
  entries
) {

  learnedEntries = Array.isArray(entries)
    ? entries.filter(
        entry =>
          entry?.active !== false
      )
    : []

  loaded = true
}


export function getLearnedVocabularyEntries() {
  return [
    ...learnedEntries
  ]
}


export function isLearnedVocabularyLoaded() {
  return loaded
}


export function clearLearnedVocabularyCache() {
  learnedEntries = []
  loaded = false
}
