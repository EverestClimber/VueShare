<template>
  <div>
    <div class="fullScreen" :class="[fullscreenClass]"></div>
    <v-layout row wrap justify-center class="mt-5">
      <v-flex xs10 sm8 md6>
        <v-card>
          <v-card-title class="white--text primary">
            <v-btn small v-if="forgotPassInit" @click.stop="resetForm()" color="white" class="absolute backButton animated fadeIn" icon>
                <v-icon small>keyboard_arrow_left</v-icon>
              </v-btn>
            <v-layout row wrap justify-center>
              <v-flex xs10 text-xs-center>
                <h1 v-if="!forgotPassInit">Log In</h1>
                <h1 v-else>Reset Your Password</h1>
              </v-flex>
            </v-layout>
          </v-card-title>
          <v-card-text class="pb-0">
            <v-layout row wrap justify-center>
              <v-flex xs10 v-if="afterReset && !forgotPassInit" text-xs-center>
                <p class="subheading">You can now log in with your new password!</p>
              </v-flex>
              <v-flex xs11 sm10 md6>
                <v-text-field
                  name="email"
                  label="Email Address"
                  id="email"
                  v-model="email"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap justify-center>
              <v-flex xs11 sm10 md6>
                <v-text-field
                  v-if="!forgotPassInit"
                  name="password"
                  label="Password"
                  id="password"
                  v-model="password"
                  type="password"
                  @keyup.enter="logIn()"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap justify-center>
              <v-flex xs12 text-xs-center>
                <p v-if="forgotPassInit" class="mb-0">
                  {{resetSent ? "Link sent! Check your emails" : "We'll send a reset link to your email address"}}
                </p>
                <v-btn v-if="!forgotPassInit" :loading="loading" color="accent" @click.stop="logIn()">Log In
                  <v-icon right>verified_user</v-icon>
                </v-btn>
                <v-btn v-else :icon="resetSent" @click.stop="resetSent ? resetForm() : resetPass()" :loading="loading" color="accent" :class="{'animated bounce': resetSent}">{{resetSent ? '': 'Send!'}}
                  <v-icon :right="!resetSent">{{resetSent ? 'check': 'send'}}</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-layout v-if="!forgotPassInit" row wrap justify-center>
              <v-flex xs11 sm8 text-xs-center class="mt-3 mb-2">
                <v-layout row wrap justify-space-around>
                  <v-flex xs12 sm6 text-xs-center>
                    <p v-if="!forgotPassInit" class="pointer primary--text animated fadeIn" @click.stop="forgotPassInit = true">Forgot your password?</p>
                  </v-flex>
                  <!-- <v-flex xs12 sm6 text-xs-center>
                    <p v-if="!forgotPassInit" class="pointer primary--text animated fadeIn" @click.stop="routeToSignUp()">Dont have an account?</p>
                  </v-flex> -->
                </v-layout>
              </v-flex>
            </v-layout>
          </v-card-actions>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
import meta from '~/mixins/meta'
import { mapGetters } from 'vuex'
export default {
  mixins: [meta],
  layout: 'default',
  data () {
    return {
      email: '',
      password: '',
      forgotPassInit: false,
      afterReset: false,
      resetSent: false
    }
  },
  computed: {
    ...mapGetters({
      loading: 'loading/loading'
    }),
    fullscreenClass () {
      var num = Math.floor(Math.random() * 7)
      return `fullscreen-${num}`
    }
  },
  methods: {
    resetPass () {
      if (!this.email) {
        this.$snack('Forget to enter your email?')
      } else {
        this.$store.dispatch('user/resetPassword', this.email).then(() => {
          this.resetSent = true
        }).catch((e) => {
          console.log(e)
        })
      }
    },
    resetForm () {
      this.forgotPassInit = false
      this.resetSent = false
    },
    routeToSignUp () {
      this.$router.push('/sign-up')
    },
    routeToDash () {
      this.$router.push('/account/dashboard')
    },
    logIn () {
      if (!this.email) {
        this.snack('Enter your email address!')
      } else if (!this.password) {
        this.snack('Enter your password!')
      } else {
        this.$store.dispatch('user/logUserIn', { email: this.email, password: this.password }).then(() => {
          this.routeToDash()
        }).catch((e) => {
          console.log(e)
        })
      }
    },
    snack (text) {
      this.$snack(text)
    }
  },
  mounted () {
    if (this.$route.query) {
      if (this.$route.query.resetPass) { this.forgotPassInit = true }
      if (this.$route.query.email) { this.email = this.$route.query.email }
      if (this.$route.query.reset) { this.afterReset = true }
    }
  }
}
</script>

<style>
.backButton {
  position: absolute!important;
  left: 10px;
  top: 10px;
}
</style>
