import {
  createAccount,
  signInWithEmail,
  sendVerificationEmail,
  getCurrentMember,
  signOutMember
} from '../auth/phoneAuth.js'

import {
  findApprovedMemberByEmail
} from '../auth/memberStore.js'

import {
  verifyMemberFromSheet
} from '../auth/memberVerificationService.js'

import {
  getApprovedMember,
  setApprovedMember
} from '../auth/appState.js'

import {
  getAdminAccess
} from '../auth/adminAccessStore.js'

import {
  openFoodSection
} from '../food/foodUI.js'

import {
  openChurchNotifications
} from '../notifications/churchNotificationsUI.js'

import {
  openChoirSection
} from '../choir/choirUI.js'

import {
  openServicePlanSection
} from '../service-plan/servicePlanUI.js'

import {
  openDailyDevotionSection
} from '../daily-devotion/dailyDevotionUI.js'

import {
  openAiBibleReadingSection
} from '../ai-bible-reading/aiBibleReadingUI.js'

import {
  openYouthSection
} from '../ministry/youth/youthUI.js'

import {
  openPrayerSection
} from '../ministry/prayer/prayerUI.js'

import {
  openSundaySchoolSection
} from '../ministry/sunday-school/sundaySchoolUI.js'

import {
  openDanishLanguageSection
} from '../ministry/danish-language/danishLanguageUI.js'

import {
  openScripturePreparationSection
} from '../scripture-preparation/scripturePreparationUI.js'

import {
  openChurchAdminSection
} from '../church-admin/churchAdminUI.js'

import {
  syncPushTokenForCurrentUser
} from '../notifications/pushNotifications.js'

let memberAreaRenderVersion = 0


export function setupMemberUI() {

  document
    .querySelector('#member-login-button')
    .addEventListener(
      'click',
      openLogin
    )


  document
    .querySelector('#member-area-button')
    .addEventListener(
      'click',
      openMemberArea
    )


  document
    .querySelector('#close-login-button')
    .addEventListener(
      'click',
      () => {

        document
          .querySelector('#member-login-overlay')
          .style.display = 'none'
      }
    )


  const closeMemberArea = () => {
    document
      .querySelector('#member-area-overlay')
      .style.display = 'none'
  }


  document
    .querySelector('#close-member-area-button')
    .addEventListener(
      'click',
      closeMemberArea
    )


  document
    .querySelector('#close-member-area-top-button')
    .addEventListener(
      'click',
      closeMemberArea
    )


  document
    .querySelector('#guest-logout-button')
    .addEventListener(
      'click',
      signOutCurrentMember
    )


  document
    .querySelector('#create-account-button')
    .addEventListener(
      'click',
      createMemberAccount
    )


  document
    .querySelector('#guest-login-button')
    .addEventListener(
      'click',
      signInAsGuest
    )


  document
    .querySelector('#sign-in-button')
    .addEventListener(
      'click',
      signInMember
    )


  document
    .querySelector('#sign-out-button')
    .addEventListener(
      'click',
      signOutCurrentMember
    )


  restoreMemberSession()
}


async function findMember(user) {

  if (!user?.email) {
    return null
  }


  return await findApprovedMemberByEmail(
    user.email
      .trim()
      .toLowerCase()
  )
}


function getPermissions(
  member,
  adminAccess = {}
) {

  if (member?.guest === true) {
    return {
      church: false,
      dailyDevotion: false,
      aiBibleReading: false,
      food: false,
      choir: false,
      youth: false,
      prayer: false,
      sundaySchool: false,
      languageSchool: false,
      scripturePreparation: false,
      plan: true,
      administration: false,
      board: false
    }
  }

  return {
    church:
      adminAccess?.churchAdmin === true,

    dailyDevotion:
      true,

    aiBibleReading:
      true,

    food:
      member?.food === true,

    choir:
      member?.choir === true ||
      member?.choirPlanning === true ||
      adminAccess?.choirPlanning === true ||
      adminAccess?.choirAdmin === true,

    youth:
      member?.youth === true,

    prayer:
      true,

    sundaySchool:
      member?.sundaySchool === true ||
      member?.sundaySchoolMember === true ||
      member?.sundaySchoolTeacher === true ||
      adminAccess?.sundaySchoolTeacher === true ||
      adminAccess?.sundaySchoolAdmin === true ||
      adminAccess?.churchAdmin === true,

    languageSchool:
      member?.languageSchool === true ||
      adminAccess?.languageSchoolAdmin === true ||
      adminAccess?.churchAdmin === true,

    scripturePreparation:
      member?.scripturePreparation === true ||
      member?.scripturePreparationMember === true ||
      member?.scripturePreparationAdmin === true ||
      adminAccess?.scripturePreparation === true ||
      adminAccess?.scripturePreparationAdmin === true ||
      adminAccess?.planAdmin === true ||
      adminAccess?.churchAdmin === true,

    plan:
      member?.plan === true ||
      adminAccess?.planAdmin === true,

    administration:
      adminAccess?.churchAdmin === true,

    board:
      member?.board === true
  }
}


