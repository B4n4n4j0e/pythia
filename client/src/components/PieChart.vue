<template>
  <v-card>
        <ChartControls v-bind:chartNumber="chartNumber" class="mb-0" />
    <svg :id="id" viewBox="0 0 800 450"></svg>
  </v-card>
</template>

<script>
import * as d3 from "d3";
import ChartControls from '../components/ChartControls.vue';

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
  },

  data: () => ({}),

  computed: {
    id() {
      return "chart" + this.chartNumber.toString();
    },
    filterTracker() {
      return this.data.tracker;
    },
    payload() {
      return this.data.payload;
    },
  },
  watch: {
    payload: function () {
      this.updateChart();
    },

    filterTracker: function () {
      this.changeFilter();
    },
  },

  mounted() {
    this.createPieChart();
    this.updateChart();
  },
  methods: {

    createPieChart() {
      var svg = d3.select("#" + this.id).append("g");
      svg.append("g").attr("class", "slices" + this.chartNumber);
      svg.append("g").attr("class", "labels" + this.chartNumber);
      svg.append("g").attr("class", "lines" + this.chartNumber);

      svg.attr(
        "transform",
        "translate(" + this.width / 2 + "," + this.height / 2 + ")"
      );
    },

    updateChart() {
      const vm = this;
      var radius = Math.min(this.width, this.height) / 2;
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
          "var(--v-quinary-darken-1)",
        ]);

      var globalPacketCount = this.payload.reduce(function (a, b) {
        return a + b.value;
      }, 0);

      var data = this.payload.map(function (label) {
        var packetCount = label.value;
        return {
          name: label.name,
          packetCount: packetCount,
          percentage: ((packetCount / globalPacketCount) * 100).toFixed(1),
        };
      });

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
          if (vm.data.filter.size == 0 || !vm.data.filter.has(d)) {
            return 1;
          } else {
            return 0.4;
          }
        })
        .on("click", handleClick);

      slice
        .transition()
        .duration(1000)
        .attrTween("d", function (d) {
          this._current = this._current || d;
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          return function (t) {
            return arc(interpolate(t));
          };
        })
        .attr("opacity", function (d) {
          if (vm.data.filter.size == 0 || !vm.data.filter.has(d)) {
            return 1;
          } else {
            return 0.4;
          }
        });

      slice.exit().remove();
      /* ------- TEXT LABELS -------*/

      var textPositions = new Map();
      var linePositions = new Map();

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
        .attr("opacity", function(d) {
          if (vm.data.filter.size == 0 || !vm.data.filter.has(d)) {
                  return 1
          }
           return 0.4
        })
        .on('click',handleClick)
        .text(function (d) {
          return (
            d.data.name +
            " / " +
            d.data.packetCount +
            " / " +
            d.data.percentage +
            " %"
          );
        })
        .attr("transform", function (d, index) {
          var offset = 2;
          var element = outerArc.centroid(d);
          element[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
          while (checkCollisions(element, textPositions)) {
            element[1] += offset;
          }
          element.push(offset);
          textPositions.set(index, element);
          return "translate(" + element[0] + "," + element[1] + ")";
        })
        .style("text-anchor", function (d) {
          this._current = d;
          return midAngle(d) < Math.PI ? "start" : "end";
        })
        .style("fill", "var(--v-text-base)");

      text
        .transition()
        .duration(1000)
        .text(function (d) {
          this._current = this._current || d;
          return (
            d.data.name +
            " / " +
            d.data.packetCount +
            " / " +
            d.data.percentage +
            " %"
          );
        })        .attr("opacity", function(d) {
          if (vm.data.filter.size == 0 || !vm.data.filter.has(d)) {
                  return 1
          }
           return 0.4
        })
        
        .attrTween("transform", function (d, index) {
          var offset = 2;
          this._current = this._current || d;
          var interpolate = d3.interpolate(this._current, d);
          this._current = interpolate(0);
          var element = outerArc.centroid(interpolate(1));
          element[0] = radius * (midAngle(interpolate(1)) < Math.PI ? 1 : -1);
          var j = 0;
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
            return midAngle(d2) < Math.PI ? "start" : "end";
          };
        });

      text.exit().remove();

      /* ------- SLICE TO TEXT POLYLINES -------*/
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

      function handleClick(d, filter) {
        var data = {
          name: vm.data.name,
          summary: vm.data.summary,
          type: vm.data.type,
          filter: filter.data.name,
        };
        if (vm.data.filter.has(data.filter)) {
          vm.$store.commit("removeFilter", data);
        } else {
          vm.$store.commit("setFilter", data);
        }
      }

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
      changeFilter() {
    const vm = this
    if (this.data.summary) {


    d3.select('#'+this.id).select('g').select('g.slices'+ this.chartNumber).selectAll('path')
        .attr("opacity", function(d) {
          if (vm.data.filter.has(d.data.name) || vm.data.filter.size == 0 ){
                  return 1
          }
           return 0.5
        })
    d3.select('#'+this.id).select('g').select('g.labels'+ this.chartNumber).selectAll('text')
        .attr("opacity", function(d) {
          if (vm.data.filter.has(d.data.name)  || vm.data.filter.size == 0){
                  return 1
          }
           return 0.5
        })
  }
  else {
    console.log('ConnectionStuff')
  }
      }

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