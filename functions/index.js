const {
  onDocumentCreated
} = require(
  'firebase-functions/v2/firestore'
)

const {
  onCall,
  HttpsError
} = require(
  'firebase-functions/v2/https'
)

const {
  onSchedule
} = require(
  'firebase-functions/v2/scheduler'
)

const {
  defineSecret
} = require(
  'firebase-functions/params'
)

const {
  initializeApp
} = require(
  'firebase-admin/app'
)

const {
  getFirestore
} = require(
  'firebase-admin/firestore'
)

const {
  getStorage
} = require(
  'firebase-admin/storage'
)

const {
  getMessaging
} = require(
  'firebase-admin/messaging'
)

const crypto =
  require(
    'crypto'
  )

const {
  OLD_TESTAMENT_BIBLE_READING_PASSAGES,
  NEW_TESTAMENT_BIBLE_READING_PASSAGES
} = require(
  './ai-bible-reading/passages'
)


let db
let storage
let messaging
let visionClient

const openAiApiKey =
  defineSecret(
    'OPENAI_API_KEY'
  )

const apiBibleKey =
  defineSecret(
    'API_BIBLE_KEY'
  )

const googleSheetsServiceAccount =
  defineSecret(
    'GOOGLE_SHEETS_SERVICE_ACCOUNT'
  )

const memberVerificationSheetId =
  '1dRtSJ-VhSeptEiCsJ8j3SzDPWxfOdcdNrYr4zbdC1qw'

const memberVerificationSheetRange =
  'A:G'

const dailyDevotionBibleIds = {
  english:
    '78a9f6124f344018-01',

  danish:
    '20c3695eb7339cca-01',

  urdu:
    'eecbca904435fce9-01'
}


const christianLanguageRules = require('./christianLanguageRules')

const christianUrduGenerationRules = [
  ...christianLanguageRules,
  'Urdu must use established Christian church terminology, not Islamic religious terminology.',
  'For Jesus use یسوع, یسوع مسیح, خداوند یسوع, or خداوند یسوع مسیح as the context requires.',
  'Never call Jesus حضرت عیسیٰ, عیسیٰ علیہ السلام, حضرت عیسیٰ علیہ السلام, or حضور.',
  'Do not add علیہ السلام or other Islamic honorifics to Jesus or other biblical persons.',
  'Use روح القدس for Holy Spirit, کلیسیا for Church, انجیل for Gospel, نجات for salvation, فضل for grace, صلیب for cross, and قیامت for resurrection.',
  'Use خداوند for Lord when referring to the Lord Jesus Christ.',
  'Keep the tone natural for an Urdu-speaking Christian church congregation.'
]


initializeApp()

db =
  getFirestore()

storage =
  getStorage()

messaging =
  getMessaging()


exports.sendChurchNotification =
  onDocumentCreated(
    {
      document:
        'churchNotifications/{notificationId}',

      region:
        'europe-west1'
    },

    async event => {

      const snapshot =
        event.data


      if (!snapshot) {
        return
      }


      const notification =
        snapshot.data()


      if (
        notification.sendMode !==
          'now' ||
        notification.status !==
          'pending'
      ) {

        return
      }


      try {

        const tokenSnapshot =
          await db
            .collection(
              'deviceTokens'
            )
            .get()


        const tokens =
          await getNotificationTokens({
            tokenSnapshot,
            notification
          })


        if (!tokens.length) {

          await snapshot.ref.update({
            status:
              'failed',

            error:
              'No registered device tokens found.',

            processedAt:
              new Date()
                .toISOString()
          })

          return
        }


        const message = {

          notification: {

            title:
              notification.title ||
              'One in Christ Church',

            body:
              notification.message ||
              ''
          },


          data: {

            section:
              String(
                notification.section ||
                'church'
              ),

            category:
              String(
                notification.category ||
                'general'
              ),

            targetId:
              String(
                notification.targetId ||
                ''
              ),

            notificationId:
              snapshot.id
          },


          android: {

            priority:
              'high',

            notification: {

              channelId:
                'church_notifications'
            }
          },


          tokens
        }


        const response =
          await messaging
            .sendEachForMulticast(
              message
            )


        await snapshot.ref.update({

          status:
            response.successCount > 0
              ? 'sent'
              : 'failed',

          sentCount:
            response.successCount,

          failedCount:
            response.failureCount,

          processedAt:
            new Date()
              .toISOString()
        })


      } catch (error) {

        console.error(
          'Notification sending failed:',
          error
        )


        await snapshot.ref.update({

          status:
            'failed',

          error:
            error?.message ||
            String(
              error
            ),

          processedAt:
            new Date()
              .toISOString()
        })
      }
    }
  )



exports.cleanupExpiredChurchNotifications =
  onSchedule(
    {
      schedule:
        'every day 03:15',

      timeZone:
        'Europe/Copenhagen',

      region:
        'europe-west1'
    },

    async () => {

      const retentionDays =
        7

      const cutoffTime =
        Date.now() -
        retentionDays *
        24 *
        60 *
        60 *
        1000


      const snapshot =
        await db
          .collection(
            'churchNotifications'
          )
          .get()


      const expiredDocuments =
        snapshot.docs.filter(
          document => {

            const data =
              document.data() || {}

            const value =
              data.createdAt ||
              data.date ||
              ''


            if (!value) {
              return false
            }


            const createdTime =
              new Date(
                value
              )
                .getTime()


            return (
              !Number.isNaN(
                createdTime
              ) &&
              createdTime <
                cutoffTime
            )
          }
        )


      let deletedCount =
        0


      for (
        let index = 0;
        index < expiredDocuments.length;
        index += 400
      ) {

        const batch =
          db.batch()


        expiredDocuments
          .slice(
            index,
            index + 400
          )
          .forEach(
            document => {
              batch.delete(
                document.ref
              )
            }
          )


        await batch.commit()


        deletedCount +=
          Math.min(
            400,
            expiredDocuments.length -
              index
          )
      }


      console.log(
        `Deleted ${deletedCount} church notifications older than ${retentionDays} days.`
      )
    }
  )


async function getNotificationTokens({
  tokenSnapshot,
  notification
}) {

  if (notification.audience === 'choir') {
    return getChoirNotificationTokens(
      tokenSnapshot
    )
  }

  if (
    !isAdminNotificationAudience(
      notification.audience
    )
  ) {

    return tokenSnapshot.docs
      .map(
        doc =>
          doc.data()?.token
      )
      .filter(
        Boolean
      )
  }


  const tokens = []


  await Promise.all(
    tokenSnapshot.docs.map(
      async doc => {

        const access =
          await db
            .collection(
              'adminAccess'
            )
            .doc(
              doc.id
            )
            .get()

        const data =
          access.data() || {}


        if (
          canReceiveAdminNotification({
            audience:
              notification.audience,
            access:
              data
          })
        ) {
          const token =
            doc.data()?.token

          if (token) {
            tokens.push(
              token
            )
          }
        }
      }
    )
  )


  return tokens
}


async function getChoirNotificationTokens(
  tokenSnapshot
) {

  const tokens = []


  await Promise.all(
    tokenSnapshot.docs.map(
      async doc => {

        const uid =
          doc.id

        const [
          memberDocument,
          accessDocument
        ] =
          await Promise.all([
            db
              .collection(
                'members'
              )
              .doc(
                uid
              )
              .get(),

            db
              .collection(
                'adminAccess'
              )
              .doc(
                uid
              )
              .get()
          ])

        const member =
          memberDocument.data() || {}

        const access =
          accessDocument.data() || {}


        if (
          member.choir === true ||
          member.choirPlanning === true ||
          access.choirAdmin === true ||
          access.choirPlanning === true ||
          access.churchAdmin === true
        ) {
          const token =
            doc.data()?.token

          if (token) {
            tokens.push(
              token
            )
          }
        }
      }
    )
  )


  return tokens
}


function isAdminNotificationAudience(
  audience
) {

  return [
    'aiBibleReadingAdmin',
    'dailyDevotionAdmin',
    'choirAdmin'
  ].includes(
    audience
  )
}


function canReceiveAdminNotification({
  audience,
  access
}) {

  if (access.churchAdmin === true) {
    return true
  }

  if (audience === 'aiBibleReadingAdmin') {
    return access.aiBibleReadingAdmin === true
  }

  if (audience === 'dailyDevotionAdmin') {
    return access.dailyDevotionAdmin === true
  }

  if (audience === 'choirAdmin') {
    return access.choirAdmin === true ||
      access.choirPlanning === true
  }

  return false
}


