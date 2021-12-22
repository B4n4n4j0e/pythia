<template>
  <v-card  max-height="750px">
        <ChartControls v-bind:chartNumber="chartNumber" class="mb-0" />
    <v-data-table
      :headers="headers"
      :items="data.payload"
      :loading="loading"
      :options.sync="options"
      :server-items-length="$store.state.detailData.totalDNSConnectionsCount"
      :footer-props="{
      'items-per-page-options': [10, 25, 50, 100]
      }"
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
  
  headers: [
      { text: "Timestamp", value: "ts" },
      { text: "Origin Host", value: "source" },
      { text: "Responder Host", value: "target" },
      { text: "Query", value: "query_text" },
      { text: "Answers", value: "q_answers" },
      { text: "Query type", value: "q_type" },
      { text: "Error Code", value: "q_rcode" },
      { text: "UID", value: "uid" },
    ],
  }),
    computed: {
          loading(){
      return this.data.loading
    },
      options: {
        get() {
          return this.$store.state.detailData.dNSTableOptions
        },
          set(newOptions) {
            this.$store.commit('detailData/setDNSTableOptions',newOptions)
         }
         
      },

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
      this.$store.dispatch("detailData/getDNSConnections",this.options).then(() => {
      })

    },
  },

}
</script>

<style scoped>
.v-card {
  overflow-y: auto;
  overflow-x: auto;

}

</style>


  