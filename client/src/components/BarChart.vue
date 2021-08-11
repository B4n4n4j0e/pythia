<template>
  <v-card>
    <v-btn @click="updateChart">clickMe</v-btn>
    <svg id="barChart" viewBox="0 0 300 300"></svg>
  </v-card>
</template>

<script>
import * as d3 from "d3";

export default {
  data: () => ({
    width: 300,
    height: 300,
  }),

  computed: {
    barChartData() {
      return this.$store.getters.barChartData;
    },
  },
    watch: {
    barChartData: function() {
      this.updateChart()
    }
    },
  mounted() {
    this.createBarChart();
  },

  methods: {
    createBarChart() {
      var svg = d3.select("#barChart").append("g");
      svg.append("g").attr("class", "axis");
      svg.append("g").attr("class", "bars");
      svg.attr(
        "transform",
        "translate(40," + (this.height-30)  + ")"
      );
      svg.select("g.axis").append('g').attr("class","yAxis")
      svg.select("g.axis").append('g').attr("class","xAxis")
    },
    updateChart() {
      var scX = d3
        .scaleBand()
        .range([0, this.width-90 ])
        .domain(this.barChartData.keys())
        .padding(0.1)
      var scY = d3
        .scaleLinear()
        .range([0,-this.height+40])
        .domain([0, d3.max(this.barChartData.values())*1.2]);

      var barWidth = (this.width-90) / this.barChartData.size;

      var xAxis = d3.axisBottom(scX);
      var yAxis = d3.axisLeft(scY);

       d3
        .select('g.yAxis')
        .call(yAxis)

        d3.select("g.xAxis")
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function () {
          return "rotate(-65)";
        });

      
var bars = d3.select('g.bars').selectAll("rect").data(this.barChartData);

bars.enter()
		.append("rect")
		.attr("class", "bar")
		.attr("x", function(d,i){ return i * barWidth + 1 })
		.attr("y", function(d){ return scY(d[1]); })
		.attr("height", function(d){ return -scY(d[1]) })
    .attr('fill',"black")
    .attr('opacity', 0.8)
		.attr("width", barWidth - 1)

bars.transition()
  .duration(1000)
    .attr("y", function(d) {
      return scY(d[1]);
    })
    .attr("height", function(d) {
      return -scY(d[1]);
    })
    .attr("x", function(d,i){ return i * barWidth + 1 })
		.attr("width", barWidth - 1)

    bars.exit().remove()
    },
  },
};
</script>

<style scoped>
</style>