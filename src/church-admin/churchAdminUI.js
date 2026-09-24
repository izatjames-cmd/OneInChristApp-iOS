import {
  getChurchAdministrationData,
  saveChurchMemberPermissions
} from './churchAdminService.js'

import {
  memberRoles
} from './churchAdminRoles.js'

import {
  returnToMemberArea
} from '../members/memberNavigation.js'


let currentMembers =
  []

let currentTab =
  'dashboard'


const baseMemberPermissions =
  {
    food:
      true,
    prayer:
      true,
    plan:
      true
  }


const extraMemberPermissions =
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


const adminPermissions =
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
        'Language School Admin'
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


export async function openChurchAdminSection() {

  renderChurchAdminShell()

  document
    .querySelector(
      '#church-admin-module-overlay'
    )
    .style.display =
    'flex'

  await loadChurchAdminMembers()
}


function renderChurchAdminShell() {

  if (
    document.querySelector(
      '#church-admin-module-overlay'
    )
  ) {
    return
  }


  document.body.insertAdjacentHTML(
    'beforeend',
    `
      <div id="church-admin-module-overlay" class="church-admin-overlay">
        <div class="church-admin-panel">
          <header class="church-admin-header">
            <div>
              <h2>Church Administration</h2>
              <p>Dashboard, members, roles, notifications, and reports</p>
            </div>

            <button id="close-church-admin-module-button">
              Close
            </button>
          </header>

          <nav class="church-admin-tabs">
            <button data-church-admin-tab="dashboard">Dashboard</button>
            <button data-church-admin-tab="members">Members</button>
            <button data-church-admin-tab="admin">Admin</button>
            <button data-church-admin-tab="roles">Roles</button>
            <button data-church-admin-tab="notifications">Notifications</button>
            <button data-church-admin-tab="audit">Audit Log</button>
            <button data-church-admin-tab="reports">Reports</button>
          </nav>

          <div id="church-admin-status" class="church-admin-status"></div>
          <main id="church-admin-content"></main>
        </div>
      </div>
    `
  )

  bindChurchAdminShell()
}


function bindChurchAdminShell() {

  document
    .querySelector(
      '#close-church-admin-module-button'
    )
    .addEventListener(
      'click',
      () => {

        document
          .querySelector(
            '#church-admin-module-overlay'
          )
          .style.display =
          'none'

        returnToMemberArea()
      }
    )

  document
    .querySelectorAll(
      '[data-church-admin-tab]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            currentTab =
              button.dataset.churchAdminTab

            renderCurrentTab()
          }
        )
      }
    )
}


async function loadChurchAdminMembers() {

  setStatus(
    'Loading Church Administration...'
  )


  try {

    const data =
      await getChurchAdministrationData()

    currentMembers =
      deduplicateChurchAdminMembers(
        data.members || []
      )

    renderCurrentTab()

    setStatus(
      ''
    )

  } catch (error) {

    console.error(
      'Unable to load Church Administration:',
      error
    )

    setStatus(
      error?.message ||
      'Unable to load Church Administration.'
    )
  }
}


function renderCurrentTab() {

  markCurrentTab()

  if (currentTab === 'members') {
    renderMembersTab()
    return
  }

  if (currentTab === 'admin') {
    renderAdminTab()
    return
  }

  if (currentTab === 'roles') {
    renderSimpleTab(
      'Role Templates',
      'Use the Members tab to choose a Member Role and an Admin Role for each person.'
    )
    return
  }

  if (currentTab === 'notifications') {
    renderSimpleTab(
      'Notifications',
      'Church-wide notifications are still managed from the Church notification screen.'
    )
    return
  }

  if (currentTab === 'audit') {
    renderSimpleTab(
      'Audit Log',
      'Audit logging is planned for a later step.'
    )
    return
  }

  if (currentTab === 'reports') {
    renderSimpleTab(
      'Reports',
      'Reports are planned for a later step.'
    )
    return
  }

  renderDashboardTab()
}


