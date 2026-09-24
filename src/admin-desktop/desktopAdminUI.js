import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth'

import {
  getFunctions,
  httpsCallable
} from 'firebase/functions'

import {
  collection,
  getDocs,
  addDoc,
  deleteDoc,
  doc
} from 'firebase/firestore'

import app, {
  auth,
  db
} from '../config/firebase.js'

import {
  memberRoles
} from '../church-admin/churchAdminRoles.js'

import {
  openDailyDevotionSection
} from '../daily-devotion/dailyDevotionUI.js'

import {
  openAiBibleReadingSection
} from '../ai-bible-reading/aiBibleReadingUI.js'

import {
  openScripturePreparationSection
} from '../scripture-preparation/scripturePreparationUI.js'

import {
  openChoirSection
} from '../choir/choirUI.js'

import {
  openServicePlanSection
} from '../service-plan/servicePlanUI.js'

import {
  openHymnLyrics
} from '../shared/hymnbookBrowser.js'

import {
  getNotificationCategoryForSection
} from '../notifications/notificationCategory.js'


let currentUser =
  null

let currentAdminAccess =
  null

let currentMembers =
  []

let currentTab =
  'dashboard'

let permissionsPage =
  0


const permissionsPageSize =
  10


const baseMemberPermissions =
  {
    food:
      true,
    prayer:
      true,
    plan:
      true
  }


const memberPermissionOptions =
  [
    {
      field:
        'choir',
      label:
        'Choir Member'
    },
    {
      field:
        'youth',
      label:
        'Youth Member'
    },
    {
      field:
        'sundaySchool',
      label:
        'Sunday School Member'
    },
    {
      field:
        'scripturePreparation',
      label:
        'Pastor / Scripture Preparation'
    },
    {
      field:
        'languageSchool',
      label:
        'Language School Member'
    }
  ]


const adminPermissionOptions =
  [
    {
      field:
        'foodAdmin',
      label:
        'Food Admin'
    },
    {
      field:
        'choirAdmin',
      label:
        'Choir Admin'
    },
    {
      field:
        'choirPlanning',
      label:
        'Choir Planning'
    },
    {
      field:
        'youthAdmin',
      label:
        'Youth Admin'
    },
    {
      field:
        'prayerAdmin',
      label:
        'Prayer Admin'
    },
    {
      field:
        'sundaySchoolAdmin',
      label:
        'Sunday School Admin'
    },
    {
      field:
        'scripturePreparationAdmin',
      label:
        'Scripture Preparation Admin'
    },
    {
      field:
        'planAdmin',
      label:
        'Service Plan Admin'
    },
    {
      field:
        'dailyDevotionAdmin',
      label:
        'Daily Devotion Admin'
    },
    {
      field:
        'aiBibleReadingAdmin',
      label:
        'Bible Reading Admin'
    },
    {
      field:
        'languageSchoolAdmin',
      label:
        'Danish Language Admin'
    },
    {
      field:
        'churchAdmin',
      label:
        'Church Admin'
    },
    {
      field:
        'chiefAdministrator',
      label:
        'Chief Administrator'
    }
  ]


const ministryOptions =
  [
    {
      title:
        'Daily Devotion',
      allMembers:
        true,
      adminFields:
        ['dailyDevotionAdmin'],
      description:
        'Church-wide Daily Devotion content and publishing.'
    },
    {
      title:
        'Bible Reading',
      allMembers:
        true,
      adminFields:
        ['aiBibleReadingAdmin'],
      description:
        'Church-wide Bible Reading content and publishing.'
    },
    {
      title:
        'Food',
      memberField:
        'food',
      adminFields:
        ['foodAdmin'],
      description:
        'Food scheduling and meal planning.'
    },
    {
      title:
        'Choir',
      memberField:
        'choir',
      adminFields:
        [
          'choirAdmin',
          'choirPlanning'
        ],
      description:
        'Choir plans, songs, and practice coordination.'
    },
    {
      title:
        'Youth',
      memberField:
        'youth',
      adminFields:
        ['youthAdmin'],
      description:
        'Youth events, announcements, and fellowship.'
    },
    {
      title:
        'Prayer',
      memberField:
        'prayer',
      adminFields:
        ['prayerAdmin'],
      description:
        'Prayer requests, meetings, and announcements.'
    },
    {
      title:
        'Sunday School',
      memberField:
        'sundaySchool',
      adminFields:
        ['sundaySchoolAdmin'],
      description:
        'Sunday school events, materials, and announcements.'
    },
    {
      title:
        'Service Plan',
      memberField:
        'plan',
      adminFields:
        ['planAdmin'],
      description:
        'Church service plans and worship order.'
    },
    {
      title:
        'Scripture Preparation',
      memberField:
        'scripturePreparation',
      adminFields:
        ['scripturePreparationAdmin'],
      description:
        'Pastor scripture preparation and Bible readings.'
    },
    {
      title:
        'Danish Language',
      memberField:
        'languageSchool',
      adminFields:
        ['languageSchoolAdmin'],
      description:
        'Danish language classes, students, and materials.'
    }
  ]


const desktopFunctions =
  getFunctions(
    app,
    'europe-west1'
  )


function withTimeout(
  promise,
  message
) {

  return Promise.race([
    promise,
    new Promise(
      (
        resolve,
        reject
      ) => {
        setTimeout(
          () => {
            reject(
              new Error(
                message
              )
            )
          },
          15000
        )
      }
    )
  ])
}


function debugStep(
  message,
  data = null
) {

  const line =
    data
      ? `${new Date().toLocaleTimeString()} - ${message}: ${JSON.stringify(data)}`
      : `${new Date().toLocaleTimeString()} - ${message}`

  console.log(
    '[Desktop Admin]',
    message,
    data || ''
  )

  document
    .querySelectorAll(
      '#desktop-admin-debug, #desktop-admin-panel-debug'
    )
    .forEach(
      element => {

        if (!element) {
          return
        }

        element.textContent =
          `${element.textContent || ''}${line}\n`
      }
    )
}


