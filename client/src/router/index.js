import Vue from "vue"
import VueRouter from "vue-router"
import HelloWorld from "../components/HelloWorld"


Vue.use(VueRouter);

const routes = [
    {
        path: "/",
        component: HelloWorld
    }
]

const router = new VueRouter({
    mode: "history",
    routes
})

export default router