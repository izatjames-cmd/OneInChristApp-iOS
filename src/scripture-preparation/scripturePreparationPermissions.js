export function canPrepareScripture(
  member,
  adminAccess = {}
) {

  return Boolean(
    member?.scripturePreparation ||
    member?.scripturePreparationMember ||
    adminAccess?.scripturePreparation ||
    adminAccess?.scripturePreparationAdmin ||
    adminAccess?.churchAdmin
  )
}


export function canManageScripturePreparation(
  member,
  adminAccess = {}
) {

  return Boolean(
    adminAccess?.scripturePreparationAdmin ||
    adminAccess?.planAdmin ||
    adminAccess?.churchAdmin ||
    member?.scripturePreparationAdmin
  )
}

export function canCommunicateScripturePreparation(member, adminAccess = {}) {
  return Boolean(
    canManageScripturePreparation(member, adminAccess) ||
    member?.scripturePreparation ||
    member?.scripturePreparationMember ||
    adminAccess?.scripturePreparation
  )
}
