export function getNotificationCategoryForSection(
  section
) {

  const normalized =
    String(
      section || 'church'
    )
      .trim()
      .toLowerCase()


  switch (normalized) {

    case 'food':
      return 'food'

    case 'choir':
      return 'choir'

    case 'youth':
      return 'youth'

    case 'prayer':
      return 'prayer'

    case 'sunday-school':
    case 'sundayschool':
      return 'sundaySchool'

    case 'danish-language':
    case 'danishlanguage':
    case 'language-school':
    case 'languageschool':
      return 'danishLanguage'

    case 'scripture-preparation':
    case 'scripturepreparation':
    case 'plan':
      return 'service'

    case 'daily-devotion':
    case 'dailydevotion':
      return 'dailyDevotion'

    case 'ai-bible-reading':
    case 'aibiblereading':
      return 'aiBibleReading'

    case 'board':
    case 'general':
    case 'church':
    default:
      return 'general'
  }
}
