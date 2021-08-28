<template>
    <v-container fluid>
      <v-row no-gutters>
        <v-toolbar flat>
          <v-toolbar-title> Status </v-toolbar-title>
        </v-toolbar>

        <v-spacer></v-spacer>
        <v-btn right class="mt-2 mr-2">Refresh</v-btn>
      </v-row>
      <v-simple-table dense>
        <template v-slot:default>
          <thead>
            <tr>
              <th class="text-left">Name</th>
              <th class="text-left">Type</th>
              <th class="text-left">Host</th>
              <th class="text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="item in status" :key="item.name">
              <td>{{ item.name }}</td>
              <td>{{ item.type }}</td>
              <td>{{ item.host }}</td>
              <td>{{ item.status }}</td>
            </tr>
          </tbody>
        </template>
      </v-simple-table>
      <v-toolbar flat>
        <v-toolbar-title> Zeek Options </v-toolbar-title>
      </v-toolbar>
      <v-container fluid>
        <v-row>
          <v-col cols="3">
            <v-checkbox
              v-model="scanCheckbox"
              label="Activate network scan detection"
            ></v-checkbox>

            <v-checkbox
              v-model="dnsCheckbox"
              label="Activate DNS-tunneling detection"
            ></v-checkbox>
            <v-checkbox
              v-model="traceCheckbox"
              label="Activate traceroute detection"
            ></v-checkbox>
          </v-col>
          <v-col cols="4">
            <v-text-field
              label="Set storage location Sensor"
              v-model="sensorLocation"
            >
            </v-text-field>

            <v-text-field
              label="Set storage location PCAP"
              v-model="pcapLocation"
            >
            </v-text-field>
            <v-row>
              <v-spacer></v-spacer>
              <v-btn class="mr-4">Submit </v-btn>
            </v-row>
          </v-col>
        </v-row>
      </v-container>

            <v-toolbar flat >
          <v-toolbar-title > Sensor data </v-toolbar-title>
        </v-toolbar>
    <v-container fluid>
      <v-row no-gutters>
        <v-col cols="6">
        <v-toolbar flat>
          <v-toolbar-title> Summary data </v-toolbar-title>
        </v-toolbar>
          <v-checkbox
              v-model="sensorSummaryCheckbox"
              label="Activate the collection of summary data"
            ></v-checkbox>
        <TimePicker
          buttonColor="error"
          buttonText="Delete "
          @sendTimeStamps="deleteSummaryByTime"
        />
        <v-btn class='mt-5' @click="test" color="error"> Delete All </v-btn>
        </v-col>
        <v-col cols="6">
        <v-toolbar flat>
          <v-toolbar-title> Detail data </v-toolbar-title>
        </v-toolbar>
             <v-checkbox
              v-model="sensorDetailCheckbox"
              label="Activate the collection of detail data"
            ></v-checkbox>
        <TimePicker
          buttonColor="error"
          buttonText="Delete "
          @sendTimeStamps="deleteSummaryByTime"
        />
        <v-btn class='mt-5' color="error"> Delete All </v-btn>
        </v-col>
      </v-row>

      </v-container>
           <v-toolbar flat >
          <v-toolbar-title > PCAP data </v-toolbar-title>
        </v-toolbar>

    <v-container fluid>
      <v-row no-gutters>
        <v-col cols="6">
        <v-toolbar flat>
          <v-toolbar-title> Summary data </v-toolbar-title>
        </v-toolbar>
                 <v-checkbox
              v-model="pcapDetailCheckbox"
              label="Activate the collection of summary data"
            ></v-checkbox>
                         <v-checkbox
              v-model="pcapDetailCheckbox"
              label="Hyperlog"
            ></v-checkbox>
        <TimePicker
          buttonColor="error"
          buttonText="Delete "
          @sendTimeStamps="deleteSummaryByTime"
        />
        <v-btn class='mt-5' @click="test" color="error"> Delete All </v-btn>
        </v-col>
        <v-col cols="6">
        <v-toolbar flat>
          <v-toolbar-title> Detail data </v-toolbar-title>
        </v-toolbar>
            <v-checkbox
              v-model="pcapDetailCheckbox"
              label="Activate the collection of detail data"
            ></v-checkbox>
        <TimePicker
          buttonColor="error"
          buttonText="Delete "
          @sendTimeStamps="deleteSummaryByTime"
        />

        <v-btn class='mt-5' color="error"> Delete All </v-btn>
        </v-col>
      </v-row>
      </v-container>
    </v-container>


</template>

<script>
import TimePicker from "./TimePicker.vue";
import ConfigurationService from "../services/ConfigurationService";
export default {
  components: {
    TimePicker,
  },

  name: "Configuration",
  mounted() {
    this.$nextTick(function () {
      this.status = ConfigurationService.getStatus();
      ConfigurationService.getStatus().then((response) => {
        this.status = response.data;
      });
    });
  },
  data: () => ({
    status: [],
    scanCheckbox: false,
    traceCheckbox: false,
    dnsCheckbox: false,
    pcapLocation: "",
    sensorLocation: "",
  }),
  computed: {},

  methods: {
    test() {
      console.log(this.status);
    },
    deleteSummaryByTime(startTime, endTime) {
      console.log(startTime);
      console.log(endTime);
    },
  },
};
</script>

<style scoped>
</style>