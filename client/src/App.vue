<template>
  <v-app>
        <Top-navigation/>
<v-main>
  <v-container fluid>
    <router-view></router-view>
  </v-container>
</v-main>
  </v-app>

</template>

<script>
import TopNavigation from './components/TopNavigation.vue';
export default {
  name: 'App',

created() {
  this.$nextTick(function () {
    var startTime = new Date(Date.now())
    var endTime = new Date(startTime).getTime()
    startTime.setHours(startTime.getHours()-1)
    startTime = startTime.getTime()
    this.$store.commit('setStartTime',startTime)
    this.$store.commit('setEndTime',endTime)
    this.$store.dispatch('summaryData/getSummaryDataByTime')
    
  })
},


  components: {
    TopNavigation,
},
  methods: {

  },

  data: () => ({
    //
  }),
};
</script>
