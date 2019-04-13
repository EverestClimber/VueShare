import firebase, { db } from './firebase.js'
import { isRedirectHomeRoute } from '~/middleware/authed'
import { getUserCustomClaims } from '~/utils/customClaims'

let watchForTokenPush

export default async (context) => {
  const { store, $axios, redirect } = context

  const updateUserTokenAndRedirect = async ({ isTokenRefreshRequest = false, token }) => {
    // Get and save the user's auth token for hitting the API in cloud Functions
    token = token || await firebase.auth().currentUser.getIdToken(true)
    // Get the user's custom claims object for userControl.
    const customClaims = await getUserCustomClaims()
    const { emailVerified, isAffiliate, isAdmin } = customClaims
    $axios.setHeader('Authorization', `Bearer ${token}`)
    if (isRedirectHomeRoute(context.route) || isTokenRefreshRequest) {
      if (!emailVerified) { return redirect('/verify-email', { email: customClaims.email }) }
      return isAffiliate ? redirect('/partner') : isAdmin ? redirect('/admin') : redirect('/account')
    }
  }

  return firebase.auth().onAuthStateChanged(async (user) => {
    if (user) {
      const token = await firebase.auth().currentUser.getIdToken(true)
      if (watchForTokenPush) { watchForTokenPush() }
      let docRef = db.doc(`users/${user.uid}/readOnly/auth`)
      watchForTokenPush = docRef.onSnapshot(async (doc) => {
        if (!doc.exists) { return docRef.set({ lastUpdate: new Date().toISOString() }, { merge: true }) }
        const { lastUpdate, refreshToken } = doc.data()
        if (!lastUpdate || lastUpdate < refreshToken) {
          return Promise.all([
            updateUserTokenAndRedirect({ isTokenRefreshRequest: true }),
            docRef.set({ lastUpdate: new Date().toISOString() }, { merge: true })
          ])
        } else {
          return true
        }
      })
      store.commit('setUserToken', token)
      store.commit('setUser', user.uid)
      store.dispatch('fillStore', user.uid)
      return updateUserTokenAndRedirect({ token })
    } else {
      store.commit('clearStore')
      return redirect('/log-in')
    }
  })
}
