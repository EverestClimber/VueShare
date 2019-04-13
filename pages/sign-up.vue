<template>
  <div>
    <div class="fullScreen"></div>
    <v-layout row wrap justify-center class="mt-5">
      <v-flex xs10 sm8 md6>
        <v-card>
          <v-card-title class="headline primary">
            <v-layout row wrap justify-center>
              <v-flex xs12 text-xs-center>
                <h2 class="white--text">Sign Up</h2>
              </v-flex>
            </v-layout>
          </v-card-title>
          <v-card-text class="pb-0">
            <v-layout row wrap justify-center>
              <v-flex xs11 sm10 md6>
                <v-text-field
                  name="email"
                  label="Email Address"
                  id="email"
                  v-model="email"
                  hint="We'll send a verification email to this address"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap justify-center>
              <v-flex xs11 sm10 md6>
                <v-text-field
                  name="password"
                  label="Password"
                  id="password"
                  v-model="password"
                  hint="Must be at least 6 charaters long"
                  type="password"
                  @keyup.enter="signUp()"
                ></v-text-field>
              </v-flex>
            </v-layout>
            <v-layout row wrap justify-center>
              <v-flex xs12 text-xs-center>
                <v-btn :loading="loading" color="accent" @click.stop="signUp()">Sign Up
                  <v-icon right>verified_user</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-card-text>
          <v-card-actions>
            <v-layout row wrap justify-center>
              <v-flex xs12 text-xs-center class="mt-3 mb-2">
                <nuxt-link to="/log-in">Already have an account?</nuxt-link>
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
import SignUpAndInWithGoogle from '~/components/sign-up-and-in-with-google'
export default {
  mixins: [meta],
  layout: 'default',
  components: {
    'sign-up-and-in-with-google': SignUpAndInWithGoogle
  },
  data () {
    return {
      loading: false,
      email: '',
      password: ''
    }
  },
  methods: {
    routeToDash () {
      this.$router.push('/account/dashboard')
    },
    async signUp () {
      const { email, password } = this
      if (!email) { return this.$snack('Enter your email address!') }
      if (!password) { return this.$snack('Enter your email password!') }
      try {
        this.loading = true
        await this.$store.dispatch('user/signUserUp', { email: email, password: password })
        this.loading = false
      } catch (e) {
        this.loading = false
        this.$handleError(e)
      }
    }
  }
}
</script>

<style lang="css">
</style>
