import Vue from 'vue'
import Vuex from 'vuex';
import summaryData from './modules/summaryData'
import detailData from './modules/detailData'
import { adjustFilter, convertViewData, checkFilterTracker } from '../helperFunctions/storeHelperFunctions'
import DashboardService from '../services/DashboardService'
import ViewService from '../services/ViewService'
import ModeService from '../services/ModeService'
import PCAPUploadService from "../services/PCAPUploadService";


Vue.use(Vuex);

export default new Vuex.Store({

    modules: {
        summaryData,
        detailData,
    },

    state: {
        dialog: false,
        dialogIsSummary: false,
        dialogIsFrozen: false,
        dialogDataLabel: "",
        dialogViewLabel: "",
        dialogCols: "",
        dialogChartNumber: "",

        dashboards: [],
        currentDashboard: "",

        snackbar: false,
        snackbarDefaultTimeout: 5000,
        snackbarTimeout: 5000,
        snackbarMessage: "",
        snackbarColor: "",
        mode: "",

        filterChangeTracker: {
            added: new Set(),
            deleted: new Set()

        },

        negativeFilterChangeTracker: {
            added: new Set(),
            deleted: new Set()
        },


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
            ['notice_source', new Set()], ['notice_target', new Set()]])
        },

        pCAPLoading: false,
        views: [],
        connectionPortsOfInterest: ["10/tcp", "21/tcp", "22/tcp", "23/tcp", "25/tcp", "80/tcp", "110/tcp", "139/tcp", "443/tcp", "445/tcp", "3389/tcp", "10/udp", "53/udp",
            "67/udp", "123/udp", "135/udp", "137/udp", "138/udp", "161/udp", "445/udp", "631/udp", "1434/udp"],
        startTime: null,
        endTime: null,
        updatedFilter: false,

    },
    mutations: {

        setMode(state, name) {
            state.mode = name
        },

        resetFilterChangeTracker(state) {
            state.filterChangeTracker.added = new Set()
            state.filterChangeTracker.deleted = new Set()

        },

        resetNegativeFilterChangeTracker(state) {
            state.negativeFilterChangeTracker.added = new Set()
            state.negativeFilterChangeTracker.deleted = new Set()

        },

        addFilter(state, filter) {
            filter = adjustFilter(filter)
            state.filters.filters.get(filter.type).add(filter.filter)
            state.filters.tracker = state.filters.tracker + 1
            checkFilterTracker(state.filterChangeTracker.added, state.filterChangeTracker.deleted, filter)

        },

        addNegativeFilter(state, filter) {
            filter = adjustFilter(filter)
            state.negativeFilters.filters.get(filter.type).add(filter.filter)
            state.negativeFilters.tracker = state.negativeFilters.tracker - 1
            checkFilterTracker(state.negativeFilterChangeTracker.added, state.negativeFilterChangeTracker.deleted, filter)

        },

        removeFilterByFilterName(state, item) {
            if (item.isNegative) {
                state.negativeFilters.filters.get(item.type).delete(item.filter)
                state.negativeFilters.tracker -= 1
                checkFilterTracker(state.negativeFilterChangeTracker.deleted, state.negativeFilterChangeTracker.added, item)

            }
            else {
                state.filters.filters.get(item.type).delete(item.filter)
                state.filters.tracker -= 1
                checkFilterTracker(state.filterChangeTracker.deleted, state.filterChangeTracker.added, item)

            }
        },

        removeAllFilters(state) {
            for (var [key, value] of state.filters.filters.entries()) {
                value.forEach(elem => {
                    var filter = { 'type': key, 'filter': elem }
                    checkFilterTracker(state.filterChangeTracker.deleted, state.filterChangeTracker.added, filter)
                })
                state.filters.filters.set(key, new Set())
            }
            state.filters.tracker -= 1
            for ([key, value] of state.negativeFilters.filters.entries()) {
                value.forEach(elem => {
                    var filter = { 'type': key, 'filter': elem }
                    checkFilterTracker(state.negativeFilterChangeTracker.deleted, state.negativeFilterChangeTracker.added, filter)
                })

                state.negativeFilters.filters.set(key, new Set())
            }
            state.negativeFilters.tracker -= 1

        },

        removeAllNegativeFilters(state) {
            for (var [key, value] of state.negativeFilters.filters.entries()) {
                value.forEach(elem => {
                    var filter = { 'type': key, 'filter': elem }
                    checkFilterTracker(state.negativeFilterChangeTracker.deleted, state.negativeFilterChangeTracker.added, filter)
                })

                state.negativeFilters.filters.set(key, new Set())
            }
            state.negativeFilters.tracker -= 1
        },

        removeView(state, id) {
            for (var i = 0; i < state.views.length; i++) {

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


        setSnackbar(state, newValue) {
            state.snackbar = newValue
        },
        setSnackbarMessage(state, newValue) {
            state.snackbarMessage = newValue
        },

        setSnackbarColor(state, color) {
            state.snackbarColor = color
        },
        setSnackbarTimeout(state, timeout) {
            state.snackbarTimeout = timeout
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

        setDashboards(state, dashboards) {
            state.dashboards = dashboards
        },
        addDashboard(state, newDashboard) {
            state.dashboards.push(newDashboard)
        },
        removeDashboard(state, name) {
            state.dashboards = state.dashboards.filter(elem => elem.name != name)
        },

        setCurrentDashboard(state, currentDashboard) {
            state.currentDashboard = currentDashboard
        },

        setViews(state, views) {
            state.views = views
        },
        setPCAPLoading(state, bool) {
            state.pCAPLoading = bool
        },
        changeUpdatedFilter(state) {
            state.updatedFilter = !state.updatedFilter;
        }
    },

    actions: {

        openViewOption(context, id) {
            context.commit('openViewOption', id)
        },
        freezeView(context, id) {
            context.commit('freezeView', id)
        },

        unfreezeView(context, id) {
            context.commit('unfreezeView', id)
        },

        addFilter(context, filter) {
            context.commit('addFilter', filter)
        },

        addNegativeFilter(context, filter) {
            context.commit('addNegativeFilter', filter)
        },
        removeFilterByFilterName(context, name) {
            context.commit('removeFilterByFilterName', name)
        },
        removeAllNegativeFilters(context) {
            context.commit('removeAllNegativeFilters')
        },

        removeAllFilters(context) {
            context.commit('removeAllFilters')
        },

        setDialog(context, dialog) {
            context.commit('setDialog', dialog)
        },


        setStartTime(context, startTime) {
            context.commit('setStartTime', startTime)
        },

        setEndTime(context, endTime) {
            context.commit('setEndTime', endTime)
        },

        setSnackbar(context, newOptions) {
            context.commit('setSnackbar', newOptions)
        },

        triggerSnackbar(context, options) {
            let timeout = options.timeout || context.state.snackbarDefaultTimeout
            context.commit('setSnackbarTimeout', timeout)
            context.commit('setSnackbarMessage', options.message)
            context.commit('setSnackbarColor', options.color)
            context.commit('setSnackbar', true)

        },

        getAllData(context) {
            context.commit('changeUpdatedFilter')
            context.dispatch("summaryData/getDataByTime")
            context.dispatch("detailData/getDataByTime")
        },

        uploadPCAP(context, data) {
            context.commit('setPCAPLoading', true)
            PCAPUploadService.post(data).then(() => {
                context.commit('setSnackbarTimeout', 2000)
                context.commit('setSnackbarMessage', ' The upload was successful, you can now switch to pcap mode')
                context.commit('setSnackbarColor', 'green')
                context.commit('setSnackbar', true)
            })
                .catch((error) => {
                    if (error.response.data.message) {
                        context.commit('setSnackbarTimeout', 5000)
                        context.commit('setSnackbarMessage', error.response.data.message)
                        context.commit('setSnackbarColor', 'error')
                        context.commit('setSnackbar', true)
                    }
                })
                .finally(() => { context.commit('setPCAPLoading', false) })
        },

        getDashboardNames(context) {
            DashboardService.getAllNames().then(response => {
                const dashboard = localStorage.getItem("current_dashboard");
                if (dashboard) {
                    context.commit('setCurrentDashboard', dashboard)

                }
                else {
                    context.commit('setCurrentDashboard', response.data[0].name)
                }

                context.commit('setDashboards', response.data)
                context.dispatch('switchDashboard', context.state.currentDashboard)
            })

        },

        addDashboard(context, name) {
            const data = {
                name: name
            }
            DashboardService.post(data).then((response) => {
                context.commit('addDashboard', response.data)
            })
        },

        removeDashboard(context, name) {
            DashboardService.delete(name).then(() => {
                context.commit('removeDashboard', name)
                //change current dashboard if current dashboard is deleted
                if (context.state.dashboards.length > 0 && context.state.currentDashboard == name) {
                    context.dispatch('switchDashboard', context.state.dashboards[0].name)
                }
            })
        },

        switchDashboard(context, name) {
            if (name == context.state.currentDashboard && context.state.views.length > 0) {
                return
            }
            DashboardService.get(name).then((response) => {
                response.data.views.forEach(elem => {
                    convertViewData(elem)
                })
                context.commit('setViews', response.data.views)
                context.commit('setCurrentDashboard', response.data.name)
                context.dispatch("summaryData/getDataByTime");
                context.dispatch("detailData/getDataByTime");
                localStorage.setItem("current_dashboard", response.data.name);

            })
        },

        switchMode(context, name) {
            if (name == context.state.mode) {
                return
            }
            const data = {
                mode: name
            }

            ModeService.post(data).then((response) => {
                context.commit('setMode', response.data.mode)
                context.dispatch("summaryData/getDataByTime")
                context.dispatch("detailData/getDataByTime")
            }).catch((error) => {
                if (error.response.status == 503) {
                    context.commit('setSnackbarTimeout', 2000)
                    context.commit('setSnackbarMessage', error.response.data.message)
                    context.commit('setSnackbarColor', 'error')
                    context.commit('setSnackbar', true)
                }
            })
        },

        getMode(context) {
            ModeService.get().then((response) => {
                context.commit('setMode', response.data.mode)
            })
        },


        removeView(context, viewData) {
            ViewService.delete(viewData.chartNumber).then(() => {
                context.commit('removeView', viewData.chartNumber)
                if (viewData.isSummary) {
                    context.dispatch('summaryData/deleteDataIfNotActive', viewData.type)
                }
                else {
                    context.dispatch('detailData/deleteDataIfNotActive', viewData.type)
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
                    context.dispatch('summaryData/getDataIfActive', viewData.type)
                }
                else {
                    context.dispatch('detailData/getDataIfActive', viewData.type)
                }
            })

        },

        updateView(context, viewData) {
            var element = context.state.views.find(el => el.chartNumber == context.state.dialogChartNumber)
            var oldType = element.type
            var oldIsSummary = element.isSummary;
            if (element.cols == viewData.cols && element.view == viewData.view && element.view && element.type == viewData.type &&
                element.isSummary == viewData.isSummary && viewData.isFrozen == element.isFrozen) {
                return
            }
            else {
                const data = {
                    'id': context.state.dialogChartNumber,
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
                    if (viewData.isSummary) {
                        context.dispatch('summaryData/getDataIfActive', viewData.type)
                        if (oldIsSummary) {
                            context.dispatch('summaryData/deleteDataIfNotActive', oldType)
                        }
                        else {
                            context.dispatch('detailData/deleteDataIfNotActive', oldType)
                        }
                    }
                    else {
                        context.dispatch('detailData/getDataIfActive', viewData.type)
                        if (!oldIsSummary) {
                            context.dispatch('detailData/getDataIfActive', viewData.type)
                        }
                        else {
                            context.dispatch('summaryData/deleteDataIfNotActive', oldType)

                        }

                    }


                })



            }

        },


    },
    getters: {

        numberOfChanges(state) {
            state.filters.tracker
            state.negativeFilters.tracker
            return state.filterChangeTracker.added.size + state.filterChangeTracker.deleted.size + state.negativeFilterChangeTracker.added.size + state.negativeFilterChangeTracker.deleted.size
        },

        hasFilter: () => (type) => {
            return type != "ipByteSummary"

        },
        viewCountByViewSummary: (state) => (name) => {
            var counter = 0;
            state.views.forEach(elem => (elem.type === name && elem.isSummary) ? counter++ : true)
            return counter
        },

        viewCountByViewDetail: (state) => (name) => {
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
            state.updatedFilter

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

        unixStartTime: state => {
            return state.startTime / 1000

        },

        unixEndTime: state => {
            return state.endTime / 1000
        },


        startTime: state => { //
            if (state.startTime) {
                var time = new Date(state.startTime)
                return time.toTimeString().slice(0, 5)
            }
            return null

        },

        endTime: state => { //
            if (state.endTime) {
                var time = new Date(state.endTime)
                return time.toTimeString().slice(0, 5)
            }
            return null

        },

        startDate: state => { //
            if (state.startTime) {
                var date = new Date(state.startTime)
                var dateWithOffset = new Date(date - (date.getTimezoneOffset() * 60000))
                return dateWithOffset.toISOString().slice(0, 10)
            }
            return null

        },

        endDate: state => {//
            if (state.endTime) {
                var date = new Date(state.endTime)
                var dateWithOffset = new Date(date - (date.getTimezoneOffset() * 60000))
                return dateWithOffset.toISOString().slice(0, 10)
            }
            return null
        }



    }
})