export async function renderDesktopAdminApp() {

  document.body.classList.add(
    'desktop-admin-page'
  )

  document.querySelector('#app').innerHTML =
    `
      <main class="desktop-admin">

        <section
          id="desktop-admin-login"
          class="desktop-admin-login"
        >

          <div class="desktop-admin-login-card">

            <h1>
              Church Administration
            </h1>

            <p>
              Desktop control panel for OneInChristApp.
            </p>

            <form id="desktop-admin-login-form">

              <input
                id="desktop-admin-email"
                type="email"
                placeholder="Admin email"
                required
              >

              <input
                id="desktop-admin-password"
                type="password"
                placeholder="Password"
                required
              >

              <button type="submit">
                Sign In
              </button>

            </form>

            <p
              id="desktop-admin-login-status"
            ></p>

            <pre
              id="desktop-admin-debug"
              class="desktop-admin-debug"
            ></pre>

          </div>

        </section>


        <section
          id="desktop-admin-panel"
          class="desktop-admin-panel"
          hidden
        >

          <aside
            class="desktop-admin-sidebar"
          >

            <div>

              <h1>
                OneInChrist
              </h1>

              <p>
                Administration
              </p>

            </div>


            <nav
              class="desktop-admin-nav"
            >

              <button
                data-desktop-admin-tab="dashboard"
              >
                Dashboard
              </button>

              <button
                data-desktop-admin-tab="members"
              >
                Members
              </button>

              <button
                data-desktop-admin-tab="permissions"
              >
                Permissions
              </button>

              <button
                data-desktop-admin-tab="ministries"
              >
                Ministries
              </button>

              <button
                data-desktop-admin-tab="notifications"
              >
                Notifications
              </button>

              <button
                data-desktop-admin-tab="content"
              >
                Worship & Content
              </button>

              <button
                data-desktop-admin-tab="reports"
              >
                Reports
              </button>

            </nav>

          </aside>


          <section
            class="desktop-admin-workspace"
          >

            <header
              class="desktop-admin-topbar"
            >

              <div>

                <h2
                  id="desktop-admin-title"
                >
                  Dashboard
                </h2>

                <p
                  id="desktop-admin-subtitle"
                >
                  Overview and quick actions
                </p>

              </div>


              <button
                id="desktop-admin-sign-out-button"
                type="button"
              >
                Sign Out
              </button>

            </header>


            <p
              id="desktop-admin-status"
              class="desktop-admin-status"
            ></p>


            <pre
              id="desktop-admin-panel-debug"
              class="desktop-admin-debug"
            ></pre>


            <div
              id="desktop-admin-content"
            ></div>

          </section>

        </section>

      </main>
    `

  bindDesktopAdminShell()

  await restoreDesktopAdminSession()
}


function bindDesktopAdminShell() {

  document
    .querySelector(
      '#desktop-admin-login-form'
    )
    .addEventListener(
      'submit',
      async event => {

        event.preventDefault()

        await signInDesktopAdmin()
      }
    )


  document
    .querySelector(
      '#desktop-admin-sign-out-button'
    )
    .addEventListener(
      'click',
      async () => {

        await signOut(
          auth
        )

        currentUser =
          null

        currentAdminAccess =
          null

        currentMembers =
          []

        showLogin()
      }
    )


  document
    .querySelectorAll(
      '[data-desktop-admin-tab]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            currentTab =
              button.dataset
                .desktopAdminTab

            safeRenderDesktopAdminTab()
          }
        )
      }
    )
}


async function restoreDesktopAdminSession() {

  debugStep(
    'Checking existing browser session'
  )

  await new Promise(
    resolve => {

      const unsubscribe =
        onAuthStateChanged(
          auth,
          async user => {

            unsubscribe()

            currentUser =
              user

            debugStep(
              'Auth state returned',
              {
                signedIn:
                  Boolean(
                    currentUser?.uid
                  ),

                email:
                  currentUser?.email ||
                  ''
              }
            )

            if (
              !currentUser?.uid
            ) {

              showLogin()

              resolve()

              return
            }

            await loadDesktopAdminAccess()

            resolve()
          }
        )
    }
  )
}


async function signInDesktopAdmin() {

  setLoginStatus(
    'Signing in...'
  )

  debugStep(
    'Sign in button pressed'
  )


  try {

    const result =
      await withTimeout(
        signInWithEmailAndPassword(
          auth,
          value(
            'desktop-admin-email'
          ),
          value(
            'desktop-admin-password'
          )
        ),

        'Firebase sign-in did not answer. Check your internet connection and make sure localhost is allowed in Firebase Authentication.'
      )


    currentUser =
      result.user


    debugStep(
      'Firebase sign in completed',
      {
        email:
          currentUser?.email ||
          '',

        uid:
          currentUser?.uid ||
          ''
      }
    )


    setLoginStatus(
      'Signed in. Checking admin access...'
    )


    await loadDesktopAdminAccess()

  } catch (error) {

    console.error(
      'Unable to sign in desktop admin:',
      error
    )


    setLoginStatus(
      error?.message ||
      'Unable to sign in.'
    )
  }
}


async function loadDesktopAdminAccess() {

  setLoginStatus(
    'Loading administration data...'
  )


  debugStep(
    'Opening panel and requesting administration function'
  )


  currentAdminAccess =
    {
      churchAdmin:
        true
    }


  showPanel()

  renderLoadingTab()


  try {

    const data =
      await withTimeout(
        getDesktopChurchAdministrationData(),

        'Church Administration data did not load.'
      )


    debugStep(
      'Administration function returned',
      {
        memberCount:
          Array.isArray(
            data.members
          )
            ? data.members.length
            : 0
      }
    )


    currentMembers =
      deduplicateMembers(
        data.members ||
        []
      )


    safeRenderDesktopAdminTab()

    setStatus(
      ''
    )

    setLoginStatus(
      ''
    )

  } catch (error) {

    console.error(
      'Unable to open desktop administration:',
      error
    )


    setLoginStatus(
      error?.message ||
      'This account does not have Church Administration access.'
    )


    setStatus(
      error?.message ||
      'Unable to load administration data.'
    )


    renderErrorTab(
      error?.message ||
      'Unable to load administration data.'
    )
  }
}


async function loadDesktopAdminData() {

  setStatus(
    'Loading administration data...'
  )


  debugStep(
    'Reloading administration function'
  )


  try {

    const data =
      await withTimeout(
        getDesktopChurchAdministrationData(),

        'Church Administration data did not load.'
      )


    debugStep(
      'Administration reload returned',
      {
        memberCount:
          Array.isArray(
            data.members
          )
            ? data.members.length
            : 0
      }
    )


    currentMembers =
      deduplicateMembers(
        data.members ||
        []
      )


    safeRenderDesktopAdminTab()

    setStatus(
      ''
    )

  } catch (error) {

    console.error(
      'Unable to load desktop administration:',
      error
    )


    setStatus(
      error?.message ||
      'Unable to load administration data.'
    )
  }
}


function safeRenderDesktopAdminTab() {

  try {

    renderDesktopAdminTab()


    debugStep(
      'Desktop tab rendered',
      {
        tab:
          currentTab
      }
    )

  } catch (error) {

    console.error(
      'Unable to render desktop admin tab:',
      error
    )


    debugStep(
      'Desktop render failed',
      {
        message:
          error?.message ||
          String(
            error
          )
      }
    )


    renderErrorTab(
      error?.message ||
      'Unable to render desktop administration.'
    )
  }
}