function renderDashboardTab() {

  const pendingCount =
    getPendingMembers().length

  const approvedCount =
    getApprovedMembers().length

  const inactiveCount =
    currentMembers.filter(
      member =>
        member.active === false
    ).length

  const content =
    document.querySelector(
      '#church-admin-content'
    )

  content.innerHTML =
    `
      <section class="church-admin-grid">
        ${renderDashboardCard(
          'Pending Approvals',
          pendingCount
        )}

        ${renderDashboardCard(
          'Approved Members',
          approvedCount
        )}

        ${renderDashboardCard(
          'Inactive Members',
          inactiveCount
        )}
      </section>

      <section class="church-admin-card">
        <h3>Quick Actions</h3>

        <div class="church-admin-quick-actions">
          <button data-dashboard-target="members">
            Members
          </button>

          <button data-dashboard-target="admin">
            Admin
          </button>

          <button data-dashboard-target="roles">
            Roles
          </button>

          <button data-dashboard-target="notifications">
            Notifications
          </button>

          <button data-dashboard-target="audit">
            Audit Log
          </button>

          <button data-dashboard-target="reports">
            Reports
          </button>
        </div>
      </section>
    `

  document
    .querySelectorAll(
      '[data-dashboard-target]'
    )
    .forEach(
      button => {

        button.addEventListener(
          'click',
          () => {

            currentTab =
              button.dataset.dashboardTarget

            renderCurrentTab()
          }
        )
      }
    )
}


function renderMembersTab() {

  const content =
    document.querySelector(
      '#church-admin-content'
    )

  content.innerHTML =
    `
      <section class="church-admin-card">
        <h3>Active Members</h3>

        <p class="church-admin-member-meta">
          Read-only overview of active members and their access.
        </p>

        <div id="church-admin-active-members"></div>
      </section>
    `

  renderMemberOverview({
    container:
      document.querySelector(
        '#church-admin-active-members'
      ),

    members:
      getActiveMembers(),

    emptyText:
      'No active members found.'
  })
}


function renderAdminTab() {

  const content =
    document.querySelector(
      '#church-admin-content'
    )

  content.innerHTML =
    `
      <section class="church-admin-card">
        <h3>Pending Approvals</h3>

        <div id="church-admin-pending-members"></div>
      </section>

      <section class="church-admin-card">
        <h3>Approved Members</h3>

        <div id="church-admin-approved-members"></div>
      </section>
    `

  renderEditableMembers({
    container:
      document.querySelector(
        '#church-admin-pending-members'
      ),

    members:
      getPendingMembers(),

    emptyText:
      'No pending members.'
  })

  renderEditableMembers({
    container:
      document.querySelector(
        '#church-admin-approved-members'
      ),

    members:
      getApprovedMembers(),

    emptyText:
      'No approved members found.'
  })
}


function renderEditableMembers({
  container,
  members,
  emptyText
}) {

  container.innerHTML =
    ''

  if (!members.length) {

    const empty =
      document.createElement(
        'p'
      )

    empty.textContent =
      emptyText

    container.appendChild(
      empty
    )

    return
  }

  members.forEach(
    member => {

      container.appendChild(
        createMemberCard(
          member
        )
      )
    }
  )
}


function renderMemberOverview({
  container,
  members,
  emptyText
}) {

  container.innerHTML =
    ''

  if (!members.length) {

    const empty =
      document.createElement(
        'p'
      )

    empty.textContent =
      emptyText

    container.appendChild(
      empty
    )

    return
  }

  members.forEach(
    member => {

      container.appendChild(
        createMemberOverviewCard(
          member
        )
      )
    }
  )
}


function createMemberOverviewCard(
  member
) {

  const card =
    document.createElement(
      'article'
    )

  card.className =
    'church-admin-member-card'

  card.innerHTML =
    `
      <div class="church-admin-member-heading">

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
        </div>

        <strong>
          ${getMemberStatusLabel(
            member
          )}
        </strong>

      </div>

      <p class="church-admin-member-meta">
        Member Role:
        ${escapeHtml(
          getRoleLabel(
            memberRoles,
            member.memberRole
          )
        )}
      </p>

      <div class="church-admin-badges">

        ${renderPermissionBadges({
          title:
            'Member Access',

          badges:
            getMemberAccessLabels(
              member
            )
        })}

        ${renderPermissionBadges({
          title:
            'Admin Authorities',

          badges:
            getAdminAccessLabels(
              member.adminAccess ||
              {}
            )
        })}

      </div>
    `

  return card
}


