<template>
  <v-container fluid>
    <v-row class="ma-0 pa-0" no-gutters>
      <v-col cols="4">
        <v-select v-model="selected" :items="items" label="Data"></v-select>
      </v-col>
      <v-spacer></v-spacer>
    </v-row>
    <v-row no-gutters>
      <v-col cols="3">
        <p class="font-weight-black">First entry date:</p>
      </v-col>
      <v-col cols="3">
        <p>{{ activeFirstDate }}</p>
      </v-col>
      <v-col cols="3">
        <p class="font-weight-black">Last entry date:</p>
      </v-col>
      <v-col cols="3">
        <p>{{ activeLastDate }}</p>
      </v-col>
    </v-row>
    <v-row no-gutters>
      <v-col cols="3">
        <p class="font-weight-black">Number of connections:</p>
      </v-col>
      <v-col cols="3">
        <p>{{ activeConnectionCount }}</p>
      </v-col>
      <v-col cols="3">
        <p class="font-weight-black">Storage used:</p>
      </v-col>
      <v-col cols="3">
        <p>{{ activeSize }}</p>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import DetailDataService from "../services/DetailDataService";
import SummaryDataService from "../services/SummaryDataService";

export default {
  name: "DataSummaryTable",
  mounted() {
    this.$nextTick(function () {
      this.getDetailDataInformation();
      this.getSummaryDataInformation();
    });
  },
  data: () => ({
    selected: "Detail & Summary",

    detailFirstDate: 5,
    detailLastDate: 2,
    detailConnectionCount: 2,
    detailSize: 400,

    summaryFirstDate: 3,
    summaryLastDate: 12,
    summaryConnectionCount: 15,
    summarySize: 320,

    items: ["Detail & Summary", "Detail", "Summary"],
  }),

  computed: {
    activeFirstDate() {
      switch (this.selected) {
        case "Detail":
          return this.timestampToDate(this.detailFirstDate);
        case "Summary":
          return this.timestampToDate(this.summaryFirstDate);
        default:
          if (this.detailFirstDate > this.summaryFirstDate) {
            return this.timestampToDate(this.summaryFirstDate);
          } else {
            return this.timestampToDate(this.detailFirstDate);
          }
      }
    },
    activeLastDate() {
      switch (this.selected) {
        case "Detail":
          return this.timestampToDate(this.detailLastDate);
        case "Summary":
          return this.timestampToDate(this.summaryLastDate);
        default:
          if (this.detailLastDate > this.summaryLastDate) {
            return this.timestampToDate(this.detailLastDate);
          } else {
            return this.timestampToDate(this.summaryLastDate);
          }
      }
    },
    activeConnectionCount() {
      switch (this.selected) {
        case "Detail":
          return this.detailConnectionCount;
        case "Summary":
          return this.summaryConnectionCount;
        default:
          return this.detailConnectionCount + this.summaryConnectionCount;
      }
    },
    activeSize() {
      switch (this.selected) {
        case "Detail":
          return this.detailSize.toString() + " MB";
        case "Summary":
          return this.summarySize.toString() + " MB";
        default:
          return (
            (
              Math.round(this.detailSize * 100 + this.summarySize * 100) / 100
            ).toString() + " MB"
          );
      }
    },
    mode() {
      return this.$store.state.mode;
    },
  },

  watch: {
    mode() {
      this.getDetailDataInformation();
      this.getSummaryDataInformation();
    },

    selected() {
      switch (this.selected) {
        case "Detail":
          this.getDetailDataInformation();
          return;
        case "Summary":
          this.getSummaryDataInformation();
          return;
        default:
          this.getDetailDataInformation();
          this.getSummaryDataInformation();
          return;
      }
    },
  },

  methods: {
    getDetailDataInformation() {
      DetailDataService.get().then((response) => {
        this.detailFirstDate = response.data["first_date"];
        this.detailLastDate = response.data["last_date"];
        this.detailConnectionCount = response.data["connection_count"];
        this.detailSize = response.data["size"];
      });
    },
    getSummaryDataInformation() {
      SummaryDataService.get().then((response) => {
        this.summaryFirstDate = response.data["first_date"];
        this.summaryLastDate = response.data["last_date"];
        this.summaryConnectionCount = response.data["connection_count"];
        this.summarySize = response.data["size"];
      });
    },

    timestampToDate(timestamp) {
      if (timestamp > 0) {
        return new Date(timestamp * 1000).toLocaleString();
      } else {
        return "None";
      }
    },
  },
};
</script>

<style scoped>
</style>