exports.readChoirLyricsTitle =
  onCall(
    {
      region:
        'europe-west1'
    },

    async request => {

      if (!request.auth?.uid) {

        throw new HttpsError(
          'unauthenticated',
          'Please sign in first.'
        )
      }


      const uid =
        request.auth.uid


      const storagePath =
        String(
          request.data
            ?.storagePath ||
          ''
        ).trim()


      if (!storagePath) {

        throw new HttpsError(
          'invalid-argument',
          'Storage path is required.'
        )
      }


      /*
       * Restrict OCR access to images
       * uploaded by the current user
       * inside the Choir lyrics folder.
       */
      if (
        !storagePath.startsWith(
          `choirLyrics/${uid}/`
        )
      ) {

        throw new HttpsError(
          'permission-denied',
          'This image cannot be accessed.'
        )
      }


      /*
       * Verify Choir Admin permission.
       */
      const adminDocument =
        await db
          .collection(
            'adminAccess'
          )
          .doc(
            uid
          )
          .get()


      if (
        !adminDocument.exists ||
        adminDocument.data()
          ?.choirAdmin !== true
      ) {

        throw new HttpsError(
          'permission-denied',
          'Choir Admin permission is required.'
        )
      }


      try {

        const bucket =
          storage.bucket()


        const file =
          bucket.file(
            storagePath
          )


        const [
          exists
        ] =
          await file.exists()


        if (!exists) {

          throw new HttpsError(
            'not-found',
            'The lyrics image could not be found.'
          )
        }


        const [
          imageBuffer
        ] =
          await file.download()


        const [
          result
        ] =
          await getVisionClient()
            .documentTextDetection({
              image: {
                content:
                  imageBuffer
              }
            })


        const fullText =
          String(
            result
              ?.fullTextAnnotation
              ?.text ||
            ''
          ).trim()


        if (!fullText) {

          return {
            title:
              '',

            textDetected:
              false
          }
        }


        const title =
          findLikelyTitle(
            fullText
          )


        return {

          title,

          textDetected:
            true
        }


      } catch (error) {

        console.error(
          'Choir OCR failed:',
          error
        )


        if (
          error instanceof
          HttpsError
        ) {

          throw error
        }


        throw new HttpsError(
          'internal',
          'Unable to read the hymn title from the image.'
        )
      }
    }
  )


exports.verifyMemberFromSheet =
  onCall(
    {
      region:
        'europe-west1',

      secrets: [
        googleSheetsServiceAccount
      ]
    },

    async request => {

      if (!request.auth?.uid) {

        throw new HttpsError(
          'unauthenticated',
          'Please sign in first.'
        )
      }


      const uid =
        request.auth.uid

      const email =
        normalizeMemberEmail(
          request.data?.email ||
          request.auth.token?.email ||
          ''
        )

      const phone =
        normalizeMemberPhone(
          request.data?.phone ||
          ''
        )


      if (
        !email ||
        !phone
      ) {

        throw new HttpsError(
          'invalid-argument',
          'Email and telephone number are required.'
        )
      }


      try {

        const rows =
          await getMemberVerificationSheetRows()

        const match =
          findMemberVerificationRow({
            rows,
            email,
            phone
          })

        const existingMemberDocument =
          await findMemberDocumentByContact({
            uid,
            email,
            phone,
            sheetFamId:
              match?.FAMID,
            sheetPerId:
              match?.PERID,
            sheetEmail:
              match?.EMAIL,
            sheetPhone:
              match?.TELEFON
          })

        const memberReference =
          existingMemberDocument?.ref ||
          db
            .collection(
              'members'
            )
            .doc(
              uid
            )

        const existingMember =
          existingMemberDocument?.data() ||
          {}

        const now =
          new Date()
            .toISOString()


        if (match) {

          await memberReference.set(
            {
              uid,
              authUid:
                uid,
              email:
                email ||
                normalizeMemberEmail(
                  match.EMAIL
                ),
              phone:
                phone ||
                String(
                  match.TELEFON || ''
                ).trim(),
              name:
                existingMember.name ||
                String(
                  match.NAVN || ''
                ).trim(),
              verifiedFromSheet:
                true,
              matchedBy:
                match.__matchedBy,
              sheetFamId:
                String(
                  match.FAMID || ''
                ).trim(),
              sheetPerId:
                String(
                  match.PERID || ''
                ).trim(),
              sheetName:
                String(
                  match.NAVN || ''
                ).trim(),
              sheetAge:
                String(
                  match.ALDER || ''
                ).trim(),
              sheetPhone:
                String(
                  match.TELEFON || ''
                ).trim(),
              sheetEmail:
                normalizeMemberEmail(
                  match.EMAIL
                ),
              sheetAddress:
                String(
                  match.ADRESSE || ''
                ).trim(),
              memberStatus:
                existingMember.approved === true
                  ? existingMember.memberStatus || 'approved'
                  : 'pendingApproval',
              approved:
                existingMember.approved === true,
              active:
                existingMember.active === false
                  ? false
                  : true,
              createdAt:
                existingMember.createdAt ||
                now,
              updatedAt:
                now
            },
            {
              merge:
                true
            }
          )


          return {
            verifiedFromSheet:
              true,
            matchedBy:
              match.__matchedBy,
            memberStatus:
              existingMember.approved === true
                ? existingMember.memberStatus || 'approved'
                : 'pendingApproval',
            name:
              existingMember.name ||
              String(
                match.NAVN || ''
              ).trim()
          }
        }


        await memberReference.set(
          {
            uid,
            authUid:
              uid,
            email,
            phone,
            verifiedFromSheet:
              false,
            matchedBy:
              '',
            memberStatus:
              existingMember.approved === true
                ? existingMember.memberStatus || 'approved'
                : 'guest',
            approved:
              existingMember.approved === true,
            active:
              existingMember.active === true,
            createdAt:
              existingMember.createdAt ||
              now,
            updatedAt:
              now
          },
          {
            merge:
              true
          }
        )


        return {
          verifiedFromSheet:
            false,
          matchedBy:
            '',
          memberStatus:
            existingMember.approved === true
              ? existingMember.memberStatus || 'approved'
              : 'guest',
          name:
            existingMember.name || ''
        }

      } catch (error) {

        console.error(
          'Member sheet verification failed:',
          error
        )


        if (
          error instanceof
          HttpsError
        ) {

          throw error
        }


        throw new HttpsError(
          'internal',
          'Unable to verify member from church list.'
        )
      }
    }
  )


exports.getChurchAdministrationData =
  onCall(
    {
      region:
        'europe-west1',
      secrets:
        [
          googleSheetsServiceAccount
        ]
    },

    async request => {

      if (!request.auth?.uid) {

        throw new HttpsError(
          'unauthenticated',
          'Please sign in first.'
        )
      }


      await requireChurchAdmin(
        request.auth.uid
      )

      let memberVerificationRows =
        []


      try {

        memberVerificationRows =
          await getMemberVerificationSheetRows()

      } catch (error) {

        logger.warn(
          'Unable to load member verification sheet for church admin names.',
          error
        )
      }


      const [
        membersSnapshot,
        adminAccessSnapshot
      ] =
        await Promise.all([
          db
            .collection(
              'members'
            )
            .limit(
              200
            )
            .get(),

          db
            .collection(
              'adminAccess'
            )
            .get()
        ])

      const adminAccessByUid =
        {}


      adminAccessSnapshot.docs.forEach(
        doc => {

          adminAccessByUid[doc.id] =
            doc.data() || {}
        }
      )


      const memberSummaries =
        membersSnapshot.docs
          .map(
            doc => {

              const member =
                doc.data() || {}

              const uid =
                String(
                  member.uid ||
                  member.authUid ||
                  doc.id
                ).trim()

              const approved =
                member.approved === true ||
                member.memberStatus === 'approved'

              const sheetMatch =
                findMemberSheetRowByContact({
                  rows:
                    memberVerificationRows,
                  email:
                    member.email ||
                    member.sheetEmail ||
                    '',
                  phone:
                    member.phone ||
                    member.sheetPhone ||
                    ''
                })


              return {
                id:
                  doc.id,
                uid,
                name:
                  String(
                    member.name ||
                    member.sheetName ||
                    sheetMatch?.NAVN ||
                    ''
                  ).trim(),
                email:
                  String(
                    member.email ||
                    member.sheetEmail ||
                    sheetMatch?.EMAIL ||
                    ''
                  ).trim(),
                phone:
                  String(
                    member.phone ||
                    member.sheetPhone ||
                    sheetMatch?.TELEFON ||
                    ''
                  ).trim(),
                sheetFamId:
                  String(
                    member.sheetFamId ||
                    sheetMatch?.FAMID ||
                    ''
                  ).trim(),
                sheetPerId:
                  String(
                    member.sheetPerId ||
                    sheetMatch?.PERID ||
                    ''
                  ).trim(),
                memberStatus:
                  approved
                    ? 'approved'
                    : String(
                        member.memberStatus ||
                        'pendingApproval'
                      ).trim(),
                approved:
                  approved,
                active:
                  member.active !== false,
                verifiedFromSheet:
                  member.verifiedFromSheet === true ||
                  Boolean(
                    sheetMatch
                  ),
                memberRole:
                  String(
                    member.memberRole ||
                    ''
                  ).trim(),
                permissions:
                  member,
                adminAccess:
                  adminAccessByUid[uid] || {}
              }
            }
          )

      const members =
        deduplicateChurchAdminMembers(
          memberSummaries
        )
          .sort(
            (first, second) => {

              if (
                first.approved !==
                second.approved
              ) {
                return first.approved ? 1 : -1
              }


              return String(
                first.name ||
                first.email
              ).localeCompare(
                String(
                  second.name ||
                  second.email
                )
              )
            }
          )


      return {
        members
      }
    }
  )


