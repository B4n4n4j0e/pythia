<template>
  <v-card >
        <ChartControls v-bind:chartNumber="chartNumber" class="mb-0" />

     <v-btn @click="createNetworkChart">clickMe</v-btn>
    <svg :id=id viewBox="0 0 960 450"></svg>

  </v-card>
</template>

<script>
import * as d3 from "d3";
import ChartControls from '../components/ChartControls.vue';
export default {
  components: { ChartControls },
    name: 'NetworkGraph',

      props: {
    data: {
      required: true,
        },
    width: {
      default: 960,
      type: Number,
      },
      height: {
      default: 450,
      type: Number,
    },
    chartNumber: {
      required:true,
      type: Number,
    }
  },
      watch: {
    data: function() {
      this.createNetworkChart()
    }
      },

  data: () => ({

  }),
    mounted() {
            this.createNetworkChart()

  },
    computed: {
          id() {
      return 'chart' + this.chartNumber.toString()
    },

    nodeData() {
      return this.$store.state.nodes
    }

  },


  methods: {

createNetworkChart() {
  console.log(this.nodeData)


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
            .force("charge", d3.forceManyBody().strength(-50))
            .force("center", d3.forceCenter(this.width/2.5, this.height/2.5));

    const link = d3.select('#'+ this.id)
                    .attr('stroke','#999')
                .selectAll("line")
                .data(this.data)
                .join("line")
                    .attr("stroke-width", 1);
 
    const node = d3.select('#'+ this.id).append("g")
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

      node
      .on('mouseover', function (d) {
        console.log(d)
        // Highlight the nodes: every node is green except of him
        node.style('fill', "#B8B8B8")
        d3.select(this).style('fill', '#69b3b2')
        // Highlight the connections
        link
          .style('stroke', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? '#69b3b2' : '#b8b8b8';})
          .style('stroke-width', function (link_d) { return link_d.source === d.id || link_d.target === d.id ? 4 : 1;})
      })
      .on('mouseout', function () {
        node.style('fill', "#69b3a2")
        link
          .style('stroke', 'black')
          .style('stroke-width', '1')
      })


  
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
  

  return d3.select('#' + this.id ).node();
    }

  },

}
</script>

<style scoped>


</style>