function renderDesktopAdminTab() {

  markActiveTab()


  if (
    currentTab ===
    'members'
  ) {

    renderMembersOverview()

    return
  }


  if (
    currentTab ===
    'permissions'
  ) {

    renderPermissionsManager()

    return
  }


  if (
    currentTab ===
    'ministries'
  ) {

    renderMinistriesOverview()

    return
  }


  if (
    currentTab ===
    'notifications'
  ) {

    renderNotificationsManager()

    return
  }


  if (
    currentTab ===
    'content'
  ) {

    renderContentControlCenter()

    return
  }


  if (
    currentTab ===
    'reports'
  ) {

    renderPlaceholderTab(
      'Reports',

      'Reports and audit logs are planned after the main management screens are stable.'
    )

    return
  }


  renderDashboard()
}


function renderContentControlCenter() {

  setHeader(
    'Worship & Content',

    'Manage the same church content used by the mobile app'
  )


  const content =
    document.querySelector(
      '#desktop-admin-content'
    )


  if (!content) {

    return
  }


  const modules =
    [
      {
        title:
          'Daily Devotion',

        description:
          'Create, review, edit, approve, and publish Daily Devotion content.',

        note:
          'Uses the existing Daily Devotion collection and administration workflow.',

        open:
          async () => {

            await openDailyDevotionSection(
              'admin'
            )
          }
      },

      {
        title:
          'Bible Reading',

        description:
          'Create, review, edit, approve, and publish the church Bible Reading.',

        note:
          'Uses the same Bible Reading data shown in the mobile app.',

        open:
          async () => {

            await openAiBibleReadingSection(
              'admin'
            )
          }
      },

      {
        title:
          'Scripture Preparation',

        description:
          'Prepare Opening Reading, Reading 1, Reading 2, and unlimited Extra References.',

        note:
          'Bible passages can be selected with the internal Bible picker and are available in Urdu, Danish, and English.',

        open:
          async () => {

            await openScripturePreparationSection(
              'admin'
            )
          }
      },

      {
        title:
          'Choir',

        description:
          'Create and review Sunday Choir Plans using the One in Christ hymnbook.',

        note:
          'Uses the local Geet and Zaboor songbook plus admin-added Geet stored in Firebase.',

        open:
          async () => {

            await openChoirSection()
          }
      },

      {
        title:
          'Service Plan',

        description:
          'Create and manage the Sunday Service Plan using Scripture Preparation and Choir content.',

        note:
          'Uses the same Service Plan, Bible readings, hymn titles, and Apostles’ Creed as the mobile app.',

        open:
          async () => {

            await openServicePlanSection()
          }
      },

      {
        title:
          'Hymnbook',

        description:
          'Open the One in Christ hymnbook directly from the desktop administration page.',

        note:
          'Includes the built-in Geet and Zaboor collection and supports admin-added Geet.',

        open:
          async () => {

            await openHymnLyrics(
              '/hymnbook/index.html',
              'One in Christ Hymnbook',
              {
                canManage:
                  true
              }
            )
          }
      }
    ]


  content.innerHTML =
    `
      <section
        class="desktop-admin-card"
      >

        <div
          class="desktop-admin-card-header"
        >

          <div>

            <h3>
              Church Content & Worship
            </h3>

            <p>
              Open a module below.
              These controls use the same Firebase
              data and shared workflows as the
              mobile app.
            </p>

          </div>

        </div>


        <div
          class="desktop-admin-content-module-grid"
        >

          ${
            modules
              .map(
                (
                  module,
                  index
                ) => `
                  <article
                    class="desktop-admin-content-module"
                  >

                    <h4>
                      ${escapeHtml(
                        module.title
                      )}
                    </h4>

                    <p>
                      ${escapeHtml(
                        module.description
                      )}
                    </p>

                    <small
                      class="desktop-admin-muted"
                    >
                      ${escapeHtml(
                        module.note
                      )}
                    </small>

                    <button
                      type="button"
                      data-content-module="${index}"
                    >
                      Open
                      ${escapeHtml(
                        module.title
                      )}
                    </button>

                  </article>
                `
              )
              .join(
                ''
              )
          }

        </div>

      </section>
    `


  content
    .querySelectorAll(
      '[data-content-module]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          async () => {

            const module =
              modules[
                Number(
                  button.dataset
                    .contentModule
                )
              ]


            if (!module) {

              return
            }


            try {

              setStatus(
                `Opening ${module.title}...`
              )


              await module.open()


              setStatus(
                ''
              )

            } catch (error) {

              console.error(
                `Unable to open ${module.title}:`,
                error
              )


              setStatus(
                error?.message ||
                `Unable to open ${module.title}.`
              )
            }
          }
        )
      }
    )
}


