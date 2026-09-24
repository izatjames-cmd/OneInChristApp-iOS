export function canViewDanishLanguage(
  member,
  adminAccess = {}
) {

  return member?.languageSchool === true ||
    adminAccess?.languageSchoolAdmin === true ||
    adminAccess?.churchAdmin === true
}


export function canManageDanishLanguage(
  member,
  adminAccess = {}
) {

  return adminAccess?.languageSchoolAdmin === true ||
    adminAccess?.churchAdmin === true
}
