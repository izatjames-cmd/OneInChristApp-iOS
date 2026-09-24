/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : AI Bible Reading
 * File   : aiBibleReadingPermissions.js
 *
 * Purpose:
 * Checks AI Bible Reading admin permission.
 * ============================================================
 */

export function canManageAiBibleReading(
  member,
  adminAccess = {}
) {

  return Boolean(
    member?.churchAdmin ||
    member?.aiBibleReadingAdmin ||
    adminAccess?.churchAdmin ||
    adminAccess?.aiBibleReadingAdmin
  )
}
