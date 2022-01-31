<template>
  <v-card>
    <ChartControls v-bind:chartNumber="chartNumber" class="mb-0" />
    <v-progress-circular
      v-if="loading && !isFrozen"
      indeterminate
      color="success"
    ></v-progress-circular>
    <div class="tooltip" :id="tooltipId">"></div>
    <svg :id="id" viewBox="0 0 800 450"></svg>
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

  name: "PieChart",
  props: {
    data: {
      required: true,
    },
    width: {
      default: 800,
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

  data: () => ({
    margin: { top: 0, right: 0, bottom: 0, left: 0 },
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
    this.createPieChart();
    this.updateChart();
  },
  methods: {
    /**
     * Creates groups for chart
     */
    createPieChart() {
      var svg = d3.select("#" + this.id).append("g");
      svg.attr(
        "transform",
        "translate(" + this.margin.left + "," + this.margin.top + ")"
      );

      var content = svg.append("g").attr("class", "content" + this.chartNumber);

      content.append("g").attr("class", "slices" + this.chartNumber);
      content.append("g").attr("class", "labels" + this.chartNumber);
      content.append("g").attr("class", "lines" + this.chartNumber);

      content.attr(
        "transform",
        "translate(" + this.chartWidth / 2 + "," + this.chartHeight / 2 + ")"
      );
    },
    /**
     * Inserts data to chart and creates chart objects
     */
    updateChart() {
      let tooltip = d3.select("#" + this.tooltipId);
      const vm = this;

      var radius = Math.min(this.chartWidth, this.chartHeight) / 2;

      // set color domain for values
      var svg = d3.select("#" + this.id);
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
          "var(--v-quaternary-base)",
          "var(--v-quinary-darken1)",
        ]);

      // calculate sum of al values
      var globalPacketCount = this.payload.reduce(function (a, b) {
        return a + b.value;
      }, 0);
      // prepare data for chart
      var data = this.payload.map(function (label) {
        var packetCount = label.value;
        return {
          name: label.name,
          packetCount: packetCount,
          percentage: ((packetCount / globalPacketCount) * 100).toFixed(1),
        };
      });

      // create pie scaling values
      var pie = d3
        .pie()
        .sort(null)
        .value(function (d) {
          return d.packetCount * 1.1;
        })
        .padAngle(0.025);

      var arc = d3
        .arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

      var outerArc = d3
        .arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

      var key = function (d) {
        return d.data.name;
      };

      // create slices
      var slice = svg
        .select("g.slices" + this.chartNumber)
        .selectAll("path")
        .data(pie(data, key));

      slice
        .enter()
        .insert("path")
        .style("fill", function (d) {
          return color(d.data.name);
        })
        .attr("d", function (d) {
          this._current = d;
          return arc(d);
        })
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
        // add or remove filter
        .on("click", function (d, filter) {
          handleFilterClick(vm, filter.data);
        })
        // show tooltip
        .on("mouseover", function (event, d) {
          var [x, y] = d3.pointer(event, svg.node());
          var svgDim = svg.node().getBoundingClientRect();
          var left = (svgDim.width / vm.chartWidth) * x;
          var top = (svgDim.height / vm.chartHeight) * y;
          let value = d.data.packetCount
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
                d.data.percentage +
                " %</p>"
            )
            .style("left", left + "px")
            .style("top", top + "px");
        })
        .on("mouseout", function () {
          tooltip.transition().duration(500).style("opacity", 0);
        });

      //transition if data is updated
      slice
        .transition()
        .duration(1000)
        // custom interpolation function for transition
        .attrTween("d", function (d) {
          this._current = this._current || d;
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          return function (t) {
            return arc(interpolate(t));
          };
        })
        .attr("opacity", function (d) {
          if (
            !vm.filterSet ||
            (vm.filterSet.size == 0 && vm.negativeFilterSet.size == 0) ||
            isFiltered(d.data, vm)
          ) {
            return 1;
          } else {
            return 0.4;
          }
        });

      //remove slices if mapped data is not available anymore
      slice.exit().remove();

      //maps for collision check
      var textPositions = new Map();
      var linePositions = new Map();

      //create text
      var text = svg
        .select(".labels" + this.chartNumber)
        .selectAll("text")
        .data(pie(data), key);
      function midAngle(d) {
        return d.startAngle + (d.endAngle - d.startAngle) / 2;
      }

      text
        .enter()
        .append("text")
        .attr("dy", ".35em")
        .attr("opacity", function (d) {
          if (
            !vm.filterSet ||
            (vm.filterSet.size == 0 && vm.negativeFilterSet.size == 0) ||
            isFiltered(d.data, vm)
          ) {
            return 1;
          }
          return 0.4;
        })
        // add or remove filter
        .on("click", function (d, filter) {
          handleFilterClick(vm, filter.data);
        })
        .text(function (d) {
          return (
            d.data.name +
            " / " +
            nFormatter(d.data.packetCount, 2) +
            " / " +
            d.data.percentage +
            " %"
          );
        })
        //sets text position
        .attr("transform", function (d, index) {
          var offset = 2;
          var element = outerArc.centroid(d);
          element[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
          //checks if text position is already taken
          while (checkCollisions(element, textPositions)) {
            element[1] += offset;
          }
          element.push(offset);
          textPositions.set(index, element);
          return "translate(" + element[0] + "," + element[1] + ")";
        })
        //sets position of text
        .style("text-anchor", function (d) {
          this._current = d;
          return midAngle(d) < Math.PI ? "start" : "end";
        })
        .style("fill", "var(--v-text-base)");

      //transition if data is updated
      text
        .transition()
        .duration(1000)
        .text(function (d) {
          this._current = this._current || d;
          return (
            d.data.name +
            " | " +
            nFormatter(d.data.packetCount, 2) +
            " | " +
            d.data.percentage +
            " %"
          );
        })
        .attr("opacity", function (d) {
          if (
            !vm.filterSet ||
            (vm.filterSet.size == 0 && vm.negativeFilterSet.size == 0) ||
            isFiltered(d.data, vm)
          ) {
            return 1;
          }
          return 0.4;
        })
        //custom interpolationfunction
        .attrTween("transform", function (d, index) {
          var offset = 2;
          this._current = this._current || d;
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          var element = outerArc.centroid(interpolate(1));
          element[0] = radius * (midAngle(interpolate(1)) < Math.PI ? 1 : -1);
          var j = 0;
          // checks for collision
          while (checkCollisions(element, textPositions)) {
            element[1] += offset;
            j++;
          }
          offset = j * offset;
          element.push(offset);
          textPositions.set(index, element);
          return function (t) {
            var d2 = interpolate(t);
            var pos = outerArc.centroid(d2);
            pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
            pos[1] += textPositions.get(index)[2];
            return "translate(" + pos[0] + "," + pos[1] + ")";
          };
        })
        .styleTween("text-anchor", function (d) {
          this._current = this._current || d;
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          return function (t) {
            var d2 = interpolate(t);
            //sets position of text
            return midAngle(d2) < Math.PI ? "start" : "end";
          };
        });

      //remove text if mapped data is not available anymore
      text.exit().remove();

      //create polylines same procedure as for text
      var polyline = svg
        .select(".lines" + this.chartNumber)
        .selectAll("polyline")
        .data(pie(data), key);

      polyline
        .enter()
        .append("polyline")
        .attr("points", function (d, index) {
          this._current = this._current || d;
          var offset = 2;
          var element = outerArc.centroid(d);
          element[0] = radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
          var j = 0;
          while (checkCollisions(element, linePositions)) {
            element[1] += offset;
            j++;
          }
          offset = j * offset;
          element.push(offset);
          linePositions.set(index, element);

          return [
            arc.centroid(d),
            outerArc.centroid(d),
            [element[0], [element[1]]],
          ];
        })
        .attr("stroke-width", "2px")
        .attr("fill", "none")
        .style("stroke", "var(--v-tertiary-base)");

      polyline
        .transition()
        .duration(1000)
        .attrTween("points", function (d, index) {
          this._current = this._current || d;
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          var element = outerArc.centroid(interpolate(1));
          element[0] =
            radius * 0.95 * (midAngle(interpolate(1)) < Math.PI ? 1 : -1);
          var j = 0;
          var offset = 2;
          while (checkCollisions(element, linePositions)) {
            element[1] += offset;
            j++;
          }
          offset = j * offset;
          element.push(offset);
          linePositions.set(index, element);

          return function (t) {
            var d2 = interpolate(t);
            var pos = outerArc.centroid(d2);
            pos[1] = pos[1] + linePositions.get(index)[2];
            pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
            return [arc.centroid(d2), outerArc.centroid(d2), pos];
          };
        })
        .attr("stroke-width", "2px")
        .attr("fill", "none")
        .style("stroke", "var(--v-tertiary-base)");

      polyline.exit().remove();

      /**
       * Checks for collisions of text or polylines
       */
      function checkCollisions(element, positions) {
        for (
          let index = 0;
          index < data.size || index < positions.size;
          index++
        ) {
          if (!positions.has(index)) {
            positions.set(index, [0, 0]);
          }
          const position = positions.get(index);
          if (position[0] != element[0]) {
            continue;
          }
          var x1, x2;
          if (position[1] <= element[1]) {
            x1 = position[1];
            x2 = element[1];
          } else {
            x1 = element[1];
            x2 = position[1];
          }
          var distance = Math.sqrt(Math.pow(x2 - x1, 2));
          if (distance < 18) {
            return true;
          }
        }
        return false;
      }
    },

    /**
     * Checks if the opacity of the slices needs to be changed
     */
    changeFilter() {
      const vm = this;
      d3.select("#" + this.id)
        .select("g")
        .select("g.slices" + this.chartNumber)
        .selectAll("path")
        .attr("opacity", function (d) {
          if (
            !vm.filterSet ||
            (vm.filterSet.size == 0 && vm.negativeFilterSet.size == 0) ||
            isFiltered(d.data, vm)
          ) {
            return 1;
          }
          return 0.5;
        });
      d3.select("#" + this.id)
        .select("g")
        .select("g.labels" + this.chartNumber)
        .selectAll("text")
        .attr("opacity", function (d) {
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
>>> polyline {
  opacity: 0.8;
  stroke: black;
  stroke-width: 2px;
  fill: none;
}

>>> path.slice {
  stroke-width: 300px;
}
</style>

