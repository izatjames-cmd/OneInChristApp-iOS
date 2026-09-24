/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Sunday School
 * File   : sundaySchoolPermissions.js
 *
 * Purpose:
 * Handles permission checks for the Sunday School module.
 * ============================================================
 */

export function isSundaySchoolMember(member) {
  return Boolean(
    member?.sundaySchool ||
    member?.sundaySchoolMember
  )
}


export function isSundaySchoolTeacher(member, adminAccess = {}) {
  return Boolean(
    member?.sundaySchoolTeacher ||
    adminAccess?.sundaySchoolTeacher
  )
}


export function isSundaySchoolAdmin(member, adminAccess = {}) {
  return Boolean(
    member?.sundaySchoolAdmin ||
    adminAccess?.sundaySchoolAdmin ||
    adminAccess?.churchAdmin
  )
}


export function canTeachSundaySchool(member, adminAccess = {}) {
  return isSundaySchoolTeacher(member, adminAccess) ||
    isSundaySchoolAdmin(member, adminAccess)
}


export function canManageSundaySchool(member, adminAccess = {}) {
  return isSundaySchoolAdmin(member, adminAccess)
}
