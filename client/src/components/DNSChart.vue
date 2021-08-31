<template>
  <v-card>
    <ChartControls v-bind:chartNumber="chartNumber" class="mb-0" />

    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="dNSConnectionList"
      :search="search"
    ></v-data-table>
  </v-card>
</template>

<script>
import ChartControls from "../components/ChartControls.vue";

export default {
  components: { ChartControls },

  data: () => ({
    search: "",
    headers: [
      { text: "Timestamp", value: "ts" },
      { text: "Origin Host", value: "connection.origin_host" },
      { text: "Responder Host", value: "connection.resp_host" },
      { text: "Query", value: "query_text" },
      { text: "Query type", value: "qtype_name" },
      { text: "Error Code", value: "rcode_name" },
      { text: "UID", value: "uid" },
    ],
  }),
  computed: {
    dNSConnectionList() {
      return this.$store.state.dNSConnections;
    },
  },

  methods: {
    test() {
      console.log(this.dNSConnectionList);
    },
  },
};
</script>

<style scoped>
g.tick {
  fill: black;
}
</style>