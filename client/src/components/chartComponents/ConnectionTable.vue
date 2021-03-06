<template>
  <v-card>
    <ChartControls v-bind:chartNumber="chartNumber" class="mb-0" />
    <v-card flat max-height="780px">
      <v-data-table
        :headers="headers"
        :items="data.payload"
        :loading="loading"
        :options.sync="options"
        :server-items-length="$store.state.detailData.totalConnectionsCount"
        :footer-props="{
          'items-per-page-options': [10, 25, 50, 100],
          'disable-pagination': loading,
        }"
      >
        <template v-slot:item.ts="{ item }">
          <span> {{ item.ts.toLocaleString() }}</span>
        </template>
      </v-data-table>
    </v-card>
  </v-card>
</template>

<script>
import ChartControls from "../ChartControls.vue";

export default {
  props: {
    data: {
      required: true,
    },

    chartNumber: {
      required: true,
      type: Number,
    },
    isSummary: {
      required: true,
      type: Boolean,
    },
  },

  components: { ChartControls },
  data: () => ({
    headers: [
      { text: "Timestamp", value: "ts" },
      { text: "Origin Host", value: "source" },
      { text: "Origin Port", value: "orig_p" },
      { text: "Responder Host", value: "target" },
      { text: "Responder Port", value: "resp_p" },
      { text: "Service", value: "service" },
      { text: "Protocol", value: "proto" },
      { text: "UID", value: "uid" },
      { text: "Duration", value: "duration" },
      { text: "Responder sent data (in kb)", value: "resp_ip_bytes" },
      { text: "Origin sent data (in kb)", value: "orig_ip_bytes" },
    ],
  }),
  computed: {
    loading() {
      return this.data.loading;
    },
    options: {
      get() {
        return this.$store.state.detailData.connectionsTableOptions;
      },
      set(newOptions) {
        this.$store.dispatch(
          "detailData/setConnectionsTableOptions",
          newOptions
        );
      },
    },
  },
  watch: {
    options: {
      handler() {
        this.getDataFromApi();
      },
      deep: true,
    },
  },

  methods: {
    getDataFromApi() {
      this.$store
        .dispatch("detailData/getConnections", this.options)
        .then(() => {});
    },
  },
};
</script>

<style scoped>
.v-card {
  overflow-y: auto;
  overflow-x: auto;
}
</style>