<template>
  <v-app>
    <Top-navigation />
    <v-snackbar v-model="snackbar" :timeout="timeout" :color="color" top right>
      {{ snackbarMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn color="primary" text v-bind="attrs" @click="snackbar = false">
          Close
        </v-btn>
      </template>
    </v-snackbar>
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>
  </v-app>
</template>

<script>
import TopNavigation from "./components/TopNavigation.vue";
export default {
  name: "App",

  created() {
    this.$nextTick(function () {
      this.$store.dispatch("getDashboardNames");
      this.$store.dispatch("getMode");
      var startTime = new Date(Date.now());
      var endTime = new Date(startTime).getTime();
      startTime.setHours(startTime.getHours() - 1);
      startTime = startTime.getTime();
      this.$store.dispatch("setStartTime", startTime);
      this.$store.dispatch("setEndTime", endTime);
    });
  },

  mounted() {
    const theme = localStorage.getItem("dark_theme");
    if (theme) {
      if (theme == "true") {
        this.$vuetify.theme.dark = true;
      } else {
        this.$vuetify.theme.dark = false;
      }
    }
  },

  components: {
    TopNavigation,
  },

  computed: {
    snackbar: {
      get() {
        return this.$store.state.snackbar;
      },
      set(newOptions) {
        this.$store.dispatch("setSnackbar", newOptions);
      },
    },
    snackbarMessage() {
      return this.$store.state.snackbarMessage;
    },

    timeout() {
      return this.$store.state.snackbarTimeout;
    },
    color() {
      return this.$store.state.snackbarColor;
    },
  },
};
</script>
<style >
div.tooltip {
  position: absolute;
  text-align: center;
  padding: 2px;
  font: 12px sans-serif;
  background: black;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
  opacity: 0;
}
</style>
