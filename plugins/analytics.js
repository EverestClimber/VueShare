import Vue from 'vue'
import VueAnalytics from 'vue-analytics'

export default ({ store, app }, inject) => {
  const googleAnalyticsID = store.getters['domain/googleAnalyticsID']
  Vue.use(VueAnalytics, {
    router: app.router,
    id: googleAnalyticsID || '',
    debug: {
      sendHitTask: process.env.NODE_ENV === 'production'
      // sendHitTask: true // use this to test in dev, comment out above
      // enabled: true
    }
  })
}
