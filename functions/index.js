const functions = require('firebase-functions')
const admin = require('firebase-admin')
const express = require('express')
const axios = require('axios')
const path = require('path')

// ***************************************************************
// Util imports
// ***************************************************************
const userUtils = require(path.join(__dirname, '/utils', '/userUtils'))
const userEmails = require(path.join(__dirname, '/emails', '/userEmails'))
const stripeUtils = require(path.join(__dirname, '/stripe', '/stripeUtils'))
const policyUtils = require(path.join(__dirname, '/policies', '/policyUtils'))
// const policyUtils = require(path.join(__dirname, '/policies', '/policyUtils')) // Removed by Jonty to satisfy linting for no-unused-vars
const { policyObjectGenerator } = require(path.join(__dirname, '/policies', '/policyObjectGenerator'))
// notification services
const notifications = require(path.join(__dirname, '/utils', '/notifications'))
// slack service
const { slack } = require(path.join(__dirname, '/utils', '/slackService.js'))

// ***************************************************************
// ENVIRONMENT
// **************************************************************
// const productionEnv = (process.env.NODE_ENV === 'production')

// ***************************************************************
// SETUP
// ***************************************************************

const config = require(path.join(__dirname, 'config.js'))

// init firebase app
const serviceAccount = require(path.join(__dirname, config.serviceAccount))
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: ''
})

// firestore timestampsInSnapshots settings error fix
admin.firestore().settings({ timestampsInSnapshots: true })

// Set up the express app, cookieParser and cors.
const cookieParser = require('cookie-parser')()
const app = express()

// ***************************************************************
// START THE EXPRESS MIDDLEWARE
// ***************************************************************

// tell the app to user cookieParser middleware
app.use(cookieParser)

// Some custom cors middleware for security.
app.use(function (req, res, next) {
  res.header('Access-Control-Allow-Origin', '*')
  res.header('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept')
  next()
})

// Log the route for error tracing in FB console logs
app.use((req, res, next) => {
  console.log(req.url)
  next()
})

// Custom middleware to check if stripe webhook is actually coming from stripe
// this prevents anyone sending a request to the webhook url and potentially causeing data issues.
const { validateStripeWebHook } = require(path.join(__dirname, '/middleware', '/validateStripeWebHook.js'))

// validate user on request
// const { validateFirebaseIdToken } = require('./middleware/validateFirebaseIdToken.js')

// ***************************************************************
// START THE API END POINTS
// ***************************************************************

// ************* BLANK TEMPLATE *************
// app.post('/api/test', validateFirebaseIdToken, async (req, res) => {
//   const { uid, email } = req.user
//   const { datFromRequest } = req.body
//   try {
//     await doSomething(uid, email, datFromRequest)
//     return res.status(200).send('Done!')
//   } catch (e) {
//     console.error(e)
//     return res.status(422).send(e.message)
//   }
// })

// ************* Ingest webhooks from legacy Gravity Forms system  *************
// Data received is stored in documents with UID comprised of (Gravity forms form ID)-(Gravity forms entry ID), nested under a document for each brand - determined by the API key used.
app.post('/api/gf-webhooks-ingest', async (req, res) => {
  const requestData = req.body
  const { apikey } = req.headers // Get the api key from the request
  const id = `${requestData.form_id}-${requestData.id}`
  try {
    // const { id } = await admin.firestore().collection('data-ingest').add(requestData)
    const apikeyResults = await admin.firestore().collection('apikeys').doc('gf-webhooks-ingest').collection('apikeys').where('keys', 'array-contains', apikey).get()
    // console.log(apikeyResults)
    if (apikeyResults.size === 0) {
      console.log('Authorisation rejected with key: ', apikey)
      return res.status(403).send('Not authorised')
    }
    if (apikeyResults.size > 1) {
      console.log('Duplicate API key found in database:', apikey)
      return res.status(403).send('Not authorised - duplicate key found')
    }
    let { brandCode } = apikeyResults.docs[0].data()
    // await admin.firestore().collection('data-ingest').doc(brandCode).collection('gf-webhooks-ingest').doc(id).set({
    await admin.firestore().doc(`data-ingest/${brandCode || 'no-brand-code'}/gf-webhooks-ingest/${id}`).set({
      data: requestData,
      meta: {
        timestampRecieved: new Date().toISOString()
      }
    })
    console.log('Document written with ID: ', id)
    return res.status(200).send({
      status: 'Accepted',
      requestData // Means requestData:requestData in ES6
      // requestData: { customThing: 'something', ...requestData }
    })
  } catch (e) {
    console.error('Error adding document: ', e)
    return res.status(500).send(e.message)
  }
})

