<template>
  <v-card>
    <v-btn @click="updateChart">clickMe</v-btn>
    <svg :id=id viewBox="0 0 300 300"></svg>
  </v-card>
</template>

<script>
import * as d3 from "d3";

export default {
  name:'BarChart',
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
      required:true,
      type: Number,
    }
  },
  data: () => ({

  }),

  computed: {
    id() {
      return 'chart' + this.chartNumber.toString()
    }

  },
    watch: {
    data: function() {
      this.updateChart()
    }
    },
  mounted() {
    this.createBarChart();
  },
  methods: {
    createBarChart() {
      var svg = d3.select('#' + this.id).append("g");
      
      svg.append("g").attr("class", "axis"+this.chartNumber);
      svg.append("g").attr("class", "bars"+this.chartNumber);
      svg.attr(
        "transform",
        "translate(40," + (this.height-30)  + ")"
      );
      svg.select("g.axis"+this.chartNumber).append('g').attr("class","yAxis"+this.chartNumber)
      svg.select("g.axis"+this.chartNumber).append('g').attr("class","xAxis"+this.chartNumber)
    },
    updateChart() {

      var scX = d3
        .scaleBand()
        .range([0, this.width-90 ])
        .domain(this.data.map(function(d) { return d.name; }))
        .padding(0.1);

var scY = d3
        .scaleLinear()
        .range([0,-this.height+40])
          .domain([0,1.10*d3.max(this.data, function(d){return d.value})])


      var barWidth = (this.width-90) / this.data.length;

      var xAxis = d3.axisBottom(scX);
      var yAxis = d3.axisLeft(scY);

       d3
        .select('g.yAxis'+this.chartNumber)
        .call(yAxis)

        d3.select("g.xAxis"+this.chartNumber)
        .call(xAxis)
        .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.8em")
        .attr("dy", ".15em")
        .attr("transform", function () {
          return "rotate(-65)";
        });

      
var bars = d3.select('g.bars'+this.chartNumber).selectAll("rect").data(this.data);

bars.enter()
		.append("rect")
		.attr("class", "bar"+this.chartNumber)
		.attr("x", function(d,i){ return i * barWidth + 1 })
		.attr("y", function(d){ return scY(d.value); })
		.attr("height", function(d){ return -scY(d.value) })
    .attr('width',barWidth-5)
    .attr('fill',"black")
    .attr('opacity', 0.8)

bars.transition()
  .duration(1000)
    .attr("y", function(d) {
      return scY(d.value);
    })
    .attr("height", function(d) {
      return -scY(d.value);
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