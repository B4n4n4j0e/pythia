<template>
  <v-card >
    <v-btn @click="createNetworkChart">clickMe</v-btn>
    <svg id="networkChart" viewBox="0 0 960 450"></svg>
  </v-card>
</template>

<script>
import * as d3 from "d3";

export default {
  data: () => ({
      height: "450",
      width: "960"

  }),

  computed: {
    nodeData() {
      return this.$store.getters.nodeData;
    }

  },


  methods: {

    createNetworkChart() {

var color = () => {
  const scale = d3.scaleOrdinal(d3.schemeCategory10);
  return d => scale(d.group);
}


var drag = simulation => {
  
  function dragstarted(event) {
    if (!event.active) simulation.alphaTarget(0.3).restart();
    event.subject.fx = event.subject.x;
    event.subject.fy = event.subject.y;
  }
  
  function dragged(event) {
    event.subject.fx = event.x;
    event.subject.fy = event.y;
  }
  
  function dragended(event) {
    if (!event.active) simulation.alphaTarget(0);
    event.subject.fx = null;
    event.subject.fy = null;
  }
  
  return d3.drag()
      .on("start", dragstarted)
      .on("drag", dragged)
      .on("end", dragended);
}

        const simulation = d3.forceSimulation(this.nodeData)
            .force("link", d3.forceLink(this.$store.state.connections).id(d=> d.id))
            .force("charge", d3.forceManyBody().strength(-100))
            .force("center", d3.forceCenter(this.width / 2, this.height / 2));

    const link = d3.select('#networkChart')
                    .attr('stroke','#999')
                    .attr('stroke-opacity',0.6)
                .selectAll("line")
                .data(this.$store.state.connections)
                .join("line")
                    .attr("stroke-width", 1);
 
    const node = d3.select('#networkChart').append("g")
                    .attr("stroke", "#fff")
                    .attr("stroke-width", 1.5)
                    .selectAll("circle")
                    .data(this.nodeData)
                    .join("circle")
                        .attr("r", 5)
                        .attr("fill", color)
                        .call(drag(simulation));
                        
    node.append("title")
        .text(d => d.id);

  simulation.on("tick", () => {
    link
        .attr("x1", d => d.source.x)
        .attr("y1", d => d.source.y)
        .attr("x2", d => d.target.x)
        .attr("y2", d => d.target.y);

    node
        .attr("cx", d => d.x)
        .attr("cy", d => d.y);
  });
  

  return d3.select('networkChart').node();
    }

    
  }
}
</script>

<style scoped>

</style>