async function renderNotificationsManager() {

  setHeader(
    'Notifications',

    'Send and manage church notifications'
  )


  const content =
    document.querySelector(
      '#desktop-admin-content'
    )


  content.innerHTML =
    `
      <section
        class="desktop-admin-card"
      >

        <h3>
          Send notification
        </h3>


        <form
          id="desktop-notification-form"
          class="desktop-admin-form"
        >

          <input
            name="title"
            placeholder="Title"
            required
          >


          <textarea
            name="message"
            rows="3"
            placeholder="Message"
            required
          ></textarea>


          <select
            name="section"
          >

            <option
              value="general"
            >
              General
            </option>

            <option
              value="prayer"
            >
              Prayer
            </option>

            <option
              value="sunday-school"
            >
              Sunday School
            </option>

            <option
              value="danish-language"
            >
              Language School
            </option>

            <option
              value="scripture-preparation"
            >
              Scripture Preparation
            </option>

          </select>


          <button
            type="submit"
          >
            Send now
          </button>


          <p
            id="desktop-notification-status"
          ></p>

        </form>

      </section>


      <section
        class="desktop-admin-card"
      >

        <h3>
          Recent notifications
        </h3>

        <div
          id="desktop-notification-list"
        >
          Loading...
        </div>

      </section>
    `


  const list =
    content.querySelector(
      '#desktop-notification-list'
    )


  try {

    const snapshot =
      await getDocs(
        collection(
          db,
          'churchNotifications'
        )
      )


    const notifications =
      snapshot.docs
        .map(
          item => ({
            id:
              item.id,

            ...item.data()
          })
        )
        .sort(
          (
            first,
            second
          ) =>
            String(
              second.createdAt ||
              ''
            )
              .localeCompare(
                String(
                  first.createdAt ||
                  ''
                )
              )
        )


    let page =
      0


    const pageSize =
      10


    const drawPage =
      () => {

        const pages =
          Math.max(
            1,

            Math.ceil(
              notifications.length /
              pageSize
            )
          )


        page =
          Math.min(
            page,
            pages - 1
          )


        const visible =
          notifications.slice(
            page *
            pageSize,

            (
              page +
              1
            ) *
            pageSize
          )


        list.innerHTML =
          visible.length
            ? visible
                .map(
                  item => `
                    <article
                      class="desktop-admin-notification-row"
                    >

                      <strong>
                        ${escapeHtml(
                          item.title ||
                          'Notification'
                        )}
                      </strong>

                      <p>
                        ${escapeHtml(
                          item.message ||
                          ''
                        )}
                      </p>

                      <small>
                        ${escapeHtml(
                          item.section ||
                          'general'
                        )}
                        ·
                        ${escapeHtml(
                          item.createdAt ||
                          ''
                        )}
                      </small>

                      <button
                        type="button"
                        data-delete-notification="${escapeAttribute(
                          item.id
                        )}"
                      >
                        Delete
                      </button>

                    </article>
                  `
                )
                .join(
                  ''
                )

            : '<p>No notifications yet.</p>'


        if (
          pages >
          1
        ) {

          list.insertAdjacentHTML(
            'beforeend',

            `
              <div
                class="desktop-admin-pagination"
              >

                <button
                  type="button"
                  data-notification-prev
                  ${
                    page ===
                    0
                      ? 'disabled'
                      : ''
                  }
                >
                  Previous
                </button>


                <span>
                  Page
                  ${page + 1}
                  of
                  ${pages}
                </span>


                <button
                  type="button"
                  data-notification-next
                  ${
                    page ===
                    pages - 1
                      ? 'disabled'
                      : ''
                  }
                >
                  Next
                </button>

              </div>
            `
          )
        }


        list
          .querySelectorAll(
            '[data-delete-notification]'
          )
          .forEach(
            button => {

              button.addEventListener(
                'click',
                async () => {

                  await deleteDoc(
                    doc(
                      db,
                      'churchNotifications',
                      button.dataset
                        .deleteNotification
                    )
                  )


                  await renderNotificationsManager()
                }
              )
            }
          )


        list
          .querySelector(
            '[data-notification-prev]'
          )
          ?.addEventListener(
            'click',
            () => {

              page -=
                1

              drawPage()
            }
          )


        list
          .querySelector(
            '[data-notification-next]'
          )
          ?.addEventListener(
            'click',
            () => {

              page +=
                1

              drawPage()
            }
          )
      }


    drawPage()

  } catch (error) {

    list.textContent =
      error?.message ||
      'Unable to load notifications.'
  }


  content
    .querySelector(
      '#desktop-notification-form'
    )
    .addEventListener(
      'submit',
      async event => {

        event.preventDefault()


        const form =
          event.currentTarget


        const data =
          new FormData(
            form
          )


        const status =
          content.querySelector(
            '#desktop-notification-status'
          )


        status.textContent =
          'Sending...'


        try {

          await addDoc(
            collection(
              db,
              'churchNotifications'
            ),

            {
              title:
                String(
                  data.get(
                    'title'
                  )
                )
                  .trim(),

              message:
                String(
                  data.get(
                    'message'
                  )
                )
                  .trim(),

              section:
                data.get(
                  'section'
                ),

              category:
                getNotificationCategoryForSection(
                  data.get(
                    'section'
                  )
                ),

              audience:
                '',

              targetId:
                'dashboard',

              sendMode:
                'now',

              status:
                'pending',

              createdBy:
                currentUser.uid,

              createdAt:
                new Date()
                  .toISOString()
            }
          )


          form.reset()


          status.textContent =
            'Notification sent.'


          await renderNotificationsManager()

        } catch (error) {

          status.textContent =
            error?.message ||
            'Unable to send notification.'
        }
      }
    )
}


function renderLoadingTab() {

  setHeader(
    'Dashboard',

    'Loading administration data'
  )


  document
    .querySelector(
      '#desktop-admin-content'
    )
    .innerHTML =
    `
      <section
        class="desktop-admin-card"
      >

        <h3>
          Loading
        </h3>

        <p>
          Please wait while the
          administration data is loaded.
        </p>

      </section>
    `
}


function renderErrorTab(
  message
) {

  setHeader(
    'Administration Error',

    'The desktop panel could not load its data'
  )


  document
    .querySelector(
      '#desktop-admin-content'
    )
    .innerHTML =
    `
      <section
        class="desktop-admin-card"
      >

        <h3>
          Unable to Load Administration
        </h3>

        <p>
          ${escapeHtml(
            message
          )}
        </p>

        <button
          id="desktop-admin-retry-button"
          type="button"
        >
          Try Again
        </button>

      </section>
    `


  document
    .querySelector(
      '#desktop-admin-retry-button'
    )
    .addEventListener(
      'click',
      async () => {

        await loadDesktopAdminAccess()
      }
    )
}


function renderDashboard() {

  setHeader(
    'Dashboard',

    'Overview and quick actions'
  )


  const pendingMembers =
    getPendingMembers()


  const approvedMembers =
    getApprovedMembers()


  const activeMembers =
    getActiveMembers()


  document
    .querySelector(
      '#desktop-admin-content'
    )
    .innerHTML =
    `
      <section
        class="desktop-admin-stat-grid"
      >

        ${statCard(
          'Pending Approvals',
          pendingMembers.length
        )}

        ${statCard(
          'Approved Members',
          approvedMembers.length
        )}

        ${statCard(
          'Active Members',
          activeMembers.length
        )}

        ${statCard(
          'Inactive Members',

          currentMembers
            .filter(
              member =>
                member.active ===
                false
            )
            .length
        )}

      </section>


      <section
        class="desktop-admin-grid two"
      >

        <article
          class="desktop-admin-card"
        >

          <h3>
            Pending Approvals
          </h3>

          <div
            class="desktop-admin-list"
          >

            ${
              pendingMembers.length
                ? pendingMembers
                    .map(
                      member =>
                        compactMemberRow(
                          member
                        )
                    )
                    .join(
                      ''
                    )

                : '<p>No pending approvals.</p>'
            }

          </div>

        </article>


        <article
          class="desktop-admin-card"
        >

          <h3>
            Quick Actions
          </h3>

          <div
            class="desktop-admin-action-grid"
          >

            <button
              data-desktop-quick-tab="permissions"
            >
              Open Permissions
            </button>

            <button
              data-desktop-quick-tab="members"
            >
              View Members
            </button>

            <button
              data-desktop-quick-tab="ministries"
            >
              Ministries
            </button>

            <button
              data-desktop-quick-tab="notifications"
            >
              Notifications
            </button>

            <button
              data-desktop-quick-tab="content"
            >
              Worship & Content
            </button>

          </div>

        </article>

      </section>
    `


  bindQuickTabs()
}


