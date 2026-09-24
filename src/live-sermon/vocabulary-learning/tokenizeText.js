export function tokenizeText(
  text,
  language
) {

  const value =
    String(
      text || ''
    )


  const pattern =
    language === 'urdu'
      ? /[\p{Script=Arabic}\p{L}\p{M}]+/gu
      : /[\p{L}\p{M}]+(?:['’\-][\p{L}\p{M}]+)*/gu


  return (
    value.match(pattern) || []
  )
    .map(
      token => ({
        original:
          token,
        normalized:
          normalizeVocabularyText(
            token,
            language
          )
      })
    )
    .filter(
      token =>
        Boolean(
          token.normalized
        )
    )
}


export function normalizeVocabularyText(
  value,
  language
) {

  const text =
    String(
      value || ''
    )
      .trim()
      .replace(
        /\s+/g,
        ' '
      )


  if (language === 'urdu') {
    return text
      .replace(
        /[\u064B-\u065F\u0670\u06D6-\u06ED]/g,
        ''
      )
  }


  return text
    .toLocaleLowerCase()
}
