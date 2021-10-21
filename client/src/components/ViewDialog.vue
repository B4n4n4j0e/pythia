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
                    v-model="selectedData"
                    :disabled="selectedDataType == ''"
                    :items="dataOptions"
                    label="Choose data*"
                    required
                  ></v-select>
                </v-col>
              </v-row>
              <v-row>
                <v-col cols="12" sm="6">
                  <v-select
                    v-model="selectedView"
                    :disabled="selectedData == ''"
                    :items="viewOptions"
                    label="Choose view*"
                    required
                  ></v-select> 
                </v-col>
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
          "Connection table",
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
      } else if (this.selectedData == "Connection table") {
        return ["Connection table"];
      } else if (this.selectedData == "DNS table") {
        return ["DNS table"];
      } else if (this.selectedData == "Notices"){
        return ["Notices"];
      }
      else return [];
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


        if (this.$store.state.dialogIsSummary) {
          this.selectedDataType = "Summary Data";
        } else {
          this.selectedDataType = "Detail Data";
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
    selectedView: "",
    selectedData: "",
    windowWidth: 6,
  }),
  methods: {

    closeDialog() {
      this.selectedDataType = "";
      this.selectedView = "";
      this.dialogTitle = "Add view";
      this.selectedData = "";
      this.dialogBool = false;
    },


    saveView() {
      var summary
      if (this.selectedDataType == 'Summary Data'){
        summary = true
      }
      else {
        summary = false 
      }
      var viewData = {
        view: this.viewDataToChartName(this.selectedView),
        type: this.typeDataToStoreTypeData(this.selectedData),
        dataLabel: this.selectedData,
        viewLabel: this.selectedView,
        cols: this.windowWidth,
        isSummary: summary,
        isFrozen: false
      };
      this.$store.dispatch("addViewAndIncrementViewCounter", viewData);
      this.closeDialog();
    },

    updateView() {
      var summary
      if (this.selectedDataType == 'Summary Data'){
        summary = true
      }
      else {
        summary = false 
      }
      var viewData = {
        view: this.viewDataToChartName(this.selectedView),
        type: this.typeDataToStoreTypeData(this.selectedData),
        dataLabel: this.selectedData,
        viewLabel: this.selectedView,
        cols: this.windowWidth,
        isSummary: summary,

      };
      this.$store.dispatch("updateViewAndCounter", viewData);
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
        case "Connection table":
          return "ConnectionTable";
        case "DNS table":
          return "DNSTable";
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
          return "connectionSummaryPerHour";
        case "Protocols summary":
          return "protocolSummary";
        case "Services summary":
          return "serviceSummary";
        case "Kilobytes summary":
          return "ipByteSummary";
        case "Kilobytes per hour":
          return "ipByteSummaryByTime";
        case "DNS table":
          return "dNSTable";
        case "Connection table":
          return "connectionTable";
        case "Connections per minute":
          return "connectionSummaryPerMinute";
        case "Notices":
          return "notices";
        default:
          break;
      }
    },
  },
};
</script>