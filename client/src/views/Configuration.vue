<template>
  <v-container fluid>
    <h1 class="mb-3 text-h4">Configuration | Mode: {{ activeMode }}</h1>
    <v-card>
      <v-container v-if="activeMode == 'Sensor'" fluid>
        <v-row>
          <v-toolbar flat>
            <v-toolbar-title> <h2 class="text-h5">Status</h2> </v-toolbar-title>
            <v-spacer></v-spacer>
            <v-tooltip top>
              <template v-slot:activator="{ on, attrs }">
                <v-btn
                  v-bind="attrs"
                  v-on="on"
                  :loading="refreshLoading"
                  :disabled="refreshLoading"
                  @click="getStatus"
                  right
                  icon
                  class="mt-2 mr-2"
                >
                  <v-icon>mdi-update</v-icon>
                </v-btn>
              </template>
              <span>Refresh status</span>
            </v-tooltip>
          </v-toolbar>
        </v-row>
        <v-row>
          <v-col cols="12">
            <v-simple-table dense v-if="activeMode == 'Sensor'">
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
          </v-col>
        </v-row>
        <v-row no-gutters>
          <v-spacer></v-spacer>
          <v-btn
            @click="deployZeek"
            :loading="deployLoading"
            :disabled="deployLoading"
            color="primary"
            >Deploy</v-btn
          >

          <v-btn
            @click="stopZeek"
            :loading="stopLoading"
            :disabled="stopLoading"
            class="ml-3"
            color="primary"
            >Stop</v-btn
          >
        </v-row>
      </v-container>
    </v-card>
    <v-card class="mt-3">
      <v-toolbar flat>
        <v-toolbar-title><h2 class="text-h5">Zeek Options</h2></v-toolbar-title>
      </v-toolbar>
      <v-form ref="configForm" lazy-validation>
        <v-container fluid>
          <v-row>
            <v-col cols="4">
              <v-checkbox
                v-model="editScanCheckbox"
                label="Activate network scan detection"
              ></v-checkbox>
              <v-checkbox
                v-model="editTraceCheckbox"
                label="Activate traceroute detection"
              ></v-checkbox>
            </v-col>
            <v-col cols="4">
              <v-checkbox
                v-model="editDetailCheckbox"
                label="Collect detail data"
              ></v-checkbox>
              <v-checkbox
                v-model="editSummaryCheckbox"
                label="Collect summary data"
              ></v-checkbox>
            </v-col>
            <v-col cols="3">
              <v-text-field
                label="Set storage location"
                v-model="editLocation"
                :rules="locationRules"
              >
              </v-text-field>
              <v-row no-gutters>
                <v-spacer></v-spacer>
                <v-btn
                  :loading="submitLoading"
                  :disabled="submitLoading"
                  @click="setConfiguration()"
                  color="primary"
                  >Submit
                </v-btn>
              </v-row>
            </v-col>
          </v-row>
        </v-container>
      </v-form>
    </v-card>
    <v-card class="mt-3">
      <v-toolbar flat>
        <v-toolbar-title>
          <h2 class="text-h5">Data Options</h2>
        </v-toolbar-title>
      </v-toolbar>
      <v-container fluid>
        <v-row no-gutters>
          <v-col justify="center" cols="6">
            <h2 class="text-subtitle-1">Summary Data</h2>
            <v-row class="d-flex flex-row" no-gutters>
              <TimePicker
                :buttons="summaryButtons"
                @submitByTime="deleteSummaryByTime"
                @submit="deleteSummaryAll"
              />
            </v-row>
          </v-col>

          <v-col cols="6">
            <h2 class="text-subtitle-1">Detail Data</h2>
            <TimePicker
              :buttons="detailButtons"
              @submitByTime="deleteDetailByTime"
              @submit="deleteDetailAll"
            />
          </v-col>
        </v-row>
      </v-container>
    </v-card>
  </v-container>
</template>
<script>
import TimePicker from "../components/TimePicker.vue";
import ZeekService from "../services/ZeekService";
import ConfigurationService from "../services/ConfigurationService";
import DetailDataService from "../services/DetailDataService";
import SummaryDataService from "../services/SummaryDataService";