exports.saveChurchMemberPermissions =
  onCall(
    {
      region:
        'europe-west1'
    },

    async request => {

      if (!request.auth?.uid) {

        throw new HttpsError(
          'unauthenticated',
          'Please sign in first.'
        )
      }


      const requesterAdminAccess =
        await requireChurchAdmin(
          request.auth.uid
        )

      const memberId =
        String(
          request.data?.memberId ||
          ''
        ).trim()

      const uid =
        String(
          request.data?.uid ||
          memberId
        ).trim()


      if (
        !memberId ||
        !uid
      ) {

        throw new HttpsError(
          'invalid-argument',
          'Member id is required.'
        )
      }


      const memberData =
        sanitizeChurchMemberPermissions(
          request.data?.memberData
        )

      const adminAccess =
        sanitizeChurchAdminAccess(
          request.data?.adminAccess
        )


      const existingAdminAccessDocument =
        await db
          .collection(
            'adminAccess'
          )
          .doc(
            uid
          )
          .get()

      const existingAdminAccess =
        existingAdminAccessDocument.exists
          ? existingAdminAccessDocument.data() || {}
          : {}


      requireChiefAdminForProtectedChanges({
        requesterAdminAccess,
        existingAdminAccess,
        adminAccess
      })


      await db
        .collection(
          'members'
        )
        .doc(
          memberId
        )
        .set(
          {
            ...memberData,
            uid,
            authUid:
              uid,
            updatedAt:
              new Date()
                .toISOString()
          },
          {
            merge:
              true
          }
        )

      await db
        .collection(
          'adminAccess'
        )
        .doc(
          uid
        )
        .set(
          {
            ...adminAccess,
            updatedAt:
              new Date()
                .toISOString()
          },
          {
            merge:
              true
          }
        )


      return {
        saved:
          true,
        memberId,
        uid,
        memberData,
        adminAccess
      }
    }
  )


exports.generateDailyDevotion =
  onCall(
    {
      region:
        'europe-west1',

      secrets: [
        openAiApiKey,
        apiBibleKey
      ]
    },

    async request => {

      if (!request.auth?.uid) {

        throw new HttpsError(
          'unauthenticated',
          'Please sign in first.'
        )
      }


      const uid =
        request.auth.uid

      const adminDocument =
        await db
          .collection(
            'adminAccess'
          )
          .doc(
            uid
          )
          .get()


      if (
        !adminDocument.exists ||
        (
          adminDocument.data()
            ?.churchAdmin !== true &&
          adminDocument.data()
            ?.dailyDevotionAdmin !== true
        )
      ) {

        throw new HttpsError(
          'permission-denied',
          'Daily Devotion Admin permission is required.'
        )
      }


      const apiKey =
        openAiApiKey.value()

      const bibleApiKey =
        apiBibleKey.value()


      if (!apiKey) {

        throw new HttpsError(
          'failed-precondition',
          'OPENAI_API_KEY is not configured.'
        )
      }


      if (!bibleApiKey) {

        throw new HttpsError(
          'failed-precondition',
          'API_BIBLE_KEY is not configured.'
        )
      }


      const date =
        String(
          request.data
            ?.date ||
          ''
        ).trim()


      const recentDevotions =
        await getRecentDailyDevotionSummaries()

      const blockedPassages =
        await getBlockedBiblePassageSummaries({
          days:
            90
        })

      const recentDevotionText =
        recentDevotions.length
          ? [
              'Do not use these recent Bible references or repeat their main themes:',
              ...recentDevotions.map(
                devotion =>
                  `- ${devotion.verseReference}: ${devotion.explanation}`
              )
            ].join('\n')
          : ''

      const blockedPassageText =
        createBlockedBiblePassageText(
          blockedPassages,
          'last 90 days'
        )

      const nextTestament =
        getNextDailyDevotionTestament(
          recentDevotions[0]
        )


      const prompt =
        [
          'Create one Christian Daily Devotion for church members.',
          `Choose the Bible passage from the ${nextTestament}.`,
          'Alternate between Old Testament and New Testament from one devotion to the next.',
          'Choose a fresh Bible passage, fresh theme, fresh application, and fresh prayer.',
          'Avoid commonly repeated passages when recent devotions already used them.',
          'Do not use any Bible passage that was used in Daily Devotion or Bible Reading during the last 90 days.',
          'Do not create teaching that conflicts with recent Daily Devotion or Bible Reading reflections.',
          'Return only valid JSON with these exact fields:',
          'passageId, verseReference, explanation, application, prayer, translations.',
          'The passageId must be a valid API.Bible passage id, such as JHN.3.16 or JHN.3.1-JHN.3.16.',
          'For verse ranges, always use the full API.Bible range form: MAT.5.14-MAT.5.16, not MAT.5.14-16.',
          'The explanation must be simple practical English, maximum 5 to 6 short lines.',
          'Use respectful biblical and church language while explaining the text.',
          'The application must answer: What Would Jesus Do? Connect the verse to one clear real-life situation that church members may face. Then explain how Jesus would think, speak, act, show mercy, obey the Father, and lead us by his example in that situation. Make it practical, reflective, and Christ-centered, so members can look at Jesus as their mirror and example.',
          'The prayer must be short, around 100 to 150 words.',
          "The prayer must end naturally and grammatically in each language with this meaning: We ask this in your beloved Son and our Lord Jesus Christ's name. Amen.",
          'Translations must contain danish and urdu objects.',
          'Each translation object must contain: explanation, application, prayer.',
          'Translate meaning and context, not word by word.',
          'Keep the spiritual meaning, biblical respect, and church tone.',
          'Use simple natural Danish for Danish-speaking church members.',
          'Use respectful Christian church Urdu for Urdu-speaking church members.',
          'For Urdu AI-written explanation, application, and prayer, use simple Urdu words where possible instead of English expressions.',
          'For Urdu AI-written text about God, Jesus Christ, and Scripture, use respectful forms such as آپ, فرماتے ہیں, and کہتے ہیں. Do not use casual forms such as تم, کہتا ہے, or disrespectful singular address.',
          'For Urdu, use vocabulary commonly used in Urdu-speaking churches.',
          ...christianUrduGenerationRules,
          'For the Urdu prayer ending, use خداوند for Lord, not رب. The Urdu ending should be natural Christian church Urdu and carry this meaning: ہم یہ دعا آپ کے پیارے بیٹے اور ہمارے خداوند یسوع مسیح کے نام میں مانگتے ہیں اور پا لیتے ہیں۔ آمین۔',
          'Do not add new doctrine, remove meaning, or use Islamic theological phrasing where Christian wording is needed.',
          'Keep translated explanations maximum 5 to 6 short lines.',
          'Generate a completely new devotion, not only one changed section.',
          blockedPassageText,
          recentDevotionText,
          date
            ? `Calendar date: ${date}.`
            : ''
        ]
          .filter(
            Boolean
          )
          .join('\n')


      try {

        const response =
          await fetch(
            'https://api.openai.com/v1/responses',
            {
              method:
                'POST',

              headers: {
                Authorization:
                  `Bearer ${apiKey}`,

                'Content-Type':
                  'application/json'
              },

              body:
                JSON.stringify({
                  model:
                    process.env.OPENAI_MODEL ||
                    'gpt-4o-mini',

                  input:
                    prompt,

                  text: {
                    format: {
                      type:
                        'json_object'
                    }
                  }
                })
            }
          )


        const result =
          await response.json()


        if (!response.ok) {

          console.error(
            'Daily Devotion generation failed:',
            result
          )

          throw new HttpsError(
            'internal',
            result?.error?.message ||
            'Unable to generate Daily Devotion.'
          )
        }


        const outputText =
          result.output_text ||
          result.output
            ?.flatMap(
              item =>
                item.content || []
            )
            ?.map(
              item =>
                item.text || ''
            )
            ?.join('') ||
          ''


        const devotion =
          JSON.parse(
            outputText
          )

        const passageId =
          normalizeApiBiblePassageId(
            devotion.passageId
          )


        if (!passageId) {

          throw new HttpsError(
            'internal',
            'Daily Devotion passage id was not generated.'
          )
        }


        const biblePassages =
          await getDailyDevotionBiblePassages({
            apiKey:
              bibleApiKey,
            passageId
          })


        return {
          passageId,

          verseReference:
            biblePassages.english.reference ||
            String(
              devotion.verseReference ||
              ''
            ).trim(),

          verseText:
            biblePassages.english.text,

          explanation:
            String(
              devotion.explanation || ''
            ).trim(),

          application:
            String(
              devotion.application || ''
            ).trim(),

          prayer:
            String(
              devotion.prayer || ''
            ).trim(),

          translations: {
            danish:
              {
                ...normalizeDailyDevotionTranslation(
                  devotion.translations
                    ?.danish
                ),

                verseReference:
                  biblePassages.danish.reference,

                verseText:
                  biblePassages.danish.text
              },

            urdu:
              {
                ...normalizeDailyDevotionTranslation(
                  devotion.translations
                    ?.urdu
                ),

                verseReference:
                  biblePassages.urdu.reference,

                verseText:
                  biblePassages.urdu.text
              }
          }
        }

      } catch (error) {

        console.error(
          'Daily Devotion generation failed:',
          error
        )


        if (
          error instanceof
          HttpsError
        ) {

          throw error
        }


        throw new HttpsError(
          'internal',
          'Unable to generate Daily Devotion.'
        )
      }
    }
  )


