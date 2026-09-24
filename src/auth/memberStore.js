import { FirebaseFirestore } from '@capacitor-firebase/firestore'

export async function findApprovedMemberByEmail(email) {
  const result = await FirebaseFirestore.getCollection({
    reference: 'members',
    compositeFilter: {
      type: 'and',
      queryConstraints: [
        {
          type: 'where',
          fieldPath: 'email',
          opStr: '==',
          value: email
        },
        {
          type: 'where',
          fieldPath: 'approved',
          opStr: '==',
          value: true
        }
      ]
    }
  })

  if (!result.snapshots || result.snapshots.length === 0) {
    return null
  }

  const first = result.snapshots[0]

  return {
    id: first.id,
    ...first.data
  }
}