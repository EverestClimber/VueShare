<template lang="html">
  <div class="">
    <v-layout row wrap justify-center class="mt-4">
      <v-flex xs12 sm8 text-xs-center>
        <v-card>
          <v-window v-model="step">
            <v-window-item value="checkAuth">
              <v-card-title>
                <v-layout row wrap justify-center>
                  <v-flex xs12 text-xs-center>
                    <h2>Checking Authentication</h2>
                  </v-flex>
                </v-layout>
              </v-card-title>
              <v-card-text>
                <v-layout row wrap justify-center class="my-4">
                  <v-flex xs12 text-xs-center>
                    <v-progress-circular color="primary" indeterminate></v-progress-circular>
                  </v-flex>
                </v-layout>
              </v-card-text>
            </v-window-item>

            <v-window-item value="login">
              <v-card-title>
                <v-layout row wrap justify-center>
                  <v-flex xs12 text-xs-center>
                    <h2>Log in</h2>
                  </v-flex>
                </v-layout>
              </v-card-title>
              <v-card-text class="py-0">
                <v-layout row wrap justify-center>
                  <v-flex xs12 sm10 text-xs-center>
                    <v-text-field
                      name="email"
                      label="Email Address"
                      id="email"
                      v-model="email"
                    ></v-text-field>
                  </v-flex>
                  <v-flex xs12 sm10 text-xs-center>
                    <v-text-field
                      type="password"
                      name="password"
                      label="Password"
                      id="password"
                      v-model="password"
                      @keyup.enter="logIn()"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-card-text>
              <v-card-actions class="pb-4">
                <v-layout row wrap justify-center>
                  <v-flex xs12 text-xs-center>
                    <v-btn :loading="loading" color="accent" @click="logIn()">
                      Log in
                      <v-icon right>verified_user</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex xs12 text-xs-center class="mt-3">
                    <p class="mb-0 pointer subText" @click.stop="step = 'forgotPass'">Forgot your password?</p>
                    <p class="mb-0 pointer subText" @click.stop="$router.push('/sign-up')">Sign up</p>
                  </v-flex>
                </v-layout>
              </v-card-actions>
            </v-window-item>

            <v-window-item value="forgotPass">
              <v-card-title>
                <v-layout row wrap justify-center>
                  <v-flex xs12 text-xs-center>
                    <h2>Reset Your Password</h2>
                    <p class="subText">We will send you an email with a reset link...</p>
                  </v-flex>
                </v-layout>
              </v-card-title>
              <v-card-text class="py-0">
                <v-layout row wrap justify-center>
                  <v-flex xs12 sm10 text-xs-center>
                    <v-text-field
                      name="emailResetPass"
                      label="Email Address"
                      id="emailResetPass"
                      v-model="email"
                    ></v-text-field>
                  </v-flex>
                </v-layout>
              </v-card-text>
              <v-card-actions class="pb-4">
                <v-layout row wrap justify-center>
                  <v-flex xs12 text-xs-center>
                    <v-btn color="accent">
                      Reset
                      <v-icon right>send</v-icon>
                    </v-btn>
                  </v-flex>
                  <v-flex xs12 text-xs-center class="mt-3">
                    <p class="mb-0 pointer subText" @click.stop="step = 'login'">Try logging in</p>
                  </v-flex>
                </v-layout>
              </v-card-actions>
            </v-window-item>
          </v-window>
        </v-card>
      </v-flex>
    </v-layout>
  </div>
</template>

<script>
export default {
  data () {
    return {
      step: 'checkAuth',
      email: null,
      password: null,
      loading: false
    }
  },
  methods: {
    async logIn () {
      const { email, password } = this
      if (!email) { return this.$snack('Please enter your email address') }
      if (!password) { return this.$snack('Please enter your password') }
      try {
        this.loading = true
        const user = await this.$store.dispatch('auth/logUserIn', { email, password })
        if (user) {
          console.log('Got user')
          // this.$router.push('/home')
        }
        this.loading = false
      } catch (e) {
        this.loading = false
        this.$handleError(e)
      }
    }
  },
  mounted () {
    setTimeout(() => {
      this.step = 'login'
    }, 2000)
  }
}
</script>

<style lang="css">
</style>
