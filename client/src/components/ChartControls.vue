  <template>
  <div class="d-flex flex-row">
    <v-card-text class="ml-4">
      {{ view.dataLabel }}
      <v-tooltip v-if="view.isSummary" top>
        <template v-slot:activator="{ on, attrs }">
          <v-icon class="ml-4 mb-1" v-bind="attrs" v-on="on">
            mdi-alpha-s-box-outline
          </v-icon>
        </template>
        <span>Summary Data </span>
      </v-tooltip>
      <v-tooltip v-else top>
        <template v-slot:activator="{ on, attrs }">
          <v-icon class="ml-4 mb-1" v-bind="attrs" v-on="on">
            mdi-alpha-d-box-outline
          </v-icon>
        </template>
        <span>Detail Data </span>
      </v-tooltip>
      <v-tooltip top>
        <template v-if="!hasFilter" v-slot:activator="{ on, attrs }">
          <v-icon class="ml-4 mb-1" v-bind="attrs" v-on="on">
            mdi-filter-off
          </v-icon>
        </template>
        <span>No Filter can be set</span>
      </v-tooltip>
    </v-card-text>
    <v-tooltip top>
      <template v-if="!isTable" v-slot:activator="{ on, attrs }">
        <v-btn
          justify-right
          @click="freezeView"
          text
          :color="view.isFrozen ? 'blue' : 'grey'"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon small>mdi-snowflake</v-icon>
        </v-btn>
      </template>
      <span>Freeze View</span>
    </v-tooltip>

    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          justify-right
          class=""
          @click="configureView"
          text
          color="grey"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon small>mdi-cog</v-icon>
        </v-btn>
      </template>
      <span>Configuration</span>
    </v-tooltip>

    <v-tooltip top>
      <template v-slot:activator="{ on, attrs }">
        <v-btn
          justify-right
          @click="removeView"
          text
          color="error"
          v-bind="attrs"
          v-on="on"
        >
          <v-icon small>mdi-window-close</v-icon>
        </v-btn>
      </template>
      <span>Close View</span>
    </v-tooltip>
  </div>
</template>

<script>
export default {
  props: {
    chartNumber: {
      required: true,
      type: Number,
    },
  },

  data: () => ({}),
  computed: {
    view() {
      return this.$store.getters.viewById(this.chartNumber);
    },
    isTable() {
      return (
        this.view.type.includes("Table") && this.view.view.includes("Table")
      );
    },
    hasFilter() {
      return this.$store.getters["hasFilter"](this.view.type);
    },
  },

  methods: {
    removeView() {
      this.$store.dispatch("removeView", this.view);
    },

    configureView() {
      this.$store.dispatch("openViewOption", this.chartNumber);
    },

    freezeView() {
      if (this.view.isFrozen) {
        this.$store.dispatch("unfreezeView", this.chartNumber);
      } else {
        this.$store.dispatch("freezeView", this.chartNumber);
      }
    },
  },
};
</script>

<style scoped>
</style>