exports.scheduleDailyDevotionAdminReminder =
  onSchedule(
    {
      schedule:
        'every day 20:00',

      timeZone:
        'Europe/Copenhagen',

      region:
        'europe-west1'
    },

    async () => {

      const date =
        new Date()
          .toISOString()
          .slice(0, 10)

      const existing =
        await db
          .collection(
            'churchNotifications'
          )
          .where(
            'category',
            '==',
            'dailyDevotion'
          )
          .where(
            'audience',
            '==',
            'dailyDevotionAdmin'
          )
          .where(
            'reminderDate',
            '==',
            date
          )
          .limit(
            1
          )
          .get()


      if (!existing.empty) {
        return
      }


      await db
        .collection(
          'churchNotifications'
        )
        .doc(
          `NOTIFICATION_${Date.now()}`
        )
        .set({
          title:
            'Daily Devotion Reminder',
          message:
            "Please prepare and approve tomorrow's Daily Devotion. Members will be notified at 7:30 in the morning after approval.",
          category:
            'dailyDevotion',
          section:
            'daily-devotion',
          audience:
            'dailyDevotionAdmin',
          targetId:
            'admin',
          sendMode:
            'now',
          status:
            'pending',
          reminderDate:
            date,
          createdBy:
            'system',
          createdAt:
            new Date().toISOString()
        })
    }
  )


exports.scheduleDailyDevotionMemberNotification =
  onSchedule(
    {
      schedule:
        'every day 07:30',

      timeZone:
        'Europe/Copenhagen',

      region:
        'europe-west1'
    },

    async () => {

      const snapshot =
        await db
          .collection(
            'dailyDevotions'
          )
          .where(
            'status',
            '==',
            'approved'
          )
          .where(
            'published',
            '==',
            true
          )
          .limit(
            25
          )
          .get()


      if (snapshot.empty) {
        return
      }


      const devotion =
        snapshot.docs
          .sort(
            (first, second) => {
              const firstDate =
                first.data()?.approvedAt ||
                first.data()?.createdAt ||
                ''

              const secondDate =
                second.data()?.approvedAt ||
                second.data()?.createdAt ||
                ''

              return secondDate.localeCompare(
                firstDate
              )
            }
          )
          .find(
          doc =>
            doc.data()?.notificationSent !== true
          )


      if (!devotion) {
        return
      }


      await db
        .collection(
          'churchNotifications'
        )
        .doc(
          `NOTIFICATION_${Date.now()}`
        )
        .set({
          title:
            'Daily Devotion',
          message:
            "Today's Daily Devotion is now available.",
          category:
            'dailyDevotion',
          section:
            'daily-devotion',
          audience:
            '',
          targetId:
            'devotion',
          sendMode:
            'now',
          status:
            'pending',
          createdBy:
            'system',
          createdAt:
            new Date().toISOString()
        })


      await devotion.ref.update({
        notificationSent:
          true,
        notificationSentAt:
          new Date().toISOString(),
        updatedAt:
          new Date().toISOString()
      })
    }
  )


exports.generateAiBibleReading =
  onCall(
    {
      region:
        'europe-west1',

      secrets: [
        openAiApiKey,
        apiBibleKey
      ]
    },

    async request => {

      if (!request.auth?.uid) {

        throw new HttpsError(
          'unauthenticated',
          'Please sign in first.'
        )
      }


      const uid =
        request.auth.uid

      await requireAiBibleReadingAdmin(
        uid
      )


      return generateAiBibleReadingContent({
        apiKey:
          openAiApiKey.value(),
        bibleApiKey:
          apiBibleKey.value(),
        date:
          request.data?.date
      })
    }
  )


exports.scheduleAiBibleReading =
  onSchedule(
    {
      schedule:
        'every day 19:00',

      timeZone:
        'Europe/Copenhagen',

      region:
        'europe-west1',

      secrets: [
        openAiApiKey,
        apiBibleKey
      ]
    },

    async () => {

      const date =
        new Date()
          .toISOString()
          .slice(0, 10)

      const existing =
        await db
          .collection(
            'aiBibleReadings'
          )
          .where(
            'date',
            '==',
            date
          )
          .where(
            'status',
            '==',
            'pending'
          )
          .limit(
            1
          )
          .get()


      if (!existing.empty) {
        return
      }


      const reading =
        await generateAiBibleReadingContent({
          apiKey:
            openAiApiKey.value(),
          bibleApiKey:
            apiBibleKey.value(),
          date
        })

      const id =
        `AI_BIBLE_READING_${Date.now()}`


      await db
        .collection(
          'aiBibleReadings'
        )
        .doc(
          id
        )
        .set({
          date,
          status:
            'pending',
          passageId:
            reading.passageId || '',
          verseReference:
            reading.verseReference || '',
          verseText:
            reading.verseText || '',
          reflection:
            reading.reflection || '',
          questions:
            reading.questions || [],
          translations:
            reading.translations || {},
          published:
            false,
          memberNotificationSent:
            false,
          generatedByAI:
            true,
          createdBy:
            'system',
          createdAt:
            new Date().toISOString(),
          publishedAt:
            '',
          publishedBy:
            '',
          updatedAt:
            new Date().toISOString()
        })

      await db
        .collection(
          'churchNotifications'
        )
        .doc(
          `NOTIFICATION_${Date.now()}`
        )
        .set({
          title:
            'Bible Reading Ready',
          message:
            "Today's Bible Reading is ready for review.",
          category:
            'aiBibleReading',
          section:
            'ai-bible-reading',
          audience:
            'aiBibleReadingAdmin',
          targetId:
            'admin',
          sendMode:
            'now',
          status:
            'pending',
          createdBy:
            'system',
          createdAt:
            new Date().toISOString()
        })
    }
  )


exports.scheduleAiBibleReadingMemberNotification =
  onSchedule(
    {
      schedule:
        'every day 20:00',

      timeZone:
        'Europe/Copenhagen',

      region:
        'europe-west1'
    },

    async () => {

      const date =
        new Date()
          .toISOString()
          .slice(0, 10)

      const snapshot =
        await db
          .collection(
            'aiBibleReadings'
          )
          .where(
            'date',
            '==',
            date
          )
          .where(
            'status',
            '==',
            'approved'
          )
          .where(
            'published',
            '==',
            true
          )
          .limit(
            1
          )
          .get()


      if (snapshot.empty) {
        return
      }


      const reading =
        snapshot.docs[0]

      const data =
        reading.data() || {}


      if (data.memberNotificationSent === true) {
        return
      }


      await db
        .collection(
          'churchNotifications'
        )
        .doc(
          `NOTIFICATION_${Date.now()}`
        )
        .set({
          title:
            'Bible Reading',
          message:
            "Today's Bible Reading is now available.",
          category:
            'aiBibleReading',
          section:
            'ai-bible-reading',
          audience:
            '',
          targetId:
            'reading',
          sendMode:
            'now',
          status:
            'pending',
          createdBy:
            'system',
          createdAt:
            new Date().toISOString()
        })

      await reading.ref.update({
        memberNotificationSent:
          true,
        memberNotificationSentAt:
          new Date().toISOString(),
        updatedAt:
          new Date().toISOString()
      })
    }
  )