// ************* Use an email address to create a new email verification code *************
app.post('/api/request-email-verification-code', async (req, res) => {
  const { email } = req.body
  try {
    const userID = await userUtils.getUserIDFromEmail(email)
    const newCode = Math.floor(Math.random() * 90000) + 10000
    await userUtils.updateUserEmailVerificationCode(userID, newCode)
    await userEmails.sendUserEmailVerificationCode(email, newCode)
    return res.status(200).send()
  } catch (e) {
    console.error(e)
    return res.status(403).send(e.message)
  }
})

// ************* Verify users email address with code *************
app.post('/api/verify-email', async (req, res) => {
  const { email, code } = req.body
  try {
    const userID = await userUtils.getUserIDFromEmail(email) // will throw if user doesn't exist
    await userUtils.verifyUserEmailAddress(userID, code) // will throw error if bad code
    res.status(200).send(true)
    return userUtils.deleteUserEmailVerificationCode(userID)
  } catch (e) {
    console.error(e)
    return res.status(403).send(e.message)
  }
})

// ************* Check that a user exists for any given email address *************
app.post('/api/checkUserExists', async (req, res) => {
  const { email } = req.body
  if (!email) { return res.status(400).send('No email address to check!') }
  try {
    const userID = await userUtils.getUserIDFromEmail(email)
    return res.json({ exists: !!userID })
  } catch (e) {
    return res.json({ exists: false })
  }
})

// ************* Verify Bank details for Direct Debit through PCA Predict *************
app.post('/api/verifyBankDetails', async (req, res) => {
  const { sortCode, accountNumber } = req.body

  try {
    let response = await axios.get(`https://services.postcodeanywhere.co.uk/BankAccountValidation/Interactive/Validate/v2.00/json.ws?Key=${config.pcaPaymentVerificationKey}&AccountNumber=${accountNumber}&SortCode=${sortCode}`)
    let data = response.data[0]

    // return false if dd verfication is false.
    if (data.IsCorrect === 'False') {
      return res.status(200).send({ verified: false, data: data.StatusInformation })
    }

    // return false if account is not capable of direct debit.
    if (response.data[0].IsDirectDebitCapable === 'False') {
      return res.status(200).send({ verified: false, data: 'NotDirectDebitCapable' })
    }

    // otherwise, we're all good so return true
    return res.status(200).send({ verified: true, data })
  } catch (e) {
    console.log(e)
    return res.status(400).send(e)
  }
})

// ************* Payment endpoint for Equipment sales through stripe *************
app.post('/api/billing/stripe/subscription/create/:product/:plan', async (req, res) => {
  const { product, plan } = req.params
  const {
    userID, // uid of user logged in who is purchasing
    userDetails, // object details of user logged in who is purchasing
    source, // token of card details
    quantity, // amount of cover to purchase - see stripe plans
    email, // email of user logged in who is purchasing
    brandCode, // brandCode of brand purchased through
    affiliateCode, // affiliateCode of affiliate purchased through
    channel, // Channel purchased through ie - web-direct
    policyData // Data for the policy including the policy holder data and details
  } = req.body
  try {
    // see if customer exists in stripe by looking for the user's doc
    // if user exists their stripeCustomerID will be on their root user doc.
    let stripeCustomerID = await stripeUtils.getUsersStripeCustomerID(userID)
    // if no stripeCustomerID, create a customer and add the new customerID to the user's doc.
    if (!stripeCustomerID) {
      const customerMeta = { email, userID }
      const newCustomer = await stripeUtils.createCustomer(email, source, customerMeta)
      stripeCustomerID = newCustomer.id
      await admin.firestore().doc(`users/${userID}`).set({ stripeCustomerID }, { merge: true })
    } else {
      // customer already exists, but their source may be old. lets add their new source
      await stripeUtils.addSourceToCustomer(stripeCustomerID, source)
    }

    // create the billing object to pass through to policyObjectGenerator
    const billing = {
      type: 'subscription',
      method: 'stripe',
      methodDetails: {
        stripeCustomerID
      }
    }

    // Create a new policy doc object for this policy.
    const newPolicyDoc = await policyObjectGenerator({
      userDetails,
      email,
      policyData,
      productCode: product,
      userID,
      billing,
      brandCode,
      affiliateCode,
      channel
    })

    // Get the new policy's uniquePolicyNumber
    const newPolicyNumber = newPolicyDoc && newPolicyDoc.policyMeta && newPolicyDoc.policyMeta.uniquePolicyNumber
    // Error if cant find the newPolicyNumber
    if (!newPolicyNumber) { throw new Error(`No policy number at newPolicyDoc.policyMeta.uniquePolicyNumber ${JSON.stringify(newPolicyDoc)}`) }

    // write the object to the db
    await admin.firestore().collection('policies').doc(newPolicyNumber).set(newPolicyDoc)

    // Create a subscription for the customer in stripe
    const subscriptionMeta = { email, userID, policy: newPolicyNumber }
    const stripeSubscriptionResponse = await stripeUtils.createSubscription({ product, plan, stripeCustomerID, quantity, metadata: subscriptionMeta })
    return res.status(200).send({ newPolicyNumber, policy: newPolicyDoc })
  } catch (e) {
    console.error(e)
    return res.status(500).send(e.message || e)
  }
})

