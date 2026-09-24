import {
  openChurchNotifications
} from './churchNotificationsUI.js'

import {
  openFoodSection
} from '../food/foodUI.js'

import {
  openChoirSection
} from '../choir/choirUI.js'

import {
  openServicePlanSection
} from '../service-plan/servicePlanUI.js'

import {
  openYouthSection
} from '../ministry/youth/youthUI.js'

import {
  routePrayer
} from '../ministry/prayer/prayerRouter.js'

import {
  routeSundaySchool
} from '../ministry/sunday-school/sundaySchoolRouter.js'

import {
  routeDanishLanguage
} from '../ministry/danish-language/danishLanguageRouter.js'

import {
  routeDailyDevotion
} from '../daily-devotion/dailyDevotionRouter.js'

import {
  routeAiBibleReading
} from '../ai-bible-reading/aiBibleReadingRouter.js'

import {
  routeScripturePreparation
} from '../scripture-preparation/scripturePreparationRouter.js'


function normalizeSection(value) {

  return String(
    value || 'church'
  )
    .trim()
    .toLowerCase()
}


function getSectionFromNotificationData(data) {

  if (!data) {
    return 'church'
  }


  if (
    typeof data === 'string'
  ) {

    return normalizeSection(
      data
    )
  }


  return normalizeSection(
    data.section ||
    data.targetSection ||
    data.destination ||
    data?.data?.section ||
    data?.extra?.section ||
    'church'
  )
}


export async function routeNotification(
  data = {}
) {

  const section =
    getSectionFromNotificationData(
      data
    )


  const targetId =
    data.targetId ||
    data?.data?.targetId ||
    data?.extra?.targetId ||
    null


  await new Promise(
    resolve =>
      setTimeout(
        resolve,
        250
      )
  )


  switch (section) {

    case 'food':

      await openFoodSection()

      return


    case 'choir':

      await openChoirSection(
        targetId
      )

      return


    case 'church':

      await openChurchNotifications()

      return


    case 'youth':

      await openYouthSection(
        targetId || 'dashboard'
      )

      return


    case 'prayer':

      await routePrayer(
        targetId || 'dashboard'
      )

      return


    case 'sunday-school':
    case 'sundayschool':
    case 'sundaySchool':

      await routeSundaySchool(
        targetId || 'dashboard'
      )

      return


    case 'danish-language':
    case 'danishLanguage':
    case 'language-school':
    case 'languageSchool':

      await routeDanishLanguage(
        targetId || 'dashboard'
      )

      return


    case 'daily-devotion':

      await routeDailyDevotion(
        targetId || 'devotion'
      )

      return


    case 'ai-bible-reading':
    case 'aiBibleReading':

      await routeAiBibleReading(
        targetId || 'reading'
      )

      return


    case 'scripture-preparation':
    case 'scripturePreparation':

      await routeScripturePreparation(
        targetId || 'dashboard'
      )

      return


    case 'plan':

      await openServicePlanSection(
        targetId
      )

      return


    case 'board':

      alert(
        'Board section will be available soon.'
      )

      return


    default:

      await openChurchNotifications()
  }
}
