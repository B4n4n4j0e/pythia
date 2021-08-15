<template>
  <v-card>
    <v-btn @click="createLineChart">clickMe</v-btn>
    <svg id="lineChart" viewBox="0 0 960 450"></svg>
  </v-card>
</template>

<script>
import * as d3 from "d3";

export default {
  mounted() {
  this.$nextTick(function () {
      this.$store.dispatch('getConnectionSummaryByTime')

  })
},

  data: () => ({
    

  }),

    computed: {

    lineChartData() {
     return this.$store.state.connectionSummary
    },


  },
    watch: {
    lineChartData: function() {
      this.createLineChart()
    }
    },
    
  

  methods: {
    createLineChart() {

      var margin = {top: 10, right:40, bottom: 30, left:40}
       var width = 960 -margin.left - margin.right 
      var  height= 450 -margin.top - margin.bottom
        
      var svg = d3.select("#lineChart")
      .append('g')
      .attr("transform",
          "translate(" + margin.left + "," + margin.top + ")");

        //add X-Axis
        var x = d3.scaleTime().range([0,width]).domain(d3.extent(this.lineChartData,function(d) {return d.ts}))
        var xAxis = svg.append('g').attr("transform", "translate(0," +height + ")").call(d3.axisBottom(x));
        var y = d3.scaleLinear()
              .domain([0, d3.max(this.lineChartData, function(d) {return +d.counter; })])
              .range([ height, 0 ]);
        svg.append("g")
              .call(d3.axisLeft(y))

      svg.append("defs").append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("width", width )
        .attr("height", height )
        .attr("x", 0)
        .attr("y", 0);

      var brush = d3.brushX()                   // Add the brush feature using the d3.brush function
        .extent( [ [0,0], [width,height] ] )  // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
        .on("end", updateChart) 

      var line = svg.append('g')
      .attr("clip-path", "url(#clip)")

          // Add the line
    line.append("path")
      .datum(this.lineChartData)
      .attr("class", "line")  // I add the class line to be able to modify this line later on.
      .attr("fill", "none")
      .attr("stroke", "steelblue")
      .attr("stroke-width", 1.5)
      .attr("d", d3.line()
        .x(function(d) { return x(d.ts) })
        .y(function(d) { return y(d.counter) })
        )

      line
      .append("g")
        .attr("class", "brush")
        .call(brush);

  var idleTimeout
    function idled() { idleTimeout = null; }
function updateChart(event) {

      // What are the selected boundaries?
      var extent = event.selection

      // If no selection, back to initial coordinate. Otherwise, update X axis domain
      if(!extent){
        if (!idleTimeout) return idleTimeout = setTimeout(idled, 350); // This allows to wait a little bit
        x.domain([ 4,8])
      }else{
        x.domain([ x.invert(extent[0]), x.invert(extent[1]) ])
        line.select(".brush").call(brush.move, null) // This remove the grey brush area as soon as the selection has been done
      }

      // Update axis and line position
      xAxis.transition().duration(1000).call(d3.axisBottom(x))
      line
          .select('.line')
          .transition()
          .duration(1000)
          .attr("d", d3.line()
            .x(function(d) { return x(d.ts) })
            .y(function(d) { return y(d.counter) })
          )
    }

    // If user double click, reinitialize the chart
    svg.on("dblclick",function(){
      x.domain(d3.extent(this.lineChartData, function(d) { return d.ts }))
      xAxis.transition().call(d3.axisBottom(x))
      line
        .select('.line')
        .transition()
        .attr("d", d3.line()
          .x(function(d) { return x(d.ts) })
          .y(function(d) { return y(d.counter) })
      )
    });

  }
  
    }
}
</script>

<style scoped>

g.tick {
  fill:black
}

</style>