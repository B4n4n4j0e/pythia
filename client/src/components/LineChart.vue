<template>
  <v-card>
    <ChartControls v-bind:chartNumber="chartNumber" class="mb-0" />
    <svg :id="id" viewBox="0 0 960 450"></svg>

  </v-card>
</template>

<script>
import * as d3 from "d3";
import ChartControls from "../components/ChartControls.vue";

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
      type: Boolean
    }
  },
  mounted() {
          this.createLineChart();
  },

  data: () => ({}),

  computed: {
    id() {
      return "chart" + this.chartNumber.toString();
    },
    payload() {
      return this.data.payload;
    },
  },
  watch: {
    payload: function () {
      this.createLineChart();
    },
  },

  methods: {

    test () {
      this.$store.dispatch('detailData/getConnections') //.then(() => {this.createLineChart})
//     this.$store.dispatch('detailData/getDNSConnections').then(() => {this.createLineChart})
  //    this.$store.dispatch('detailData/getNotices').then(() => {this.createLineChart})
  

    },
    createLineChart() {
      var vm = this;
      d3.select("#" + this.id)
        .selectAll("g")
        .remove();

      var margin = { top: 10, right: 40, bottom: 30, left: 40 };
      var width = this.width - margin.left - margin.right;
      var height = this.height - margin.top - margin.bottom;

      var svg = d3
        .select("#" + this.id)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

      //add X-Axis
      var domain = d3.extent(this.payload, function (d) {
        return d.ts;
      });
      var x = d3.scaleTime().range([0, width]).domain(domain);

      var xAxis = svg
        .append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));
      var y = d3
        .scaleLinear()
        .domain([
          0,
          d3.max(this.payload, function (d) {
            return +d.value;
          }),
        ])
        .range([height, 0]);
      svg.append("g").call(d3.axisLeft(y));

      svg
        .append("defs")
        .append("svg:clipPath")
        .attr("id", "clip" + this.chartNumber)
        .append("svg:rect")
        .attr("width", width)
        .attr("height", height)
        .attr("x", 0)
        .attr("y", 0);
      var brush = d3
        .brushX() // Add the brush feature using the d3.brush function
        .extent([
          [0, 0],
          [width, height],
        ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart);

      var line = svg
        .append("g")
        .attr("clip-path", "url(#clip" + this.chartNumber + ")");

      // Add the line
      line
        .append("path")
        .datum(this.payload)
        .attr("class", "line") // I add the class line to be able to modify this line later on.
        .attr("fill", "none")
        .style("stroke", "var(--v-tertiary-base)")
        .attr("stroke-width", 1.5)
        .attr(
          "d",
          d3
            .line()
            .x(function (d) {
              return x(d.ts);
            })
            .y(function (d) {
              return y(d.value);
            })
        );
      line.append("g").attr("class", "brush").call(brush);
      // If user double click, reinitialize the chart
      svg.on("dblclick", function () {
        x.domain(domain);
        var startTime = x.invert(domain[0]).getTime();
        var endTime = x.invert(domain[1]).getTime();
        updateData(startTime, endTime);

        xAxis.transition().call(d3.axisBottom(x));
        line
          .select(".line")
          .transition()
          .attr(
            "d",
            d3
              .line()
              .x(function (d) {
                return x(d.ts);
              })
              .y(function (d) {
                return y(d.value);
              })
          );
      });

      var idleTimeout;
      function idled() {
        idleTimeout = null;
      }
      function updateChart(event) {
        // What are the selected boundaries?
        var extent = event.selection;
        // If no selection, back to initial coordinate. Otherwise, update X axis domain
        if (!extent) {
          if (!idleTimeout) return (idleTimeout = setTimeout(idled, 350)); // This allows to wait a little bit
          x.domain([4, 8]);
        } else {
          var startTime = x.invert(extent[0]).getTime();
          var endTime = x.invert(extent[1]).getTime();
          updateData(startTime, endTime);

          x.domain([x.invert(extent[0]), x.invert(extent[1])]);
          line.select(".brush").call(brush.move, null); // This remove the grey brush area as soon as the selection has been done
        }

        // Update axis and line position
        xAxis.transition().duration(1000).call(d3.axisBottom(x));
        line
          .select(".line")
          .transition()
          .duration(1000)
          .attr(
            "d",
            d3
              .line()
              .x(function (d) {
                return x(d.ts);
              })
              .y(function (d) {
                return y(d.value);
              })
          );
      }
      function updateData(startTime, endTime) {
        if (vm.isSummary) {
          vm.$store.commit("setStartTime", startTime);
          vm.$store.commit("setEndTime", endTime);
          vm.$store.dispatch("summaryData/updateData");
          vm.$store.dispatch("detailData/getDataByTime");

        } else {
          //direkt filtern
        }
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