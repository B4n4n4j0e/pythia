<template>
      <v-container fluid>
<v-row>
<v-menu v-model="startDateMenu"
:close-on-content-click="false"
:nudge-right="40" 
 transition="scale-transition"
 offset-y
 min-width="auto"
>
  <template v-slot:activator="{ on, attrs }">
          <v-text-field
            class="dateField"
            v-model="startDate"
            label="Start date"
            prepend-icon="mdi-calendar"
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="startDate"
          @input="startDateMenu = false"
        ></v-date-picker>
</v-menu>
 <v-menu 
        ref="startTimeRef"
        v-model="startTimeMenu"
        :return-value.sync="startTime"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            v-bind="attrs"            
            class="dateField"
            v-model="startTime"
            label="Start time"
            prepend-icon="mdi-clock-time-four-outline"
            readonly
            v-on="on"
          ></v-text-field>
        </template>
        <v-time-picker
          v-if="startTimeMenu"
          v-model="startTime"
          full-width
          @click:minute="$refs.startTimeRef.save(startTime)"
          ></v-time-picker>
      </v-menu>

<v-menu v-model="endDateMenu"
:close-on-content-click="false"
:nudge-left="40" 
 transition="scale-transition"
 offset-y
 min-width="auto"
>
  <template v-slot:activator="{ on, attrs }">
          <v-text-field
          class="dateField"
            v-model="endDate"
            label="End Date"
            prepend-icon="mdi-calendar"
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="endDate"
          @input="endDateMenu = false"
        ></v-date-picker>
</v-menu>

 <v-menu
        ref="endTimeRef"
        v-model="endTimeMenu"
        :close-on-content-click="false"
        :nudge-left="40"
        :return-value.sync="endTime"
        transition="scale-transition"
        offset-y
        max-width="290px"
        min-width="290px"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            class="dateField"
            v-model="endTime"
            label="End Time"
            prepend-icon="mdi-clock-time-four-outline"
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-time-picker
          v-model="endTime"
          v-if="endTimeMenu"
          full-width
          @click:minute="$refs.endTimeRef.save(endTime)"
          
        ></v-time-picker>
      </v-menu>
</v-row>
<v-row>
<v-btn :color=buttonColor @click="submitTime">{{this.buttonText}}</v-btn>
</v-row>

 </v-container>

</template>

<script>


  export default {  
      props: {
             buttonColor: {
                 default: 'primary'
             },
             buttonText: {
                 type: String
             }

  },

    name: 'TimePicker',
    mounted() {
        this.$nextTick(function () {
          this.startTime = this.$store.getters.startTime
          this.endTime = this.$store.getters.endTime
          this.startDate = this.$store.getters.startDate
          this.endDate = this.$store.getters.endDate
        })

    },
    data: () => ({
        startDateMenu: false,
        startTimeMenu: false,
        endDateMenu: false,
        endTimeMenu: false,

        startTime: null,
        endTime: null,
        startDate: null,
        endDate: null 
    }),
    computed:{

    },

    methods: {

      /*
      sets start and end time in store and requests new data from store
      */
      submitTime() {
        var time = this.startTime.split(":") 
        var date = this.startDate.split("-").map(x => parseInt(x))
        var startTimestamp = new Date(date[0],date[1]-1,date[2],time[0],time[1],0).getTime()
        
        time = this.endTime.split(":") 
        date = this.endDate.split("-").map(x => parseInt(x))
        var endTimestamp = new Date(date[0],date[1]-1,date[2],time[0],time[1],0).getTime()
        var timestamps = { startTimestamp: startTimestamp, endTimestamp: endTimestamp}
        console.log(timestamps)

        this.$emit('sendTimestamps', startTimestamp,endTimestamp);



      }
  
  }}
</script>

<style scoped>
.dateField{
    max-width:125px;
    overflow: hidden
}

</style>