<template>
  <v-container fluid>
    <v-row>
      <v-menu
        v-model="startDateMenu"
        :close-on-content-click="false"
        :nudge-right="40"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            class="dateField"
            v-model="localStartDate"
            label="Start date"
            prepend-icon="mdi-calendar"
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="localStartDate"
          @input="startDateMenu = false"
        ></v-date-picker>
      </v-menu>
      <v-menu
        ref="startTimeRef"
        v-model="startTimeMenu"
        :return-value.sync="localStartTime"
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
            v-model="localStartTime"
            label="Start time"
            prepend-icon="mdi-clock-time-four-outline"
            readonly
            v-on="on"
          ></v-text-field>
        </template>
        <v-time-picker
          v-if="startTimeMenu"
          v-model="localStartTime"
          full-width
          @click:minute="$refs.startTimeRef.save(localStartTime)"
        ></v-time-picker>
      </v-menu>

      <v-menu
        v-model="endDateMenu"
        :close-on-content-click="false"
        :nudge-left="40"
        transition="scale-transition"
        offset-y
        min-width="auto"
      >
        <template v-slot:activator="{ on, attrs }">
          <v-text-field
            class="dateField"
            v-model="localEndDate"
            label="End Date"
            prepend-icon="mdi-calendar"
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-date-picker
          v-model="localEndDate"
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
            v-model="localEndTime"
            label="End Time"
            prepend-icon="mdi-clock-time-four-outline"
            readonly
            v-bind="attrs"
            v-on="on"
          ></v-text-field>
        </template>
        <v-time-picker
          v-model="localEndTime"
          v-if="endTimeMenu"
          full-width
          @click:minute="$refs.endTimeRef.save(localEndTime)"
        ></v-time-picker>
      </v-menu>
    </v-row>
    <v-row no-gutters>
      <v-btn
        class="ml-2 mt-4"
        v-for="button in buttons"
        :key="button.text"
        :color="button.color"
        @click="submitTime(button.funcName)"
        >{{ button.text }}</v-btn
      >
    </v-row>
  </v-container>
</template>

<script>
export default {
  props: {
    buttons: {
      type: Array,
    },
    buttonColor: {
      default: "primary",
    },
    buttonText: {
      type: String,
    },
  },

  name: "TimePicker",
  mounted() {
    this.$nextTick(function () {
      this.updateLocalStartTime();
      this.updateLocalEndTime();
    });
  },
  data: () => ({
    startDateMenu: false,
    startTimeMenu: false,
    endDateMenu: false,
    endTimeMenu: false,

    localStartTime: null,
    localEndTime: null,
    localStartDate: null,
    localEndDate: null,
  }),
  computed: {
    startTime() {
      return this.$store.state.startTime;
    },

    endTime() {
      return this.$store.state.startTime;
    },
  },
  watch: {
    startTime() {
      this.updateLocalStartTime();
    },

    endTime() {
      this.updateLocalEndTime();
    },
  },

  methods: {
    updateLocalStartTime() {
      this.localStartTime = this.$store.getters.startTime;
      this.localStartDate = this.$store.getters.startDate;
    },
    updateLocalEndTime() {
      this.localEndDate = this.$store.getters.endDate;
      this.localEndTime = this.$store.getters.endTime;
    },

    submitTime(funcName) {
      var startTimeStamp = this.getStartTimeStamp();
      var endTimeStamp = this.getEndTimeStamp();
      this.$emit(funcName, startTimeStamp, endTimeStamp);
    },
    submit(funcName) {
      this.$emit(funcName);
    },

    getStartTimeStamp() {
      var time = this.localStartTime.split(":");
      var date = this.localStartDate.split("-").map((x) => parseInt(x));
      var startTimestamp = new Date(
        date[0],
        date[1] - 1,
        date[2],
        time[0],
        time[1],
        0
      ).getTime();
      return startTimestamp;
    },

    getEndTimeStamp() {
      var time = this.localEndTime.split(":");
      var date = this.localEndDate.split("-").map((x) => parseInt(x));
      var endTimestamp = new Date(
        date[0],
        date[1] - 1,
        date[2],
        time[0],
        time[1],
        0
      ).getTime();
      return endTimestamp;
    },
  },
};
</script>

<style scoped>
.dateField {
  max-width: 125px;
  overflow: hidden;
}
</style>