function renderMembersOverview() {

  setHeader(
    'Members',

    'Read-only overview of members and assigned access'
  )


  const members =
    currentMembers


  const activeMembers =
    getActiveMembers()


  const inactiveMembers =
    currentMembers
      .filter(
        member =>
          member.active ===
          false
      )


  const pendingMembers =
    getPendingMembers()


  document
    .querySelector(
      '#desktop-admin-content'
    )
    .innerHTML =
    `
      <section
        class="desktop-admin-stat-grid"
      >

        ${statCard(
          'All Members',
          members.length
        )}

        ${statCard(
          'Active',
          activeMembers.length
        )}

        ${statCard(
          'Pending',
          pendingMembers.length
        )}

        ${statCard(
          'Inactive',
          inactiveMembers.length
        )}

      </section>


      <section
        class="desktop-admin-card"
      >

        <div
          class="desktop-admin-card-header"
        >

          <div>

            <h3>
              Members
            </h3>

            <p>
              Search by name, email,
              telephone, status, or
              assigned access.
            </p>

          </div>


          <button
            data-desktop-quick-tab="permissions"
            type="button"
          >
            Manage Permissions
          </button>

        </div>


        <div
          class="desktop-admin-filter-bar"
        >

          <input
            id="desktop-admin-member-search"
            type="search"
            placeholder="Search members"
            autocomplete="off"
          >

        </div>


        <div
          class="desktop-admin-table-wrap"
        >

          <table
            class="desktop-admin-table"
          >

            <thead>

              <tr>

                <th>
                  Name
                </th>

                <th>
                  Status
                </th>

                <th>
                  Email
                </th>

                <th>
                  Telephone
                </th>

                <th>
                  Member Access
                </th>

                <th>
                  Admin Access
                </th>

                <th>
                  Action
                </th>

              </tr>

            </thead>


            <tbody
              id="desktop-admin-member-table-body"
            >

              ${
                memberTableRows(
                  members
                )
              }

            </tbody>

          </table>

        </div>

      </section>
    `


  bindQuickTabs()

  bindMemberOverview()
}


function renderPermissionsManager() {

  setHeader(
    'Members & Permissions',

    'Approve members and assign access, 10 members at a time'
  )


  const members =
    sortedPermissionMembers()


  const totalPages =
    Math.max(
      1,

      Math.ceil(
        members.length /
        permissionsPageSize
      )
    )


  if (
    permissionsPage >=
    totalPages
  ) {

    permissionsPage =
      totalPages -
      1
  }


  const start =
    permissionsPage *
    permissionsPageSize


  const visibleMembers =
    members.slice(
      start,

      start +
      permissionsPageSize
    )


  document
    .querySelector(
      '#desktop-admin-content'
    )
    .innerHTML =
    `
      <section
        class="desktop-admin-card"
      >

        <div
          class="desktop-admin-card-header"
        >

          <div>

            <h3>
              Member Permissions
            </h3>

            <p>
              Showing
              ${
                members.length
                  ? start + 1
                  : 0
              }
              -
              ${
                Math.min(
                  start +
                  permissionsPageSize,

                  members.length
                )
              }
              of
              ${members.length}
            </p>

          </div>


          <div
            class="desktop-admin-pagination"
          >

            <button
              type="button"
              data-permissions-page="previous"
              ${
                permissionsPage ===
                0
                  ? 'disabled'
                  : ''
              }
            >
              Previous
            </button>


            <span>
              Page
              ${permissionsPage + 1}
              of
              ${totalPages}
            </span>


            <button
              type="button"
              data-permissions-page="next"
              ${
                permissionsPage + 1 >=
                totalPages
                  ? 'disabled'
                  : ''
              }
            >
              Next
            </button>

          </div>

        </div>


        <div
          id="desktop-admin-permissions-list"
        ></div>

      </section>
    `


  renderEditableMemberList({
    container:
      document.querySelector(
        '#desktop-admin-permissions-list'
      ),

    members:
      visibleMembers,

    emptyText:
      'No members found.'
  })


  bindPermissionsPagination()
}


function renderMinistriesOverview() {

  setHeader(
    'Ministries',

    'Overview of ministry access and administrators'
  )


  document
    .querySelector(
      '#desktop-admin-content'
    )
    .innerHTML =
    `
      <section
        class="desktop-admin-grid two"
      >

        ${ministryCards()}

      </section>
    `


  bindQuickTabs()
}


function renderEditableMemberList({
  container,
  members,
  emptyText
}) {

  container.innerHTML =
    members.length
      ? ''
      : `<p>${escapeHtml(
          emptyText
        )}</p>`


  members.forEach(
    member => {

      container.appendChild(
        createEditableMemberCard(
          member
        )
      )
    }
  )
}


function bindPermissionsPagination() {

  document
    .querySelectorAll(
      '[data-permissions-page]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            if (
              button.dataset
                .permissionsPage ===
              'previous'
            ) {

              permissionsPage =
                Math.max(
                  0,

                  permissionsPage -
                  1
                )
            }


            if (
              button.dataset
                .permissionsPage ===
              'next'
            ) {

              permissionsPage =
                permissionsPage +
                1
            }


            safeRenderDesktopAdminTab()
          }
        )
      }
    )
}


function createEditableMemberCard(
  member
) {

  const card =
    document.createElement(
      'article'
    )


  card.className =
    'desktop-admin-member-card'


  card.id =
    `desktop-admin-member-${escapeAttribute(
      memberKey(
        member
      )
    )}`


  card.innerHTML =
    `
      <div
        class="desktop-admin-member-heading"
      >

        <div>

          <h4>
            ${escapeHtml(
              member.name ||
              'Unnamed member'
            )}
          </h4>

          <p>
            ${escapeHtml(
              member.email ||
              'No email'
            )}
          </p>

          <p>
            ${escapeHtml(
              member.phone ||
              'No telephone'
            )}
          </p>

        </div>


        <strong
          class="desktop-admin-status-pill"
        >
          ${escapeHtml(
            getMemberStatus(
              member
            )
          )}
        </strong>

      </div>


      ${
        multiChoiceDropdown({
          title:
            'Member Roles',

          buttonText:
            'Normal Church Member',

          items:
            memberPermissionOptions,

          source:
            getMemberPermissionSource(
              member
            ),

          type:
            'member'
        })
      }


      ${
        multiChoiceDropdown({
          title:
            'Admin Roles',

          buttonText:
            'No admin roles selected',

          items:
            adminPermissionOptions,

          source:
            member.adminAccess ||
            {},

          type:
            'admin'
        })
      }


      <div
        class="desktop-admin-member-actions"
      >

        <button
          data-save-member
        >
          ${
            isMemberApproved(
              member
            )
              ? 'Save Permissions'
              : 'Approve and Save'
          }
        </button>


        <button
          data-toggle-active
        >
          ${
            member.active ===
            false
              ? 'Activate'
              : 'Deactivate'
          }
        </button>

      </div>


      <p
        data-card-status
        class="desktop-admin-card-status"
      ></p>
    `


  bindEditableMemberCard({
    card,
    member
  })


  return card
}


