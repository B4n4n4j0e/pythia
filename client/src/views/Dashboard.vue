<template>
<div>
  <v-container fluid>
  
  <v-card>
  <v-container fluid>
    <v-row no-gutters>
    <v-col cols="4">
        <TimePicker
          buttonText="Submit"
          buttonColor="primary"
          :buttons="buttons"
          @submitByTime="submitByTime"
        />
          </v-col>
                <v-divider class="mx-4"  vertical></v-divider>
        <v-col cols="5">
        <DataSummaryTable/>
        </v-col>
    </v-row>
    </v-container>
  </v-card>

<v-row class="mt-2">
  <v-col cols="6">
    <FilterTable/> 
  </v-col>
    <v-col v-for="(view) in views" v-bind:key="view.chartNumber" :cols="view.cols">
      <component v-bind:isFrozen="view.isFrozen" v-bind:isSummary="view.isSummary" v-bind:chartNumber="view.chartNumber" v-bind:data="view.isSummary ? $store.getters['summaryData/dataByType'](view.type):  $store.getters['detailData/dataByType'](view.type)" v-bind:is="view.view" > </component>
    </v-col>

    </v-row>
      <div class=" mt-3 d-flex justify-center flex-row">

      </div>
<ViewDialog/>
  </v-container>
</div>
</template>

<script>
import PieChart from "../components/chartComponents/PieChart.vue";
import BarChart from "../components/chartComponents/BarChart.vue";
import LineChart from "../components/chartComponents/LineChart.vue";
import NoticeTable from "../components/chartComponents/NoticeTable.vue";
import ConnectionTable from "../components/chartComponents/ConnectionTable.vue";
import DNSTable from "../components/chartComponents/DNSTable.vue";
import BarChartHorizontal from "../components/chartComponents/BarChartHorizontal.vue";
import TimePicker from "../components/TimePicker.vue";
import ViewDialog from "../components/ViewDialog.vue";
import FilterTable from "../components/FilterTable.vue";
import TreeMap from "../components/chartComponents/TreeMap.vue";
import DataSummaryTable from "../components/DataSummaryTable.vue";
 
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
    FilterTable,
    DataSummaryTable
  },

  name: "Dashboard",

  mounted() {},
  data: () => ({
      buttons : [{text: 'Submit', color:'primary', funcName: 'submitByTime'}]
  }),

  computed: {
  views() {
      return this.$store.state.views
    }

  },

  methods: {
    submitByTime(startTimestamp, endTimestamp) {
      this.$store.dispatch("setStartTime", startTimestamp);
      this.$store.dispatch("setEndTime", endTimestamp).then(() => {
      this.$store.dispatch("getAllData")
      });

    },
  },
};
</script>

<style scoped>
.dateField {
  max-width: 125px;
  overflow: hidden;

}

>>>.v-progress-circular{
    position: absolute;			
    left: 50%;  
    top: 50%

}
</style>

