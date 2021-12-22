<template>
  <v-card>
    
    <ChartControls v-bind:chartNumber="chartNumber" class="mb-0" />
      <v-progress-circular v-if="loading && !isFrozen"
      indeterminate
      color="success"
    ></v-progress-circular> 
    <svg :id="id" viewBox="0 0 300 300"></svg>
  </v-card>
</template>

<script>
import ChartControls from "../components/ChartControls.vue";
import * as d3 from "d3";
import {
  handleFilterClick,
  isFiltered,
} from "../helperFunctions/graphHelperFunctions";

export default {
  components: { ChartControls },
  name: "BarChart",
  props: {
    data: {
      required: true,
    },
    width: {
      default: 300,
      type: Number,
    },
    height: {
      default: 300,
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
  },
  data: () => ({}),
  computed: {
    id() {
      return "chart" + this.chartNumber.toString();
    },
 

     filterSet() {
      return this.$store.getters["filterByType"](this.data.filterType);
    },

    negativeFilterSet() {
      return this.$store.getters["negativeFilterByType"](this.data.filterType);
    },

    payload() {
      return this.data.payload;
    },

    loading(){
      return this.data.loading
    },
    
    isFrozen() {
      return this.data.isFrozen
    }
  },

  watch: {
    payload: function () {
      if (this.isFrozen) {
        return;
      } else {
        this.updateChart();
      }
    },

    isFrozen() {
      if (this.isFrozen){
        return
      }
      else {
        this.updateChart();
      }
    },

      filterSet: function () {
      this.changeFilter();
    },
    negativeFilterSet: function () {
      this.changeFilter();
    },
  },
  mounted() {
    this.createBarChart();
    this.updateChart();
  },
  methods: {
    createBarChart() {
      var svg = d3.select("#" + this.id).append("g");
      svg.append("g").attr("class", "axis" + this.chartNumber);
      svg.append("g").attr("class", "bars" + this.chartNumber);
      svg.attr("transform", "translate(40," + (this.height - 30) + ")");
      svg
        .select("g.axis" + this.chartNumber)
        .append("g")
        .attr("class", "yAxis" + this.chartNumber);
      svg
        .select("g.axis" + this.chartNumber)
        .append("g")
        .attr("class", "xAxis" + this.chartNumber);
           svg
        .append("g")
        .attr("class", "text" + this.chartNumber)
        .attr("fill", "white")
        .attr("text-anchor", "start")
        .attr("font-family", "sans-serif")
        .attr("font-size", 9);
    },
    updateChart() {
      const vm = this;

      var scX = d3
        .scaleBand()
        .range([0, this.width - 90])
        .domain(
          this.payload.map(function (d) {
            return d.name;
          })
        )
        .padding(0.1);

      var scY = d3
        .scaleLinear()
        .range([0, -this.height + 40])
        .domain([
          0,
          1.1 *
            d3.max(this.payload, function (d) {
              return d.value;
            }),
        ]);

      var barWidth = (this.width - 90) / this.payload.length;

      var xAxis = d3.axisBottom(scX).tickFormat(() => {return "";}).tickSize(0);
      var yAxis = d3.axisLeft(scY)

      d3.select("g.yAxis" + this.chartNumber).call(yAxis);

      d3.select("g.xAxis" + this.chartNumber)
        .call(xAxis)

      var bars = d3
        .select("g.bars" + this.chartNumber)
        .selectAll("rect")
        .data(this.payload);

      bars
        .enter()
        .append("rect")
        .attr("class", "bar" + this.chartNumber)
        .attr("x", function (d, i) {
          return i * barWidth + 1;
        })
        .attr("y", function (d) {
          return scY(d.value);
        })
        .attr("height", function (d) {
          return -scY(d.value);
        })
        .attr("width", barWidth - 5)
        .style("fill", function (d) {
          if (isFiltered(d, vm)) {
            return "var(--v-tertiary-base)";
          }
          return "var(--v-primary-base)";
        })
        .attr("opacity", 0.8)
        .on("click", function (d, filter) {
          handleFilterClick(vm, filter);
        });
      bars
        .transition()
        .duration(1000)
        .attr("y", function (d) {
          return scY(d.value);
        })
        .attr("height", function (d) {
          return -scY(d.value);
        })
        .attr("x", function (d, i) {
          return i * barWidth + 1;
        })
        .attr("width", barWidth - 1)
        .attr("width", barWidth - 5)
        .style("fill", function (d) {
          if (isFiltered(d, vm)) {
            return "var(--v-tertiary-base)";
          }
          return "var(--v-primary-base)";
        });

      bars.exit().remove();


   var text = d3
        .select("g.text" + this.chartNumber)
        .selectAll("text")
        .data(this.payload);
      text.enter();
      text
        .join("text")
        .attr("x", 0)
        .attr("y",(d) => {
          return scX(d.name) + scX.bandwidth() /3}
          )
        .attr("dy", "0.35em")
        .attr("dx", +4)
        .style("fill", "var(--v-text-base)")
        .attr('transform', 'rotate(270)')
        .text((d) => d.name)
        .call((text) =>
          text
            .filter((d) => scY(d.value) > -100) // short bars
            .attr("x", (d) =>  -scY(d.value))
            .attr("dx", +4)
            .attr("text-anchor", "start")
        );

      text.exit().remove();

    },

    changeFilter() {
      const vm = this;
      d3.select("g.bars" + this.chartNumber)
        .selectAll("rect")
        .style("fill", function (d) {
          if (isFiltered(d, vm)) {
            return "var(--v-tertiary-base)";
          }
          return "var(--v-primary-base)";
        });
    },
  },
};
</script>

<style scoped>
</style>