function bindEditableMemberCard({
  card,
  member
}) {

  card
    .querySelector(
      '[data-save-member]'
    )
    .addEventListener(
      'click',
      async () => {

        await saveMemberCard({
          card,
          member,

          approve:
            true,

          active:
            true
        })
      }
    )


  card
    .querySelector(
      '[data-toggle-active]'
    )
    .addEventListener(
      'click',
      async () => {

        if (
          member.active !==
            false &&

          !confirm(
            `Deactivate ${
              member.name ||
              member.email ||
              'this member'
            }?`
          )
        ) {

          return
        }


        await saveMemberCard({
          card,
          member,

          approve:
            isMemberApproved(
              member
            ),

          active:
            member.active ===
            false
        })
      }
    )


  bindMultiChoiceDropdowns(
    card
  )
}


async function saveMemberCard({
  card,
  member,
  approve,
  active
}) {

  const status =
    card.querySelector(
      '[data-card-status]'
    )


  const adminAccess =
    readCheckboxes({
      card,

      selector:
        '[data-admin-permission]'
    })


  const selectedMemberPermissions =
    readCheckboxes({
      card,

      selector:
        '[data-member-permission]'
    })


  const memberData =
    {
      church:
        false,

      ...baseMemberPermissions,

      ...selectedMemberPermissions,

      name:
        member.name ||
        '',

      email:
        member.email ||
        '',

      phone:
        member.phone ||
        '',

      approved:
        approve,

      active,

      memberRole:
        inferMemberRole(
          selectedMemberPermissions
        ),

      memberStatus:
        approve
          ? 'approved'
          : 'pendingApproval'
    }


  setCardButtons(
    card,
    true
  )


  status.textContent =
    'Saving...'


  try {

    await withTimeout(
      saveDesktopChurchMemberPermissions({
        memberId:
          member.id,

        uid:
          member.uid,

        memberData,

        adminAccess
      }),

      'Saving member permissions did not answer.'
    )


    status.textContent =
      'Saved. Reloading...'


    await loadDesktopAdminData()

  } catch (error) {

    console.error(
      'Unable to save desktop member permissions:',
      error
    )


    status.textContent =
      error?.message ||
      'Unable to save member.'


    alert(
      status.textContent
    )


    setCardButtons(
      card,
      false
    )
  }
}


async function getDesktopChurchAdministrationData() {

  const callable =
    httpsCallable(
      desktopFunctions,

      'getChurchAdministrationData'
    )


  const result =
    await callable(
      {}
    )


  return result?.data ||
    {}
}


async function saveDesktopChurchMemberPermissions(
  data
) {

  const callable =
    httpsCallable(
      desktopFunctions,

      'saveChurchMemberPermissions'
    )


  const result =
    await callable(
      data
    )


  return result?.data ||
    {}
}


function renderPlaceholderTab(
  title,
  message
) {

  setHeader(
    title,
    message
  )


  document
    .querySelector(
      '#desktop-admin-content'
    )
    .innerHTML =
    `
      <section
        class="desktop-admin-card"
      >

        <h3>
          ${escapeHtml(
            title
          )}
        </h3>

        <p>
          ${escapeHtml(
            message
          )}
        </p>

      </section>
    `
}


function statCard(
  label,
  value
) {

  return `
    <article
      class="desktop-admin-stat-card"
    >

      <span>
        ${escapeHtml(
          label
        )}
      </span>

      <strong>
        ${value}
      </strong>

    </article>
  `
}


function compactMemberRow(
  member
) {

  return `
    <button
      class="desktop-admin-member-row"
      data-desktop-quick-tab="permissions"
    >

      <span>
        ${escapeHtml(
          member.name ||
          'Unnamed member'
        )}
      </span>

      <small>
        ${escapeHtml(
          member.email ||
          'No email'
        )}
      </small>

    </button>
  `
}


function ministryCards() {

  return ministryOptions
    .map(
      ministry =>
        ministryCard(
          ministry
        )
    )
    .join(
      ''
    )
}


function ministryCard(
  ministry
) {

  const members =
    ministry.allMembers ===
    true
      ? getActiveMembers()

      : getActiveMembers()
          .filter(
            member =>
              getMemberPermissionSource(
                member
              )?.[
                ministry.memberField
              ] ===
              true
          )


  const admins =
    getApprovedMembers()
      .filter(
        member =>
          ministry.adminFields
            .some(
              field =>
                member.adminAccess
                  ?.[field] ===
                true
            )
      )


  return `
    <article
      class="desktop-admin-card desktop-admin-ministry-card"
    >

      <div
        class="desktop-admin-card-header"
      >

        <div>

          <h3>
            ${escapeHtml(
              ministry.title
            )}
          </h3>

          <p>
            ${escapeHtml(
              ministry.description
            )}
          </p>

        </div>

      </div>


      <div
        class="desktop-admin-ministry-stats"
      >

        <span>

          <strong>
            ${members.length}
          </strong>

          Members

        </span>


        <span>

          <strong>
            ${admins.length}
          </strong>

          Admins

        </span>

      </div>


      <div
        class="desktop-admin-ministry-list"
      >

        <h4>
          Administrators
        </h4>

        ${
          admins.length
            ? admins
                .slice(
                  0,
                  4
                )
                .map(
                  member =>
                    escapeHtml(
                      member.name ||
                      member.email ||
                      'Unnamed member'
                    )
                )
                .join(
                  ', '
                )

            : `
                <span
                  class="desktop-admin-muted"
                >
                  No admin assigned
                </span>
              `
        }

      </div>


      <button
        data-desktop-quick-tab="permissions"
        type="button"
      >
        Manage Access
      </button>

    </article>
  `
}


