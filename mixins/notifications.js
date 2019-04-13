import { mapGetters } from 'vuex'
export default {
  data () {
    return {
      newNotification: false,
      currentNotification: null,
      showExpansion: false,
      loading: false
    }
  },
  computed: {
    ...mapGetters({
      userID: 'user/userID',
      user: 'user/user',
      notifications: 'notifications/notifications'
    }),
    emailNotifications: {
      get () {
        return this.$store.getters['user/settings'] && this.$store.getters['user/settings'].emailNotifications
      },
      set (v) {
        return this.$database.doc(`users/${this.user.userID}`).update({ 'settings.emailNotifications': v })
      }
    },
    unreadNotifications () {
      if (this.notifications) {
        return this.notifications.filter(x => !x.read).length
      } else {
        return false
      }
    }
  },
  watch: {
    unreadNotifications (val, prevVal) {
      if (val > prevVal) {
        this.newNotification = true
        setTimeout(() => {
          this.newNotification = false
        }, 1000)
      }
    },
    userID (val) {
      if (val) {
        this.addSomeNotifications()
      }
    }
  },
  methods: {
    async deleteNotification (id) {
      if (this.user) {
        try {
          this.loading = true
          await this.$database.doc(`users/${this.user.userID}/notifications/${id}`).update({ deleted: true })
          this.loading = false
        } catch (e) {
          console.log(e)
          this.$snack(`Can't reach the database at the moment... Refresh and try again!`)
        }
      } else {
        this.$snack(`Can't reach the database at the moment... Refresh and try again!`)
      }
    },
    async markAsRead (id) {
      if (this.user) {
        try {
          this.loading = true
          await this.$database.doc(`users/${this.user.userID}/notifications/${id}`).update({ read: true })
          this.loading = false
        } catch (e) {
          console.log(e)
          this.$snack(`Can't reach the database at the moment... Refresh and try again!`)
        }
      } else {
        this.$snack(`Can't reach the database at the moment... Refresh and try again!`)
      }
    },
    async markAsUnread (id) {
      if ((this.currentNotification && this.currentNotification.id) || id) {
        try {
          this.loading = true
          await this.$database.doc(`users/${this.user.userID}/notifications/${(this.currentNotification && this.currentNotification.id) || id}`).update({ read: false })
          this.loading = false
          this.showExpansion = false
        } catch (e) {
          console.log(e)
          this.loading = false
          this.$snack(`Can't reach the database at the moment... Refresh and try again!`)
        }
      }
    },
    expandNotification (notification) {
      this.currentNotification = notification
      this.$nextTick(() => {
        this.showExpansion = true
      })
    },
    async markAllAsRead () {
      if (this.user) {
        try {
          this.loading = true
          const markAsRead = async (id) => {
            return this.$database.doc(`users/${this.user.userID}/notifications/${id}`).update({ read: true })
          }
          let promises = this.notifications.map((x) => { markAsRead(x.id) })
          await Promise.all(promises)
          this.loading = false
        } catch (e) {
          console.log(e)
          this.loading = false
          this.$snack(`Can't reach the database at the moment... Refresh and try again!`)
        }
      } else {
        this.$snack(`Can't reach the database at the moment... Refresh and try again!`)
      }
    },
    async deleteAll () {
      if (this.user) {
        try {
          this.loading = true
          const deleteNotification = async (id) => {
            return this.$database.doc(`users/${this.user.userID}/notifications/${id}`).delete()
          }
          let promises = this.notifications.map((x) => { deleteNotification(x.id) })
          await Promise.all(promises)
          this.loading = false
        } catch (e) {
          console.log(e)
          this.loading = false
          this.$snack(`Can't reach the database at the moment... Refresh and try again!`)
        }
      } else {
        this.$snack(`Can't reach the database at the moment... Refresh and try again!`)
      }
    }
  }
}
