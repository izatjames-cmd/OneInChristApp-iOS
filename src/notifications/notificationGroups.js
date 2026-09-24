export const NOTIFICATION_GROUPS = [
  {
    key: 'food',
    label: 'Food'
  },
  {
    key: 'aiBibleReading',
    label: 'Daily Bible Reading'
  },
  {
    key: 'dailyDevotion',
    label: 'Daily Devotion'
  },
  {
    key: 'choir',
    label: 'Choir'
  },
  {
    key: 'prayer',
    label: 'Prayer'
  },
  {
    key: 'youth',
    label: 'Youth'
  },
  {
    key: 'sundaySchool',
    label: 'Sunday School'
  },
  {
    key: 'danishLanguage',
    label: 'Language School'
  },
  {
    key: 'scripturePreparation',
    label: 'Scripture Preparation'
  },
  {
    key: 'servicePlan',
    label: 'Service Plan'
  },
  {
    key: 'board',
    label: 'Board'
  },
  {
    key: 'general',
    label: 'General Church'
  },
  {
    key: 'other',
    label: 'Other'
  }
]


function normalizeNotificationValue(value) {

  return String(
    value || ''
  )
    .trim()
    .toLowerCase()
}


export function getNotificationGroupKey(
  notification
) {

  const section =
    normalizeNotificationValue(
      notification?.section
    )

  const category =
    normalizeNotificationValue(
      notification?.category
    )


  switch (section) {

    case 'food':
      return 'food'

    case 'ai-bible-reading':
    case 'aibiblereading':
      return 'aiBibleReading'

    case 'daily-devotion':
    case 'dailydevotion':
      return 'dailyDevotion'

    case 'choir':
      return 'choir'

    case 'prayer':
      return 'prayer'

    case 'youth':
      return 'youth'

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
      return 'scripturePreparation'

    case 'plan':
      return 'servicePlan'

    case 'board':
      return 'board'

    case 'church':
    case 'general':
      return 'general'
  }


  switch (category) {

    case 'food':
      return 'food'

    case 'aibiblereading':
      return 'aiBibleReading'

    case 'daily devotion':
    case 'dailydevotion':
      return 'dailyDevotion'

    case 'choir':
    case 'choirfeedback':
      return 'choir'

    case 'prayer':
      return 'prayer'

    case 'youth':
      return 'youth'

    case 'sundayschool':
      return 'sundaySchool'

    case 'danishlanguage':
    case 'danishclass':
      return 'danishLanguage'

    case 'service':
      return 'servicePlan'

    case 'general':
    case 'news':
    case 'holiday':
      return 'general'

    default:
      return 'other'
  }
}


