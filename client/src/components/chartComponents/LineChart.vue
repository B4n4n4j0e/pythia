<template>
  <v-card>
    <ChartControls v-bind:chartNumber="chartNumber" class="mb-0" />
    <svg :id="id" viewBox="0 0 960 450"></svg>
    <v-progress-circular
      v-if="loading && !isFrozen"
      indeterminate
      color="success"
    ></v-progress-circular>
  </v-card>
</template>

<script>
import * as d3 from "d3";
import ChartControls from "../ChartControls.vue";

export default {
  components: { ChartControls },

  name: "LineChart",
  props: {
    data: {
      required: true,
    },
    width: {
      default: 960,
      type: Number,
    },
    height: {
      default: 450,
      type: Number,
    },
    chartNumber: {
      required: true,
      type: Number,
    },
    isSummary: {
      required: true,
      type: Boolean,
    },
    isFrozen: {
      required: true,
      type: Boolean,
    },
  },
  mounted() {
    this.createLineChart();
    this.updateChart();
  },

  data: () => ({
    margin: { top: 10, right: 40, bottom: 30, left: 40 },
    time: [],
  }),

  computed: {
    id() {
      return "chart" + this.chartNumber.toString();
    },
    payload() {
      return this.data.payload;
    },
    loading() {
      return this.data.loading;
    },
    chartWidth() {
      return this.width - this.margin.left - this.margin.right;
    },
    chartHeight() {
      return this.height - this.margin.top - this.margin.bottom;
    },
  },

  watch: {
    payload: function () {
      if (this.isFrozen) {
        return;
      }
      this.updateChart();
    },
    isFrozen: function () {
      if (this.isFrozen) {
        return;
      } else {
        this.updateChart();
      }
    },
  },

  methods: {
    /**
     * Creates groups for chart and brush definition
     */
    createLineChart() {
      var svg = d3
        .select("#" + this.id)
        .append("g")
        .attr(
          "transform",
          "translate(" + this.margin.left + "," + this.margin.top + ")"
        );

      svg.append("g").attr("class", "axis" + this.chartNumber);
      svg.append("g").attr("class", "defs" + this.chartNumber);

      svg.append("g").attr("class", "content" + this.chartNumber);

      svg
        .select("g.axis" + this.chartNumber)
        .append("g")
        .attr("class", "yAxis" + this.chartNumber);

      svg
        .select("g.axis" + this.chartNumber)
        .append("g")
        .attr("class", "xAxis" + this.chartNumber);

      svg
        .select(".defs" + this.chartNumber)
        .append("defs")
        .append("svg:clipPath")
        .attr("id", "clip" + this.chartNumber)
        .append("svg:rect")
        .attr("width", this.chartWidth)
        .attr("height", this.chartHeight)
        .attr("x", 0)
        .attr("y", 0);

      svg
        .select(".content" + this.chartNumber)
        .append("g")
        .attr("clip-path", "url(#clip" + this.chartNumber + ")")
        .append("path")
        .attr("class", "line") // I add the class line to be able to modify this line later on.
        .attr("fill", "none")
        .style("stroke", "var(--v-tertiary-base)")
        .attr("stroke-width", 1.5);

      svg
        .select(".content" + this.chartNumber)
        .append("g")
        .attr("class", "brush");
    },

    /**
     * Inserts data to chart and creates chart objects
     */
    updateChart() {
      var vm = this;
      svg = d3.select("#" + this.id);

      var svg = d3.select("#" + this.id);

      var domain = d3.extent(this.payload, function (d) {
        return d.ts;
      });
      // configure x,y scaling
      var scX = d3.scaleTime().range([0, this.chartWidth]).domain(domain);
      var scY = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(this.payload, function (d) {
            return +d.value;
          }),
        ])
        .range([this.chartHeight, 0]);
      // add brush and initialize with position 0,0
      var brush = d3
        .brushX()
        .extent([
          [0, 0],
          [this.chartWidth, this.chartHeight],
        ])
        .on("end", updateChart);

      // create line
      var line = d3
        .select(".content" + this.chartNumber)
        .select("g")
        .datum(this.payload);

      //transition if data is updated
      line
        .select("path")
        .transition()
        .duration(1000)
        .attr(
          "d",
          d3
            .line()
            .x(function (d) {
              return scX(d.ts);
            })
            .y(function (d) {
              return scY(d.value);
            })
        );

      svg.select(".brush").call(brush);
      svg.select(".brush").call(brush.move, null);

      //Draws axis if payload exists, otherwise deletes them
      if (this.payload.length > 0) {
        d3.select("g.xAxis" + this.chartNumber)
          .attr("transform", "translate(0," + this.chartHeight + ")")
          .transition()
          .duration(1000)
          .call(d3.axisBottom(scX));

        d3.select("g.yAxis" + this.chartNumber)
          .transition()
          .duration(1000)
          .call(d3.axisLeft(scY).ticks(10, "s"));
      } else {
        d3.select("g.yAxis" + this.chartNumber)
          .selectAll("*")
          .remove();
        d3.select("g.xAxis" + this.chartNumber)
          .selectAll("*")
          .remove();
      }
      // Reinitialize the chart on double click
      svg.on("dblclick", function () {
        if (vm.isFrozen) {
          return;
        }
        var time = vm.time.pop();
        if (time) {
          updateData(time.startTime, time.endTime);
        }
      });

      /**
       * Helperfunction for brush functionality
       */
      var idleTimeout;
      function idled() {
        idleTimeout = null;
      }

      function updateChart(event) {
        if (vm.isFrozen) {
          return;
        }

        var extent = event.selection;
        // if something is selected, set new boundaries. Otherwise set initial domain
        if (!extent) {
          if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
          scX.domain([4, 8]);
        } else {
          // Push time data to access later. For go back functionality
          vm.time.push({
            startTime: vm.$store.state.startTime,
            endTime: vm.$store.state.endTime,
          });
          // rescale axis
          var startTime = scX.invert(extent[0]).getTime();
          var endTime = scX.invert(extent[1]).getTime();
          // request data for new time boundaries
          updateData(startTime, endTime);
          // remove brush area
          svg.select(".brush").call(brush.move, null);
        }
      }

      /**
       * Set new start time, end time and get data for new timespan
       */
      function updateData(startTime, endTime) {
        if (vm.isFrozen) {
          return;
        }
        vm.$store.dispatch("setStartTime", startTime);
        vm.$store.dispatch("setEndTime", endTime).then(() => {
          vm.$store.dispatch("summaryData/getDataByTime");
          vm.$store.dispatch("detailData/getDataByTime");
        });
      }
    },
  },
};
</script>

<style scoped>
g.tick {
  fill: black;
}
</style>