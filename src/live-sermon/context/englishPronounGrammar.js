import {
  enforceEnglishPluralAgreement,
  enforceEnglishSingularAgreement
} from './englishVerbAgreement.js'


export function correctEnglishPronouns(
  text,
  context
) {

  const focus =
    context?.focus

  const pronouns =
    context?.pronouns || {}


  if (!focus) {
    return text
  }


  if (
    focus.number ===
    'plural'
  ) {
    return toEnglishPlural(
      text,
      pronouns
    )
  }


  if (
    focus.number !==
    'singular'
  ) {
    return text
  }


  if (
    focus.gender ===
    'feminine'
  ) {
    return toEnglishFeminineSingular(
      text,
      pronouns
    )
  }


  return toEnglishMasculineSingular(
    text,
    pronouns,
    focus.sacred ===
      true
  )
}


function toEnglishMasculineSingular(
  text,
  pronouns,
  sacred
) {

  const value =
    replacePluralPronouns(
      text,
      pronouns,
      {
        subject:
          sacred
            ? 'He'
            : 'he',
        object:
          sacred
            ? 'Him'
            : 'him',
        possessive:
          sacred
            ? 'His'
            : 'his',
        possessiveStandalone:
          sacred
            ? 'His'
            : 'his',
        reflexive:
          sacred
            ? 'Himself'
            : 'himself'
      }
    )


  return enforceEnglishSingularAgreement(
    value
  )
}


function toEnglishFeminineSingular(
  text,
  pronouns
) {

  const value =
    replacePluralPronouns(
      text,
      pronouns,
      {
        subject:
          'she',
        object:
          'her',
        possessive:
          'her',
        possessiveStandalone:
          'hers',
        reflexive:
          'herself'
      }
    )


  return enforceEnglishSingularAgreement(
    value
  )
}


function toEnglishPlural(
  text,
  pronouns
) {

  let value =
    String(
      text || ''
    )


  if (
    shouldResolveSubject(
      pronouns
    )
  ) {
    value =
      replaceWord(
        value,
        /\bhe\b(?!['’]s\b)/gi,
        'they'
      )

    value =
      replaceWord(
        value,
        /\bshe\b(?!['’]s\b)/gi,
        'they'
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
        /\bhimself\b/gi,
        'themselves'
      )

    value =
      replaceWord(
        value,
        /\bherself\b/gi,
        'themselves'
      )

    value =
      replaceWord(
        value,
        /\bhim\b/gi,
        'them'
      )

    value =
      replaceWord(
        value,
        /\bher\b/gi,
        'them'
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
        /\bhis\b/gi,
        'their'
      )

    value =
      value.replace(
        /\bher\b(?=\s+[A-Za-z])/gi,
        match =>
          preserveCase(
            match,
            'their'
          )
      )

    value =
      replaceWord(
        value,
        /\bhers\b/gi,
        'theirs'
      )
  }


  return enforceEnglishPluralAgreement(
    value
  )
}


function replacePluralPronouns(
  text,
  pronouns,
  replacements
) {

  let value =
    String(
      text || ''
    )


  if (
    shouldResolveSubject(
      pronouns
    )
  ) {
    // Resolve auxiliary contractions before replacing the subject; otherwise
    // "they're" becomes the ungrammatical "He're".
    value = value.replace(/\bthey['’](re|ve)\b/gi, (match, ending) =>
      `${preserveCase(match, replacements.subject)} ${ending.toLowerCase() === 're' ? 'is' : 'has'}`
    )
    value =
      replaceWord(
        value,
        /\bthey\b/gi,
        replacements.subject
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
        /\bthemselves\b/gi,
        replacements.reflexive
      )

    value =
      replaceWord(
        value,
        /\bthemself\b/gi,
        replacements.reflexive
      )

    value =
      replaceWord(
        value,
        /\bthem\b/gi,
        replacements.object
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
        /\btheirs\b/gi,
        replacements.possessiveStandalone
      )

    value =
      replaceWord(
        value,
        /\btheir\b/gi,
        replacements.possessive
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
