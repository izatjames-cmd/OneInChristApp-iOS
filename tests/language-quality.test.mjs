import test from 'node:test'
import assert from 'node:assert/strict'
import { createSermonContext } from '../src/live-sermon/context/sermonContext.js'
import { applyContextualGrammar } from '../src/live-sermon/context/contextualTranslation.js'
import { enforceEnglishSingularAgreement, enforceEnglishPluralAgreement } from '../src/live-sermon/context/englishVerbAgreement.js'

test('life surrender preserves the singular divine recipient in English and Danish', () => {
  const context = createSermonContext()
  for (const source of [
    'یسوع مسیح چاہتے ہیں کہ ہم اپنی زندگیاں بدلیں اور اپنی زندگیاں اُن کے سپرد کریں۔',
    'وہ چاہتے ہیں کہ ہم اپنی زندگی انہیں دیں۔'
  ]) {
    const snapshot = context.observe(source, 'urdu')
    const named = source.startsWith('یسوع')
    const english = named ? 'Jesus Christ wants' : 'They want'
    const danish = named ? 'Jesus Kristus' : 'De'
    assert.equal(applyContextualGrammar(`${english} us to change our lives and give our lives to them.`, 'en', snapshot), `${named ? 'Jesus Christ wants' : 'He wants'} us to change our lives and give our lives to Him.`)
    assert.equal(applyContextualGrammar(`${danish} ønsker, at vi ændrer vores liv og overgiver vores liv til dem.`, 'da', snapshot), `${named ? 'Jesus Kristus' : 'Han'} ønsker, at vi ændrer vores liv og overgiver vores liv til ham.`)
  }
})

test('other recipients and ambiguous antecedents are preserved', () => {
  const context = createSermonContext()
  context.observe('یسوع مسیح ہمارے خداوند ہیں۔', 'ur')
  let snapshot = context.observe('وہ انہیں نجات دیتا ہے۔', 'ur')
  assert.equal(applyContextualGrammar('They give them salvation.', 'en', snapshot), 'He gives them salvation.')
  snapshot = context.observe('یسوع نے شاگردوں سے بات کی۔', 'ur')
  assert.equal(applyContextualGrammar('We give our lives to them.', 'en', snapshot), 'We give our lives to them.')
  snapshot = context.observe('پطرس اور پولس وہاں تھے۔', 'ur')
  assert.equal(snapshot.ambiguous, true)
  context.reset()
  snapshot = context.observe('ہم اپنی زندگی انہیں دیں۔', 'ur')
  assert.equal(applyContextualGrammar('We give our lives to them.', 'en', snapshot), 'We give our lives to them.')
})

test('Urdu diacritics and sentence punctuation preserve pronoun recognition', () => {
  const context = createSermonContext()
  context.observe('یسوع مسیح ہمارے خداوند ہیں۔', 'ur')
  const snapshot = context.observe('ہم اُن پر ایمان رکھتے ہیں۔', 'ur')
  assert.equal(applyContextualGrammar('We believe in them.', 'en', snapshot), 'We believe in Him.')
  const unrelated = createSermonContext().observe('مسیحی زندگی', 'ur')
  assert.equal(unrelated.focus, null)
})

test('agreement repairs known verbs without corrupting adverbs or past tense', () => {
  assert.equal(enforceEnglishSingularAgreement('He want us. He bless us. He always loved us. He never left. He had mercy.'), 'He wants us. He blesses us. He always loved us. He never left. He had mercy.')
  assert.equal(enforceEnglishPluralAgreement('They gives. They always pray. They express hope.'), 'They give. They always pray. They express hope.')
})

test('plural groups and expired context do not force a singular recipient', () => {
  const context = createSermonContext()
  context.observe('شاگردوں نے دعا کی۔', 'ur')
  let snapshot = context.observe('وہ چاہتے ہیں کہ ہم اپنی زندگی انہیں دیں۔', 'ur')
  assert.equal(applyContextualGrammar('They want us to give our lives to them.', 'en', snapshot), 'They want us to give our lives to them.')
  context.reset()
  context.observe('یسوع مسیح ہمارے خداوند ہیں۔', 'ur')
  for (let index = 0; index < 5; index++) context.observe('آج ایک نیا دن ہے۔', 'ur')
  snapshot = context.observe('ہم اپنی زندگی انہیں دیں۔', 'ur')
  assert.equal(applyContextualGrammar('We give our lives to them.', 'en', snapshot), 'We give our lives to them.')
})
