<template>
  <v-card>
    <v-btn @click="createPieChart">clickMe</v-btn>
    <svg viewBox="0 0 960 460"></svg>
  </v-card>
</template>

<script>
import * as d3 from "d3";

export default {
  data: () => ({


  }),

  mounted() {
    this.createPieChart()
  },
  methods: {
    createPieChart() {
    var  width=  960
    var  height= 450
    var  margin= 20
    //var  globalPacketCount  $store.state.globalPacketCount
    var radius= Math.min(width, height /2)- margin
    var svg = d3.select("svg").append("g")
        .attr("transform","translate(" + width/2 +"," + height /2 + ")")

    var pieData = new Map()
      this.$store.state.connections.forEach((element) => {
        if (pieData.has(element["service"])) {
          pieData.set(element["service"], pieData.get(element["service"]) + 1);
        } else {
          pieData.set(element["service"], 1);
        }
      });



   var color = d3.scaleOrdinal()
        .domain(pieData.entries())
        .range(d3.schemeDark2)

    var pie = d3.pie()
        .value(function(d) {return d.value})
        .sort(function(a,b){return d3.ascending(a.key,b.key)})


   var key = function (d) {
        return d.data.label;
      };

    var u = svg.selectAll("path")
            .data(pie(pieData), key);
    
    u
        .enter()
        .append('path')
        .merge(u)
        .transition()
        .duration(1000)
        .attr('d',d3.arc()
            .innerRadius(0)
            .outerRadius(radius))
        .attr("fill",function(d){return(color(d.data.key))})
        .style("stroke","white")
        .style("opacity",1)
    u.exit()
    .remove()



      
  },

 

  }
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