<template>
  <v-card>
    <v-btn  @click="updateChart">clickMe</v-btn>
    <svg id="pieChart" viewBox="0 0 960 450"></svg>
  </v-card>
</template>

<script>
import * as d3 from "d3";

export default {

  data: () => ({
    width: 960,
    height: 450,
  }),

  computed: {

    globalPacketCount() {
      return this.$store.state.globalPacketCount
    },

    pieData() {
    
     return this.$store.getters.pieData
    }


  },
    watch: {
    pieData: function() {
      this.updateChart()
    }
    

  },

  mounted() {
    this.createPieChart()

  },
  methods: {
    createPieChart() {
  
      var svg = d3.select("#pieChart").append("g");
      svg.append("g").attr("class", "slices");
      svg.append("g").attr("class", "labels");
      svg.append("g").attr("class", "lines");

      svg.attr(
        "transform",
        "translate(" + this.width / 2.5 + "," + this.height / 2 + ")"
      );

    },

    updateChart() {
      var radius =  Math.min(this.width, this.height) / 2; 
      var svg = d3.select("#pieChart")
      var color = d3
        .scaleOrdinal()
        .domain(this.pieData.entries())
        .range([
          "#98abc5",
          "#8a89a6",
          "#7b6888",
          "#6b486b",
          "#a05d56",
          "#d0743c",
          "#ff8c00",
        ]);
      var globalPacketCount = this.$store.state.globalPacketCount
      var  data = color.domain().map(function (label) {
          var packetCount = label[1];
          return {
            label: label[0],
            packetCount: packetCount,
            percentage: ((packetCount / globalPacketCount) * 100).toFixed(1),
          };
        });

        var pie = d3
        .pie()
        .sort(null)
        .value(function (d) {
          return d.packetCount;
        })
        .padAngle(0.025);

      var arc = d3
        .arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

      var outerArc = d3
        .arc()
        .innerRadius(radius * 0.9)
        .outerRadius(radius * 0.9);

      var key = function (d) {
        return d.data.label;
      };

        var slice = svg
          .select("g.slices")
          .selectAll("path.slice")
          .data(pie(data), key);

        slice
          .enter()
          .insert("path")
          .style("fill", function (d) {
            return color(d.data.label);
          })
          .attr("class", "slice")
          .attr("d", function (d) {
            this._current = d;
            return arc(d)
            })


      slice.transition()
          .duration(1000)
          .attrTween("d", function (d) {
            this._current = this._current || d;   
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function (t) {
              return arc(interpolate(t));
            };
          });

        slice.exit().remove();
        /* ------- TEXT LABELS -------*/

        var positions = [];

        var text = svg
          .select(".labels")
          .selectAll("text")
          .data(pie(data), key);

        function midAngle(d) {
          return d.startAngle + (d.endAngle - d.startAngle) / 2;
        }
        
        text
          .enter()
          .append("text")
          .attr("dy", ".35em")
          .text(function (d) {
            return (
              d.data.label +
              " / " +
              d.data.packetCount +
              " / " +
              d.data.percentage +
              " %"
            );
          })
          .attr("transform", function(d) {
            this._current = d;
            var element = outerArc.centroid(d)
            element[0] = radius * (midAngle(d) < Math.PI ? 1 : -1);
              positions.forEach(pos => {
               while (checkCollition(element,pos)){
                element[1] = element[1]+20
            }
            })
            positions.push(element)
            return "translate(" + element[0] +"," + (element[1]) +")";

          })
          .style("text-anchor", function (d) {
              this._current = d;
              return midAngle(d) < Math.PI ? "start" : "end";
          });

          text
          .transition()
          .duration(1000)
          .text(function (d) {
            return (
              d.data.label +
              " / " +
              d.data.packetCount +
              " / " +
              d.data.percentage +
              " %"
            );
          })
          .attrTween("transform", function (d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            var collisionOffset = 0;
            var element = outerArc.centroid(interpolate(1))
            element[0]= radius * (midAngle(interpolate(1)) < Math.PI ? 1 : -1);
            positions.forEach(pos => {
               while (checkCollition(element,pos)){
                collisionOffset +=20;
                element[1] = element[1]+20
            }
            })
            positions.push(element)
            return function (t) {
              var d2 = interpolate(t);
              var pos = outerArc.centroid(d2);
              pos[0] = radius * (midAngle(d2) < Math.PI ? 1 : -1);
              return "translate(" + pos[0] +","+ (pos[1]+collisionOffset) + ")";
            };
          })
          .styleTween("text-anchor", function (d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function (t) {
              var d2 = interpolate(t);
              return midAngle(d2) < Math.PI ? "start" : "end";
            };
          }
     );

        text.exit().remove();

        /* ------- SLICE TO TEXT POLYLINES -------*/
        var polyline = svg
          .select(".lines")
          .selectAll("polyline")
          .data(pie(data), key);
        
        polyline
          .enter()
          .append("polyline")
          .attr("points",function (d) {
            var element = outerArc.centroid(d)
            element[0]= radius * 0.95 * (midAngle(d) < Math.PI ? 1 : -1);
            positions.forEach(pos => {
               while (checkCollition(element,pos)){
                element[1] = element[1]+20
            }})
                        positions.push(element)

              return [arc.centroid(d), outerArc.centroid(d), element];
            })
          .attr("stroke-width", "2px")
          .attr("fill", "none")
          .attr("stroke", "black");


        polyline
          .transition()
          .duration(1000)
          .attrTween("points", function (d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            var collisionOffset = 0
            var element = outerArc.centroid(interpolate(1))
            element[0]= radius * 0.95 * (midAngle(interpolate(1)) < Math.PI ? 1 : -1);
            positions.forEach(pos => {
               while (checkCollition(element,pos)){
                collisionOffset +=20;
                element[1] = element[1]+20
            }})
              positions.push(element)
            return function (t) {
              var d2 = interpolate(t);
              var pos = outerArc.centroid(d2);
              pos[1] = pos[1]+ collisionOffset
              pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
              return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };
          })
          .attr("stroke-width", "2px")
          .attr("fill", "none")
          .attr("stroke", "black");

        polyline.exit().remove();

        function checkCollition(position, element) {
          if (position[0] != element[0]) {
            return false;
          }
            return Math.abs(position[1]) - Math.abs(element[1]) < 2 && Math.abs(position[1]) - Math.abs(element[1]) > -2;
          
        }
    
    },
  },
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