<template>
  <v-card>
         <v-card-title>Notices</v-card-title>
  <v-expansion-panels>
    <v-expansion-panel
      v-for="(item,i) in notices"
      :key="i"
    >
      <v-expansion-panel-header>
      {{showDate(item.ts)}} || {{item.note}}
      </v-expansion-panel-header>
      <v-expansion-panel-content>
       <span style="font-weight:bold"> message: </span> {{item.msg}}  <br>
       <span style="font-weight:bold"> connection uid: </span> {{item.uid}} <br>
       <div v-if="item.uid != '-'" >
       <span style="font-weight:bold"> Source IP: </span> {{ item['source'] }}  <br>
       <span style="font-weight:bold"> Source Port: </span> {{ item['id.orig_p'] }} <br>
        <span style="font-weight:bold"> Destination IP: </span> {{ item['target'] }}  <br>
       <span style="font-weight:bold"> Destination Port: </span> {{item['id.resp_p']}} <br>
        </div>

      </v-expansion-panel-content>
    </v-expansion-panel>
  </v-expansion-panels>

  </v-card>
</template>

<script>
export default {

  data: () => ({

  }),
  computed: {
    notices() {
      return this.$store.state.notices;
    }

  },

  methods: {

    showDate(time) {
      return (new Date(time*1000)).toLocaleString()
    }

   
  },
};
</script>

<style scoped>

</style>