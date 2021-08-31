<template>
  <v-app-bar clipped-left app>
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
    <v-menu top :close-on-content-click="false" v-model="datasetDialog">
      <template v-slot:activator="{ on, attrs }">
        <v-btn text v-bind="attrs" v-on="on"> Dataset options </v-btn>
      </template>

      <v-list nav flat>
        <v-list-item tile v-for="(item, index) in datasets" :key="index">
          <v-list-item-title>{{ item.name }}</v-list-item-title>
          <v-btn @click="removeDataset(item.name)" text color="error">X</v-btn>
        </v-list-item>
        <v-list-item>
          <v-text-field
            class="mr-2"
            v-model="datasetName"
            label="Add new dataset"
          ></v-text-field>
          <v-btn @click="addDataset" class="ml-3" color="success">+</v-btn>
        </v-list-item>
      </v-list>
    </v-menu>
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
    datasetDialog: false,
    datasetName: "",
    closeOnClick: true,
  }),
  computed: {
    datasets() {
      return this.$store.state.datasets;
    },
  },

  methods: {
    darkmode() {
      this.$vuetify.theme.dark = !this.$vuetify.theme.dark;
    },
    addDataset() {
      this.$store.commit("addDataset", this.datasetName);
      this.datasetName = "";
    },
    removeDataset(name) {
      this.$store.commit("removeDataset", name);
    },
  },
};
</script>
<style scoped>
>>> .v-text-field {
  width: 110px;
}
</style>