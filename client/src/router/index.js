import Vue from "vue"
import VueRouter from "vue-router"
import Dashboard from "../views/Dashboard"
import Configuration from "../views/Configuration"


Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        component: Dashboard
    },
    {
        path: "/configuration",
        component: Configuration
    }
]

export default new VueRouter({
    mode: "history",
    routes
})

