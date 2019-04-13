import { stopWatchingUserData } from '../utils/stopWatchers.js'
export const state = () => ({
  userID: null,
  userToken: null
})

export const mutations = {
  clearStore (state) {
    state.userID = null
    state.userToken = null
  },
  setUser (state, userID) {
    state.userID = userID
  },
  setUserToken (state, token) {
    state.userToken = token
  }
}

export const actions = {
  async nuxtServerInit ({ commit, dispatch }, { req }) {
    let host = req.headers['x-forwarded-host'] ? req.headers['x-forwarded-host'] : req.headers.host.split(':')[0]
    // Get initial domain settings and save to state
    try {
      const result = await this.$db.brand().where('domains', 'array-contains', host).get()
      if (result.size === 0) { throw new Error('Can not find domain.') }
      let doc = result.docs[0].data()
      return commit('domain/init', { host, settings: doc })
    } catch (e) {
      console.log('nuxtServerInit Error:', e)
      console.error(e)
    }
  },
  async fillStore ({ commit, dispatch }, userID) {
    commit('user/setUserID', userID)
    dispatch('user/watchUserData', userID)
    dispatch('userPolicies/watchUserPoliciesData', userID)
    dispatch('notifications/watchNotifications', userID)
    dispatch('userPolicies/watchUserPoliciesData', userID)
  },
  clearStore ({ dispatch, commit }) {
    commit('user/clearStore')
  },
  stopWatchingUserData ({ dispatch }) {
    stopWatchingUserData(dispatch)
  }
}

export const getters = {
  userID (state) {
    return state.userID
  },
  userToken (state) {
    return state.userToken
  }
}
