import test from 'node:test'
import assert from 'node:assert/strict'
import { normalizeChurchTerminology as normalize } from '../src/shared/church-vocabulary/terminologyNormalizer.js'
import { CHURCH_TERMINOLOGY } from '../src/shared/church-vocabulary/terminology/index.js'
import { createSermonContext } from '../src/live-sermon/context/sermonContext.js'
import { applyContextualGrammar } from '../src/live-sermon/context/contextualTranslation.js'
import { normalizeLearnedChurchTerminology } from '../src/shared/church-vocabulary/learned/learnedVocabularyRuntime.js'
import { setLearnedVocabularyEntries, clearLearnedVocabularyCache } from '../src/shared/church-vocabulary/learned/learnedVocabularyCache.js'

test('learned vocabulary also preserves longer words', () => {
  setLearnedVocabularyEntries([{ preferred: { english: 'Christ', urdu: 'کلیسیا' }, aliases: { english: ['Masih'], urdu: ['چرچ'] } }])
  try {
    assert.equal(normalizeLearnedChurchTerminology('Masih Masihabad', 'en'), 'Christ Masihabad')
    assert.equal(normalizeLearnedChurchTerminology('چرچ چرچل', 'ur'), 'کلیسیا چرچل')
  } finally { clearLearnedVocabularyCache() }
})

test('terms are matched as complete words in all three languages', () => {
  assert.equal(normalize('Masih Masiha Masihabad', 'en'), 'Christ Messiah Masihabad')
  assert.equal(normalize('Masih Masiha Masihabad', 'da'), 'Kristus Messias Masihabad')
  assert.equal(normalize('سن کر سنبھل جاؤ۔', 'ur'), 'سن کر سنبھل جاؤ۔')
  assert.equal(normalize('چرچل چرچ', 'ur'), 'چرچل کلیسیا')
  assert.equal(normalize('یسوع مسیحی', 'ur'), 'یسوع مسیحی')
})

test('titles never acquire invented or repeated possession', () => {
  const options = { sourceLanguage: 'ur', sourceText: 'خداوند یسوع مسیح' }
  for (const title of ['Our Lord Jesus Christ', 'the Lord Jesus Christ', 'Lord Jesus Christ']) {
    assert.equal(normalize(title, 'en', options), title)
  }
  assert.equal(normalize('our Aasmani Baap', 'en'), 'our Heavenly Father')
  assert.equal(normalize('ہمارا ہیونلی فادر', 'ur'), 'ہمارا آسمانی باپ')
  assert.equal(normalize('Herre Jesus, hjælp os.', 'da', options), 'Herre Jesus, hjælp os.')
})

test('repeated normalization is stable for every preferred term and alias', () => {
  for (const language of ['english', 'danish', 'urdu']) {
    for (const term of CHURCH_TERMINOLOGY) {
      for (const phrase of [term.preferred[language], ...(term.aliases?.[language] || [])]) {
        const once = normalize(phrase, language)
        assert.equal(normalize(once, language), once, `${language}: ${phrase}`)
      }
    }
  }
})

test('established religious concepts and synonyms stay distinct', () => {
  for (const [language, text] of [
    ['en', 'Grace, mercy, redemption, atonement. Holy Communion.'],
    ['da', 'Nåde, barmhjertighed, forløsning, soning.'],
    ['ur', 'فضل، رحمت، مخلصی، کفارہ۔']
  ]) assert.equal(normalize(text, language), text)
})

test('honorific subject correction handles English contractions', () => {
  const context = createSermonContext()
  context.observe('یسوع مسیح ہمارے خداوند ہیں۔', 'ur')
  const snapshot = context.observe('وہ ہمیں بلاتے ہیں۔', 'ur')
  assert.equal(applyContextualGrammar("They're calling us. They've called us.", 'en', snapshot), 'He is calling us. He has called us.')
  assert.equal(applyContextualGrammar('They’re calling us.', 'en', snapshot), 'He is calling us.')
})