function memberTableRow(
  member
) {

  return `
    <tr>

      <td>
        ${escapeHtml(
          member.name ||
          'Unnamed member'
        )}
      </td>

      <td>
        ${escapeHtml(
          getMemberStatus(
            member
          )
        )}
      </td>

      <td>
        ${escapeHtml(
          member.email ||
          ''
        )}
      </td>

      <td>
        ${escapeHtml(
          member.phone ||
          ''
        )}
      </td>

      <td>
        ${
          badges(
            memberAccessLabels(
              member
            )
          )
        }
      </td>

      <td>
        ${
          badges(
            adminAccessLabels(
              member.adminAccess ||
              {}
            )
          )
        }
      </td>

      <td>

        <button
          type="button"
          data-edit-member="${escapeAttribute(
            memberKey(
              member
            )
          )}"
        >
          Edit
        </button>

      </td>

    </tr>
  `
}


function memberTableRows(
  members
) {

  return members.length
    ? members
        .map(
          member =>
            memberTableRow(
              member
            )
        )
        .join(
          ''
        )

    : `
        <tr>
          <td colspan="7">
            No members found.
          </td>
        </tr>
      `
}


function bindMemberOverview() {

  const search =
    document.querySelector(
      '#desktop-admin-member-search'
    )


  if (search) {

    search.addEventListener(
      'input',
      () => {

        const term =
          normalize(
            search.value
          )


        const filteredMembers =
          currentMembers
            .filter(
              member =>
                memberSearchText(
                  member
                )
                  .includes(
                    term
                  )
            )


        document
          .querySelector(
            '#desktop-admin-member-table-body'
          )
          .innerHTML =
          memberTableRows(
            filteredMembers
          )


        bindMemberEditButtons()
      }
    )
  }


  bindMemberEditButtons()
}


function bindMemberEditButtons() {

  document
    .querySelectorAll(
      '[data-edit-member]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            currentTab =
              'permissions'


            safeRenderDesktopAdminTab()


            const card =
              document.getElementById(
                `desktop-admin-member-${
                  button.dataset
                    .editMember
                }`
              )


            if (card) {

              card.scrollIntoView({
                behavior:
                  'smooth',

                block:
                  'start'
              })
            }
          }
        )
      }
    )
}


function memberSearchText(
  member
) {

  return normalize(
    [
      member.name,

      member.email,

      member.phone,

      getMemberStatus(
        member
      ),

      ...memberAccessLabels(
        member
      ),

      ...adminAccessLabels(
        member.adminAccess ||
        {}
      )
    ]
      .filter(
        Boolean
      )
      .join(
        ' '
      )
  )
}


function badges(
  values
) {

  if (
    !values.length
  ) {

    return `
      <span
        class="desktop-admin-muted"
      >
        None
      </span>
    `
  }


  return values
    .map(
      value =>
        `
          <span
            class="desktop-admin-badge"
          >
            ${escapeHtml(
              value
            )}
          </span>
        `
    )
    .join(
      ''
    )
}


function permissionCheckboxes({
  items,
  source,
  type
}) {

  return items
    .map(
      item => `
        <label
          class="desktop-admin-check"
        >

          <input
            type="checkbox"
            data-${type}-permission="${escapeHtml(
              item.field
            )}"
            ${
              source?.[
                item.field
              ] ===
              true
                ? 'checked'
                : ''
            }
          >

          ${escapeHtml(
            item.label
          )}

        </label>
      `
    )
    .join(
      ''
    )
}


function multiChoiceDropdown({
  title,
  buttonText,
  items,
  source,
  type
}) {

  return `
    <div
      class="desktop-admin-multi-choice"
      data-multi-choice
      data-empty-text="${escapeAttribute(
        buttonText
      )}"
    >

      <button
        class="desktop-admin-multi-choice-button"
        type="button"
        data-multi-choice-button
      >

        <span>

          <strong>
            ${escapeHtml(
              title
            )}
          </strong>

          <small
            data-multi-choice-summary
          >
            ${
              escapeHtml(
                selectedPermissionSummary({
                  items,
                  source,

                  emptyText:
                    buttonText
                })
              )
            }
          </small>

        </span>


        <span
          aria-hidden="true"
        >
          ▼
        </span>

      </button>


      <div
        class="desktop-admin-multi-choice-menu"
        data-multi-choice-menu
        hidden
      >

        ${
          permissionCheckboxes({
            items,
            source,
            type
          })
        }

      </div>

    </div>
  `
}


function bindMultiChoiceDropdowns(
  card
) {

  card
    .querySelectorAll(
      '[data-multi-choice]'
    )
    .forEach(
      dropdown => {

        const button =
          dropdown.querySelector(
            '[data-multi-choice-button]'
          )


        const menu =
          dropdown.querySelector(
            '[data-multi-choice-menu]'
          )


        button.addEventListener(
          'click',
          () => {

            menu.hidden =
              !menu.hidden
          }
        )


        dropdown
          .querySelectorAll(
            'input[type="checkbox"]'
          )
          .forEach(
            checkbox => {

              checkbox.addEventListener(
                'change',
                () => {

                  updateMultiChoiceSummary(
                    dropdown
                  )
                }
              )
            }
          )
      }
    )
}


function updateMultiChoiceSummary(
  dropdown
) {

  const checkedLabels =
    Array
      .from(
        dropdown
          .querySelectorAll(
            'input[type="checkbox"]:checked'
          )
      )
      .map(
        checkbox =>
          checkbox
            .closest(
              'label'
            )
            ?.textContent
            ?.trim()
      )
      .filter(
        Boolean
      )


  dropdown
    .querySelector(
      '[data-multi-choice-summary]'
    )
    .textContent =
    checkedLabels.length
      ? checkedLabels.join(
          ', '
        )

      : dropdown.dataset
          .emptyText
}


function selectedPermissionSummary({
  items,
  source,
  emptyText
}) {

  const labels =
    items
      .filter(
        item =>
          source?.[
            item.field
          ] ===
          true
      )
      .map(
        item =>
          item.label
      )


  return labels.length
    ? labels.join(
        ', '
      )

    : emptyText
}


function readCheckboxes({
  card,
  selector
}) {

  return Array
    .from(
      card.querySelectorAll(
        selector
      )
    )
    .reduce(
      (
        data,
        checkbox
      ) => {

        const field =
          checkbox.dataset
            .memberPermission ||

          checkbox.dataset
            .adminPermission


        if (field) {

          data[
            field
          ] =
            checkbox.checked ===
            true
        }


        return data
      },
      {}
    )
}


function memberAccessLabels(
  member
) {

  const source =
    getMemberPermissionSource(
      member
    )


  const labels =
    [
      'Normal Church Member'
    ]


  memberPermissionOptions
    .forEach(
      item => {

        if (
          source[
            item.field
          ] ===
          true
        ) {

          labels.push(
            item.label
          )
        }
      }
    )


  return labels
}


