export function correctDanishPronouns(
  text,
  context
) {

  const focus =
    context?.focus

  const pronouns =
    context?.pronouns || {}

  let value =
    String(
      text || ''
    )


  if (!focus) {
    return value
  }


  if (
    focus.number ===
    'plural'
  ) {

    if (
      shouldResolveSubject(
        pronouns
      )
    ) {
      value =
        replaceWord(
          value,
          /\bhan\b/gi,
          'de'
        )

      value =
        replaceWord(
          value,
          /\bhun\b/gi,
          'de'
        )
    }


    if (
      shouldResolveObject(
        pronouns
      )
    ) {
      value =
        replaceWord(
          value,
          /\bham\b/gi,
          'dem'
        )

      value =
        replaceWord(
          value,
          /\bhende\b/gi,
          'dem'
        )
    }


    if (
      shouldResolvePossessive(
        pronouns
      )
    ) {
      value =
        replaceWord(
          value,
          /\bhans\b/gi,
          'deres'
        )

      value =
        replaceWord(
          value,
          /\bhendes\b/gi,
          'deres'
        )
    }


    return value
  }


  if (
    focus.number !==
    'singular'
  ) {
    return value
  }


  const feminine =
    focus.gender ===
    'feminine'


  if (
    shouldResolveObject(
      pronouns
    )
  ) {
    value =
      replaceWord(
        value,
        /\bdem\b/gi,
        feminine
          ? 'hende'
          : 'ham'
      )
  }


  if (
    shouldResolvePossessive(
      pronouns
    )
  ) {
    value =
      replaceWord(
        value,
        /\bderes\b/gi,
        feminine
          ? 'hendes'
          : 'hans'
      )
  }


  if (
    shouldResolveSubject(
      pronouns
    )
  ) {
    // Danish "de" can also be an article. Only rewrite it when it is
    // used as a standalone pronoun at the beginning of a clause.
    value =
      value.replace(
        /(^|[.!?]\s+)(De|de)\b/g,
        (
          _match,
          prefix,
          pronoun
        ) =>
          prefix +
          preserveCase(
            pronoun,
            feminine
              ? 'hun'
              : 'han'
          )
      )
  }


  return value
}


function shouldResolveSubject(
  pronouns
) {
  return pronouns?.subject ===
    true
}


function shouldResolveObject(
  pronouns
) {
  return (
    pronouns?.resolveSubjectOnly !==
      true &&
    pronouns?.object ===
      true
  )
}


function shouldResolvePossessive(
  pronouns
) {
  return (
    pronouns?.resolveSubjectOnly !==
      true &&
    pronouns?.possessive ===
      true
  )
}


function replaceWord(
  text,
  pattern,
  replacement
) {

  return String(
    text || ''
  ).replace(
    pattern,
    match =>
      preserveCase(
        match,
        replacement
      )
  )
}


function preserveCase(
  original,
  replacement
) {

  const source =
    String(
      original || ''
    )

  const target =
    String(
      replacement || ''
    )


  if (
    source &&
    source[0] ===
      source[0].toUpperCase()
  ) {
    return (
      target[0].toUpperCase() +
      target.slice(1)
    )
  }


  return target
}
