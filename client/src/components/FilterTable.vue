<template>
  <v-card>
    <v-data-table
      dense
      :headers="headers"
      :items="filters"
      hide-default-footer
      :item-class="itemRowBackground"
    >
      <template v-slot:top>
        <v-toolbar flat>
          <v-toolbar-title>Filter</v-toolbar-title>
          <v-divider class="mx-4" inset vertical></v-divider>
          <v-spacer></v-spacer>
          <v-dialog v-model="dialog" max-width="500px">
            <template v-slot:activator="{ on, attrs }">
              <v-btn
                color="primary"
                small
                class="mb-2"
                v-bind="attrs"
                v-on="on"
              >
                New Filter
              </v-btn>
              <v-btn
                color="primary"
                small
                class="mb-2 mr-2"
                @click="dialogDelete = true"
              >
                Clear Filter
              </v-btn>
            </template>
            <v-card>
              <v-card-title>
                <span class="text-h5">Add Filter </span>
              </v-card-title>
              <v-card-text>
                <v-container>
                  <v-row>
                    <v-col class="d-flex" cols="5">
                      <v-select
                        v-model="selectedOption"
                        :items="options"
                        label="Select Option"
                      ></v-select>
                    </v-col>
                    <v-col class="d-flex" cols="7">
                      <v-text-field
                        v-model="filterText"
                        append-icon="mdi-filter"
                        label="Filter*"
                        :rules="
                          selectedOption.startsWith('Text') ?  [] : numberRules
                        "
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row v-if="selectedOption == 'Text'">
                    <div
                      v-for="(textOption,i) in textOptions"
                      v-bind:key="i"
                      class="d-flex pl-2 ml-2"
                    >
                      <v-checkbox
                        v-model="textOption.isActive"
                        :label="textOption.text"
                        class="d-flex"
                      >
                      </v-checkbox>
                    </div>
                  </v-row>
                  <v-row v-else-if="selectedOption == 'Port'">
                    <v-col cols="4">
                      <v-row
                        no-gutters
                        v-for="(portOption,i) in portOptions"
                        v-bind:key="i"
                        class="d-flex"
                      >
                        <v-checkbox
                          v-model="portOption.isActive"
                          :label="portOption.text"
                          class="d-flex"
                        >
                        </v-checkbox>
                      </v-row>
                    </v-col>
                    <v-col class="d-flex" cols="8">
                      <v-text-field
                        v-model="portProtocolText"
                        label="Protocol (optional)"
                        :rules="protocolRules"
                      ></v-text-field>
                    </v-col>
                  </v-row>
                  <v-row v-else>
                    <v-col cols="8">
                      <v-row
                        no-gutters
                        v-for="(compOption,i) in compOptions"
                        v-bind:key="i"
                        class="d-flex"
                      >
                        <v-checkbox
                          v-model="compOption.isActive"
                          :label="compOption.text"
                          class="d-flex"
                        >
                        </v-checkbox>
                      </v-row>
                    </v-col>
                    <v-col class="d-flex flex-column" cols="4">
                      <v-row
                        no-gutters
                        v-for="(compOperator, index) in compOperators.operators"
                        v-bind:key="index"
                        class="d-flex justify-start align-center"
                      >
                        <v-btn
                          class="opButton"
                          @click="setOperator(index)"
                          text
                          icon
                          :color="
                            compOperators.activeOperator == index
                              ? 'success'
                              : ''
                          "
                          >{{ compOperator }}
                        </v-btn>
                      </v-row>
                    </v-col>
                  </v-row>
                  <v-row class="flex align-end" align-begin
                    >*  Each space sets an additional filte. </v-row
                  >
                  <v-row class="flex align-end" align-begin>* If you want to use spaces for a filter, use " ".</v-row>
                </v-container>
              </v-card-text>
              <v-card-actions>
                <v-btn color="tertiary" text @click="close"> Leave </v-btn>
                <v-spacer></v-spacer>
                <v-btn color="tertiary" text @click="addNegativeFilter">
                  Add negative filter
                </v-btn>
                <v-btn color="tertiary" text @click="addFilter">
                  Add filter
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-dialog>
          <v-dialog v-model="dialogDelete" max-width="600px">
            <v-card>
              <v-card-title class="text-h5"
                >Are you sure you want to delete all filters?</v-card-title
              >
              <v-card-actions>
                <v-spacer></v-spacer>
                <v-btn color="tertiary" text @click="dialogDelete = false"
                  >Cancel</v-btn
                >
                <v-btn color="tertiary" text @click="removeAllFilters"
                  >OK</v-btn
                >
                <v-spacer></v-spacer>
              </v-card-actions>
            </v-card>
          </v-dialog>
        </v-toolbar>
      </template>
      <template v-slot:item.actions="{ item }">
        <v-icon small @click="removeFilter(item)"> mdi-delete </v-icon>
      </template>
    </v-data-table>
  </v-card>
</template>

