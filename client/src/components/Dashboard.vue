<template>
  <v-container fluid>
    <v-row no-gutters>
        <TimePicker
          buttonText="Submit summary"
          buttonColor="primary"
          @sendTimestamps="submitSummaryTime"
        />
    </v-row>

<v-row>
    <v-col v-for="view in views" v-bind:key="view.chartNumber" :cols="view.cols">
      <component v-bind:isSummary="view.isSummary" v-bind:chartNumber="view.chartNumber" v-bind:data="view.isSummary ? $store.getters['summaryData/dataByType'](view.type):  $store.getters['detailData/dataByType'](view.type)" v-bind:is="view.view" > </component>
    </v-col>

    </v-row>
      <div class=" mt-3 d-flex justify-center flex-row">

      </div>
<ViewDialog/>
  </v-container>

</template>

<script>
import PieChart from "./PieChart.vue";
import BarChart from "./BarChart.vue";
import LineChart from "./LineChart.vue";
import Notices from "./Notices.vue";
import ConnectionTable from "./ConnectionTable.vue";
import DNSTable from "./DNSTable.vue";
import BarChartHorizontal from "./BarChartHorizontal.vue";
import TimePicker from "./TimePicker.vue";
import ViewDialog from "./ViewDialog.vue";

 
export default {
  components: {
    BarChart,
    PieChart,
    Notices,
    LineChart,
    ConnectionTable,
    DNSTable,
    BarChartHorizontal,
    TimePicker,
    ViewDialog
  },

  name: "Dashboard",
  mounted() {},
  data: () => ({
    
  }),

  computed: {
  views() {
      return this.$store.state.views
    }

  },

  methods: {
    /*
      sets start and end time in store and requests new data from store
      */
    submitDetailTime(startTimestamp, endTimestamp) {
      this.$store.commit("setStartTime", startTimestamp);
      this.$store.commit("setEndTime", endTimestamp);
      this.$store.dispatch("getDashboardDataByTime");
    },
    submitSummaryTime(startTimestamp, endTimestamp) {
      this.$store.commit("setStartTime", startTimestamp);
      this.$store.commit("setEndTime", endTimestamp);
      this.$store.dispatch("summaryData/getDataByTime");
    },
  },
};
</script>

<style scoped>
.dateField {
  max-width: 125px;
  overflow: hidden;
}
</style>