// ************* Handle all webhooks from stripe *************
// will handle any webhooks that are defined, or ping slack with any that are not associated with a function.
app.post('/api/stripeWebHook', validateStripeWebHook, async (req, res) => {
  // webhook types and their corresponding functions.
  // if type doesn't exist, or has no function, it will ping slack with the deets.

  // set the hook type functions
  const { webHookFunctionsMap } = require(path.join(__dirname, '/stripe', '/webHookFunctions.js'))

  // get the hook type
  const { type } = req.hook
  // if the type doesn't exist in the webHookFunctions object,
  // or it's undefined, ping slack but still respond with 200 status to stripe or else it'll try again.
  if (!type || !webHookFunctionsMap[type]) {
    await slack({
      channel: 'stripe-webhooks',
      title: 'Webhook from Stipe does not have a function yet!',
      text: `*Webhook Type:*\n "${type}"\n *Data:*\n ${JSON.stringify(req.hook)}`
    })
    return res.status(200).send('Type not managed in cloud functions yet...')
  }
  // otherwise, do the function that corresponds with the hook type.
  try {
    await webHookFunctionsMap[type].handler(req.hook)
    return res.status(200).send()
  } catch (e) {
    console.error(e)
    await slack({
      channel: 'stripe-webhooks',
      title: 'Webhook function error!',
      text: `*Error:*\n ${e.message}\n ${e}\n *Webhook Type:*\n "${type}"\n *Data:*\n ${JSON.stringify(req.hook)}`
    })
    return res.status(400).send(e.message)
  }
})

// ************* Export the app! *************
exports.app = functions.https.onRequest(app)

// ***************************************************************
// START THE FIREBASE TRIGGERS
// ***************************************************************

// ************* Send user an email with verification code when created *************
exports.sendUserEmailVerificationCodeOnAccountCreation = functions.auth.user().onCreate(async (user) => {
  const email = user.email
  try {
    return axios({
      url: `${config.functionsURL}/api/request-email-verification-code`,
      method: 'post',
      data: { email }
    })
  } catch (e) {
    console.error(e)
    return null
  }
})

// ************* Set up users account/docs when created *************
exports.provisionUserDocsOnUserCreation = functions.auth.user().onCreate(async (user) => {
  const { email, uid } = user
  try {
    const userDocRef = admin.firestore().doc(`users/${uid}`)
    await userDocRef.set({
      dateCreated: new Date().toISOString(),
      email,
      id: uid
    }, { merge: true })
  } catch (e) {
    console.error(e)
    return null
  }
})

// ************* Watch userControl docs and set user's custom claims on change *************
exports.updateCurrentClaimsOnUserControlChange = functions.firestore.document('userControl/{userID}').onWrite(async (change, context) => {
  const { userID } = context.params
  const newDoc = change.after.exists ? change.after.data() : null
  // const oldDocument = change.before.data()
  if (!newDoc) { return null }
  return userUtils.updateCustomClaims(userID, newDoc, true)
})

// ************* Watch for new policy docs and notify user *************
// notifyUserOnPolicyDocCreation({userData: {userID: 'zgVBmmvKa7Z6YaUGrAonxekDtU42'}}, {params: {policyID: 'MSIEQ1001019D'}})
exports.notifyUserOnPolicyDocCreation = functions.firestore.document('policies/{policyID}').onCreate(async (snap, context) => {
  try {
    const { policyID } = context.params
    const policyDoc = snap.data()
    const userID = policyUtils.getPolicyDocUserID(policyDoc)
    if (!userID) { throw new Error('Could not find userID.' + JSON.stringify(policyDoc)) }
    return notifications.send({
      userID,
      title: 'Your new policy',
      text: 'Congratulations on purchasing your new policy! Click the link below to view the policy details.',
      link: `/account/policies/${policyID}`
    })
  } catch (e) {
    console.error(e)
    return slack({
      channel: 'cloud-function-errors',
      title: 'notifyUserOnPolicyDocCreation function error!',
      text: `*Error:*\n ${e.message}\n ${e}`
    })
  }
})
