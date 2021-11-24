<template>
  <v-app-bar clipped-right app >
    <router-link to="/">
      <v-img
        position="left"
        max-height="80px"
        max-width="90px"
        contain
        src="../assets/logo_light2.png"
      >
      </v-img>
    </router-link>
    <v-btn to="/configuration" text>Configuration</v-btn>
    <v-btn text>import PCAP</v-btn>

    <v-spacer></v-spacer>
    <v-btn @click="darkmode" icon>
      <v-icon large>mdi-theme-light-dark </v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
export default {
  data: () => ({

  }),
  computed: {

  },

  methods: {
    darkmode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },
  },
};
</script>
<style scoped>
>>> .v-text-field {
  width: 110px;
}
</style>