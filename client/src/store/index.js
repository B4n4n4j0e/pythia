import Vue from 'vue'
import Vuex from 'vuex';
import summaryData from './modules/summaryData'
import detailData from './modules/detailData'
import {changeFilterTypeToLowerCaseOrUpperCase, convertViewData} from '../helperFunctions/storeHelperFunctions'
import DashboardService from '../services/DashboardService'
import ViewService from '../services/ViewService'

Vue.use(Vuex);

export default new Vuex.Store({

    modules: {
        summaryData,
        detailData,
    },

    state: {
        //dialogData
        dialog: false,
        dialogIsSummary: false,
        dialogIsFrozen: false,
        dialogDataLabel: "",
        dialogViewLabel: "",
        dialogCols: "",
        dialogChartNumber: "",
        
        //dashboarddata
        dashboards: [],
        currentDashboard: "",
        
        //snackbar data
        snackbar: false,
        snackbarMessage: "",
        
        filters:
        {
            tracker: 0,
            filters: new Map([['source', new Set()], ['target', new Set()], ['service', new Set()], ['proto', new Set()],
            ['query_text', new Set()], ['q_answers', new Set()], ['q_type', new Set()], ['q_rcode', new Set()],
            ['uid', new Set()], ['resp_ip_bytes', new Set()], ['orig_ip_bytes', new Set()], ['duration', new Set()],
            ['resp_p', new Set()], ['origin_p', new Set()], ['notice_uid', new Set()], ['notice_header', new Set()],
            ['notice_source', new Set()], ['notice_target', new Set()]])
        },

        negativeFilters: {
            tracker: 0,
            filters: new Map([['source', new Set()], ['target', new Set()], ['service', new Set()], ['proto', new Set()],
            ['query_text', new Set()], ['q_answers', new Set()], ['q_type', new Set()], ['q_rcode', new Set()],
            ['uid', new Set()], ['resp_ip_bytes', new Set()], ['orig_ip_bytes', new Set()], ['duration', new Set()],
            ['resp_p', new Set()], ['origin_p', new Set()], ['notice_uid', new Set()], ['notice_header', new Set()],
            ['notice_source', new Set()], ['notice_target', new Set()] ])
        },
        

        views: [],
        connectionPortsOfInterest: ["10/tcp", "21/tcp", "22/tcp", "23/tcp", "25/tcp", "80/tcp", "110/tcp", "139/tcp", "443/tcp", "445/tcp", "3389/tcp", "10/udp", "53/udp",
            "67/udp", "123/udp", "135/udp", "137/udp", "138/udp", "161/udp", "445/udp", "631/udp", "1434/udp"],
        startTime: null,
        endTime: null,
        globalPacketCount: 0,
    },
    mutations: {


        addFilter(state, filter) {
            filter = changeFilterTypeToLowerCaseOrUpperCase(filter)
            state.filters.filters.get(filter.type).add(filter.filter)
            state.filters.tracker = state.filters.tracker + 1
        },

        addNegativeFilter(state, filter) {
            filter = changeFilterTypeToLowerCaseOrUpperCase(filter)
            state.negativeFilters.filters.get(filter.type).add(filter.filter)
            state.negativeFilters.tracker = state.negativeFilters.tracker - 1

        },

        removeFilterByFilterName(state, item) {
            if (item.isNegative) {
                state.negativeFilters.filters.get(item.type).delete(item.filter)
                state.negativeFilters.tracker -= 1
            }
            else {
                state.filters.filters.get(item.type).delete(item.filter)
                state.filters.tracker -= 1
            }
        },

        removeAllFilters(state) {
            for (var [key,] of state.filters.filters.entries()) {
                state.filters.filters.set(key, new Set())
            }
            state.filters.tracker -= 1
            for ([key,] of state.negativeFilters.filters.entries()) {
                state.negativeFilters.filters.set(key, new Set())
            }
            state.negativeFilters.tracker -= 1

        },

        removeAllNegativeFilters(state) {
            for (var [key,] of state.negativeFilters.filters.entries()) {
                state.negativeFilters.filters.set(key, new Set())
            }
            state.negativeFilters.tracker -= 1
        },

        removeView(state, id) {
            for( var i = 0; i < state.views.length; i++){ 
    
                if (state.views[i].chartNumber === id) { 
                    state.views.splice(i, 1); 
                }
            }
        },

        addView(state, viewData) {
            state.views.push(viewData)
        },

        updateView(state, viewData) {
            var element = state.views.find(el => el.chartNumber == state.dialogChartNumber)
            {
                element.isFrozen = viewData.isFrozen
                element.isSummary = viewData.isSummary
                element.cols = viewData.cols
                element.dataLabel = viewData.dataLabel
                element.viewLabel = viewData.viewLabel
                element.view = viewData.view
                element.type = viewData.type
            }
        },
        openViewOption(state, id) {
            var element = state.views.find(el => el.chartNumber == id)
            state.dialogIsSummary = element.isSummary
            state.dialogIsFrozen = element.isFrozen
            state.dialogChartNumber = id
            state.dialogCols = element.cols
            state.dialogDataLabel = element.dataLabel
            state.dialogViewLabel = element.viewLabel
            state.dialogView = element.view
            state.dialog = true
        },


        freezeView(state, id) {
            var element = state.views.find(el => el.chartNumber == id)
            element.isFrozen = true
        },

        unfreezeView(state, id) {
            var element = state.views.find(el => el.chartNumber == id)
            element.isFrozen = false
        },

        setGlobalPacketCount(state, globalPacketCount) {
            state.globalPacketCount = globalPacketCount;
        },

        setSnackbar(state, newValue) {
            state.snackbar = newValue
        },
        setSnackbarMessage(state,newValue) {
            state.snackbarMessage = newValue
        },

        setDialog(state, bool) {
            state.dialog = bool
        },

        setStartTime(state, startTime) {
            state.startTime = startTime;
        },

        setEndTime(state, endTime) {
            state.endTime = endTime;
        },

        setDashboards(state, dashboards ){
            state.dashboards = dashboards
        },
        addDashboard(state, newDashboard ){
            state.dashboards.push(newDashboard)
        },
        removeDashboard(state, name ){
            state.dashboards = state.dashboards.filter(elem => elem.name != name)
        },

        setCurrentDashboard(state, currentDashboard){
            state.currentDashboard = currentDashboard
        },

        setViews(state, views){
            state.views = views
        }
    },

    actions: {
        getDashboardNames(context) {
            DashboardService.getAllNames().then(response => {
                const theme = localStorage.getItem("current_dashboard");
                if (theme) {
                    context.commit('setCurrentDashboard', theme)

                }
                else {
                    context.commit('setCurrentDashboard', response.data[0].name)
                }

                context.commit('setDashboards',response.data)
                context.dispatch('switchDashboard', context.state.currentDashboard)
            })

        },

        addDashboard(context, name) {
            const data = {
                name: name
            }
            DashboardService.post(data).then((response) => {
                context.commit('addDashboard',response.data)
            })
        },   
        
        removeDashboard(context,name) {
            DashboardService.delete(name).then(() => {
                context.commit('removeDashboard',name)
                //change current dashboard if current dashboard is deleted
                if (context.state.dashboards.length > 0 && context.state.currentDashboard==name) {
                    context.dispatch('switchDashboard', context.state.dashboards[0].name)
                }
            })
        },

        switchDashboard(context,name) {
            if (name == context.state.currentDashboard && context.state.views.length > 0) {
                return
            }
            DashboardService.get(name).then((response) => {
                response.data.views.forEach(elem => {
                   convertViewData(elem)
                })
                context.commit('setViews',response.data.views)
                context.commit('setCurrentDashboard',response.data.name)
                context.dispatch("summaryData/getDataByTime");
                context.dispatch("detailData/getDataByTime"); 
                localStorage.setItem("current_dashboard", response.data.name);
                    
             })
        },

        removeView(context, viewData) {
            ViewService.delete(viewData.chartNumber).then(() => {
                context.commit('removeView', viewData.chartNumber)
                if (viewData.isSummary) {
                    context.dispatch('summaryData/deleteDataIfNotActivated', viewData.type)
                }
                else {
                    context.dispatch('detailData/deleteDataIfNotActivated', viewData.type)
                }
            })
        },

        addView(context, viewData) {
            const data = {
                'dashboard_name': context.state.currentDashboard,
                'data_label': viewData.dataLabel,
                'view_label': viewData.viewLabel,
                'view_type': viewData.type,
                'is_frozen': viewData.isFrozen,
                'is_summary': viewData.isSummary,
                'view': viewData.view,
                'cols': viewData.cols
            }
         
            ViewService.post(data).then(response => {
                convertViewData(response.data)
                context.commit("addView", response.data)
                if (viewData.isSummary) {
                    context.dispatch('summaryData/getDataIfActivated', viewData.type)
                }
                else {
                    context.dispatch('detailData/getDataIfActivated', viewData.type)
                }
            })

        },

        updateView(context, viewData) {
            var element = context.state.views.find(el => el.chartNumber == context.state.dialogChartNumber)
            if (element.cols == viewData.cols && element.view == viewData.view && element.view && element.type == viewData.type &&
                element.isSummary == viewData.isSummary && viewData.isFrozen == element.isFrozen) {
                return
            }
            else {
            const data = {
                    'id' : context.state.dialogChartNumber,
                    'dashboard_name': context.state.currentDashboard,
                    'data_label': viewData.dataLabel,
                    'view_label': viewData.viewLabel,
                    'view_type': viewData.type,
                    'is_frozen': viewData.isFrozen,
                    'is_summary': viewData.isSummary,
                    'view': viewData.view,
                    'cols': viewData.cols
                }
                ViewService.put(data).then((response) => {
                    convertViewData(response.data)
                    context.commit('updateView', response.data)
                    context.dispatch('summaryData/getDataIfActivated', viewData.type)
                    context.dispatch('summaryData/deleteDataIfNotActivated', element.type)
                    context.dispatch('detailData/getDataIfActivated', viewData.type)
                    context.dispatch('detailData/deleteDataIfNotActivated', element.type)
            
                })

             

            }

        },


    },
    getters: {
        viewCountByViewSummary: (state) => (name) =>{
            var counter = 0;
            state.views.forEach(elem => (elem.type === name && elem.isSummary) ? counter++ : true)
            return counter
        },

        viewCountByViewDetail: (state) => (name) =>{
            var counter = 0;
            state.views.forEach(elem => (elem.type === name && !elem.isSummary) ? counter++ : true)
            return counter
        },


        allFilters(state) {
            state.filters.tracker
            state.negativeFilters.tracker
            const result = []
            for (var [key, value] of state.filters.filters.entries()) {
                value.forEach(elem => {
                    result.push({ 'type': key, 'filter': elem, 'isNegative': false })
                })
            }
            for ([key, value] of state.negativeFilters.filters.entries()) {
                value.forEach(elem => {
                    result.push({ 'type': key, 'filter': elem, 'isNegative': true })
                })
            }
            return result

        },

        filterByType: (state) => (type) => {
            state.filters.tracker
            return state.filters.filters.get(type)
        },

        negativeFilterByType: (state) => (type) => {
            state.negativeFilters.tracker
            return state.negativeFilters.filters.get(type)
        },
        filterRequestParams(state) {
            state.filters.tracker
            state.negativeFilters.tracker

            const filters = state.filters.filters
            const negativeFilters = state.negativeFilters.filters
            var result = {}
            result['filters'] = {}
            result['filters']['start_time'] = state.startTime / 1000
            result['filters']['end_time'] = state.endTime / 1000

            for (var [key, value] of filters.entries()) {
                if (value.size > 0) {
                    result['filters'][key] = Array.from(value)
                }
            }
            result['negative_filters'] = {}
            for ([key, value] of negativeFilters.entries()) {
                if (value.size > 0) {
                    result['negative_filters'][key] = Array.from(value)
                }
            }
            return result
        },


        viewById: (state) => (id) => {
            var element = state.views.find(el => el.chartNumber == id)
            return element
        },


        startTime: state => {
            if (state.startTime) {
                var time = new Date(state.startTime)
                return time.toTimeString().slice(0, 5)
            }
            return null

        },

        endTime: state => {
            if (state.endTime) {
                var time = new Date(state.endTime)
                return time.toTimeString().slice(0, 5)
            }
            return null

        },

        startTimeUnix: state => {
            if (state.startTime) {
                return state.startTime / 1000
            }
            return null
        },

        endTimeUnix: state => {
            if (state.startTime) {
                return state.endTime / 1000
            }
            return null
        },


        startDate: state => {
            if (state.startTime) {
                var date = new Date(state.startTime)
                var dateWithOffset = new Date(date - (date.getTimezoneOffset() * 60000))
                return dateWithOffset.toISOString().slice(0, 10)
            }
            return null

        },

        endDate: state => {
            if (state.endTime) {
                var date = new Date(state.endTime)
                var dateWithOffset = new Date(date - (date.getTimezoneOffset() * 60000))
                return dateWithOffset.toISOString().slice(0, 10)
            }
            return null
        }



    }
})
