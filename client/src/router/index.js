import Vue from "vue"
import VueRouter from "vue-router"
import Dashboard from "../components/Dashboard"
import Configuration from "../components/Configuration"


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

const router = new VueRouter({
    mode: "history",
    routes
})

export default router