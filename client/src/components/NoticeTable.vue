<template>
  <v-card  max-height="750px">
    <ChartControls v-bind:chartNumber="chartNumber" class="mb-0" />
    <v-data-table
    dense
      :headers="headers"
      :items="data.payload"
      :loading="loading"
      :options.sync="options"
      :server-items-length="$store.state.detailData.totalNoticesCount"
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
    loading: true,
        headers: [
        {text: 'Timestamp', value: 'ts' },
        {text: 'Message Header', value: 'note'},
        {text: 'Message', value: 'msg'},
        {text: 'Origin Host', value: 'notice_source'},
        {text: 'Responder Host', value: 'notice_target'},
        {text: 'UID', value: 'notice_uid' },
        ],
  }),
    computed: {
      options: {
        get() {
          return this.$store.state.detailData.noticesTableOptions
        },
          set(newOptions) {
            this.$store.commit('detailData/setNoticesTableOptions',newOptions)
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
      this.loading = true
      this.$store.dispatch("detailData/getNotices",this.options).then(() => {
        this.loading = false
      })

    },
  },

}
</script>

<style scoped>
.v-card {
  overflow-y: auto;
}

</style>