function updateMemberState(member) {

  setApprovedMember(member)


  const memberAreaButton =
    document.querySelector(
      '#member-area-button'
    )


  if (!member) {

    memberAreaButton.style.display =
      'none'

    return
  }


  memberAreaButton.style.display =
    'block'


  renderMemberArea()
}


async function renderMemberArea() {

  const renderVersion =
    ++memberAreaRenderVersion


  const member =
    getApprovedMember()


  if (!member) {
    return
  }


  const welcome =
    document.querySelector(
      '#member-welcome'
    )


  const sectionsContainer =
    document.querySelector(
      '#member-sections'
    )


  welcome.textContent =
    member?.guest === true
      ? 'Welcome Guest'
      : `Welcome ${
          member.name ||
          'Member'
        }`


  /* Guest logout belongs to the Member Login page,
   * not inside Member Area. */

  const user =
    await getCurrentMember()


  const adminAccess =
    user?.uid
      ? await getAdminAccess(
          user.uid
        )
      : null


  if (
    renderVersion !==
    memberAreaRenderVersion
  ) {
    return
  }


  const permissions =
    getPermissions(
      member,
      adminAccess
    )


  /*
   * Clear only after async permission loading.
   * This prevents duplicate buttons if two renders
   * overlap while Firebase is responding.
   */
  sectionsContainer.replaceChildren()


  const sections = [
    ['church', 'Church'],
    ['dailyDevotion', 'Daily Devotion'],
    ['aiBibleReading', 'Bible Reading'],
    ['food', 'Food'],
    ['choir', 'Choir'],
    ['youth', 'Youth'],
    ['prayer', 'Prayer'],
    ['sundaySchool', 'Sunday School'],
    ['languageSchool', 'Danish Language'],
    ['scripturePreparation', 'Scripture Preparation'],
    ['plan', 'Service Plan'],
    ['administration', 'Administration'],
    ['board', 'Board']
  ]


  sections.forEach(
    ([key, label]) => {

      if (!permissions[key]) {
        return
      }


      const button =
        document.createElement(
          'button'
        )


      button.textContent =
        label


      button.style.padding =
        '13px'

      button.style.fontSize =
        '16px'


      if (key === 'food') {

        button.addEventListener(
          'click',
          async () => {

            closeMemberArea()


            await openFoodSection()
          }
        )


      } else if (key === 'church') {

        button.addEventListener(
          'click',
          async () => {

            closeMemberArea()


            await openChurchNotifications()
          }
        )


      } else if (key === 'dailyDevotion') {

        button.addEventListener(
          'click',
          async () => {

            closeMemberArea()


            await openDailyDevotionSection()
          }
        )


      } else if (key === 'aiBibleReading') {

        button.addEventListener(
          'click',
          async () => {

            closeMemberArea()


            await openAiBibleReadingSection()
          }
        )


      } else if (key === 'choir') {

        button.addEventListener(
          'click',
          async () => {

            closeMemberArea()


            await openChoirSection()
          }
        )


      } else if (key === 'plan') {

        button.addEventListener(
          'click',
          async () => {

            closeMemberArea()


            await openServicePlanSection()
          }
        )


      } else if (key === 'youth') {

        button.addEventListener(
          'click',
          async () => {

            closeMemberArea()


            await openYouthSection()
          }
        )


      } else if (key === 'prayer') {

        button.addEventListener(
          'click',
          async () => {

            closeMemberArea()


            await openPrayerSection()
          }
        )


      } else if (key === 'sundaySchool') {

        button.addEventListener(
          'click',
          async () => {

            closeMemberArea()


            await openSundaySchoolSection()
          }
        )


      } else if (key === 'languageSchool') {

        button.addEventListener(
          'click',
          async () => {

            closeMemberArea()


            await openDanishLanguageSection()
          }
        )


      } else if (key === 'scripturePreparation') {

        button.addEventListener(
          'click',
          async () => {

            closeMemberArea()


            await openScripturePreparationSection()
          }
        )


      } else if (key === 'administration') {

        button.addEventListener(
          'click',
          async () => {

            closeMemberArea()


            await openChurchAdminSection()
          }
        )


      } else {

        button.addEventListener(
          'click',
          () => {

            alert(
              `${label} section is available for this member.`
            )
          }
        )
      }


      sectionsContainer.appendChild(
        button
      )
    }
  )
}


