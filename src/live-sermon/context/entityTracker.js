const ENTITY_PATTERNS = {
  urdu: [
    {
      key: 'jesus',
      number: 'singular',
      gender: 'masculine',
      sacred: true,
      priority: 100,
      pattern: /(?:خداوند\s+)?یسوع(?:\s+مسیح)?|مسیحا|مسیح/g
    },
    {
      key: 'holy-spirit',
      number: 'singular',
      gender: 'masculine',
      sacred: true,
      priority: 95,
      pattern: /روح\s*القدس/g
    },
    {
      key: 'god',
      number: 'singular',
      gender: 'masculine',
      sacred: true,
      priority: 90,
      pattern: /خدا(?!وند)(?:\s+باپ)?/g
    },
    {
      key: 'lord',
      number: 'singular',
      gender: 'masculine',
      sacred: true,
      priority: 75,
      pattern: /خداوند/g
    },
    {
      key: 'mary',
      number: 'singular',
      gender: 'feminine',
      sacred: false,
      priority: 80,
      pattern: /مریم(?:\s+مگدلینی)?/g
    },
    {
      key: 'biblical-man',
      number: 'singular',
      gender: 'masculine',
      sacred: false,
      priority: 65,
      pattern: /(?:پطرس|پولس|یوحنا|موسیٰ|داؤد|ابراہام|اسحاق|اضحاق|یعقوب|یوسف|سلیمان|دانی\s*ایل|ایلیاہ|الیشع)/g
    },
    {
      key: 'biblical-woman',
      number: 'singular',
      gender: 'feminine',
      sacred: false,
      priority: 65,
      pattern: /(?:مرتھا|الیشبع|حوا|روت|آستر|دبورہ|راحیل|ربقہ|سارہ)/g
    },
    {
      key: 'group',
      number: 'plural',
      gender: 'mixed',
      sacred: false,
      priority: 70,
      pattern: /(?:شاگردوں|رسولوں|لوگوں|لوگ|ایمانداروں|مومنوں|بھائیوں|بہنوں|مردوں|عورتوں|بچوں|فریسیوں|یہودیوں|قوموں|کاہنوں|بزرگوں)/g
    }
  ],

  english: [
    {
      key: 'jesus',
      number: 'singular',
      gender: 'masculine',
      sacred: true,
      priority: 100,
      pattern: /\b(?:the\s+Lord\s+)?Jesus(?:\s+Christ)?\b|\bChrist\b|\bMessiah\b/gi
    },
    {
      key: 'holy-spirit',
      number: 'singular',
      gender: 'masculine',
      sacred: true,
      priority: 95,
      pattern: /\bHoly\s+Spirit\b/gi
    },
    {
      key: 'god',
      number: 'singular',
      gender: 'masculine',
      sacred: true,
      priority: 90,
      pattern: /\bGod(?:\s+the\s+Father)?\b/gi
    },
    {
      key: 'lord',
      number: 'singular',
      gender: 'masculine',
      sacred: true,
      priority: 75,
      pattern: /\bthe\s+Lord\b/gi
    },
    {
      key: 'mary',
      number: 'singular',
      gender: 'feminine',
      sacred: false,
      priority: 80,
      pattern: /\bMary(?:\s+Magdalene)?\b/gi
    },
    {
      key: 'group',
      number: 'plural',
      gender: 'mixed',
      sacred: false,
      priority: 70,
      pattern: /\b(?:disciples|apostles|people|believers|brothers|sisters|men|women|children|Pharisees|Jews|nations|priests|elders)\b/gi
    }
  ],

  danish: [
    {
      key: 'jesus',
      number: 'singular',
      gender: 'masculine',
      sacred: true,
      priority: 100,
      pattern: /\b(?:Herren\s+)?Jesus(?:\s+Kristus)?\b|\bKristus\b|\bMessias\b/gi
    },
    {
      key: 'holy-spirit',
      number: 'singular',
      gender: 'masculine',
      sacred: true,
      priority: 95,
      pattern: /\bHelligånden\b|\bDen\s+Hellige\s+Ånd\b/gi
    },
    {
      key: 'god',
      number: 'singular',
      gender: 'masculine',
      sacred: true,
      priority: 90,
      pattern: /\bGud(?:\s+Fader)?\b/gi
    },
    {
      key: 'lord',
      number: 'singular',
      gender: 'masculine',
      sacred: true,
      priority: 75,
      pattern: /\bHerren\b/gi
    },
    {
      key: 'mary',
      number: 'singular',
      gender: 'feminine',
      sacred: false,
      priority: 80,
      pattern: /\bMaria(?:\s+Magdalene)?\b/gi
    },
    {
      key: 'group',
      number: 'plural',
      gender: 'mixed',
      sacred: false,
      priority: 70,
      pattern: /\b(?:disciplene|apostlene|menneskerne|folket|troende|brødrene|søstrene|mændene|kvinderne|børnene|farisæerne|jøderne|folkene|præsterne|de\s+ældste)\b/gi
    }
  ]
}


