let stopWatchHostSettings

export const state = () => ({
  host: null,
  settings: null,
  darkTheme: false
})

export const mutations = {
  init (state, { host, settings }) {
    state.host = host
    state.settings = settings
    if (settings && settings.darkTheme) {
      state.darkTheme = true
    }
  }
}

export const actions = {
  watchSettings ({ commit, state }, domain) {
    let host = domain || state.host
    if (!host) { return console.error('watchSettings action Error: No host!') }
    stopWatchHostSettings = this.$db.brand().where('domains', 'array-contains', host).onSnapshot((result) => {
      if (result.size === 0) { throw new Error('Can not find domain.') }
      let doc = result.docs[0].data()
      return commit('init', { host, settings: doc })
    })
  },
  stopWatchHostSettings () {
    if (stopWatchHostSettings) { return stopWatchHostSettings() }
  }
}

export const getters = {
  host (state) {
    return state.host
  },
  settings (state) {
    return state.settings
  },
  theme (state) {
    return (state.settings && state.settings.theme) || null
  },
  darkTheme (state) {
    return state.darkTheme
  },
  logo (state) {
    return (state.settings && state.settings.headerImageUrl) || null
  },
  topBar: state => (state.settings && state.settings.topBar) || false,
  globalMeta: state => (state.settings && state.settings.globalMeta) || false,
  rootUrl: state => (state.settings && state.settings.rootUrl),
  googleAnalyticsID: state => (state.settings && state.settings.googleAnalyticsID) || false,
  googleTagManagerID: state => (state.settings && state.settings.googleTagManagerID) || false,
  code: state => (state.settings && state.settings.code) || false
}
