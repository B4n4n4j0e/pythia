<template>
  <v-app-bar clipped-right app>
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
    <v-btn
      :loading="pCAPLoading"
      :disabled="pCAPLoading"
      @click="uploadPCAP"
      text
      >import PCAP</v-btn
    >
    <input
      ref="uploadInput"
      class="d-none"
      :loading="isSelecting"
      type="file"
      @change="onFileInput"
    />
    <v-menu top :close-on-content-click="false" v-model="dashboardDialog">
      <template v-slot:activator="{ on, attrs }">
        <v-btn text v-bind="attrs" v-on="on">Dashboard options </v-btn>
      </template>
      <v-list nav flat>
        <v-list-item tile v-for="(item, index) in dashboards" :key="index">
          <v-btn
            :class="
              currentDashboard == item.name
                ? 'textButtonActive'
                : 'textButtonInactive'
            "
            @click="switchDashboard(item.name)"
            text
            >{{ item.name }}</v-btn
          >
          <v-spacer></v-spacer>
          <v-btn @click="removeDashboard(item.name)" text color="error"
            >X</v-btn
          >
        </v-list-item>
        <v-list-item>
          <v-text-field
            class="mr-2"
            v-model="dashboardName"
            label="Add new dashboard"
          ></v-text-field>
          <v-btn @click="addDashboard" class="ml-3" color="success">+</v-btn>
        </v-list-item>
      </v-list>
    </v-menu>
    <v-menu top :close-on-content-click="false" v-model="modeDialog">
      <template v-slot:activator="{ on, attrs }">
        <v-btn text v-bind="attrs" v-on="on">Mode</v-btn>
      </template>
      <v-list nav flat>
        <v-list-item tile v-for="(item, index) in modes" :key="index">
          <v-btn
            :class="
              currentMode == item ? 'textButtonActive' : 'textButtonInactive'
            "
            @click="switchMode(item)"
            text
            >{{ item }}</v-btn
          >
        </v-list-item>
      </v-list>
    </v-menu>
    <v-spacer></v-spacer>
    <div v-if="updateInfo">
      <v-tooltip bottom>
        <template v-slot:activator="{ on, attrs }">
          <v-icon v-bind="attrs" v-on="on" class="mr-2" large
            >mdi-information-outline</v-icon
          >
        </template>
        <span>Click Update to apply new filter</span>
      </v-tooltip>

      <v-btn class="ml-2" @click="update" color="primary">Update</v-btn>
    </div>

    <v-spacer></v-spacer>

    <v-tooltip bottom>
      <template v-slot:activator="{ on, attrs }">
        <v-btn icon @click="setDarkmode" v-bind="attrs" v-on="on">
          <v-icon large>mdi-theme-light-dark</v-icon>
        </v-btn>
      </template>
      <span>Dark Mode</span>
    </v-tooltip>
  </v-app-bar>
</template>

<script>
export default {
  data: () => ({
    dashboardDialog: false,
    modeDialog: false,
    isSelecting: false,
    selectedFile: null,
    dashboardName: "",
    modes: ["Sensor", "PCAP"],
  }),

  computed: {
    dashboards() {
      return this.$store.state.dashboards;
    },
    currentDashboard() {
      return this.$store.state.currentDashboard;
    },
    currentMode() {
      return this.$store.state.mode;
    },
    pCAPLoading() {
      return this.$store.state.pCAPLoading;
    },
    updateInfo() {
      return this.$store.getters["numberOfChanges"] > 0;
    },
  },

  methods: {
    update() {
      this.$store.dispatch("getAllData");
    },

    addDashboard() {
      if (this.dashboardName == "") {
        return;
      }
      var dashboardDuplicates = this.dashboards.filter(
        (elem) => elem.name == this.dashboardName
      );
      if (dashboardDuplicates.length > 0) {
        let snackBarOptions = {
          message: "Name already exists, please choose another name",
          color: "error",
          timeout: 2000,
        };
        this.$store.dispatch("triggerSnackbar", snackBarOptions);
      } else {
        this.$store.dispatch("addDashboard", this.dashboardName);
        this.dashboardName = "";
      }
    },
    removeDashboard(name) {
      this.$store.dispatch("removeDashboard", name);
    },
    switchDashboard(name) {
      this.$store.dispatch("switchDashboard", name).finally(() => {
        this.dashboardDialog = false;
      });
    },

    switchMode(name) {
      this.$store
        .dispatch("switchMode", name)
        .finally(() => (this.modeDialog = false));
    },

    setDarkmode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem("dark_theme", this.$vuetify.theme.dark.toString());
    },
    uploadPCAP() {
      if (this.$store.state.mode == "PCAP") {
        let snackBarOptions = {
          message: "Please switch to sensor mode to upload a pcap-file",
          color: "error",
          timeout: 2000,
        };
        this.$store.dispatch("triggerSnackbar", snackBarOptions);
        return;
      }
      this.isSelecting = true;
      window.addEventListener(
        "focus",
        () => {
          this.isSelecting = false;
        },
        { once: true }
      );
      this.$refs.uploadInput.click();
    },

    onFileInput(e) {
      this.selectedFile = e.target.files[0];
      var formData = new FormData();
      formData.append("file", this.selectedFile);
      this.$store.dispatch("uploadPCAP", formData);
    },
  },
};
</script>
<style scoped>
>>> .v-text-field {
  width: 110px;
}
.textButtonActive {
  text-transform: none;
}
.textButtonInactive {
  text-transform: none;
  opacity: 0.5;
}
</style>