  <template>
    <div class="d-flex flex-row">    
        <v-card-text class="ml-4"> {{view.dataLabel}} </v-card-text>
          <v-btn justify-right class="ml-4" @click="freezeView" text :color="view.isFrozen ? 'blue' : 'grey'">
              <v-icon>mdi-snowflake</v-icon> 
          </v-btn>
          <v-btn justify-right class="ml-4" @click="configureView" text color="primary">
              <v-icon>mdi-cog</v-icon>
          </v-btn>
          <v-btn  text @click="removeView" color="error">X</v-btn>
              </div>
</template>

<script>

export default {
  props: {
    chartNumber: {
      required: true,
      type: Number,
    },
  },

  data: () => ({

  }),
    computed: {
      view() {
        return this.$store.getters.viewById(this.chartNumber)
      },

  
  },


  methods: {
    removeView() {
      this.$store.dispatch('removeView',this.view)
    },
    
    configureView() {
      this.$store.commit('openViewOption',this.chartNumber)
    },

    freezeView() {
      if (this.view.isFrozen){
        this.$store.commit('unfreezeView',this.chartNumber)
      }
      else {
            this.$store.commit('freezeView', this.chartNumber)
  
      }

    } 
  
  },

}
</script>

<style scoped>

</style>