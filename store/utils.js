// import {db} from '~/plugins/firebase'
import cookies from '~/utils/cookies'
export const state = () => ({
  authMini: false,
  modulesMini: false
})

export const mutations = {
  authMini (state, data) {
    state.authMini = data
    cookies.set({ authMini: `${data}` })
  },
  modulesMini (state, data) {
    state.modulesMini = data
    cookies.set({ modulesMini: `${data}` })
  }
}

export const getters = {
  authMini (state) {
    return state.authMini
  },
  modulesMini (state) {
    return state.modulesMini
  }
}
