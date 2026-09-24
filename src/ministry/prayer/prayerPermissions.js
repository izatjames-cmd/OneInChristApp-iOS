/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Prayer
 * File   : prayerPermissions.js
 *
 * Purpose:
 * Handles permission checks for the Prayer module.
 * ============================================================
 */

export function isPrayerMember(
  member
) {

  return Boolean(
    member?.prayer ||
    member?.prayerMember
  )
}


export function isPrayerLeader(
  member,
  adminAccess = {}
) {

  return Boolean(
    member?.prayerLeader ||
    adminAccess?.prayerLeader
  )
}


export function isPrayerAdmin(
  member,
  adminAccess = {}
) {

  return Boolean(
    member?.prayerAdmin ||
    adminAccess?.prayerAdmin ||
    adminAccess?.churchAdmin
  )
}


export function canManagePrayer(
  member,
  adminAccess = {}
) {

  return isPrayerLeader(
    member,
    adminAccess
  ) ||
    isPrayerAdmin(
      member,
      adminAccess
    )
}


export function canDeletePrayer(
  member,
  adminAccess = {}
) {

  return isPrayerAdmin(
    member,
    adminAccess
  )
}