async function requireAiBibleReadingAdmin(
  uid
) {

  const adminDocument =
    await db
      .collection(
        'adminAccess'
      )
      .doc(
        uid
      )
      .get()


  if (
    !adminDocument.exists ||
    (
      adminDocument.data()
        ?.churchAdmin !== true &&
      adminDocument.data()
        ?.aiBibleReadingAdmin !== true
    )
  ) {

    throw new HttpsError(
      'permission-denied',
      'Bible Reading Admin permission is required.'
    )
  }
}


async function generateAiBibleReadingContent({
  apiKey,
  bibleApiKey,
  date
}) {

  if (!apiKey) {

    throw new HttpsError(
      'failed-precondition',
      'OPENAI_API_KEY is not configured.'
    )
  }


  if (!bibleApiKey) {

    throw new HttpsError(
      'failed-precondition',
      'API_BIBLE_KEY is not configured.'
    )
  }


  const recentReadings =
    await getRecentAiBibleReadingSummaries()

  const blockedPassages =
    await getBlockedBiblePassageSummaries({
      months:
        6
    })

  const nextTestament =
    getNextDailyDevotionTestament(
      recentReadings[0]
    )

  const selectedPassageId =
    await reserveAiBibleReadingPassageId({
      testament:
        nextTestament,
      blockedPassages
    })

  const blockedPassageText =
    createBlockedBiblePassageText(
      blockedPassages,
      'last 6 months'
    )

  const prompt =
    [
      'Create one AI Bible Reading for church members.',
      `Use exactly this API.Bible passage id: ${selectedPassageId}.`,
      `This passage is from the ${nextTestament}.`,
      'Do not choose a different passage id.',
      'This passage has passed the six-month no-repeat check and is reserved for this Bible Reading.',
      'Return only valid JSON with these exact fields:',
      'passageId, verseReference, reflection, questions, translations.',
      `The passageId field must be exactly: ${selectedPassageId}.`,
      'The reflection must be simple, biblical, practical, and maximum 5 to 6 short lines.',
      'Do not create teaching that conflicts with recent Daily Devotion or Bible Reading reflections.',
      'The questions field must be an array of 3 to 4 thoughtful questions.',
      'Questions must not ask members to type answers in the app.',
      'Questions must help church members reflect on daily life, choices, worries, forgiveness, obedience, mercy, family, work, and following Jesus.',
      'Translations must contain danish and urdu objects.',
      'Each translation object must contain: reflection and questions.',
      'Translate meaning and context, not word by word.',
      'Use natural Danish for Danish-speaking church members.',
      'Use respectful Christian church Urdu for Urdu-speaking church members.',
      'For Urdu AI-written reflection and questions, use simple Urdu words where possible instead of English expressions.',
      'For Urdu AI-written text about God, Jesus Christ, and Scripture, use respectful forms such as آپ, فرماتے ہیں, and کہتے ہیں. Do not use casual forms such as تم, کہتا ہے, or disrespectful singular address.',
      'For Urdu, use vocabulary commonly used in Urdu-speaking churches.',
      ...christianUrduGenerationRules,
      'Do not translate the Bible passage text yourself; only translate the reflection and questions.',
      blockedPassageText,
      recentReadings.length
        ? [
            'Do not use these recent references:',
            ...recentReadings.map(
              reading =>
                `- ${reading.passageId || reading.verseReference}`
            )
          ].join('\n')
        : '',
      date
        ? `Calendar date: ${String(date).trim()}.`
        : ''
    ]
      .filter(
        Boolean
      )
      .join('\n')


  const response =
    await fetch(
      'https://api.openai.com/v1/responses',
      {
        method:
          'POST',

        headers: {
          Authorization:
            `Bearer ${apiKey}`,

          'Content-Type':
            'application/json'
        },

        body:
          JSON.stringify({
            model:
              process.env.OPENAI_MODEL ||
              'gpt-4o-mini',

            input:
              prompt,

            text: {
              format: {
                type:
                  'json_object'
              }
            }
          })
      }
    )

  const result =
    await response.json()


  if (!response.ok) {

    console.error(
      'AI Bible Reading generation failed:',
      result
    )

    throw new HttpsError(
      'internal',
      result?.error?.message ||
      'Unable to generate Bible Reading.'
    )
  }


  const outputText =
    result.output_text ||
    result.output
      ?.flatMap(
        item =>
          item.content || []
      )
      ?.map(
        item =>
          item.text || ''
      )
      ?.join('') ||
    ''

  const generated =
    JSON.parse(
      outputText
    )

  const passageId =
    normalizeApiBiblePassageId(
      selectedPassageId
    )


  if (!passageId) {

    throw new HttpsError(
      'internal',
      'Bible Reading passage id was not generated.'
    )
  }


  const biblePassages =
    await getDailyDevotionBiblePassages({
      apiKey:
        bibleApiKey,
      passageId
    })


  return {
    passageId,

    verseReference:
      biblePassages.english.reference ||
      String(
        generated.verseReference ||
        ''
      ).trim(),

    verseText:
      biblePassages.english.text,

    reflection:
      String(
        generated.reflection || ''
      ).trim(),

    questions:
      normalizeBibleReadingQuestions(
        generated.questions
      ),

    translations: {
      danish:
        {
          ...normalizeAiBibleReadingTranslation(
            generated.translations
              ?.danish
          ),

          verseReference:
            biblePassages.danish.reference,

          verseText:
            biblePassages.danish.text
        },

      urdu:
        {
          ...normalizeAiBibleReadingTranslation(
            generated.translations
              ?.urdu
          ),

          verseReference:
            biblePassages.urdu.reference,

          verseText:
            biblePassages.urdu.text
        }
    }
  }
}


function normalizeAiBibleReadingTranslation(
  translation
) {

  return {
    verseReference:
      String(
        translation?.verseReference || ''
      ).trim(),

    verseText:
      String(
        translation?.verseText || ''
      ).trim(),

    reflection:
      String(
        translation?.reflection || ''
      ).trim(),

    questions:
      normalizeBibleReadingQuestions(
        translation?.questions
      )
  }
}


function normalizeBibleReadingQuestions(
  questions
) {

  if (Array.isArray(questions)) {

    return questions
      .map(
        question =>
          String(
            question || ''
          ).trim()
      )
      .filter(Boolean)
      .slice(
        0,
        4
      )
  }


  return String(
    questions || ''
  )
    .split(/\r?\n/)
    .map(
      question =>
        question
          .replace(/^\s*[-0-9.)]+\s*/, '')
          .trim()
    )
    .filter(Boolean)
    .slice(
      0,
      4
    )
}


async function getRecentAiBibleReadingSummaries() {

  try {

    const snapshot =
      await db
        .collection(
          'aiBibleReadings'
        )
        .orderBy(
          'createdAt',
          'desc'
        )
        .limit(
          20
        )
        .get()


    return snapshot.docs.map(
      doc => {

        const reading =
          doc.data() || {}


        return {
          verseReference:
            String(
              reading.verseReference || ''
            ).trim(),

          passageId:
            String(
              reading.passageId || ''
            ).trim()
        }
      }
    )

  } catch (error) {

    console.error(
      'Unable to read recent Bible Readings:',
      error
    )

    return []
  }
}


async function reserveAiBibleReadingPassageId({
  testament,
  blockedPassages
}) {

  const passages =
    testament === 'Old Testament'
      ? OLD_TESTAMENT_BIBLE_READING_PASSAGES
      : NEW_TESTAMENT_BIBLE_READING_PASSAGES

  const blockedIds =
    new Set(
      blockedPassages
        .map(
          passage =>
            normalizeApiBiblePassageId(
              passage.passageId
            )
        )
        .filter(Boolean)
    )

  const candidates =
    shuffleBibleReadingPassages(
      passages.filter(
        passageId =>
          !blockedIds.has(
            normalizeApiBiblePassageId(
              passageId
            )
          )
      )
    )

  const cutoff =
    getBibleReadingRepeatCutoff()


  for (
    const passageId
    of candidates
  ) {

    const normalizedPassageId =
      normalizeApiBiblePassageId(
        passageId
      )

    const usageReference =
      db
        .collection(
          'aiBibleReadingPassageUsage'
        )
        .doc(
          createBibleReadingPassageUsageId(
            normalizedPassageId
          )
        )

    const reserved =
      await db.runTransaction(
        async transaction => {

          const usageSnapshot =
            await transaction.get(
              usageReference
            )

          if (usageSnapshot.exists) {

            const usage =
              usageSnapshot.data() || {}

            const lastSelectedAt =
              parseStoredDate(
                usage.lastSelectedAt
              )

            if (
              lastSelectedAt &&
              lastSelectedAt >= cutoff
            ) {
              return false
            }
          }


          const now =
            new Date()
              .toISOString()


          transaction.set(
            usageReference,
            {
              passageId:
                normalizedPassageId,

              testament,

              lastSelectedAt:
                now,

              repeatBlockedUntil:
                addMonthsToIsoDate(
                  now,
                  6
                ),

              updatedAt:
                now
            },
            {
              merge:
                true
            }
          )


          return true
        }
      )


    if (reserved) {
      return normalizedPassageId
    }
  }


  throw new HttpsError(
    'resource-exhausted',
    `No fresh ${testament} Bible Reading passage is available. Every configured passage has been used during the last six months.`
  )
}


