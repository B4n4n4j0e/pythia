<template>
  <v-card >
    <v-card-title>
      <v-text-field
        v-model="search"
        append-icon="mdi-magnify"
        label="Search"
        single-line
        hide-details
      ></v-text-field>
    </v-card-title>
    <v-data-table
      :headers="headers"
      :items="connectionList"
      :search="search"
    ></v-data-table>
  </v-card>
</template>

<script>

export default {


  data: () => ({
    search: '',
        headers: [
   
          { text: 'Timestamp', value: 'ts' },
          {text: 'Origin Host', value: 'source'},
        {text: 'Origin Port', value: 'origin_port'},
        {text: 'Responder Host', value: 'target'},
        {text: 'Responder Port', value: 'resp_port'},
        {text: 'Service', value: 'service'},
         {text: 'Protocol', value: 'proto'},
         {text: 'Duration', value: 'duration'},
        {text: 'Responder sent data (in kb)', value: 'resp_ip_bytes'},
        {text: 'Origin sent data (in kb)', value: 'orig_ip_bytes'},
         { text: 'UID', value: 'uid' },

        ],
  }),
    computed: {
            connectionList() {
                return this.$store.state.connections;
      }

  },


  methods: {
  
  },

}
</script>

<style scoped>
g.tick {
  fill: black;
}

</style>