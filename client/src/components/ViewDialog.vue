<template>
  <v-container class="mt-4" fluid>
    <v-row justify="center">
      <v-dialog v-model="dialogBool" persistent max-width="600px">
        <template v-slot:activator="{ on, attrs }">
          <v-btn dark v-bind="attrs" v-on="on" class="mx-2" fab color="primary">
            <v-icon dark> mdi-plus </v-icon>
          </v-btn>
        </template>
        <v-card>
          <v-card-title>
            <span class="text-h5">{{ dialogTitle }}</span>
          </v-card-title>
          <v-card-text>
            <v-container>
              <v-row>
                <v-col>
                  <v-select
                    v-model="selectedDataType"
                    :items="['Summary Data', 'Detail Data']"
                    label="Data type*"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-if="selectedDataType == 'Summary Data'"
                    v-model="selectedDataset"
                    :items="datasets"
                    label="Dataset*"
                    required
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="selectedData"
                    :disabled="selectedDataType == ''"
                    :items="dataOptions"
                    label="Choose data*"
                    required
                  ></v-select>
                </v-col>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="selectedView"
                    :disabled="selectedData == ''"
                    :items="viewOptions"
                    label="Choose view*"
                    required
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="3">
                  <v-select
                    v-model="windowWidth"
                    :items="[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]"
                    label="Width*"
                    required
                  ></v-select>
                </v-col>
              </v-row>
            </v-container>
            <small>*indicates required field</small>
          </v-card-text>
          <v-card-actions>
            <v-spacer></v-spacer>
            <v-btn color="primary" text @click="closeDialog"> Close </v-btn>
            <v-btn
              color="primary"
              :disabled="selectedView == ''"
              text
              v-on="
                dialogTitle == 'Add view'
                  ? { click: () => saveView() }
                  : { click: () => updateView() }
              "
            >
              Save
            </v-btn>
          </v-card-actions>
        </v-card>
      </v-dialog>
    </v-row>
  </v-container>
</template>

<script>
export default {
  computed: {
    datasets() {
      return this.$store.getters.datasetsArrayWithNames;
    },
    dataOptions() {
      var result = [
        "Top k DNS queries",
        "Top k origin hosts",
        "Top k resp hosts",
        "Top k resp ports",
        "Ports of interest summary",
        "Connections per hour",
        "Protocols summary",
        "Services summary",
        "Kilobytes summary",
        "Kilobytes per hour",
      ];
      if (this.selectedDataType == "Summary Data") {
        return result;
      } else {
        result.unshift(
          "DNS table",
          "Connections table",
          "Connections per minute",
          "Notices"
        );
        return result;
      }
    },
    viewOptions() {
      var summaries = [
        "Top k DNS queries",
        "Top k origin hosts",
        "Top k resp hosts",
        "Top k resp ports",
        "Ports of interest summary",
        "Protocols summary",
        "Services summary",
        "Kilobytes summary",
      ];
      var lineCharts = [
        "Connections per minute",
        "Connections per hour",
        "Kilobytes per hour",
      ];
      if (summaries.includes(this.selectedData)) {
        return ["Bar chart horizontal", "Bar chart vertical", "Pie chart"];
      } else if (lineCharts.includes(this.selectedData)) {
        return ["Line chart"];
      } else if (this.selectedData == "Connections table") {
        return ["Connections table"];
      } else if (this.selectedData == "DNS table") {
        return ["DNS table"];
      } else {
        return ["Notices"];
      }
    },
    dialog() {
      return this.$store.state.dialog;
    },
  },

  watch: {
    dialog: function () {
      if (this.dialog == false) {
        return;
      } else {
        this.$store.commit("setDialog", false);

        if (this.$store.state.dialogName == "connections") {
          this.selectedDataType = "Detail data";
        } else {
          this.selectedDataType = "Summary Data";
          this.selectedDataset = this.$store.state.dialogName;
        }
        this.dialogTitle = "Edit View";
        this.selectedData = this.$store.state.dialogDataLabel;
        this.selectedView = this.$store.state.dialogViewLabel;
        this.windowWidth = this.$store.state.dialogCols;
        this.dialogBool = true;

      }
    },
  },
  data: () => ({
    dialogBool: false,
    dialogTitle: "Add view",
    selectedDataType: "",
    selectedDataset: "",
    selectedView: "",
    selectedData: "",
    windowWidth: 6,
  }),
  methods: {

    closeDialog() {
      this.selectedDataType = "";
      this.selectedDataset = "";
      this.selectedView = "";
      this.dialogTitle = "Add view";
      this.selectedData = "";
      this.dialogBool = false;
    },


    saveView() {
      var viewData = {
        name: this.selectedDataset,
        view: this.viewDataToChartName(this.selectedView),
        type: this.typeDataToStoreTypeData(this.selectedData),
        dataLabel: this.selectedData,
        viewLabel: this.selectedView,
        cols: this.windowWidth,
        summary: true
      };
      if (viewData.name == "") {
        viewData.name = "connections";
        viewData.summary = false
      }
      this.$store.commit("addView", viewData);
      this.closeDialog();
    },

    updateView() {
      var viewData = {
       name: this.selectedDataset,
        view: this.viewDataToChartName(this.selectedView),
        type: this.typeDataToStoreTypeData(this.selectedData),
        dataLabel: this.selectedData,
        viewLabel: this.selectedView,
        cols: this.windowWidth,
      };
      if (viewData.name == "") {
        viewData.name = "connections";
      }
      this.$store.commit("updateView", viewData);
      this.closeDialog();
    },

    viewDataToChartName(selectedView) {
      switch (selectedView) {
        case "Bar chart horizontal":
          return "BarChartHorizontal";
        case "Bar chart vertical":
          return "BarChart";
        case "Pie chart":
          return "PieChart";
        case "Line chart":
          return "LineChart";
        case "Connections table":
          return "ConnectionChart";
        case "DNS table":
          return "ConnectionChart";
        case "Notices":
          return "Notices";
        default:
          break;
      }
    },

    typeDataToStoreTypeData(typeData) {
      switch (typeData) {
        case "Top k DNS queries":
          return "topKDNSQueries";
        case "Top k origin hosts":
          return "topKOriginHosts";
        case "Top k resp hosts":
          return "topKRespHosts";
        case "Top k resp ports":
          return "topKRespPorts";
        case "Ports of interest summary":
          return "portsOfInterest";
        case "Connections per hour":
          return "connectionSummaries";
        case "Protocols summary":
          return "protocolSummaries";
        case "Services summary":
          return "serviceSummaries";
        case "Kilobytes summary":
          return "ipByteSummaries";
        case "Kilobytes per hour":
          return "ipByteSummariesByTime";
        case "DNS table":
          return "dnsTable";
        case "Connections table":
          return "connectionTable";
        case "Connections per minute":
          return "connectionsPerMinute";
        case "Notices":
          return "Notices";
        default:
          break;
      }
    },
  },
};
</script>