<template lang="html">
  <!--
  Long term widget!
  Use as an iframe - height should be at least 500px to look good on all screen sizes.

  URL params:
  hideExtras - Boolean // hides all optional extras
  hideFracture - Boolean // hides the fracture optional extra
  hideDeathCover - Boolean // hides the Life cover optional extra
  hideFixPremium - Boolean // hides the Critical Illness optional extra
  cardView - Boolean // Adds some padding to the page and makes the card shadow/borders
  -->
  <v-layout fill-height class="" :class="$route.query && $route.query.backgroundColour">
    <v-card :tile="!cardView" :class="{'ma-2': cardView, 'elevation-5': cardView, 'elevation-0': !cardView}">
      <v-card-text class="pa-0 fill-height">
        <v-layout row wrap justify-center fill-height align-center>

          <v-flex fill-height sm8 xs12 class="pa-3">
            <v-form ref="form" v-model="validation" class="fill-height" lazy-validation>
              <v-layout fill-height row wrap justify-space-around align-content-center>
                <v-flex xs4>
                  <fadeUp v-model="fadeUpAge" :text="fadeUpAgeText">
                    <dateOfBirth required v-model="dob" :age.sync="age" @update="validAge(...arguments)"/>
                  </fadeUp>
                </v-flex>
                <v-flex xs4>
                  <grossAnnualIncome required v-model="grossAnnualIncome"/>
                </v-flex>
                <v-flex xs12 text-xs-left>
                  <p class="mb-0"><strong>How much would you like your policy to pay you each month?</strong></p>
                  <payOutSlider :disabled="sliderDisabled" :step="5" :max="max" :min="350" :payOut.sync="payOut" v-focus="sliderFocus" :hint="sliderHint"/>
                </v-flex>
                <v-flex v-if="!hideExtras" xs12>
                  <p class=""><strong>Optional Extras:</strong></p>
                </v-flex>
                <v-flex v-if="!hideExtras" xs12>
                  <optionalExtras
                    :fixedDiff="fixedDiff"
                    :fracture.sync="fracture"
                    :deathCover.sync="deathCover"
                    :fixPremium.sync="fixPremium"
                    :hideFracture="hideFracture"
                    :hideDeathCover="hideDeathCover"
                    :hideFixPremium="hideFixPremium"
                  ></optionalExtras>
                </v-flex>
                <v-flex xs12 class="px-1" :class="$vuetify.breakpoint.mdAndUp ? 'mt-2' : 'mt-0'">
                  <v-btn color="primary" block :large="$vuetify.breakpoint.mdAndUp" :href="buyLink" target="_parent" @click="validate()">
                    <strong class="headline">Buy Now {{$vuetify.breakpoint.xs ? `- £${price}` : ''}}</strong>
                    <v-icon right>chevron_right</v-icon>
                  </v-btn>
                </v-flex>
              </v-layout>
            </v-form>
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
import optionalExtras from '~/components/longTerm/optionalExtras'
import grossAnnualIncome from '~/components/longTerm/grossAnnualIncome'
import payOutSlider from '~/components/shortTerm/payOutSlider'
import yourQuoteCard from '~/components/shortTerm/yourQuoteCard'
import dateOfBirth from '~/components/helpers/dateOfBirth'
import longTermCalc from '~/mixins/longTermCalc'
export default {
  layout: 'blank',
  directives: { focus },
  mixins: [longTermCalc],
  components: {
    optionalExtras,
    payOutSlider,
    yourQuoteCard,
    dateOfBirth,
    grossAnnualIncome
  },
  data () {
    return {
      validation: true,
      grossAnnualIncome: null,
      age: 0,
      dob: null,
      start: 1,
      payOut: 350,
      fracture: false,
      deathCover: false,
      fixPremium: false,
      cardView: false,
      hideFracture: false,
      hideDeathCover: false,
      hideFixPremium: false,
      hideExtras: false,
      fadeUpAge: false,
      fadeUpAgeText: null,
      sliderFocus: false,
      affiliate: null
    }
  },
  computed: {
    buyLink () {
      if (!this.dob || !this.payOut || !this.grossAnnualIncome) { return '' }
      return `/checkout/long-term/?dob=${this.dob}&payOut=${this.payOut}&grossAnnualIncome=${this.grossAnnualIncome}&fracture=${this.fracture}&deathCover=${this.deathCover}&fixPremium=${this.fixPremium}&affiliate=${this.affiliate || this.$store.getters['domain/host']}`
    }
  },
  methods: {
    validate () {
      console.log('validate: ', this.$refs.form.validate())
      if (!this.$refs.form.validate()) {
        this.$snack('Please check to make sure you have filled in all fields correctly.')
      }
    }
  },
  created () {
    if (this.$route.query) {
      this.cardView = this.$route.query.cardView === 'true'
      this.hideFracture = this.$route.query.hideFracture === 'true'
      this.hideDeathCover = this.$route.query.hideDeathCover === 'true'
      this.hideFixPremium = this.$route.query.hideFixPremium === 'true'
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
