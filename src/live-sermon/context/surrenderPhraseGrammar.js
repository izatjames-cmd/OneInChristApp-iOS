// Only repair the recipient of a life-surrender phrase when both the source
// phrase and a single divine antecedent support it. Never replace every object.
export function correctSurrenderRecipient(text, language, context) {
  if (!context.focus?.sacred || context.focus.number !== 'singular') return text
  const source = context.sourceText.normalize('NFC').replace(/[\u064B-\u065F\u0670]/gu, '')
  const life = /(?:اپنی|ہماری)\s+(?:زندگی|زندگیاں|جان)/u
  const recipient = /(?:انہیں|انھیں|ان\s+کو|اسے|اس\s+کو|ان\s+کے\s+سپرد|اس\s+کے\s+سپرد)/u
  if (!life.test(source) || !recipient.test(source) || !/(?:دیں|دے|دینا|دیتے|سپرد)/u.test(source)) return text
  if (language === 'english') {
    return text.replace(/\b((?:give|giving|surrender|surrendering|entrust|entrusting|commit|committing)\s+(?:our|my|your)\s+(?:life|lives)\s+to\s+)them\b/gi, '$1Him')
  }
  if (language === 'danish') {
    return text.replace(/\b((?:give|giver|overgive|overgiver|overlade|overlader)\s+(?:vores|vore|mit|dit|jeres)\s+liv\s+til\s+)dem\b/gi, '$1ham')
  }
  return text
}
