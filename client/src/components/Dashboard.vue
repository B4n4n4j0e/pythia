<template>
  <v-container fluid>
    <v-row no-gutters>
      <div class="d-flex ">
        <TimePicker
          buttonTextLeft="Submit summary"
          buttonColorLeft="primary"
          buttonTextRight="Submit detail"
          buttonColorRight="primary"
          @sendTimestampsLeft="submitSummaryTime"
          @sendTimestampsRight="submitDetailTime"
        />

        <v-select
        v-model="selected"
          :items="datasets"
          item-text="name"
          label="Select Dataset"
          outlined
        ></v-select>

      </div>
    </v-row>

<v-row>
    <v-col v-for="view in views" v-bind:key="view.chartNumber" :cols="view.cols">
      <component v-bind:chartNumber="view.chartNumber" v-bind:data="$store.getters.dataById(view.chartNumber)" v-bind:is="view.view" > </component>
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
import ConnectionChart from "./ConnectionChart.vue";
import DNSChart from "./DNSChart.vue";
import BarChartHorizontal from "./BarChartHorizontal.vue";
import TimePicker from "./TimePicker.vue";
import ViewDialog from "./ViewDialog.vue";


export default {
  components: {
    BarChart,
    PieChart,
    Notices,
    LineChart,
    ConnectionChart,
    DNSChart,
    BarChartHorizontal,
    TimePicker,
    ViewDialog
  },

  name: "Dashboard",
  mounted() {},
  data: () => ({
    
  }),

  computed: {
    datasets() {
            return this.$store.state.datasets
    },
    selected: {
      get: function() {
                  return this.$store.state.selectedDataset
        },

      set: function(newValue) {
                  this.$store.commit('setSelectedDataset',newValue)
        }
    },
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
      this.$store.dispatch("getSummaryDataByTime",this.$store.state.selectedDataset);
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