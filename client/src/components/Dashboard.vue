<template>
<div>
  <v-container fluid>
    <v-row no-gutters>
        <TimePicker
          buttonText="Submit"
          buttonColor="primary"
          @sendTimestamps="submitByTime"
        />
    </v-row>

<v-row>
  <v-col cols="6">
    <FilterTable/> 
  </v-col>
    <v-col v-for="(view,index) in views" v-bind:key="index" :cols="view.cols">
      <component v-bind:isSummary="view.isSummary" v-bind:chartNumber="view.chartNumber" v-bind:data="view.isSummary ? $store.getters['summaryData/dataByType'](view.type):  $store.getters['detailData/dataByType'](view.type)" v-bind:is="view.view" > </component>
    </v-col>

    </v-row>
      <div class=" mt-3 d-flex justify-center flex-row">

      </div>
<ViewDialog/>
  </v-container>
</div>
</template>

<script>
import PieChart from "./PieChart.vue";
import BarChart from "./BarChart.vue";
import LineChart from "./LineChart.vue";
import NoticeTable from "./NoticeTable.vue";
import ConnectionTable from "./ConnectionTable.vue";
import DNSTable from "./DNSTable.vue";
import BarChartHorizontal from "./BarChartHorizontal.vue";
import TimePicker from "./TimePicker.vue";
import ViewDialog from "./ViewDialog.vue";
import FilterTable from "./FilterTable.vue";
import TreeMap from "./TreeMap.vue";

 
export default {
  components: {
    BarChart,
    PieChart,
    TreeMap,
    NoticeTable,
    LineChart,
    ConnectionTable,
    DNSTable,
    BarChartHorizontal,
    TimePicker,
    ViewDialog,
    FilterTable
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
    submitByTime(startTimestamp, endTimestamp) {
      this.$store.commit("setStartTime", startTimestamp);
      this.$store.commit("setEndTime", endTimestamp);
      this.$store.dispatch("summaryData/getDataByTime");
      this.$store.dispatch("detailData/getDataByTime");
      
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