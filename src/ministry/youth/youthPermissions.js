/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Youth
 * File   : youthPermissions.js
 *
 * Purpose:
 * Handles permission checks for the Youth module.
 * ============================================================
 */

export const YOUTH_ROLES = {
  MEMBER: 'member',
  LEADER: 'leader',
  ADMIN: 'admin'
}

export function isYouthMember(
  member
) {
  return Boolean(
    member?.youth ||
    member?.youthMember
  )
}

export function isYouthLeader(
  member,
  adminAccess = {}
) {
  return Boolean(
    member?.youthLeader ||
    adminAccess?.youthLeader
  )
}

export function isYouthAdmin(
  member,
  adminAccess = {}
) {
  return Boolean(
    member?.youthAdmin ||
    adminAccess?.youthAdmin
  )
}

export function canManageYouth(
  member,
  adminAccess = {}
) {
  return isYouthLeader(
    member,
    adminAccess
  ) ||
    isYouthAdmin(
      member,
      adminAccess
    )
}

export function canEditYouth(
  member,
  adminAccess = {}
) {
  return canManageYouth(
    member,
    adminAccess
  )
}

export function canDeleteYouth(
  member,
  adminAccess = {}
) {
  return isYouthAdmin(
    member,
    adminAccess
  )
}

export function canPublishYouth(
  member,
  adminAccess = {}
) {
  return canManageYouth(
    member,
    adminAccess
  )
}
