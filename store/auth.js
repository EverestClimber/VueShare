import firebase from '~/plugins/firebase'
export const actions = {
  async logUserIn ({ commit }, { email, password }) {
    try {
      const { user } = await firebase.auth().signInWithEmailAndPassword(email, password)
      return user
    } catch (e) {
      console.error(e)
      if (e.code === 'auth/wrong-password') {
        return commit('snack/setSnack', 'Opps! Looks like the wrong password...', { root: true })
      } else if (e.code === 'auth/user-not-found') {
        return commit('snack/setSnack', `Hmmm... We couldn't find that email address in the database.`, { root: true })
      } else {
        return commit('snack/setSnack', e.message, { root: true })
      }
    }
  },
  async logUserOut ({ commit }) {
    return firebase.auth().signOut()
  }
}
