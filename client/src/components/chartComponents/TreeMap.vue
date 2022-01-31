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
      color="success"
    ></v-progress-circular>
    <div class="tooltip" :id="tooltipId">"></div>
    <svg :id="id" viewBox="0 0 660 500"></svg>
  </v-card>
</template>

<script>
import * as d3 from "d3";
import ChartControls from "../ChartControls.vue";
import {
  handleFilterClick,
  isFiltered,
  nFormatter,
} from "../../helperFunctions/graphHelperFunctions";
export default {
  components: { ChartControls },
  name: "TreeMap",
  props: {
    data: {
      required: true,
    },
    width: {
      default: 660,
      type: Number,
    },
    height: {
      default: 500,
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
  data: () => ({
    margin: { top: 10, right: 10, bottom: 0, left: 10 },
  }),

  computed: {
    id() {
      return "chart" + this.chartNumber.toString();
    },
    tooltipId() {
      return "tooltip" + this.chartNumber.toString();
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
      } else {
        this.updateChart();
      }
    },
    isFrozen: function () {
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
    this.createTreeMap();
    this.updateChart();
  },

  methods: {
    /**
     * Creates groups for chart
     */
    createTreeMap() {
      var svg = d3.select("#" + this.id).append("g");
      svg.append("g").attr("class", "rects");
      svg.append("g").attr("class", "foreignObjects");
      svg.attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      );
    },

    /**
     * Inserts data to chart and creates chart objects
     */
    updateChart() {
      var svg = d3.select("#" + this.id);
      let tooltip = d3.select("#" + this.tooltipId);
      // checks if data exists, if not removes Tree elements
      if (this.payload.length == 0) {
        svg.selectAll("rect").remove();
        svg.selectAll("foreignObject").remove();
        return;
      }

      var vm = this;
      // creates tree hierarchy from data
      let hierarchy = d3
        .hierarchy(this.payload, (node) => {
          return node;
        })
        .sum((node) => {
          return node["value"];
        });

      // sets color scale
      var color = d3
        .scaleOrdinal()
        .domain(
          this.payload.map(function (d) {
            return d.name;
          })
        )
        .range([
          "var(--v-primary-base)",
          "var(--v-secondary-base)",
          "var(--v-tertiary-base)",
        ]);
      // create treemap
      var treemap = d3
        .treemap()
        .size([this.chartWidth, this.chartHeight])
        .padding(1)
        .round(true);

      treemap(hierarchy);

      let tiles = hierarchy.leaves();

      var block = svg.select("g.rects").selectAll("rect").data(tiles);
      // create blocks
      block
        .enter()
        .insert("rect")
        .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
        .attr("opacity", function (d) {
          if (
            !vm.filterSet ||
            (vm.filterSet.size == 0 && vm.negativeFilterSet.size == 0) ||
            isFiltered(d.data, vm)
          ) {
            return 1;
          } else {
            return 0.5;
          }
        })
        .attr("fill", (d) => {
          return color(d.data.name);
        })
        .attr("width", (d) => {
          return d.x1 - d.x0;
        })
        .attr("height", (d) => {
          return d.y1 - d.y0;
        });
      //transition if data is updated
      block
        .transition()
        .duration(1000)
        .attr("transform", (d) => `translate(${d.x0},${d.y0})`)
        .attr("width", (d) => d.x1 - d.x0)
        .attr("opacity", function (d) {
          if (
            !vm.filterSet ||
            (vm.filterSet.size == 0 && vm.negativeFilterSet.size == 0) ||
            isFiltered(d.data, vm)
          ) {
            return 1;
          } else {
            return 0.5;
          }
        })
        .attr("height", (d) => d.y1 - d.y0);

      //remove blocks if mapped data is not available anymore
      block.exit().remove();
      // creates text blocks overlaying tiles
      var text = svg
        .select("g.foreignObjects")
        .selectAll("foreignObject")
        .data(tiles);
      text
        .enter()
        .insert("foreignObject")
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => {
          return d.x1 - d.x0;
        })
        .attr("height", (d) => {
          return d.y1 - d.y0;
        })
        .style("fill", "var(--v-text-base)")
        .html((d) => {
          let value = d.data.value
            .toString()
            .replace(/\B(?=(d{3})+(?!\d))/g, ",");
          return (
            "<div><p>" +
            d.data.name +
            " | " +
            nFormatter(value, 2) +
            " | " +
            ((value / d.parent.value) * 100).toFixed(1) +
            " %</p></div>"
          );
        })
        // activate tooltip
        .on("mouseover", function (event, d) {
          var svgDim = svg.node().getBoundingClientRect();
          var height = (svgDim.height / vm.height) * d.y0;
          var width = (svgDim.width / vm.width) * d.x0;

          let value = d.data.value
            .toString()
            .replace(/\B(?=(d{3})+(?!\d))/g, ",");
          tooltip.transition().duration(1000).style("opacity", 0.8);
          tooltip
            .html(
              '<p class="subtitle-2 white--text">' +
                d.data.name +
                " | " +
                nFormatter(value, 2) +
                " | " +
                ((value / d.parent.value) * 100).toFixed(1) +
                " %</p>"
            )
            .style("left", width + "px")
            .style("top", height + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(500).style("opacity", 0);
        })
        // adds or removes filter
        .on("click", function (d, filter) {
          handleFilterClick(vm, filter.data);
        });

      //transition if data is updated
      text
        .transition()
        .duration(1000)
        .attr("x", (d) => d.x0)
        .attr("y", (d) => d.y0)
        .attr("width", (d) => {
          return d.x1 - d.x0;
        })
        .attr("height", (d) => {
          return d.y1 - d.y0;
        })
        .attr("opacity", function (d) {
          if (
            !vm.filterSet ||
            (vm.filterSet.size == 0 && vm.negativeFilterSet.size == 0) ||
            isFiltered(d.data, vm)
          ) {
            return 1;
          }
          return 0.5;
        })
        .each(function () {
          d3.select(this).html((d) => {
            let value = d.data.value
              .toString()
              .replace(/\B(?=(d{3})+(?!\d))/g, ",");
            return (
              "<div><p>" +
              d.data.name +
              " | " +
              nFormatter(value, 2) +
              " | " +
              ((value / d.parent.value) * 100).toFixed(1) +
              " %</p></div>"
            );
          });
        });

      text.exit().remove();
    },

    /**
     * Checks if the opacity of the slices needs to be changed
     */
    changeFilter() {
      const vm = this;
      var svg = d3.select("#" + this.id);
      svg.selectAll("rect").attr("opacity", function (d) {
        if (
          !vm.filterSet ||
          (vm.filterSet.size == 0 && vm.negativeFilterSet.size == 0) ||
          isFiltered(d.data, vm)
        ) {
          return 1;
        }
        return 0.5;
      });
      svg.selectAll("foreignObject").attr("opacity", function (d) {
        if (
          !vm.filterSet ||
          (vm.filterSet.size == 0 && vm.negativeFilterSet.size == 0) ||
          isFiltered(d.data, vm)
        ) {
          return 1;
        }
        return 0.5;
      });
    },
  },
};
</script>

<style scoped>
div.tooltip {
  position: absolute;
  text-align: center;
  padding: 2px;
  font: 12px sans-serif;
  background: black;
  border: 0px;
  border-radius: 8px;
  pointer-events: none;
  opacity: 0;
}
</style>