<script>
export default {
  name: "FilterTable",
  data: () => ({
    patternNumber: /^(-?\d+(\.\d+)?\s{0,1})*$/,
    patternProtocol: /^((?!(\s)).)*$/,

    numberRules: [
      (value) => {
        const pattern = /^(-?\d+(\.\d+)?\s{0,1})*$/;
        return (
          pattern.test(value) || "Please use only numbers (e.g. 20 -2 0.2)"
        );
      },
    ],

    protocolRules: [
      (value) => {
        const pattern = /^((?!(\s)).)*$/;
        return pattern.test(value) || "Only one protocol is allowed";
      },
    ],

    selectedOption: "Text",
    dialog: false,
    dialogDelete: false,
    filterText: "",
    portProtocolText: "",
    headers: [
      { text: "Category", value: "type" },
      { text: "Filter", value: "filter" },
      { text: "Actions", value: "actions", sortable: false },
    ],
    options: ["Text", "Port", "Comparison"],
  
    textOptions: [
      { text: "Origin Host", isActive: false, filterName: "source" },
      { text: "Responder Host", isActive: false, filterName: "target" },
      { text: "Service", isActive: false, filterName: "service" },
      { text: "Protocol", isActive: false, filterName: "proto" },
      { text: "Query", isActive: false, filterName: "query_text" },
      { text: "Query answers", isActive: false, filterName: "q_answers" },
      { text: "Query type", isActive: false, filterName: "q_type" },
      { text: "Error Code", isActive: false, filterName: "q_rcode" },
      { text: "UID", isActive: false, filterName: "uid" },
      { text: "Notice UID", isActive: false, filterName: "notice_uid" },
      { text: "Notice Origin Host", isActive: false, filterName: "notice_source" },
      { text: "Notice Resp Host", isActive: false, filterName: "notice_target" },
      { text: "Notice Header", isActive: false, filterName: "notice_header" },
    ],

    portOptions: [
      { text: "Responder Port", isActive: false, filterName: "resp_p" },
      { text: "Origin Port", isActive: false, filterName: "origin_p" },
    ],
    compOptions: [
      {
        text: "Responder sent data in kb",
        isActive: false,
        filterName: "resp_ip_bytes",
      },
      {
        text: "Origin sent data in kb",
        isActive: false,
        filterName: "orig_ip_bytes",
      },
      { text: "Duration", isActive: false, filterName: "duration" },
    ],
    compOperators: {
      activeOperator: -1,
      operators: [">", "<", "=="],
    },
  }),
  computed: {
    filters() {
      return this.$store.getters["allFilters"];
    },
  },
  watch: {
    selectedOption() {
      this.clearFilterDialogOptions();
    },
  },

  methods: {
    itemRowBackground: function (item) {
      return item.isNegative ? "red-text" : "";
    },
    removeFilter(item) {
      this.$store.commit("removeFilterByFilterName", item);
    },

    removeAllFilters() {
      this.$store.commit("removeAllFilters");
      this.dialogDelete = false;
    },
    sendFilterOption(option) {
      const regex = /(".*?")|(\S+)/g
      var filters = []
     
      for (var match of this.filterText.matchAll(regex)){
         var filter
         if (match[1]) {
            filter = match[1].replace(/^"\s*|\s*"$/g,"")
          }
          else {
            filter = match[2].replace(/^\s*|\s*$/g,"")
          }
          filters.push(filter)
      }
      filters.forEach((filter) => {
        if (this.selectedOption == "Text") {
          this.textOptions.forEach((value) => {
            if (value.isActive) {
              this.$store.commit(option, {
                type: value.filterName,
                filter: filter,
              });
            }
          });
        }

      else if (this.selectedOption == "Port") {
          if (
            !(
              this.patternNumber.test(this.filterText) &&
              this.patternProtocol.test(this.portProtocolText)
            )
          ) {
            return;
          }
          this.portOptions.forEach((value) => {
            if (value.isActive) {
              var newFilter = filter;
              if (this.portProtocolText != "") {
                newFilter = (
                  filter +
                  "/" +
                  this.portProtocolText
                )
              }
              this.$store.commit(option, {
                type: value.filterName,
                filter: newFilter,
              });
            }
          });
        } else {
          if (!this.patternNumber.test(filter)) {
            return;
          }
          if (this.compOperators.activeOperator == -1) {
            return;
          }
          this.compOptions.forEach((value) => {
            if (value.isActive) {
              var newFilter =
                this.compOperators.operators[
                  this.compOperators.activeOperator
                ][0] + filter;
              this.$store.commit(option, {
                type: value.filterName,
                filter: newFilter,
              });
            }
          });
        }
        this.filterText = "";
        this.portProtocolText = "";
      });
    },

    addFilter() {
      this.sendFilterOption("addFilter");
    },
    addNegativeFilter() {
      this.sendFilterOption("addNegativeFilter");
    },

    close() {
      this.dialog = false;
      this.selectedOption = this.options[0];
      this.setArrayInactive(this.textOptions);
      this.clearFilterDialogOptions();
    },
    setOperator(index) {
      if (index != this.compOperators.activeOperator) {
        this.compOperators.activeOperator = index;
      } else {
        this.compOperators.activeOperator = -1;
      }
    },

    clearFilterDialogOptions() {
      if (this.selectedOption == "Text") {
        this.setArrayInactive(this.portOptions);
        this.setArrayInactive(this.compOptions);
      } else if (this.selectedOption == "Port") {
        this.setArrayInactive(this.textOptions);
        this.setArrayInactive(this.compOptions);
      } else {
        this.setArrayInactive(this.textOptions);
        this.setArrayInactive(this.portOptions);
      }
      this.filterText = "";
      this.portProtocolText = "";
    },
    setArrayInactive(array) {
      array.forEach((element) => {
        element.isActive = false;
      });
    },
  },
};
</script>

<style scoped>
.v-btn.opButton {
  font-size: 1.5em;
}
>>> .red-text {
  color: red;
}
</style>
