<template>
  <v-card  max-height="375px">
    <ChartControls v-bind:data="data" v-bind:chartNumber="chartNumber" class="mb-0" />
         <v-card-title>Notices</v-card-title>
  <v-expansion-panels>
    <v-expansion-panel
      v-for="(item,i) in data.payload"
      :key="i"
    >
      <v-expansion-panel-header>
      {{showDate(item.ts)}} || {{item.note}}
      </v-expansion-panel-header>
      <v-expansion-panel-content>
       <span style="font-weight:bold"> message: </span> {{item.msg}}  <br>
       <span style="font-weight:bold"> connection uid: </span> {{item.uid}} <br>
       <div v-if="item.uid != '-'" >
       <span style="font-weight:bold"> Source IP: </span> {{ item['connection.origin_host'] }}  <br>
        <span style="font-weight:bold"> Destination IP: </span> {{ item['connection.resp_host'] }}  <br>
        </div>

      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>

  </v-card>
</template>

<script>

import ChartControls from "../components/ChartControls.vue";

export default {
  components: { ChartControls },
  name: "Notices",
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
      type: Boolean
    },
  },
data: () => ({}),

  computed: {

  },

  methods: {
    showDate(time) {
      return time.toLocaleString()
    }

   
  },
};
</script>

<style scoped>
.v-card {
  overflow-y: auto;
}

</style>