function createMemberCard(
  member
) {

  const card =
    document.createElement(
      'article'
    )

  card.className =
    isMemberApproved(
      member
    )
      ? 'church-admin-member-card'
      : 'church-admin-member-card pending'


  const memberSummary =
    getMemberAccessLabels(
      member
    )
      .join(', ') ||
    'Normal Church Member'


  const adminSummary =
    getAdminAccessLabels(
      member.adminAccess ||
      {}
    )
      .join(', ') ||
    'No admin roles selected'


  card.innerHTML =
    `
      <div class="church-admin-member-heading">

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

        </div>

        <strong>
          ${getMemberStatusLabel(
            member
          )}
        </strong>

      </div>


      <p class="church-admin-member-meta">

        ${
          member.verifiedFromSheet
            ? 'Verified from Google Sheet'
            : 'Manual review'
        }

      </p>


      <details
        class="church-admin-role-dropdown"
        data-member-roles-details
      >

        <summary>

          <span
            class="church-admin-role-dropdown-title"
          >
            Member Roles
          </span>

          <span
            class="church-admin-role-summary-text"
            data-member-roles-summary
          >
            ${escapeHtml(
              memberSummary
            )}
          </span>

        </summary>


        <div
          class="church-admin-role-dropdown-body"
        >

          <label
            class="church-admin-permission-option"
          >

            <input
              type="checkbox"
              checked
              disabled
            >

            Normal Church Member

          </label>


          ${renderPermissionCheckboxes({
            items:
              extraMemberPermissions,

            source:
              getMemberPermissionSource(
                member
              )
          })}

        </div>

      </details>


      <details
        class="church-admin-role-dropdown"
        data-admin-roles-details
      >

        <summary>

          <span
            class="church-admin-role-dropdown-title"
          >
            Admin Roles
          </span>

          <span
            class="church-admin-role-summary-text"
            data-admin-roles-summary
          >
            ${escapeHtml(
              adminSummary
            )}
          </span>

        </summary>


        <div
          class="church-admin-role-dropdown-body"
        >

          ${renderPermissionCheckboxes({
            items:
              adminPermissions,

            source:
              member.adminAccess ||
              {},

            type:
              'admin'
          })}

        </div>

      </details>


      <div
        class="church-admin-member-actions"
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
          data-activate-member
        >

          ${
            member.active === false
              ? 'Activate'
              : 'Deactivate'
          }

        </button>

      </div>


      <p
        data-card-status
        class="church-admin-card-status"
      ></p>
    `


  bindMemberCard(
    card,
    member
  )


  updateRoleDropdownSummaries(
    card
  )


  return card
}


