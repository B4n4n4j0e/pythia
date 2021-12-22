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
    <v-btn @click="uploadPCAP" text>import PCAP</v-btn>
    <input
      ref="uploadInput"
      class="d-none"
      :loading="isSelecting"
      type="file"
      @change="onFileInput"
    />
   <v-menu top :close-on-content-click="false" v-model="dialog">
      <template v-slot:activator="{ on, attrs }">
        <v-btn text v-bind="attrs" v-on="on">Dashboard options </v-btn>
      </template>

      <v-list nav flat>
        <v-list-item tile v-for="(item, index) in dashboards" :key="index">
          <v-btn :class="currentDashboard == item.name ? 'dashboardTextButtonActive': 'dashboardTextButtonInactive' " @click="switchDashboard(item.name)" text>{{ item.name }}</v-btn>
          <v-spacer></v-spacer>
          <v-btn @click="removeDashboard(item.name)" text color="error">X</v-btn>
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
    <v-spacer></v-spacer>
    <v-btn @click="darkmode" icon>
      <v-icon large>mdi-theme-light-dark </v-icon>
    </v-btn>
  </v-app-bar>
</template>

<script>
import PCAPUploadService from "../services/PCAPUploadService";

export default {
  data: () => ({
    dialog: false,
    isSelecting: false,
    selectedFile: null,
    dashboardName: ""
  }),
  
  computed: {
    dashboards() {
      return this.$store.state.dashboards
    },
    currentDashboard() {
      return this.$store.state.currentDashboard
    }
  },

  methods: {
    addDashboard(){
      if (this.dashboardName == "") {
        return 
      }
      var dashboardDuplicates = this.dashboards.filter(elem => elem.name== this.dashboardName)
      if (dashboardDuplicates.length> 0){
        this.$store.commit('setSnackbarMessage', "Name already exists, please choose another name")
        this.$store.commit('setSnackbar',true)
      }
      else {
        this.$store.dispatch('addDashboard',this.dashboardName)
        this.dashboardName=""
      }
    },
    removeDashboard(name) {
        this.$store.dispatch('removeDashboard',name)

    },
    switchDashboard(name) {
        this.$store.dispatch('switchDashboard', name)
        this.dialog=false
    },

    darkmode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
      localStorage.setItem("dark_theme", this.$vuetify.theme.dark.toString());
    },
    uploadPCAP() {
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
      PCAPUploadService.post(formData);

    },
  },
};
</script>
<style scoped>
>>> .v-text-field {
  width: 110px;
}
.dashboardTextButtonActive {
    text-transform: none;
}
.dashboardTextButtonInactive {
    text-transform: none;
    opacity: 0.5;
}
</style>