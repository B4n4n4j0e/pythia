<template>
  <v-card>
    <v-btn @click="test">clickMe</v-btn>
    <svg :id="id" viewBox="0 0 660 500"></svg>
  </v-card>
</template>

<script>
import * as d3 from "d3";
export default {
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
    summary: {
      default: true,
      type: Boolean
    },
    dataName: {
      type: String,
      required: true
    }
  },
  data: () => ({
    
  }),

  computed: {
    id() {
      return "chart" + this.chartNumber.toString();
    },
    filter() {
      return this.$store.state.dNSTopKfilterTracker
    }
  },
  watch: {
    data: function () {
      this.updateChart();
    },
    filter: function() {
      this.changeFilter();
    }
  },

  mounted() {
    this.createBarChart();
  },

  methods: {
    test() {
            console.log(this.filter)

      this.updateChart();
    },
    createBarChart() {
      var margin = { top: 20, right: 20, bottom: 30, left: 10 },
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
     var svg = d3.select("#" + this.id)

      var scX = d3
        .scaleLinear()
        .range([0, this.width])
        .domain([
          0,
          1.05 *
            d3.max(this.data, function (d) {
              return d.value;
            }),
        ]);

      var scY = d3
        .scaleBand()
        .range([0, this.height])
        .padding(0.1)
        .domain(
          this.data.map(function (d) {
            return d.name;
          })
        );
      const vm = this

      var bar = svg
        .select("g.bars" + this.chartNumber)
        .selectAll("rect")
        .data(this.data);
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
          if (vm.$store.state.filter[1].has(d.name)){
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
        .data(this.data);
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
        var selecterdBar = d3.select(this)  
        var data = {
          summary: vm.summary,
          dataName: vm.dataName,
          filter: filter.name
        }

         if (selecterdBar.style('fill') == 'var(--v-tertiary-base)') {
           vm.$store.commit('removeFilter',data)
         }
         else {
            vm.$store.commit('setFilter',data)

         }

      }
    },
    changeFilter() {
      console.log('Filter is changing')
      const vm = this
    var bars = d3.select("#" + this.id).select("g.bars" + this.chartNumber).selectAll("rect")
                .style("fill", function(d) {
          if (vm.$store.state.filter[1].has(d.name)){
            console.log(d.name)
                  return "var(--v-tertiary-base)"
          }
           return "var(--v-primary-base)"
        })
        console.log(bars)
    }
  },
};
</script>

<style scoped>
</style>