function adminAccessLabels(
  adminAccess
) {

  return adminPermissionOptions
    .filter(
      item =>
        adminAccess?.[
          item.field
        ] ===
        true
    )
    .map(
      item =>
        item.label
    )
}


function getMemberPermissionSource(
  member
) {

  return {
    ...(
      memberRoles[
        member.memberRole ||
        'none'
      ]?.data ||
      {}
    ),

    ...(
      member.permissions ||
      member
    )
  }
}


function getPendingMembers() {

  return currentMembers
    .filter(
      member =>
        !isMemberApproved(
          member
        )
    )
}


function getApprovedMembers() {

  return currentMembers
    .filter(
      member =>
        isMemberApproved(
          member
        )
    )
}


function getActiveMembers() {

  return currentMembers
    .filter(
      member =>
        member.active !==
          false &&

        isMemberApproved(
          member
        )
    )
}


function sortedPermissionMembers() {

  return [
    ...currentMembers
  ]
    .sort(
      (
        first,
        second
      ) => {

        const firstPending =
          !isMemberApproved(
            first
          )


        const secondPending =
          !isMemberApproved(
            second
          )


        if (
          firstPending !==
          secondPending
        ) {

          return firstPending
            ? -1
            : 1
        }


        return String(
          first.name ||
          first.email ||
          ''
        )
          .localeCompare(
            String(
              second.name ||
              second.email ||
              ''
            )
          )
      }
    )
}


function isMemberApproved(
  member
) {

  return (
    member?.approved ===
      true ||

    member?.memberStatus ===
      'approved'
  )
}


function getMemberStatus(
  member
) {

  if (
    member?.active ===
    false
  ) {

    return 'Inactive'
  }


  if (
    isMemberApproved(
      member
    )
  ) {

    return 'Approved'
  }


  return 'Pending'
}


function deduplicateMembers(
  members
) {

  const seen =
    new Set()


  return members
    .filter(
      member => {

        const key =
          duplicateKey(
            member
          )


        if (
          seen.has(
            key
          )
        ) {

          return false
        }


        seen.add(
          key
        )


        return true
      }
    )
}


function duplicateKey(
  member
) {

  return [
    sheetKey(
      member
    ),

    normalize(
      member?.email
    ),

    normalizePhone(
      member?.phone
    ),

    member?.uid ||
      '',

    member?.id ||
      ''
  ]
    .find(
      Boolean
    ) ||

    normalize(
      member?.name
    ) ||

    Math.random()
      .toString()
}


function memberKey(
  member
) {

  return (
    member?.id ||

    member?.uid ||

    sheetKey(
      member
    ) ||

    normalize(
      member?.email
    ) ||

    normalizePhone(
      member?.phone
    ) ||

    normalize(
      member?.name
    )
  )
}


function sheetKey(
  member
) {

  const famId =
    normalize(
      member?.sheetFamId ||

      member?.permissions
        ?.sheetFamId
    )


  const perId =
    normalize(
      member?.sheetPerId ||

      member?.permissions
        ?.sheetPerId
    )


  if (
    famId ||
    perId
  ) {

    return `${famId}:${perId}`
  }


  return ''
}


function bindQuickTabs() {

  document
    .querySelectorAll(
      '[data-desktop-quick-tab]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            currentTab =
              button.dataset
                .desktopQuickTab


            safeRenderDesktopAdminTab()
          }
        )
      }
    )
}


function inferMemberRole(
  permissions = {}
) {

  if (
    permissions
      .scripturePreparation ===
    true
  ) {

    return 'pastor'
  }


  if (
    permissions
      .languageSchool ===
    true
  ) {

    return 'languageSchool'
  }


  if (
    permissions
      .sundaySchool ===
    true
  ) {

    return 'sundaySchool'
  }


  if (
    permissions
      .youth ===
    true
  ) {

    return 'youth'
  }


  if (
    permissions
      .choir ===
    true
  ) {

    return 'choir'
  }


  return 'member'
}


function markActiveTab() {

  document
    .querySelectorAll(
      '[data-desktop-admin-tab]'
    )
    .forEach(
      button => {

        button.classList.toggle(
          'active',

          button.dataset
            .desktopAdminTab ===
            currentTab
        )
      }
    )
}


function setHeader(
  title,
  subtitle
) {

  const titleElement =
    document.querySelector(
      '#desktop-admin-title'
    )


  const subtitleElement =
    document.querySelector(
      '#desktop-admin-subtitle'
    )


  if (titleElement) {

    titleElement.textContent =
      title
  }


  if (subtitleElement) {

    subtitleElement.textContent =
      subtitle
  }
}


function showLogin() {

  const login =
    document.querySelector(
      '#desktop-admin-login'
    )


  const panel =
    document.querySelector(
      '#desktop-admin-panel'
    )


  if (login) {

    login.hidden =
      false
  }


  if (panel) {

    panel.hidden =
      true
  }
}


function showPanel() {

  const login =
    document.querySelector(
      '#desktop-admin-login'
    )


  const panel =
    document.querySelector(
      '#desktop-admin-panel'
    )


  if (login) {

    login.hidden =
      true
  }


  if (panel) {

    panel.hidden =
      false
  }
}


function setLoginStatus(
  message
) {

  const status =
    document.querySelector(
      '#desktop-admin-login-status'
    )


  if (status) {

    status.textContent =
      message
  }
}


function setStatus(
  message
) {

  const status =
    document.querySelector(
      '#desktop-admin-status'
    )


  if (status) {

    status.textContent =
      message
  }
}


function setCardButtons(
  card,
  disabled
) {

  card
    .querySelectorAll(
      'button'
    )
    .forEach(
      button => {

        button.disabled =
          disabled
      }
    )
}


function value(
  id
) {

  return (
    document
      .getElementById(
        id
      )
      ?.value
      ?.trim() ||
    ''
  )
}


function normalize(
  value
) {

  return String(
    value ||
    ''
  )
    .trim()
    .toLowerCase()
}


function normalizePhone(
  value
) {

  return String(
    value ||
    ''
  )
    .replace(
      /[^\d+]/g,
      ''
    )
}


function escapeHtml(
  value
) {

  return String(
    value ||
    ''
  )
    .replaceAll(
      '&',
      '&amp;'
    )
    .replaceAll(
      '<',
      '&lt;'
    )
    .replaceAll(
      '>',
      '&gt;'
    )
    .replaceAll(
      '"',
      '&quot;'
    )
    .replaceAll(
      "'",
      '&#039;'
    )
}


function escapeAttribute(
  value
) {

  return escapeHtml(
    value
  )
}