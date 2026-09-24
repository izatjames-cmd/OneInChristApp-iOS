import { DANISH_CHRISTIAN_TRANSLATION_RULES } from './danish/index.js'
import { ENGLISH_CHRISTIAN_TRANSLATION_RULES } from './english/index.js'
import { URDU_CHRISTIAN_TRANSLATION_RULES } from './urdu/index.js'
import { CHURCH_TERMINOLOGY } from './terminology/index.js'

const RULES_BY_LANGUAGE = {
  danish: DANISH_CHRISTIAN_TRANSLATION_RULES,
  english: ENGLISH_CHRISTIAN_TRANSLATION_RULES,
  urdu: URDU_CHRISTIAN_TRANSLATION_RULES
}
const escapeRegExp = value => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
// ASCII word boundaries do not recognize Urdu or Danish letters.
const boundaryPattern = source => `(?<![\\p{L}\\p{M}\\p{N}_])(?:${source})(?![\\p{L}\\p{M}\\p{N}_])`

export function normalizeChurchTerminology(text, language, {
  sourceText = '', sourceLanguage = ''
} = {}) {
  const target = normalizeLanguageKey(language)
  let value = String(text || '').trim()
  if (!value || !target) return value
  const source = normalizeLanguageKey(sourceLanguage)
  const replacements = new Map()
  for (const term of CHURCH_TERMINOLOGY) {
    const preferred = term.preferred?.[target]
    if (!preferred) continue
    const aliases = [...(term.aliases?.[target] || [])]
    if ((term.sourceTerms?.[source] || []).some(word =>
      new RegExp(boundaryPattern(escapeRegExp(word)), 'iu').test(sourceText)
    )) aliases.push(...(term.sourceAwareAliases?.[target] || []))
    for (const alias of aliases) replacements.set(alias.toLowerCase(), preferred)
  }
  // Protect complete preferred phrases against shorter aliases within them.
  // One pass prevents replacement text being translated again.
  for (const term of CHURCH_TERMINOLOGY) {
    const preferred = term.preferred?.[target]
    if (preferred) replacements.set(preferred.toLowerCase(), null)
  }
  const alternatives = [...replacements.keys()].sort((a, b) => b.length - a.length)
  if (alternatives.length) {
    const pattern = new RegExp(boundaryPattern(alternatives.map(escapeRegExp).join('|')), 'giu')
    value = value.replace(pattern, match => replacements.get(match.toLowerCase()) ?? match)
  }
  for (const rule of RULES_BY_LANGUAGE[target]) {
    const pattern = rule.pattern.source === ' {2,}' ? rule.pattern :
      new RegExp(boundaryPattern(rule.pattern.source), [...new Set(`${rule.pattern.flags}u`)].join(''))
    value = value.replace(pattern, rule.replacement)
  }
  return value.trim()
}

export function normalizeLanguageKey(language) {
  const key = String(language || '').trim().toLowerCase()
  if (['da', 'da-dk', 'danish', 'dansk'].includes(key)) return 'danish'
  if (['en', 'en-gb', 'en-us', 'english'].includes(key)) return 'english'
  if (['ur', 'ur-in', 'ur-pk', 'urdu'].includes(key)) return 'urdu'
  return ''
}