function getBibleReadingRepeatCutoff() {

  const cutoff =
    new Date()

  cutoff.setMonth(
    cutoff.getMonth() - 6
  )

  return cutoff
}


function addMonthsToIsoDate(
  isoDate,
  months
) {

  const date =
    new Date(
      isoDate
    )

  date.setMonth(
    date.getMonth() + months
  )

  return date.toISOString()
}


function createBibleReadingPassageUsageId(
  passageId
) {

  return crypto
    .createHash(
      'sha256'
    )
    .update(
      String(
        passageId || ''
      )
    )
    .digest(
      'hex'
    )
    .slice(
      0,
      40
    )
}


function shuffleBibleReadingPassages(
  passages
) {

  const result =
    [
      ...passages
    ]


  for (
    let index =
      result.length - 1;
    index > 0;
    index -= 1
  ) {

    const randomIndex =
      crypto.randomInt(
        index + 1
      )

    ;[
      result[index],
      result[randomIndex]
    ] = [
      result[randomIndex],
      result[index]
    ]
  }


  return result
}

async function getBlockedBiblePassageSummaries({
  days = 0,
  months = 0
}) {

  const cutoff =
    new Date()


  if (months > 0) {

    cutoff.setMonth(
      cutoff.getMonth() - months
    )

  } else {

    cutoff.setDate(
      cutoff.getDate() - days
    )
  }


  const [
    devotions,
    readings
  ] =
    await Promise.all([
      getRecentCollectionPassages({
        collection:
          'dailyDevotions',
        source:
          'Daily Devotion',
        cutoff
      }),

      getRecentCollectionPassages({
        collection:
          'aiBibleReadings',
        source:
          'Bible Reading',
        cutoff
      })
    ])


  return [
    ...devotions,
    ...readings
  ]
}


async function getRecentCollectionPassages({
  collection,
  source,
  cutoff
}) {

  try {

    const snapshot =
      await db
        .collection(
          collection
        )
        .orderBy(
          'createdAt',
          'desc'
        )
        .limit(
          500
        )
        .get()


    return snapshot.docs
      .map(
        doc => {

          const data =
            doc.data() || {}

          const createdAt =
            parseStoredDate(
              data.createdAt ||
              data.date ||
              ''
            )


          if (
            !createdAt ||
            createdAt < cutoff
          ) {
            return null
          }


          return {
            source,
            passageId:
              normalizeApiBiblePassageId(
                data.passageId
              ),
            verseReference:
              String(
                data.verseReference || ''
              ).trim(),
            summary:
              String(
                data.explanation ||
                data.reflection ||
                ''
              )
                .replace(
                  /\s+/g,
                  ' '
                )
                .trim()
                .slice(
                  0,
                  220
                )
          }
        }
      )
      .filter(Boolean)

  } catch (error) {

    console.error(
      `Unable to read ${collection} passage history:`,
      error
    )

    return []
  }
}


function parseStoredDate(
  value
) {

  if (!value) {
    return null
  }


  if (
    typeof value.toDate ===
    'function'
  ) {

    const date =
      value.toDate()

    return Number.isNaN(
      date?.getTime?.()
    )
      ? null
      : date
  }


  if (
    typeof value.seconds ===
    'number'
  ) {

    const date =
      new Date(
        value.seconds * 1000
      )

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date
  }


  if (
    typeof value._seconds ===
    'number'
  ) {

    const date =
      new Date(
        value._seconds * 1000
      )

    return Number.isNaN(
      date.getTime()
    )
      ? null
      : date
  }


  const date =
    new Date(
      value
    )


  return Number.isNaN(
    date.getTime()
  )
    ? null
    : date
}


function createBlockedBiblePassageText(
  blockedPassages,
  windowLabel = 'recent exclusion period'
) {

  if (!blockedPassages.length) {
    return ''
  }


  return [
    `Blocked Bible passages from the ${windowLabel}. Do not use these passages and do not conflict with their teaching:`,
    ...blockedPassages.map(
      passage =>
        `- ${passage.source}: ${passage.passageId || passage.verseReference} ${passage.summary}`
    )
  ].join('\n')
}


function getVisionClient() {

  if (visionClient) {
    return visionClient
  }


  /*
   * Load Google Vision only when
   * Choir OCR is actually used.
   *
   * This keeps Firebase function
   * discovery fast during deploy.
   */
  const vision =
    require(
      '@google-cloud/vision'
    )


  visionClient =
    new vision.ImageAnnotatorClient()


  return visionClient
}


function normalizeMemberEmail(
  email
) {

  return String(
    email || ''
  )
    .trim()
    .toLowerCase()
}


function normalizeMemberPhone(
  phone
) {

  return String(
    phone || ''
  )
    .replace(
      /[^\d+]/g,
      ''
    )
    .replace(
      /^00/,
      '+'
    )
}


function memberPhonesMatch(
  first,
  second
) {

  const firstPhone =
    normalizeMemberPhone(
      first
    )

  const secondPhone =
    normalizeMemberPhone(
      second
    )


  if (
    !firstPhone ||
    !secondPhone
  ) {
    return false
  }


  if (firstPhone === secondPhone) {
    return true
  }


  const firstDigits =
    firstPhone.replace(
      /\D/g,
      ''
    )

  const secondDigits =
    secondPhone.replace(
      /\D/g,
      ''
    )


  if (
    !firstDigits ||
    !secondDigits ||
    firstDigits.length < 7 ||
    secondDigits.length < 7
  ) {
    return false
  }


  return (
    firstDigits.endsWith(
      secondDigits
    ) ||
    secondDigits.endsWith(
      firstDigits
    )
  )
}


async function findMemberDocumentByEmail(
  email
) {

  if (!email) {
    return null
  }


  const snapshot =
    await db
      .collection(
        'members'
      )
      .where(
        'email',
        '==',
        email
      )
      .limit(
        1
      )
      .get()


  if (snapshot.empty) {
    return null
  }


  return snapshot.docs[0]
}


async function findMemberDocumentByContact({
  uid,
  email,
  phone,
  sheetFamId,
  sheetPerId,
  sheetEmail,
  sheetPhone
}) {

  const candidates =
    []

  const addCandidate =
    doc => {

      if (
        doc?.exists &&
        !candidates.some(
          candidate =>
            candidate.id === doc.id
        )
      ) {

        candidates.push(
          doc
        )
      }
    }

  const addQuery =
    async (
      field,
      value
    ) => {

      if (!value) {
        return
      }


      const snapshot =
        await db
          .collection(
            'members'
          )
          .where(
            field,
            '==',
            value
          )
          .limit(
            5
          )
          .get()


      snapshot.docs.forEach(
        addCandidate
      )
    }

  const normalizedEmail =
    normalizeMemberEmail(
      email ||
      sheetEmail ||
      ''
    )

  const normalizedPhone =
    normalizeMemberPhone(
      phone ||
      sheetPhone ||
      ''
    )

  const normalizedSheetFamId =
    String(
      sheetFamId || ''
    ).trim()

  const normalizedSheetPerId =
    String(
      sheetPerId || ''
    ).trim()


  if (uid) {

    const currentMember =
      await db
        .collection(
          'members'
        )
        .doc(
          uid
        )
        .get()

    addCandidate(
      currentMember
    )
  }


  await addQuery(
    'email',
    normalizedEmail
  )

  await addQuery(
    'sheetEmail',
    normalizedEmail
  )

  await addQuery(
    'sheetFamId',
    normalizedSheetFamId
  )

  await addQuery(
    'sheetPerId',
    normalizedSheetPerId
  )

  await addQuery(
    'phone',
    normalizedPhone
  )

  await addQuery(
    'sheetPhone',
    String(
      sheetPhone || ''
    ).trim()
  )


  if (!candidates.length) {
    return null
  }


  return candidates.sort(
    (first, second) => {

      const firstData =
        first.data() || {}

      const secondData =
        second.data() || {}


      if (
        firstData.approved === true &&
        secondData.approved !== true
      ) {
        return -1
      }


      if (
        firstData.approved !== true &&
        secondData.approved === true
      ) {
        return 1
      }


      if (
        first.id === uid &&
        second.id !== uid
      ) {
        return -1
      }


      if (
        first.id !== uid &&
        second.id === uid
      ) {
        return 1
      }


      return String(
        firstData.createdAt ||
        ''
      ).localeCompare(
        String(
          secondData.createdAt ||
          ''
        )
      )
    }
  )[0]
}


