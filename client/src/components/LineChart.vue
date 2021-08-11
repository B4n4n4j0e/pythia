<template>
  <v-card>
    <v-btn @click="createLineChart">clickMe</v-btn>
    <svg id="lineChart" viewBox="0 0 960 450"></svg>
  </v-card>
</template>

<script>
import * as d3 from "d3";

export default {
  data: () => ({}),

  methods: {
    createLineChart() {

        var max = this.$store.getters.endTimeUnix
        var min = this.$store.getters.startTimeUnix
   
      console.log(this.$store.state.endTime)
      console.log(max)
      console.log(min)

        // set dimensions and margins of the graph
       var width = 960 
        var  height= 450 
        
        var parse = d3.timeFormat("%d.%m.%y")
  
        console.log(parse(this.$store.state.endTime))

        var x = d3.scaleTime().range([0,width]).domain([parse(min),parse(max)]);
        var y = d3.scaleLinear().range([height,0]).domain([0,10]);
        
        var valueLine = d3.line()
            .x(function(d) {return x(d.ts)})
            .y(function() {return y(1)})
        
        var chartData = this.$store.state.connections
        var svg = d3.select("#lineChart")
            .data([chartData])
            .attr("class","line")
            .attr("d",valueLine)
        
        svg.append("g")
            .attr("transform","translate(30," + (height-20) + ")")
            .call(d3.axisBottom(x));
        
        svg.append("g")
            .attr("transform","translate(30," + 0 + ")")
            .call(d3.axisLeft(y))        

    }
  }
}
</script>

<style scoped>

</style>