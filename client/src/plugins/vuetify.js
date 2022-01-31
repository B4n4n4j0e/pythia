import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';
import 'material-design-icons-iconfont/dist/material-design-icons.css'

Vue.use(Vuetify, {
  iconfont: 'md'
})


export default new Vuetify({
  theme: {
    options: {
      customProperties: true,
    },
    themes: {
      light: {
        primary: "#BFD8D5",
        secondary: "#DFDFDF",
        tertiary: "#B1BED5",
        quaternary: "#272727",
        quinary: '#4F98CA',
        senary: 'F4F3F3',
        text: "#000000",
        selected: '#A7D129',
        error: "#FF0303",
        warning: "#FFD200",
        success: "#009A38",
      },
      dark: {
        primary: "#511845",
        secondary: "#C70039",
        tertiary: "#900C3F",
        quaternary: '#E43F5A',
        quinary: '#1F4068',
        senary: '#2D132C',
        selected: '#A7D129',
        text: "#FFFFFF",
        error: "#FF0303",
        warning: "#FFD200",
        success: "#009A38",
      },
    },
  }
});
