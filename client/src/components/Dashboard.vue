<template>
      <v-container fluid>
<v-row>
<TimePicker buttonText="Submit" buttonColor="primary" @sendTimestamps="submitTime" />

</v-row>
<v-row>
  <v-col cols=5 >
   <PieChart  v-bind:chartNumber=3 v-bind:data="this.$store.state.protocolSummary"/>
     </v-col>
<v-col cols="5">
      <BarChartHorizontal  v-bind:chartNumber=2 v-bind:data="this.$store.state.protocolSummary"/>
</v-col>

</v-row>
<v-row>
  <v-col cols="4">
      <BarChart v-bind:chartNumber=1 v-bind:data="this.$store.state.ipByteSummary"
/>
  </v-col>
  <v-col>
    <LineChart v-bind:chartNumber=4 v-bind:data="this.$store.state.ipByteSummaryByTime"/>
  </v-col>
</v-row>
<v-row>
    <v-col>
    <LineChart v-bind:chartNumber=5 v-bind:data="this.$store.state.connectionSummary"/>
  </v-col>
</v-row>
<v-row>
<v-col cols="12">
      <ConnectionChart/>
</v-col>
<v-col cols="12">
      <DNSChart/>
</v-col>
     <v-col>
 <Notices/>
   </v-col>
</v-row>

 </v-container>

</template>

<script>
import PieChart from './PieChart.vue';
import BarChart from './BarChart.vue'
import LineChart from './LineChart.vue'
import Notices from './Notices.vue';
import ConnectionChart from './ConnectionChart.vue';
import DNSChart from './DNSChart.vue';
import BarChartHorizontal from './BarChartHorizontal.vue';
import TimePicker from './TimePicker.vue'


  export default {
    components:{
      BarChart,
      PieChart,
      Notices,
      LineChart,
      ConnectionChart,
      DNSChart,
      BarChartHorizontal,
      TimePicker
    },

    name: 'Dashboard',
    mounted() {

    },
    data: () => ({

    }),
    computed:{

    },

    methods: {

      /*
      sets start and end time in store and requests new data from store
      */
      submitTime(startTimestamp, endTimestamp ) {
        this.$store.commit('setStartTime',startTimestamp)
        this.$store.commit('setEndTime',endTimestamp)
        this.$store.dispatch('getDashboardDataByTime')
      }
  
  }}
</script>

<style scoped>
.dateField{
    max-width:125px;
    overflow: hidden
}

</style>