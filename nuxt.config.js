const rootUrl = ''

export default {
  mode: 'universal',

  /*
  ** Environment
  */
  env: {
    dev: (process.env.NODE_ENV !== 'production'),
    rootUrl: (process.env.NODE_ENV === 'production') ? rootUrl : 'http://localhost:3000',
    functionsURL: (process.env.NODE_ENV === 'production') ? rootUrl : 'http://localhost:5000',
    pcaKey: ''
  },

  /*
  ** Router options
  */
  router: {
    middleware: ['authed']
  },

  /*
  ** Firebase
  */
  fireBaseConfig: {
    apiKey: '',
    authDomain: '',
    databaseURL: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: ''
  },

  /*
  ** Headers of the page
  */
  head: {
    title: '',
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' }
    ],
    link: [
      // { rel: 'icon', type: 'image/x-icon', href: '/favicon.png' },
      { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css?family=Open+Sans:100,200,300,400,500,700|Roboto:300,400,500,700|Material+Icons' },
      { rel: 'stylesheet', href: 'https://use.fontawesome.com/releases/v5.0.13/css/all.css' }
    ]
  },

  /*
  ** Customize the progress-bar color
  */
  loading: { color: '#3B8070' },

  /*
  ** Global CSS
  */
  css: [
    'animate.css',
    '~/assets/style/app.styl',
    '~/assets/style/custom.css',
    '~/assets/style/app.scss'
  ],

  /*
  ** Plugins to load before mounting the App
  */
  plugins: [
    '~/plugins/vuetify',
    '~/plugins/snack.js',
    '~/plugins/moment.js',
    '~/plugins/handleError.js',
    '~/plugins/smoothResize.js',
    '~/plugins/globalComponents.js',
    '~/plugins/firebase.js',
    '~/plugins/dbFactory.js',
    { src: '~/plugins/fireAuth.js', ssr: false },
    { src: '~/plugins/analytics.js', ssr: false },
    { src: '~/plugins/tagManager.js', ssr: false }
  ],

  /*
  ** Nuxt.js modules
  */
  modules: [
    // Doc: https://github.com/nuxt-community/axios-module#usage
    '@nuxtjs/axios',
    'nuxt-stripe-module'
  ],

  /*
  ** Axios module configuration
  */
  axios: {
    // See https://github.com/nuxt-community/axios-module#options
  },

  /*
  ** Stripe module configuration
  */
  stripe: {
    version: 'v3',
    publishableKey: (process.env.NODE_ENV === 'production') ? '' : ''
  },

  /*
  ** Build configuration
  */
  build: {
    /*
    ** You can extend webpack config here
    */
    extend (config, ctx) {
      // Run ESLint on save
      if (ctx.isDev && ctx.isClient) {
        config.module.rules.push({
          enforce: 'pre',
          test: /\.(js|vue)$/,
          loader: 'eslint-loader',
          exclude: /(node_modules)/
        })
      }
    }
  }
}