async function getMemberVerificationSheetRows() {

  const serviceAccount =
    parseGoogleSheetsServiceAccount()

  const accessToken =
    await getGoogleSheetsAccessToken(
      serviceAccount
    )

  const url =
    `https://sheets.googleapis.com/v4/spreadsheets/${memberVerificationSheetId}/values/${encodeURIComponent(memberVerificationSheetRange)}`

  const response =
    await fetch(
      url,
      {
        method:
          'GET',

        headers: {
          Authorization:
            `Bearer ${accessToken}`
        }
      }
    )

  const result =
    await response.json()


  if (!response.ok) {

    console.error(
      'Google Sheet lookup failed:',
      result
    )

    throw new HttpsError(
      'internal',
      result?.error?.message ||
      'Unable to read church member list.'
    )
  }


  const values =
    Array.isArray(
      result.values
    )
      ? result.values
      : []


  if (values.length < 2) {
    return []
  }


  const headers =
    values[0].map(
      header =>
        String(
          header || ''
        )
          .trim()
          .toUpperCase()
    )


  return values.slice(
    1
  )
    .map(
      row =>
        row.reduce(
          (record, value, index) => {

            record[
              headers[index] || `COLUMN_${index}`
            ] =
              String(
                value || ''
              ).trim()


            return record
          },
          {}
        )
    )
}


function parseGoogleSheetsServiceAccount() {

  const rawSecret =
    googleSheetsServiceAccount.value()


  if (!rawSecret) {

    throw new HttpsError(
      'failed-precondition',
      'GOOGLE_SHEETS_SERVICE_ACCOUNT is not configured.'
    )
  }


  try {

    const serviceAccount =
      JSON.parse(
        rawSecret
      )


    if (
      !serviceAccount.client_email ||
      !serviceAccount.private_key
    ) {

      throw new Error(
        'Missing service account fields.'
      )
    }


    return serviceAccount

  } catch (error) {

    console.error(
      'Invalid Google Sheets service account secret:',
      error
    )


    throw new HttpsError(
      'failed-precondition',
      'GOOGLE_SHEETS_SERVICE_ACCOUNT is invalid.'
    )
  }
}


async function getGoogleSheetsAccessToken(
  serviceAccount
) {

  const now =
    Math.floor(
      Date.now() / 1000
    )

  const header =
    {
      alg:
        'RS256',
      typ:
        'JWT'
    }

  const claim =
    {
      iss:
        serviceAccount.client_email,
      scope:
        'https://www.googleapis.com/auth/spreadsheets.readonly',
      aud:
        'https://oauth2.googleapis.com/token',
      iat:
        now,
      exp:
        now + 3600
    }

  const unsignedToken =
    [
      base64UrlEncodeJson(
        header
      ),
      base64UrlEncodeJson(
        claim
      )
    ].join('.')

  const signature =
    crypto
      .createSign(
        'RSA-SHA256'
      )
      .update(
        unsignedToken
      )
      .sign(
        serviceAccount.private_key,
        'base64url'
      )

  const assertion =
    `${unsignedToken}.${signature}`

  const response =
    await fetch(
      'https://oauth2.googleapis.com/token',
      {
        method:
          'POST',

        headers: {
          'Content-Type':
            'application/x-www-form-urlencoded'
        },

        body:
          new URLSearchParams({
            grant_type:
              'urn:ietf:params:oauth:grant-type:jwt-bearer',
            assertion
          })
      }
    )

  const result =
    await response.json()


  if (
    !response.ok ||
    !result.access_token
  ) {

    console.error(
      'Google access token request failed:',
      result
    )

    throw new HttpsError(
      'internal',
      result?.error_description ||
      'Unable to authorize Google Sheets.'
    )
  }


  return result.access_token
}


function base64UrlEncodeJson(
  value
) {

  return Buffer
    .from(
      JSON.stringify(
        value
      )
    )
    .toString(
      'base64url'
    )
}


function findMemberVerificationRow({
  rows,
  email,
  phone
}) {

  const normalizedEmail =
    normalizeMemberEmail(
      email
    )

  const normalizedPhone =
    normalizeMemberPhone(
      phone
    )


  for (
    const row
    of rows
  ) {

    if (
      normalizedEmail &&
      normalizedPhone &&
      normalizeMemberEmail(
        row.EMAIL
      ) === normalizedEmail &&
      memberPhonesMatch(
        row.TELEFON,
        normalizedPhone
      )
    ) {

      return {
        ...row,
        __matchedBy:
          'emailPhone'
      }
    }

  }


  return null
}


function findMemberSheetRowByContact({
  rows,
  email,
  phone
}) {

  const normalizedEmail =
    normalizeMemberEmail(
      email
    )

  const normalizedPhone =
    normalizeMemberPhone(
      phone
    )


  return rows.find(
    row =>
      (
        normalizedEmail &&
        normalizeMemberEmail(
          row.EMAIL
        ) === normalizedEmail
      ) ||
      (
        normalizedPhone &&
        memberPhonesMatch(
          row.TELEFON,
          normalizedPhone
        )
      )
  ) || null
}


function deduplicateChurchAdminMembers(
  members
) {

  const membersByKey =
    new Map()


  members.forEach(
    member => {

      const emailKey =
        normalizeMemberEmail(
          member.email
        )

      const phoneKey =
        normalizeMemberPhone(
          member.phone
        )

      const key =
        emailKey ||
        phoneKey ||
        member.uid ||
        member.id

      const existingMember =
        membersByKey.get(
          key
        )


      if (
        !existingMember ||
        shouldUseMemberSummary(
          member,
          existingMember
        )
      ) {

        membersByKey.set(
          key,
          member
        )
      }
    }
  )


  return Array.from(
    membersByKey.values()
  )
}


function shouldUseMemberSummary(
  member,
  existingMember
) {

  if (
    member.approved === true &&
    existingMember.approved !== true
  ) {
    return true
  }


  if (
    member.active === true &&
    existingMember.active !== true
  ) {
    return true
  }


  if (
    member.name &&
    !existingMember.name
  ) {
    return true
  }


  return String(
    member.id ||
    ''
  ).localeCompare(
    String(
      existingMember.id ||
      ''
    )
  ) < 0
}


async function requireChurchAdmin(
  uid
) {

  const adminDocument =
    await db
      .collection(
        'adminAccess'
      )
      .doc(
        uid
      )
      .get()

  const adminAccess =
    adminDocument.data() || {}


  if (
    !adminDocument.exists ||
    adminAccess.churchAdmin !== true
  ) {

    throw new HttpsError(
      'permission-denied',
      'Church Admin permission is required.'
    )
  }


  return adminAccess
}


function sanitizeChurchMemberPermissions(
  data = {}
) {

  return {
    approved:
      data.approved === true,
    active:
      data.approved === true
        ? true
        : data.active !== false,
    memberStatus:
      data.approved === true
        ? 'approved'
        : String(
            data.memberStatus ||
            'pendingApproval'
          ).trim(),
    memberRole:
      String(
        data.memberRole || ''
      ).trim(),
    name:
      String(
        data.name || ''
      ).trim(),
    email:
      normalizeMemberEmail(
        data.email || ''
      ),
    phone:
      String(
        data.phone || ''
      ).trim(),
    church:
      data.church === true,
    food:
      data.food === true,
    choir:
      data.choir === true,
    youth:
      data.youth === true,
    prayer:
      data.prayer === true,
    sundaySchool:
      data.sundaySchool === true,
    plan:
      data.plan === true,
    board:
      data.board === true,
    scripturePreparation:
      data.scripturePreparation === true,
    languageSchool:
      data.languageSchool === true
  }
}


