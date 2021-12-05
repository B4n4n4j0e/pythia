<template>
  <v-card>
    <ChartControls
      v-bind:data="data"
      v-bind:chartNumber="chartNumber"
      class="mb-0"
    />
          <div class="tooltip" :id="tooltipId">"></div>
    <svg :id="id" viewBox="0 0 660 500">

    </svg>

  </v-card>
</template>

<script>
import * as d3 from "d3";
import ChartControls from "./ChartControls.vue";
import {handleFilterClick, isFiltered} from "../helperFunctions/graphHelperFunctions"
export default {
  components: { ChartControls },
  name: "TreeMap",
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
    isSummary: {
      required: true,
      type: Boolean,
    },
  },
  data: () => ({}),

  computed: {
    id() {
      return "chart" + this.chartNumber.toString();
    },
    tooltipId() {
      return "tooltip" + this.chartNumber.toString();
    },

    filterSet() {
      return this.$store.getters["filterByType"](this.data.filterType);
    },

    negativeFilterSet() {
      return this.$store.getters["negativeFilterByType"](this.data.filterType);
    },

    payload() {
      return this.data.payload;
    },
  },
  watch: {
    payload: function () {
      if (this.$store.getters.viewById(this.chartNumber).isFrozen) {
        return;
      } else {
        this.updateChart();
      }
    },

    filterSet: function () {
      this.changeFilter();
    },
    negativeFilterSet: function () {
      this.changeFilter();
    },
  },


  mounted() {
    this.createTreeMap();
    this.updateChart();
  },

  methods: {
    createTreeMap() {
      var svg = d3.select("#" + this.id);
      svg.append("g").attr("class", "rects");
      svg.append("g").attr("class", "foreignObjects");

    },

    updateChart() {
      var svg = d3.select("#" + this.id);
      let tooltip = d3.select('#' + this.tooltipId)
      if (this.payload.length == 0) {
        svg.selectAll('rect foreignObjects').remove()
        return
      }




var  vm=this

let hierarchy = d3.hierarchy(this.payload, (node) => {
    return node
}).sum((node) => {
  return node['value']
})

/*.sort((node1,node2) => {
  return node2['value'] - node1['value']
})
*/

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
        ]);

var treemap = d3.treemap()
    .size([this.width, this.height])
    .padding(1)
    .round(true);
  
treemap(hierarchy)

let tiles = hierarchy.leaves()

var block = svg.select('g.rects').selectAll('rect').data(tiles)

block
  .enter()
  .insert('rect')
  .attr("transform", d => `translate(${d.x0},${d.y0})`)
  .attr("opacity", function (d) { 
          if ((vm.filterSet.size==0 & vm.negativeFilterSet.size==0) | isFiltered(d.data, vm)) {
            return 1;
          } else {
            return 0.5;
          }
        })
    .attr('fill',(d) => {
      return color(d.data.name)
    }
   ) 
    .attr('width',(d) => {return d.x1 -d.x0})
    .attr('height',(d) => {return d.y1-d.y0})  
    block.transition()
        .duration(1000)
        .attr("transform", d => `translate(${d.x0},${d.y0})`)
        .attr("width", d => d.x1 - d.x0)
         .attr("opacity", function (d) { 
          if ((vm.filterSet.size==0 & vm.negativeFilterSet.size==0) | isFiltered(d.data, vm)) {
            return 1;
          } else {
            return 0.5;
          }
        })
        .attr("height", d => d.y1 - d.y0);
    
    block.exit().remove()

var text = svg.select('g.foreignObjects').selectAll('foreignObject').data(tiles)

text
  .enter()
  .insert('foreignObject')
  .attr("transform", d => `translate(${d.x0},${d.y0})`)
  .attr('width',(d) => {return d.x1 -d.x0})
  .attr('height',(d) => {return d.y1-d.y0})
  .style("fill", "var(--v-text-base)")
   .html((d) => {
          let value = d.data.value.toString().replace(/\B(?=(d{3})+(?!\d))/g,",")
       return '<div><p>'+ d.data.name + ' | ' + value + ' | ' + ((value / d.parent.value) * 100).toFixed(1) + ' %</p></div>'})
  .on("mouseover", function(event,d) {	
          const [x,y] = d3.pointer(event, this.parentElement.parentElement)


              let value = d.data.value.toString().replace(/\B(?=(d{3})+(?!\d))/g,",")
            tooltip.transition()		
                .duration(1000)		
          .style('opacity', 0.8)
            tooltip	.html('<p class="subtitle-2 white--text">' + d.data.name + ' | ' + value + ' | ' + ((value / d.parent.value) * 100).toFixed(1) + ' %</p>')	
                .style("left", x+50  + "px")		  
                .style("top",y + "px");	
            })					
 .on("mouseout", function() {		
            tooltip.transition()		
                .duration(500)		
                .style("opacity", 0);	
        })
           .on("click", function (d, filter) {
          handleFilterClick(vm, filter.data);
        });
text.transition()
        .duration(1000)
  .attr("transform", d => `translate(${d.x0},${d.y0})`)
  .attr('width',(d) => {return d.x1 -d.x0})
  .attr('height',(d) => {return d.y1-d.y0})
   .attr("opacity", function (d) {
          if ((vm.filterSet.size==0 & vm.negativeFilterSet.size==0) | isFiltered(d.data, vm)) {
            return 1;
          }
          return 0.5;
        })
    .each(function () {
    d3.select(this).html((d) => {
          let value = d.data.value.toString().replace(/\B(?=(d{3})+(?!\d))/g,",")
       return '<div><p>'+ d.data.name + ' | ' + value + ' | ' + ((value / d.parent.value) * 100).toFixed(1) + ' %</p></div>'})
});

text.exit().remove()

    },

    changeFilter() {
      const vm = this;
      var svg = d3.select("#" + this.id)
      svg.selectAll('rect')
        .attr("opacity", function (d) {
          if ((vm.filterSet.size==0 & vm.negativeFilterSet.size==0) | isFiltered(d.data, vm)) {
            return 1;
          }
          return 0.5;
        });
      svg.selectAll('foreignObject')
        .attr("opacity", function (d) {
          if ((vm.filterSet.size==0 & vm.negativeFilterSet.size==0) | isFiltered(d.data, vm)) {
            return 1;
          }
          return 0.5;
        });
    },
  },
};
</script>

<style scoped>


div.tooltip {	
    position: absolute;			
    text-align: center;						
    padding: 2px;				
    font: 12px sans-serif;		
    background:black;	
    border: 0px;		
    border-radius: 8px;			
    pointer-events: none;			
    opacity: 0;			

}
</style>