function closeMemberArea() {

  memberAreaRenderVersion++

  const overlay =
    document.querySelector(
      '#member-area-overlay'
    )

  if (overlay) {
    overlay.style.display =
      'none'
  }
}


async function openMemberArea() {

  const overlay =
    document.querySelector(
      '#member-area-overlay'
    )

  if (!overlay) {
    return
  }

  overlay.style.display =
    'flex'

  await renderMemberArea()
}


async function openLogin() {

  const overlay =
    document.querySelector(
      '#member-login-overlay'
    )


  const status =
    document.querySelector(
      '#login-status'
    )


  const signOutButton =
    document.querySelector(
      '#sign-out-button'
    )


  overlay.style.display =
    'flex'


  try {

    const approvedMember =
      getApprovedMember()

    const isGuest =
      approvedMember?.guest === true

    const guestLoginButton =
      document.querySelector(
        '#guest-login-button'
      )

    const guestLogoutButton =
      document.querySelector(
        '#guest-logout-button'
      )

    if (isGuest) {

      status.textContent =
        'Signed in as Guest.'

      signOutButton.style.display =
        'none'

      if (guestLoginButton) {
        guestLoginButton.style.display =
          'none'
      }

      if (guestLogoutButton) {
        guestLogoutButton.style.display =
          'block'
      }

      return
    }

    if (guestLoginButton) {
      guestLoginButton.style.display =
        'block'
    }

    if (guestLogoutButton) {
      guestLogoutButton.style.display =
        'none'
    }

    const user =
      await getCurrentMember()


    if (!user) {

      status.textContent =
        ''


      signOutButton.style.display =
        'none'


      return
    }


    const member =
      await findMember(user)


    if (!member) {

      await signOutMember()


      updateMemberState(null)


      status.textContent =
        'This email and telephone number are not registered as an approved church member.'


      return
    }


    updateMemberState(member)


    await syncPushTokenForCurrentUser()


    status.textContent =
      `Signed in as ${
        member.name ||
        user.email
      }.`


    signOutButton.style.display =
      'block'


  } catch (error) {

    console.error(
      'Unable to check login:',
      error
    )


    status.textContent =
      'Unable to check login.'
  }
}


async function signInAsGuest() {

  try {
    const currentUser =
      await getCurrentMember()

    if (currentUser) {
      await signOutMember()
    }
  } catch (error) {
    console.warn(
      'Unable to clear existing login before Guest access:',
      error
    )
  }

  const guestMember = {
    guest: true,
    name: 'Guest'
  }

  updateMemberState(
    guestMember
  )

  document
    .querySelector('#login-status')
    .textContent =
      'Guest access enabled. You can view the Service Plan.'

  document
    .querySelector('#sign-out-button')
    .style.display =
      'none'

  const guestLogoutButton =
    document.querySelector(
      '#guest-logout-button'
    )

  if (guestLogoutButton) {
    guestLogoutButton.style.display =
      'block'
  }

  document
    .querySelector('#member-login-overlay')
    .style.display =
      'none'

  openMemberArea()
}


async function createMemberAccount() {

  const email =
    document
      .querySelector(
        '#member-email'
      )
      .value
      .trim()
      .toLowerCase()


  const password =
    document
      .querySelector(
        '#member-password'
      )
      .value


  const phone =
    document
      .querySelector(
        '#member-phone'
      )
      .value
      .trim()


  const status =
    document.querySelector(
      '#login-status'
    )


  if (!email || !phone || !password) {

    status.textContent =
      'Please enter email, telephone number and password.'


    return
  }


  try {

    await createAccount(
      email,
      password
    )


    let verificationResult =
      null


    try {

      verificationResult =
        await verifyMemberFromSheet({
          email,
          phone
        })

    } catch (verificationError) {

      console.error(
        'Unable to verify member from sheet:',
        verificationError
      )
    }


    await sendVerificationEmail()


    status.textContent =
      getCreatedAccountStatus(
        verificationResult
      )


  } catch (error) {

    console.error(
      'Unable to create account:',
      error
    )


    status.textContent =
      error?.message ||
      'Unable to create account.'
  }
}


