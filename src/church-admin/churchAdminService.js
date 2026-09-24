import {
  FirebaseFunctions
} from '@capacitor-firebase/functions'


export async function getChurchAdministrationData() {

  const result =
    await FirebaseFunctions.callByName({
      name:
        'getChurchAdministrationData',

      region:
        'europe-west1',

      data: {}
    })


  return result?.data || {}
}


export async function saveChurchMemberPermissions({
  memberId,
  uid,
  memberData,
  adminAccess
}) {

  const result =
    await FirebaseFunctions.callByName({
      name:
        'saveChurchMemberPermissions',

      region:
        'europe-west1',

      data: {
        memberId,
        uid,
        memberData,
        adminAccess
      }
    })


  return result?.data || {}
}