export function detectExplicitReferents(
  text,
  language
) {

  const value =
    String(
      text || ''
    )

  const patterns =
    ENTITY_PATTERNS[
      normalizeLanguageKey(
        language
      )
    ] || []

  const matches = []


  patterns.forEach(
    definition => {

      const pattern =
        new RegExp(
          definition.pattern.source,
          definition.pattern.flags
        )

      let match

      while (
        (
          match =
            pattern.exec(
              value
            )
        )
      ) {

        // Urdu names must not match inside other words, e.g. مسیحی.
        if (normalizeLanguageKey(language) === 'urdu' && (
          /[\p{L}\p{M}]/u.test(value[match.index - 1] || '') ||
          /[\p{L}\p{M}]/u.test(value[match.index + match[0].length] || '')
        )) continue

        matches.push({
          ...definition,
          text:
            match[0],
          index:
            match.index,
          end:
            match.index +
            match[0].length
        })

        if (
          match[0].length ===
          0
        ) {
          pattern.lastIndex +=
            1
        }
      }
    }
  )


  const accepted = []


  matches
    .sort(
      (
        first,
        second
      ) =>
        second.priority -
          first.priority ||
        first.index -
          second.index
    )
    .forEach(
      candidate => {

        const overlaps =
          accepted.some(
            existing =>
              candidate.index <
                existing.end &&
              candidate.end >
                existing.index
          )


        if (!overlaps) {
          accepted.push(
            candidate
          )
        }
      }
    )


  return accepted
    .sort(
      (
        first,
        second
      ) =>
        first.index -
        second.index
    )
    .map(
      item => ({
        key:
          ['biblical-man', 'biblical-woman'].includes(item.key)
            ? `${item.key}:${item.text}`
            : item.key,
        number:
          item.number,
        gender:
          item.gender,
        sacred:
          item.sacred,
        text:
          item.text,
        index:
          item.index
      })
    )
}


export function hasAmbiguousThirdPersonReference(
  text,
  language
) {

  const value =
    String(
      text || ''
    )

  const key =
    normalizeLanguageKey(
      language
    )


  if (key === 'urdu') {
    return /(?:^|[\s،,.!?؟؛])(وہ|اُس|اس|انہوں|انھوں|انہیں|انھیں|ان)(?=$|[\s،,.!?؟؛])/u.test(
      value
    )
  }


  return false
}


export function normalizeLanguageKey(
  language
) {

  const value =
    String(
      language || ''
    )
      .trim()
      .toLowerCase()


  if (
    value === 'ur' ||
    value === 'ur-in' ||
    value === 'ur-pk' ||
    value === 'urdu'
  ) {
    return 'urdu'
  }


  if (
    value === 'en' ||
    value === 'en-gb' ||
    value === 'en-us' ||
    value === 'english'
  ) {
    return 'english'
  }


  if (
    value === 'da' ||
    value === 'da-dk' ||
    value === 'danish' ||
    value === 'dansk'
  ) {
    return 'danish'
  }


  return ''
}
