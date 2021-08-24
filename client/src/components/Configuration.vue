<template>
  <v-card>
    <v-container>
      Status: Proxy: Running, Worker: Running, Logger,
      <v-btn>Refresh Button</v-btn>
      <v-checkbox
        v-model="checkbox"
        label="Activate network scan detection"
      ></v-checkbox>
      <v-row>
        <v-col cols="2">
          <v-text-field label="Set storage location Sensor" v-model="sensorLocation">
          </v-text-field>
        </v-col>
        <v-col cols="2">
          <v-text-field label="Set storage location PCAP" v-model="pcapLocation">
          </v-text-field>
        </v-col>
      </v-row>
      <v-row>
        <v-card width="50%">
          <v-toolbar flat>
            <v-toolbar-title> Summary data </v-toolbar-title>
          </v-toolbar>
          <TimePicker
            buttonColor="error"
            buttonText="Delete "
            @sendTimeStamps="deleteSummaryByTime"
          />
          <v-btn color="error"> Delete All </v-btn>
        </v-card>
        <v-card width="50%">
          <v-toolbar flat>
            <v-toolbar-title> Detail data </v-toolbar-title>
          </v-toolbar>
             <TimePicker buttonColor="error" buttonText="Delete "  @sendTimeStamps="deleteSummaryByTime"/>
          <v-btn color="error"> Delete All </v-btn>
        </v-card>
      </v-row>
    </v-container>
  </v-card>
</template>

<script>
import TimePicker from "./TimePicker.vue";

export default {
  components: {
    TimePicker,
  },

  name: "Configuration",
  mounted() {},
  data: () => ({
    checkbox: "",
    pcapLocation:"",
    sensorLocation:""
  }),
  computed: {},

  methods: {
    deleteSummaryByTime(startTime, endTime) {
      console.log(startTime);
      console.log(endTime);
    },
  },
};
</script>

<style scoped>
</style>