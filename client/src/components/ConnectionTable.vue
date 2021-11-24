<template>
  <v-card >
        <ChartControls v-bind:chartNumber="chartNumber" class="mb-0" />
    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Filter"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>

    <div class="d-flex">
    <div v-for="header in headers.slice(1)" v-bind:key="header.value" class="d-flex pl-2 ml-2" >
    <v-checkbox 
      
    :label="header.text"
    class="d-flex">
    </v-checkbox>
    </div>    
    </div>
<div>* Search Example: 
  </div>
    <v-data-table
      :headers="headers"
      :items="data.payload"
      :loading="loading"
      :options.sync="options"
      :server-items-length="$store.state.detailData.totalConnectionsCount"
    >

    <template v-slot:item.ts = "{item}"> 
      <span> {{item.ts.toLocaleString()}}</span>
    </template>
    </v-data-table>
  </v-card>
</template>

<script>
import ChartControls from "./ChartControls.vue";

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
      type: Boolean
    }
  },

  components: { ChartControls },
  data: () => ({
    singleSelect: false,
    total: 0,
    entries: [],
    loading: true,
    options: {},
    search: '',
        headers: [
        {text: 'Timestamp', value: 'ts' },
        {text: 'Origin Host', value: 'source'},
        {text: 'Origin Port', value: 'origin_port'},
        {text: 'Responder Host', value: 'target'},
        {text: 'Responder Port', value: 'resp_port'},
        {text: 'Service', value: 'service'},
        {text: 'Protocol', value: 'proto'},
        {text: 'UID', value: 'uid' },
        {text: 'Duration', value: 'duration'},
        {text: 'Responder sent data (in kb)', value: 'resp_ip_bytes'},
        {text: 'Origin sent data (in kb)', value: 'orig_ip_bytes'},
        ],
  }),
    computed: {   

  },
  watch: {

    options: {
      handler () {
          this.getDataFromApi()
        },
        deep: true,
      },
  },

  methods: {
    getDataFromApi() {
      this.loading = true
      this.$store.dispatch("detailData/getConnections",this.options).then(() => {
        this.loading = false
      })

    },
  
  },

}
</script>

<style scoped>
g.tick {
  fill: black;
}

</style>