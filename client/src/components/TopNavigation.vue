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
    isSelecting: false,
    selectedFile: null,
  }),
  computed: {},

  methods: {
    darkmode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
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
</style>