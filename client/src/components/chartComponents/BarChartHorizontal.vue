<template>
  <v-card>
    <ChartControls
      v-bind:data="data"
      v-bind:chartNumber="chartNumber"
      class="mb-0"
    />
    <v-progress-circular
      v-if="loading && !isFrozen"
      indeterminate
      color="primary"
    ></v-progress-circular>
    <svg :id="id" viewBox="0 0 660 500"></svg>
  </v-card>
</template>

<script>
import * as d3 from "d3";
import ChartControls from "../ChartControls.vue";
import {
  handleFilterClick,
  isFiltered,
} from "../../helperFunctions/graphHelperFunctions";
export default {
  components: { ChartControls },
  name: "HorizontalBarChart",
  props: {
    data: {
      required: true,
    },
    width: {
      default: 600,
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
    loading() {
      return this.data.loading;
    },
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
      if (this.isFrozen) {
        return;
      } else {
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
    /**
     * Creates groups for chart
     */
    createBarChart() {
      var margin = { top: 0, right: 20, bottom: 10, left: 10 },
        svg = d3.select("#" + this.id).append("g");
      svg.append("g").attr("class", "bars" + this.chartNumber);
      svg.append("g").attr("class", "xAxis" + this.chartNumber);
      svg.append("g").attr("class", "yAxis" + this.chartNumber);

      svg
        .append("g")
        .attr("class", "text" + this.chartNumber)
        .attr("fill", "white")
        .attr("text-anchor", "start")
        .attr("font-family", "sans-serif")
        .attr("font-size", 12);

      svg.attr(
        "transform",
        "translate(" + margin.left + "," + margin.top + ")"
      );
    },

    /**
     * Inserts data to chart and creates chart objects
     */
    updateChart() {
      var svg = d3.select("#" + this.id);

      // configure x,y scaling
      var scX = d3
        .scaleLinear()
        .range([0, this.width])
        .domain([
          0,
          1.05 *
            d3.max(this.payload, function (d) {
              return d.value;
            }),
        ]);

      var scY = d3
        .scaleBand()
        .range([0, this.height])
        .padding(0.1)
        .domain(
          this.payload.map(function (d) {
            return d.name;
          })
        );
      const vm = this;

      // create bars
      var bar = svg
        .select("g.bars" + this.chartNumber)
        .selectAll("rect")
        .data(this.payload);
      bar
        .enter()
        .append("rect")
        .attr("class", "bar" + this.chartNumber)
        .attr("width", function (d) {
          return scX(d.value);
        })
        .attr("y", function (d) {
          return scY(d.name);
        })
        .attr("height", scY.bandwidth())
        .style("fill", function (d) {
          if (isFiltered(d, vm)) {
            return "var(--v-tertiary-base)";
          }
          return "var(--v-primary-base)";
        })
        .on("click", function (d, filter) {
          //add or removes filter
          handleFilterClick(vm, filter);
        });

      //transition if data is updated
      bar
        .transition()
        .duration(1000)
        .style("fill", function (d) {
          if (isFiltered(d, vm)) {
            return "var(--v-tertiary-base)";
          }
          return "var(--v-primary-base)";
        })
        .attr("width", function (d) {
          return scX(d.value);
        })
        .attr("y", function (d) {
          return scY(d.name);
        })
        .attr("height", scY.bandwidth());

      //remove bars if mapped data is not available anymore
      bar.exit().remove();

      // create text
      var text = svg
        .select("g.text" + this.chartNumber)
        .selectAll("text")
        .data(this.payload);
      text.enter();
      text
        .join("text")
        .attr("x", 0)
        .attr("y", (d) => scY(d.name) + scY.bandwidth() / 2)
        .attr("dy", "0.35em")
        .attr("dx", +4)
        .style("fill", "var(--v-text-base)")
        .text((d) => d.name)
        .call((text) =>
          text
            .filter((d) => scY(d.value) - scY(0) > 250) // short bars
            .attr("x", (d) => scX(d.value))
            .attr("dx", +4)
            .attr("text-anchor", "start")
        );

      //remove text if mapped data is not available anymore
      text.exit().remove();

      //Draws axis if payload exists, otherwise deletes them
      if (this.payload.length > 0) {
        d3.select("g.xAxis" + this.chartNumber)
          .attr("transform", "translate(0," + this.height + ")")
          .call(d3.axisBottom(scX).ticks(10, "s"));

        d3.select("g.yAxis" + this.chartNumber).call(
          d3
            .axisLeft(scY)
            .tickFormat(() => {
              return "";
            })
            .tickSize(0)
        );
      } else {
        d3.select("g.yAxis" + this.chartNumber)
          .selectAll("*")
          .remove();
        d3.select("g.xAxis" + this.chartNumber)
          .selectAll("*")
          .remove();
      }
    },

    /**
     * Checks if the color of the bars needs to be changed
     */
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