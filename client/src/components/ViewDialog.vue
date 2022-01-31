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
              :disabled="!viewOptions.includes(selectedView)"
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
import {
  viewDataToChartName,
  typeDataToStoreTypeData,
} from "../helperFunctions/labelHelperFunction";

export default {
  computed: {
    dataOptions() {
      var result = [
        "Connections per timeunit",
        "Data volume summary",
        "Data volume per timeunit",
        "DNS queries top k",
        "Origin hosts top k",
        "Ports of interest summary",
        "Protocols summary",
        "Resp hosts top k",
        "Resp ports top k",
        "Services summary",
      ];
      if (this.selectedDataType == "Summary Data") {
        return result;
      } else {
        result.unshift("Connection table", "DNS table", "Notice table");
        return result;
      }
    },

    viewOptions() {
      var summaries = [
        "DNS queries top k",
        "Origin hosts top k",
        "Resp hosts top k",
        "Resp ports top k",
        "Ports of interest summary",
        "Protocols summary",
        "Services summary",
        "Data volume summary",
      ];
      var lineCharts = ["Connections per timeunit", "Data volume per timeunit"];
      if (summaries.includes(this.selectedData)) {
        return [
          "Bar chart horizontal",
          "Bar chart vertical",
          "Pie chart",
          "TreeMap",
        ];
      } else if (lineCharts.includes(this.selectedData)) {
        return ["Line chart"];
      } else if (this.selectedData == "Connection table") {
        return ["Connection table"];
      } else if (this.selectedData == "DNS table") {
        return ["DNS table"];
      } else if (this.selectedData == "Notice table") {
        return ["Notice table"];
      } else return [];
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
        this.$store.dispatch("setDialog", false);
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
      if (
        this.selectedDataType == "" ||
        this.selectedView == "" ||
        this.selectedData == ""
      ) {
        return;
      }
      var summary;
      if (this.selectedDataType == "Summary Data") {
        summary = true;
      } else {
        summary = false;
      }
      var viewData = {
        view: viewDataToChartName(this.selectedView),
        type: typeDataToStoreTypeData(this.selectedData),
        dataLabel: this.selectedData,
        viewLabel: this.selectedView,
        cols: this.windowWidth,
        isSummary: summary,
        isFrozen: false,
      };
      this.$store.dispatch("addView", viewData);
      this.closeDialog();
    },

    updateView() {
      if (
        this.selectedDataType == "" ||
        this.selectedView == "" ||
        this.selectedData == ""
      ) {
        return;
      }
      var summary;
      if (this.selectedDataType == "Summary Data") {
        summary = true;
      } else {
        summary = false;
      }
      var viewData = {
        id: this.$store.state.dialogChartNumber,
        view: viewDataToChartName(this.selectedView),
        type: typeDataToStoreTypeData(this.selectedData),
        dataLabel: this.selectedData,
        viewLabel: this.selectedView,
        cols: this.windowWidth,
        isSummary: summary,
        isFrozen: this.$store.state.dialogIsFrozen,
      };
      this.$store.dispatch("updateView", viewData);
      this.closeDialog();
    },
  },
};
</script>