async function verifyPendingMemberByEmail(
  email,
  phone = ''
) {

  if (!email) {
    return null
  }


  return await verifyMemberFromSheet({
    email,
    phone
  })
}


function getCreatedAccountStatus(
  verificationResult
) {

  if (
    verificationResult
      ?.verifiedFromSheet === true
  ) {

    return 'Verification email sent. Your church record was found. Please wait for admin approval.'
  }


  if (verificationResult) {

    return 'Verification email sent. Your signup is waiting for admin review.'
  }


  return 'Verification email sent.'
}


async function signInMember() {

  const email =
    document
      .querySelector(
        '#member-email'
      )
      .value
      .trim()
      .toLowerCase()


  const password =
    document
      .querySelector(
        '#member-password'
      )
      .value


  const phone =
    document
      .querySelector(
        '#member-phone'
      )
      .value
      .trim()


  const status =
    document.querySelector(
      '#login-status'
    )


  const signOutButton =
    document.querySelector(
      '#sign-out-button'
    )


  try {

    await signInWithEmail(
      email,
      password
    )


    const user =
      await getCurrentMember()


    const member =
      await findMember(user)


    if (!member) {

      let verificationResult =
        null

      let verificationErrorMessage =
        ''


      try {

        verificationResult =
          await verifyPendingMemberByEmail(
            email,
            phone
          )

      } catch (verificationError) {

        console.error(
          'Unable to verify member from sheet:',
          verificationError
        )


        verificationErrorMessage =
          verificationError?.message ||
          String(
            verificationError
          )
      }


      await signOutMember()


      updateMemberState(null)


      status.textContent =
        verificationErrorMessage
          ? `Unable to check church member list: ${verificationErrorMessage}`
          : verificationResult
          ? getPendingApprovalStatus(
              verificationResult
            )
          : 'This email and telephone number are not approved for church member access.'


      return
    }

    // Approval by the church administrator is the access decision for an
    // existing member. Email verification remains required for accounts that
    // have not yet been approved.
    if (user?.emailVerified === false && (member.approved !== true || member.active === false)) {
      status.textContent = 'Please verify your email first.'
      return
    }


    updateMemberState(member)


    await syncPushTokenForCurrentUser()


    status.textContent =
      `Login successful. Welcome ${
        member.name ||
        user.email
      }.`


    signOutButton.style.display =
      'block'


    setTimeout(
      () => {

        document
          .querySelector(
            '#member-login-overlay'
          )
          .style.display =
            'none'
      },
      1200
    )


  } catch (error) {

    console.error(
      'Sign in failed:',
      error
    )


    status.textContent =
      'Email or password is incorrect.'
  }
}


function getPendingApprovalStatus(
  verificationResult
) {

  if (
    verificationResult
      ?.verifiedFromSheet === true
  ) {

    return 'Your church record was found. Please wait for admin approval.'
  }


  return 'Your signup is waiting for admin review.'
}


async function signOutCurrentMember() {

  try {

    const member =
      getApprovedMember()

    if (member?.guest !== true) {
      await signOutMember()
    }


    updateMemberState(null)


    document
      .querySelector(
        '#member-area-overlay'
      )
      .style.display =
        'none'


    document
      .querySelector(
        '#login-status'
      )
      .textContent =
        'Signed out.'


    document
      .querySelector(
        '#sign-out-button'
      )
      .style.display =
        'none'


    const guestLogoutButton =
      document.querySelector(
        '#guest-logout-button'
      )

    if (guestLogoutButton) {
      guestLogoutButton.style.display =
        'none'
    }


    if (member?.guest === true) {
      await openLogin()
    }


  } catch (error) {

    console.error(
      'Unable to sign out:',
      error
    )
  }
}


async function restoreMemberSession() {

  try {

    const user =
      await getCurrentMember()


    if (!user) {

      updateMemberState(null)


      return
    }


    const member =
      await findMember(user)


    if (!member) {

      await signOutMember()


      updateMemberState(null)


      return
    }


    updateMemberState(member)


    await syncPushTokenForCurrentUser()


  } catch (error) {

    console.error(
      'Unable to restore member session:',
      error
    )
  }
}