function bindMemberCard(
  card,
  member
) {

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
      '[data-activate-member]'
    )
    .addEventListener(
      'click',
      async () => {

        if (
          member.active !== false &&
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


  card
    .querySelectorAll(
      `
        [data-member-permission],
        [data-admin-permission]
      `
    )
    .forEach(
      checkbox => {

        checkbox.addEventListener(
          'change',
          () => {

            updateRoleDropdownSummaries(
              card
            )
          }
        )
      }
    )
}


function updateRoleDropdownSummaries(
  card
) {

  const memberSummary =
    card.querySelector(
      '[data-member-roles-summary]'
    )


  const adminSummary =
    card.querySelector(
      '[data-admin-roles-summary]'
    )


  if (memberSummary) {

    const labels =
      [
        'Normal Church Member'
      ]


    card
      .querySelectorAll(
        '[data-member-permission]'
      )
      .forEach(
        checkbox => {

          if (
            !checkbox.checked
          ) {
            return
          }


          const item =
            extraMemberPermissions.find(
              role =>
                role.field ===
                checkbox.dataset.memberPermission
            )


          if (item?.label) {

            labels.push(
              item.label
            )
          }
        }
      )


    memberSummary.textContent =
      labels.join(
        ', '
      )
  }


  if (adminSummary) {

    const labels =
      []


    card
      .querySelectorAll(
        '[data-admin-permission]'
      )
      .forEach(
        checkbox => {

          if (
            !checkbox.checked
          ) {
            return
          }


          const item =
            adminPermissions.find(
              role =>
                role.field ===
                checkbox.dataset.adminPermission
            )


          if (item?.label) {

            labels.push(
              item.label
            )
          }
        }
      )


    adminSummary.textContent =
      labels.length
        ? labels.join(
            ', '
          )
        : 'No admin roles selected'
  }
}


async function saveMemberCard({
  card,
  member,
  approve,
  active
}) {

  const cardStatus =
    card.querySelector(
      '[data-card-status]'
    )


  const buttons =
    card.querySelectorAll(
      'button'
    )


  const selectedMemberPermissions =
    readPermissionCheckboxes({
      card,

      selector:
        '[data-member-permission]'
    })


  const memberRole =
    inferMemberRole(
      selectedMemberPermissions
    )


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

      memberRole,

      memberStatus:
        approve
          ? 'approved'
          : 'pendingApproval'
    }


  const adminAccess =
    readPermissionCheckboxes({
      card,

      selector:
        '[data-admin-permission]'
    })


  setButtonsDisabled(
    buttons,
    true
  )


  cardStatus.textContent =
    'Saving...'


  try {

    const result =
      await saveChurchMemberPermissions({

        memberId:
          member.id,

        uid:
          member.uid,

        memberData,

        adminAccess
      })


    cardStatus.textContent =
      result?.saved === true
        ? 'Saved in Firebase. Reloading...'
        : 'Saved. Reloading...'


    await loadChurchAdminMembers()

  } catch (error) {

    console.error(
      'Unable to save member:',
      error
    )


    cardStatus.textContent =
      error?.message ||
      'Unable to save member.'


    alert(
      cardStatus.textContent
    )


    setButtonsDisabled(
      buttons,
      false
    )
  }
}


function renderSimpleTab(
  title,
  message
) {

  document
    .querySelector(
      '#church-admin-content'
    )
    .innerHTML =
    `
      <section class="church-admin-card">

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


function renderDashboardCard(
  label,
  value
) {

  return `
    <article
      class="church-admin-card"
    >

      <h3>
        ${escapeHtml(
          label
        )}
      </h3>

      <p
        class="church-admin-stat"
      >
        ${value}
      </p>

    </article>
  `
}


function getPendingMembers() {

  return currentMembers.filter(
    member =>
      !isMemberApproved(
        member
      )
  )
}


function getApprovedMembers() {

  return currentMembers.filter(
    member =>
      isMemberApproved(
        member
      )
  )
}


function getActiveMembers() {

  return currentMembers.filter(
    member =>
      member.active !== false &&
      isMemberApproved(
        member
      )
  )
}


function deduplicateChurchAdminMembers(
  members
) {

  const seen =
    new Set()


  return members.filter(
    member => {

      const key =
        getMemberDuplicateKey(
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


function getMemberDuplicateKey(
  member
) {

  return [
    getMemberSheetKey(
      member
    ),

    normalizeText(
      member?.email
    ),

    normalizePhoneText(
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

    normalizeText(
      member?.name
    ) ||

    Math.random()
      .toString()
}


function getMemberSheetKey(
  member
) {

  const famId =
    normalizeText(
      member?.sheetFamId ||
      member?.permissions?.sheetFamId
    )


  const perId =
    normalizeText(
      member?.sheetPerId ||
      member?.permissions?.sheetPerId
    )


  if (
    famId ||
    perId
  ) {

    return `${famId}:${perId}`
  }


  return ''
}


function normalizeText(
  value
) {

  return String(
    value ||
    ''
  )
    .trim()
    .toLowerCase()
}


function normalizePhoneText(
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


function getMemberStatusLabel(
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


  return 'Pending Approval'
}


function getRoleLabel(
  roles,
  selected
) {

  return (
    roles[selected]
      ?.label ||

    'Normal Church Member'
  )
}


function getMemberAccessLabels(
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


  extraMemberPermissions.forEach(
    item => {

      if (
        source[
          item.field
        ] === true
      ) {

        labels.push(
          item.label
        )
      }
    }
  )


  return labels
}


function getAdminAccessLabels(
  adminAccess
) {

  return adminPermissions

    .filter(
      item =>
        adminAccess?.[
          item.field
        ] === true
    )

    .map(
      item =>
        item.label
    )
}


function renderPermissionBadges({
  title,
  badges
}) {

  return `
    <div
      class="church-admin-badge-group"
    >

      <strong>
        ${escapeHtml(
          title
        )}
      </strong>

      <div>

        ${
          badges.length
            ? badges
                .map(
                  badge =>
                    `
                      <span
                        class="church-admin-badge"
                      >
                        ${escapeHtml(
                          badge
                        )}
                      </span>
                    `
                )
                .join(
                  ''
                )

            : `
                <span
                  class="church-admin-muted"
                >
                  None
                </span>
              `
        }

      </div>

    </div>
  `
}


function getMemberPermissionSource(
  member
) {

  return {

    ...memberRoles[
      member.memberRole ||
      'none'
    ]?.data,

    ...(
      member.permissions ||
      member
    )
  }
}


function renderPermissionCheckboxes({
  items,
  source,
  type = 'member'
}) {

  return items

    .map(
      item => `
        <label
          class="church-admin-permission-option"
        >

          <input
            type="checkbox"

            data-${type}-permission="${escapeHtml(
              item.field
            )}"

            ${
              source?.[
                item.field
              ] === true
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


function readPermissionCheckboxes({
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


function markCurrentTab() {

  document
    .querySelectorAll(
      '[data-church-admin-tab]'
    )
    .forEach(
      button => {

        button.classList.toggle(
          'active',

          button.dataset
            .churchAdminTab ===
            currentTab
        )
      }
    )
}


function setStatus(
  message
) {

  const status =
    document.querySelector(
      '#church-admin-status'
    )


  if (status) {

    status.textContent =
      message
  }
}


function setButtonsDisabled(
  buttons,
  disabled
) {

  buttons.forEach(
    button => {

      button.disabled =
        disabled
    }
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