<template>
  <v-card>
    <ChartControls v-bind:data="data" v-bind:chartNumber="chartNumber" class="mb-0" />
    <svg :id="id" viewBox="0 0 660 500"></svg>
  </v-card>
</template>

<script>
import * as d3 from "d3";
import ChartControls from '../components/ChartControls.vue';
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
  },
  data: () => ({
    
  }),

  computed: {
    id() {
      return "chart" + this.chartNumber.toString();
    },
    filterTracker() {
      return this.data.tracker
    },
    payload() {
      return this.data.payload
    }

  },
  watch: {
    payload: function () {
      this.updateChart();
    },

    filterTracker: function() {
      this.changeFilter();
    }
  },

  mounted() {
    this.createBarChart();
      this.updateChart();

  },

  methods: {

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

    updateChart() {
            console.log(this.$store.state.startTime)

     var svg = d3.select("#" + this.id)

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
      const vm = this

      var bar = svg
        .select("g.bars" + this.chartNumber)
        .selectAll("rect")
        .data(this.payload);
      bar
        .enter()
        .append("rect")
        .attr("class", "bar" + this.chartNumber)
        //.attr("x", function(d) { return x(d.sales); })
        .attr("width", function (d) {
          return scX(d.value);
        })
        .attr("y", function (d) {
          return scY(d.name);
        })
        .attr("height", scY.bandwidth())
        .style("fill", function(d) {
           if (vm.data.filter.has(d.name)){
                  return "var(--v-tertiary-base)"
          }
           return "var(--v-primary-base)"
        })
        .on('click',handleClick);

      bar
        .transition()
        .duration(1000)
        .attr("width", function (d) {
          return scX(d.value);
        })
        .attr("y", function (d) {
          return scY(d.name);
        })
        .attr("height", scY.bandwidth());

      bar.exit().remove();

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
        .style("fill", 'var(--v-text-base)')
        .text((d) => d.name)
        .call((text) =>
          text
            .filter((d) => scX(d.value) - scX(0) < 250) // short bars
            .attr("x", (d) => scX(d.value))
            .attr("dx", +4)
            .attr("text-anchor", "start")
        );

      text.exit().remove();

      // add the x Axis
      d3.select('g.xAxis'+this.chartNumber)
        .attr("transform", "translate(0," + this.height + ")")
        .call(d3.axisBottom(scX));

      // add the y Axis
      d3.select("g.yAxis"+this.chartNumber).call(
        d3
          .axisLeft(scY)
          .tickFormat(() => {
            return "";
          })
          .tickSize(0)
      );
      function handleClick(d,filter) {
        var data = {
          name: vm.data.name,
          summary: vm.data.summary,
          type: vm.data.type,
          filter: filter.name
        }
         if (vm.data.filter.has(data.filter)) {
           vm.$store.commit('removeFilter',data)
         }
         else {

            vm.$store.commit('setFilter',data)

         }

      }
    },

    changeFilter() {
      const vm = this
      d3.select("#" + this.id).select("g.bars" + this.chartNumber).selectAll("rect")
                .style("fill", function(d) {
          if (vm.data.filter.has(d.name)){
                  return "var(--v-tertiary-base)"
          }
           return "var(--v-primary-base)"
        })
    }
  },
};
</script>

<style scoped>
</style>