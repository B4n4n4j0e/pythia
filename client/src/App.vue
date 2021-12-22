<template>
  <v-app>
        <Top-navigation/>
    <v-snackbar
      v-model="snackbar"
      :timeout="timeout"
      top
      right
    >
      {{ snackbarMessage }}
      <template v-slot:action="{ attrs }">
        <v-btn
          color="primary"
          text
          v-bind="attrs"
          @click="snackbar = false"
        >
          Close
        </v-btn>
      </template>
    </v-snackbar>
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
    this.$store.dispatch('getDashboardNames');
  })
},

mounted() {
    const theme = localStorage.getItem("dark_theme");
    if (theme) {
        if (theme == "true") {
            this.$vuetify.theme.dark = true;
        } else {
            this.$vuetify.theme.dark = false;
        }
  }
},

  components: {
    TopNavigation,
},

  computed:{
    snackbar:{
        get() {
          return this.$store.state.snackbar
        },
          set(newOptions) {
            this.$store.commit('setSnackbar',newOptions)
         }
    },
    snackbarMessage() {
      return this.$store.state.snackbarMessage
    }
  },
  methods: {
    

  },

  data: () => ({
      timeout: 10000,
  }),
};
</script>
<style >

.v-progress-circular{
    position: absolute;			
    left: 50%;  
    top: 50%
}

div.tooltip {	
    position: absolute;			
    text-align: center;						
    padding: 2px;				
    font: 12px sans-serif;		
    background:black;	
    border: 0px;		
    border-radius: 8px;			
    pointer-events: none;			
    opacity: 0;			

}

</style>
