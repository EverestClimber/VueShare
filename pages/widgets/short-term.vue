<template lang="html">
  <!--
  Shot term widget!
  Use as an iframe - height should be at least 500px to look good on all screen sizes.

  URL params:
  hideExtras - Boolean // hides all optional extras
  hideRedundancy - Boolean // hides the redundancy optional extra
  hideLifeCover - Boolean // hides the Life cover optional extra
  hideCriticalIllness - Boolean // hides the Critical Illness optional extra
  cardView - Boolean // Adds some padding to the page and makes the card shadow/borders
  -->
  <v-layout fill-height :style="{'backgroundColor': `#${$route.query && $route.query.backgroundColour}`}">
    <v-card :tile="!cardView" :class="{'ma-2': cardView, 'elevation-5': cardView, 'elevation-0': !cardView}">
      <v-card-text class="pa-0 fill-height">
        <v-layout row wrap justify-center fill-height align-center>

          <v-flex fill-height sm8 xs12 class="pa-3">
            <v-layout fill-height row wrap justify-space-around align-content-center>
              <v-flex xs4>
                <fadeUp v-model="fadeUpAge" :text="fadeUpAgeText">
                  <dateOfBirth v-model="dob" :age.sync="age" @update="validAge(...arguments)"/>
                </fadeUp>
              </v-flex>
              <v-flex xs12 text-xs-left>
                <p class="mb-0"><strong>How much would you like your policy to pay you each month?</strong></p>
                <payOutSlider :payOut.sync="payOut" v-focus="sliderFocus"/>
              </v-flex>
              <v-flex v-if="!hideExtras" xs12>
                <p class=""><strong>Optional Extras:</strong></p>
              </v-flex>
              <v-flex v-if="!hideExtras" xs12>
                <optionalExtras
                  :redundancy.sync="redundancy"
                  :lifeCover.sync="lifeCover"
                  :criticalIllness.sync="criticalIllness"
                  :hideRedundancy="hideRedundancy"
                  :hideLifeCover="hideLifeCover"
                  :hideCriticalIllness="hideCriticalIllness"
                ></optionalExtras>
              </v-flex>
              <v-flex xs12 class="px-1" :class="$vuetify.breakpoint.mdAndUp ? 'mt-2' : 'mt-0'">
                <v-btn color="primary" block :large="$vuetify.breakpoint.mdAndUp" :href="buyLink" target="_parent">
                  <strong class="headline">Buy Now {{$vuetify.breakpoint.xs ? `- £${price}` : ''}}</strong>
                  <v-icon right>chevron_right</v-icon>
                </v-btn>
              </v-flex>
            </v-layout>
          </v-flex>

          <v-flex fill-height sm4 class="hidden-xs-only pa-0 primary" :class="{'borderRadiusFlex': cardView}">
            <v-layout fill-height row wrap justify-space-around align-center>
              <yourQuoteCard :tile="!cardView" class="elevation-0" :age="age" :price="price" :payOut="payOut"/>
            </v-layout>
          </v-flex>
        </v-layout>
      </v-card-text>
    </v-card>
  </v-layout>
</template>

<script>
import { focus } from 'vue-focus'
import optionalExtras from '~/components/shortTerm/optionalExtras'
import payOutSlider from '~/components/shortTerm/payOutSlider'
import yourQuoteCard from '~/components/shortTerm/yourQuoteCard'
import dateOfBirth from '~/components/helpers/dateOfBirth'
import shortTermCalc from '~/mixins/shortTermCalc'
export default {
  layout: 'blank',
  directives: { focus },
  mixins: [shortTermCalc],
  components: {
    optionalExtras,
    payOutSlider,
    yourQuoteCard,
    dateOfBirth
  },
  data () {
    return {
      age: 0,
      dob: null,
      day: 14,
      payOut: 500,
      redundancy: false,
      lifeCover: false,
      criticalIllness: false,
      cardView: false,
      hideRedundancy: false,
      hideLifeCover: false,
      hideCriticalIllness: false,
      hideExtras: false,
      fadeUpAge: false,
      fadeUpAgeText: null,
      sliderFocus: false,
      affiliate: null
    }
  },
  computed: {
    buyLink () {
      if (!this.dob || !this.payOut) { return '' }
      return `/checkout/short-term/?dob=${this.dob}&payOut=${this.payOut}&redundancy=${this.redundancy}&lifeCover=${this.lifeCover}&criticalIllness=${this.criticalIllness}&affiliate=${this.affiliate || this.$store.getters['domain/host']}`
    }
  },
  created () {
    if (this.$route.query) {
      this.cardView = this.$route.query.cardView === 'true'
      this.hideRedundancy = this.$route.query.hideRedundancy === 'true'
      this.hideLifeCover = this.$route.query.hideLifeCover === 'true'
      this.hideCriticalIllness = this.$route.query.hideCriticalIllness === 'true'
      this.hideExtras = this.$route.query.hideExtras === 'true'
      this.affiliate = this.$route.query.affiliate
    }
  }
}
</script>

<style lang="css">
.centerSwitch {
  width: 35px;
  margin: auto;
}
.borderRadiusFlex {
  border-radius: 0 2px 2px 0px;
}
</style>