export default {
  components: {
    TimePicker,
  },

  name: "Configuration",
  mounted() {
    this.$nextTick(function () {
      this.getConfiguration();
      this.getStatus();
    });
  },
  data: () => ({
    detailButtons: [
      { text: "Delete", color: "error", funcName: "submitByTime" },
      { text: "Delete all", color: "error", funcName: "submit" },
    ],
    summaryButtons: [
      { text: "Delete", color: "error", funcName: "submitByTime" },
      { text: "Delete all", color: "error", funcName: "submit" },
    ],

    locationRules: [
      (value) => {
        var pattern = /^\/((\/$)|((\w+\/)*\w+$)|$)/;
        return pattern.test(value) || "Please enter a valid path";
      },
    ],
    submitLoading: false,
    refreshLoading: false,
    deployLoading: false,
    stopLoading: false,
    status: [],
    scanCheckbox: false,
    traceCheckbox: false,
    summaryCheckbox: true,
    detailCheckbox: true,
    location: "",
    editScanCheckbox: false,
    editTraceCheckbox: false,
    editDetailCheckbox: true,
    editSummaryCheckbox: true,
    editLocation: "",
  }),

  computed: {
    activeMode() {
      return this.$store.state.mode;
    },
  },

  watch: {
    activeMode() {
      this.getConfiguration();
    },
  },

  methods: {
   getStatus() {
      this.refreshLoading = true;
      ZeekService.get()
        .then((response) => {
          this.status = response.data;
        })
        .finally(() => {
          this.refreshLoading = false;
        });
    },

    deployZeek() {
      var data = { command: "deploy" };
      this.deployLoading = true;
      ZeekService.post(data)
        .then(() => {})
        .catch((error) => {
          if (error.response.data.message) {
            let snackBarOptions = {
              message: error.response.data.message,
              color: "error",
            };
            this.$store.dispatch("triggerSnackbar", snackBarOptions);
          }
        })
        .finally(() => (this.deployLoading = false))
        .then(() => this.getStatus());
    },
    stopZeek() {
      this.stopLoading = true;
      var data = { command: "stop" };
      ZeekService.post(data)
        .then((response) => {
          response;
        })
        .catch((error) => {
          if (error.response.data.message) {
            let snackBarOptions = {
              message: error.response.data.message,
              color: "error",
            };
            this.$store.dispatch("triggerSnackbar", snackBarOptions);
          }
        })
        .finally(() => (this.stopLoading = false))
        .then(() => this.getStatus());
    },

    getConfiguration() {
      ConfigurationService.getConfiguration().then((response) => {
        this.location = response.data.path;
        this.traceCheckbox = response.data.traceroute_detection;
        this.scanCheckbox = response.data.network_scan_detection;
        this.detailCheckbox = response.data.detail;
        this.summaryCheckBox = response.data.summary;
        this.editLocation = response.data.path;
        this.editTraceCheckbox = response.data.traceroute_detection;
        this.editScanCheckbox = response.data.network_scan_detection;
        (this.editDetailCheckbox = response.data.detail),
          (this.editSummaryCheckbox = response.data.summary);
      });
    },

    setConfiguration() {
      if (
        (this.detailCheckbox == this.editDetailCheckbox &&
          this.summaryCheckBox == this.editSummaryCheckbox &&
          this.location == this.editLocation &&
          this.traceCheckbox == this.editTraceCheckbox &&
          this.scanCheckbox == this.editScanCheckbox) ||
        !this.$refs.configForm.validate()
      ) {
        return;
      }
      const data = {
        path: this.editLocation,
        traceroute_detection: this.editTraceCheckbox,
        network_scan_detection: this.editScanCheckbox,
        detail: this.editDetailCheckbox,
        summary: this.editSummaryCheckbox,
      };
      this.submitLoading = true;
      ConfigurationService.post(data)
        .then((response) => {
          this.location = response.data.path;
          this.traceCheckbox = response.data.traceroute_detection;
          this.scanCheckbox = response.data.network_scan_detection;
          this.editLocation = response.data.path;
          this.editTraceCheckbox = response.data.traceroute_detection;
          this.editScanCheckbox = response.data.network_scan_detection;
          let snackBarOptions = {
            message: "Configuration updated",
            color: "success",
            timeout: 2000,
          };
          this.$store.dispatch("triggerSnackbar", snackBarOptions);
          this.submitLoading = false;
        })
        .catch((error) => {
          if (error.response.data.message) {
            let snackBarOptions = {
              message: error.response.data.message,
              color: "error",
              timeout: 5000,
            };
            this.$store.dispatch("triggerSnackbar", snackBarOptions);
          }
        })
        .finally(() => {
          this.submitLoading = false;
        })
        .then(() => this.getStatus());
    },
    deleteSummaryByTime(startTime, endTime) {
      SummaryDataService.delete(startTime/1000, endTime/1000).then(() => {
        let snackBarOptions = {
          message: "The deletion was successful",
          color: "success",
          timeout: 2000,
        };
        this.$store.dispatch("triggerSnackbar", snackBarOptions);
      });
    },

    deleteDetailByTime(startTime, endTime) {
      DetailDataService.delete(startTime/1000, endTime/1000).then(() => {
        let snackBarOptions = {
          message: "The deletion was successful",
          color: "success",
          timeout: 2000,
        };
        this.$store.dispatch("triggerSnackbar", snackBarOptions);
      });
    },
    deleteSummaryAll() {
      SummaryDataService.delete().then(() => {
        let snackBarOptions = {
          message: "The deletion was successful",
          color: "success",
          timeout: 2000,
        };
        this.$store.dispatch("triggerSnackbar", snackBarOptions);
      });
    },
    deleteDetailAll() {
      DetailDataService.delete().then(() => {
        let snackBarOptions = {
          message: "The deletion was successful",
          color: "success",
          timeout: 2000,
        };
        this.$store.dispatch("triggerSnackbar", snackBarOptions);
      });
    },
  },
};
</script>

<style scoped>
</style>