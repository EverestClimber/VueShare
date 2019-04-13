import Vue from 'vue'
import Vuetify from 'vuetify'

let theme = {
  primary: '#03A9CE',
  accent: '#09B3AF',
  secondary: '#484848',
  info: '#0D47A1',
  warning: '#ffb300',
  error: '#B71C1C',
  success: '#2E7D32'
}

const icons = {
  pound: 'fas fa-pound-sign'
}

Vue.use(Vuetify, { theme, icons })

Vue.prototype.$theme = theme
