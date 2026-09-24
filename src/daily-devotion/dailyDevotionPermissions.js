/**
 * ============================================================
 * OneInChristApp
 * ============================================================
 * Module : Daily Devotion
 * File   : dailyDevotionPermissions.js
 *
 * Purpose:
 * Checks Daily Devotion admin permission.
 * ============================================================
 */

export function canManageDailyDevotion(
  member,
  adminAccess = {}
) {

  return Boolean(
    member?.churchAdmin ||
    member?.dailyDevotionAdmin ||
    adminAccess?.churchAdmin ||
    adminAccess?.dailyDevotionAdmin
  )
}
