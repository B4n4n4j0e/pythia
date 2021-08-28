import Vue from 'vue';
import Vuetify from 'vuetify/lib/framework';

Vue.use(Vuetify);

export default new Vuetify({
    theme:{
      variations: {
        colors: ['primary', 'secondary'],
        lighten: 2,
        darken: 2,},
    options: { customProperties: true },
    themes: {
      light: {
        primary: "#BFD8D5",
        secondary: "#DFDFDF",
        tertiary: "#B1BED5",
        quaternary:"#272727",
        quinary:'#4F98CA',
        senary:'F4F3F3',
        text: "#000000",
        selected:'#A7D129',
        error: "#B1BED5",
        warning: "#FFD200",
        success: "#009A38",
      },
      dark: {
        primary: "#511845",
        secondary: "#C70039",
        tertiary: "#900C3F",
        quaternary:'#E43F5A',
        quinary:'#1F4068',
        senary:'#2D132C',
        selected:'#A7D129',
        text: "#FFFFFF",
        error: "#B1BED5",
        warning: "#FFD200",
        success: "#009A38",
      },
    },
}
});