function sanitizeChurchAdminAccess(
  data = {}
) {

  return {
    churchAdmin:
      data.churchAdmin === true,
    foodAdmin:
      data.foodAdmin === true,
    choirAdmin:
      data.choirAdmin === true,
    choirPlanning:
      data.choirPlanning === true,
    youthAdmin:
      data.youthAdmin === true,
    prayerAdmin:
      data.prayerAdmin === true,
    prayerLeader:
      data.prayerLeader === true,
    sundaySchoolAdmin:
      data.sundaySchoolAdmin === true,
    sundaySchoolTeacher:
      data.sundaySchoolTeacher === true,
    planAdmin:
      data.planAdmin === true,
    scripturePreparationAdmin:
      data.scripturePreparationAdmin === true,
    dailyDevotionAdmin:
      data.dailyDevotionAdmin === true,
    aiBibleReadingAdmin:
      data.aiBibleReadingAdmin === true,
    languageSchoolAdmin:
      data.languageSchoolAdmin === true,
    chiefAdministrator:
      data.chiefAdministrator === true
  }
}


function requireChiefAdminForProtectedChanges({
  requesterAdminAccess,
  existingAdminAccess,
  adminAccess
}) {

  const protectedFields =
    [
      'churchAdmin',
      'planAdmin',
      'scripturePreparationAdmin',
      'dailyDevotionAdmin',
      'aiBibleReadingAdmin',
      'languageSchoolAdmin',
      'chiefAdministrator'
    ]

  const changesProtectedField =
    protectedFields.some(
      field =>
        (
          adminAccess[field] === true &&
          existingAdminAccess[field] !== true
        ) ||
        (
          adminAccess[field] !== true &&
          existingAdminAccess[field] === true
        )
    )


  if (
    changesProtectedField &&
    requesterAdminAccess
      ?.chiefAdministrator !== true
  ) {

    throw new HttpsError(
      'permission-denied',
      'Chief Administrator permission is required for this admin role.'
    )
  }
}


function findLikelyTitle(
  fullText
) {

  const lines =
    String(
      fullText || ''
    )
      .split(
        /\r?\n/
      )
      .map(
        line =>
          line
            .replace(
              /\s+/g,
              ' '
            )
            .trim()
      )
      .filter(
        Boolean
      )


  if (!lines.length) {

    return ''
  }


  /*
   * Hymn sheets normally place the
   * title near the top of the page.
   */
  const candidates =
    lines.slice(
      0,
      6
    )


  for (
    const line
    of candidates
  ) {

    if (
      line.length >= 2 &&
      line.length <= 120
    ) {

      return line
    }
  }


  return candidates[0] || ''
}


function normalizeDailyDevotionTranslation(
  translation
) {

  return {
    verseReference:
      String(
        translation?.verseReference || ''
      ).trim(),

    verseText:
      String(
        translation?.verseText || ''
      ).trim(),

    explanation:
      String(
        translation?.explanation || ''
      ).trim(),

    application:
      String(
        translation?.application || ''
      ).trim(),

    prayer:
      String(
        translation?.prayer || ''
    ).trim()
  }
}


async function getDailyDevotionBiblePassages({
  apiKey,
  passageId
}) {

  const [
    english,
    danish,
    urdu
  ] =
    await Promise.all([
      getApiBiblePassage({
        apiKey,
        bibleId:
          dailyDevotionBibleIds.english,
        passageId
      }),

      getApiBiblePassage({
        apiKey,
        bibleId:
          dailyDevotionBibleIds.danish,
        passageId
      }),

      getApiBiblePassage({
        apiKey,
        bibleId:
          dailyDevotionBibleIds.urdu,
        passageId
      })
    ])


  return {
    english,
    danish,
    urdu
  }
}


function normalizeApiBiblePassageId(
  passageId
) {

  const normalized =
    String(
      passageId || ''
    )
      .trim()
      .toUpperCase()
      .replace(
        /:/g,
        '.'
      )
      .replace(
        /\s+/g,
        ''
      )

  const shorthandRange =
    normalized.match(
      /^([1-3]?[A-Z]{2,3})\.([0-9]+)\.([0-9]+)-([0-9]+)$/
    )


  if (shorthandRange) {

    return `${shorthandRange[1]}.${shorthandRange[2]}.${shorthandRange[3]}-${shorthandRange[1]}.${shorthandRange[2]}.${shorthandRange[4]}`
  }


  const fullRange =
    normalized.match(
      /^([1-3]?[A-Z]{2,3})\.([0-9]+)\.([0-9]+)-([1-3]?[A-Z]{2,3})\.([0-9]+)\.([0-9]+)$/
    )


  if (fullRange) {
    return normalized
  }


  const singleVerse =
    normalized.match(
      /^([1-3]?[A-Z]{2,3})\.([0-9]+)\.([0-9]+)$/
    )


  if (singleVerse) {
    return normalized
  }


  return normalized
}


async function getApiBiblePassage({
  apiKey,
  bibleId,
  passageId
}) {

  const response =
    await fetch(
      `https://rest.api.bible/v1/bibles/${bibleId}/passages/${encodeURIComponent(passageId)}`,
      {
        method:
          'GET',

        headers: {
          'api-key':
            apiKey
        }
      }
    )

  const result =
    await response.json()


  if (!response.ok) {

    console.error(
      'API.Bible passage lookup failed:',
      result
    )

    throw new HttpsError(
      'internal',
      result?.message ||
      'Unable to load Bible passage.'
    )
  }


  return {
    reference:
      String(
        result?.data?.reference ||
        ''
      ).trim(),

    text:
      cleanBiblePassageText(
        result?.data?.content
      )
  }
}


function cleanBiblePassageText(
  content
) {

  return String(
    content || ''
  )
    .replace(
      /<style[\s\S]*?<\/style>/gi,
      ''
    )
    .replace(
      /<script[\s\S]*?<\/script>/gi,
      ''
    )
    .replace(
      /<sup[^>]*>[\s\S]*?<\/sup>/gi,
      ''
    )
    .replace(
      /<[^>]+>/g,
      ' '
    )
    .replace(
      /&nbsp;/g,
      ' '
    )
    .replace(
      /&amp;/g,
      '&'
    )
    .replace(
      /&quot;/g,
      '"'
    )
    .replace(
      /&#39;/g,
      "'"
    )
    .replace(
      /\s+/g,
      ' '
    )
    .trim()
}


async function getRecentDailyDevotionSummaries() {

  try {

    const snapshot =
      await db
        .collection(
          'dailyDevotions'
        )
        .orderBy(
          'createdAt',
          'desc'
        )
        .limit(
          20
        )
        .get()


    return snapshot.docs
      .map(
        doc => {

          const devotion =
            doc.data() || {}


          return {
            verseReference:
              String(
                devotion.verseReference || ''
              ).trim(),

            passageId:
              String(
                devotion.passageId || ''
              ).trim(),

            explanation:
              String(
                devotion.explanation || ''
              )
                .replace(
                  /\s+/g,
                  ' '
                )
                .trim()
                .slice(
                  0,
                  180
                )
          }
        }
      )
      .filter(
        devotion =>
          devotion.verseReference ||
          devotion.explanation
      )

  } catch (error) {

    console.error(
      'Unable to read recent Daily Devotions:',
      error
    )

    return []
  }
}


function getNextDailyDevotionTestament(
  previousDevotion
) {

  const previousTestament =
    getDailyDevotionTestament(
      previousDevotion?.passageId ||
      previousDevotion?.verseReference
    )


  if (previousTestament === 'Old Testament') {
    return 'New Testament'
  }


  if (previousTestament === 'New Testament') {
    return 'Old Testament'
  }


  return 'New Testament'
}


function getDailyDevotionTestament(
  reference
) {

  const bookId =
    String(
      reference || ''
    )
      .trim()
      .split(
        /[.\s:]/
      )[0]
      .toUpperCase()


  if (!bookId) {
    return ''
  }


  const newTestamentBooks =
    new Set([
      'MAT',
      'MRK',
      'LUK',
      'JHN',
      'ACT',
      'ROM',
      '1CO',
      '2CO',
      'GAL',
      'EPH',
      'PHP',
      'COL',
      '1TH',
      '2TH',
      '1TI',
      '2TI',
      'TIT',
      'PHM',
      'HEB',
      'JAS',
      '1PE',
      '2PE',
      '1JN',
      '2JN',
      '3JN',
      'JUD',
      'REV'
    ])


  if (
    newTestamentBooks.has(
      bookId
    )
  ) {
    return 'New Testament'
  }


  return 'Old Testament'
}

/*
 * Scripture Preparation Bible selector.
 * Kept in a separate module so the API key remains server-side.
 */
exports.scriptureBibleLookup =
  require('./scriptureBible')
    .scriptureBibleLookup

/*
 * Live Sermon Translation.
 * Azure Speech credentials remain server-side and the mobile app receives
 * only a short-lived authorization token.
 */
exports.liveSermonSpeechToken =
  require('./liveSermonTranslation')
    .liveSermonSpeechToken
