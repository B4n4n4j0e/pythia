import Vue from 'vue'
import Vuex from 'vuex';
import summaryData from './modules/summaryData'
import detailData from './modules/detailData'
import {changeFilterTypeToLowerCaseOrUpperCase} from '../helperFunctions/storeHelperFunctions'
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
        dialogDataLabel: "",
        dialogViewLabel: "",
        dialogCols: "",
        dialogChartNumber: "",

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
        

        nodes: [],
        views: [
            {
                view: 'BarChartHorizontal',
                type: 'respHostsTopK',
                dataLabel: "Resp hosts top k",
                viewLabel: 'Bar chart horizontal',
                chartNumber: 30,
                cols: 6,
                isFrozen: false,
                isSummary: true

            }
        ],
        chartNumberCounter: 0,
        connectionPortsOfInterest: ["10/tcp", "21/tcp", "22/tcp", "23/tcp", "25/tcp", "80/tcp", "110/tcp", "139/tcp", "443/tcp", "445/tcp", "3389/tcp", "10/udp", "53/udp",
            "67/udp", "123/udp", "135/udp", "137/udp", "138/udp", "161/udp", "445/udp", "631/udp", "1434/udp"],
        startTime: null,
        endTime: null,
        globalPacketCount: 0,
    },
    mutations: {


        incrementChartNumberCounter(state) {
            state.chartNumberCounter += 1
        },

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
            state.views = state.views.filter(el => el.chartNumber != id)
        },

        addView(state, viewData) {
            viewData.chartNumber = state.chartNumberCounter
            state.chartNumberCounter += 1
            state.views.push(viewData)
        },

        updateView(state, viewData) {
            var element = state.views.find(el => el.chartNumber == state.dialogChartNumber)
            {
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



        setDialog(state, bool) {

            state.dialog = bool
        },

        setStartTime(state, startTime) {
            state.startTime = startTime;
        },

        setEndTime(state, endTime) {
            state.endTime = endTime;
        },
    },


    actions: {
        removeViewAndDecrementViewCounter(context, id) {
            var element = context.state.views.find(el => el.chartNumber == id)
            if (element.isSummary) {
                context.dispatch('summaryData/decrementViewCounter', element.type)
            }
            else {
                context.dispatch('detailData/decrementViewCounter', element.type)

            }
            context.commit('removeView', id)
        },

        addViewAndIncrementViewCounter(context, viewData) {
            viewData.chartNumber = context.state.chartNumberCounter
            if (viewData.isSummary) {
                context.dispatch('summaryData/incrementViewCounter', viewData.type)
            }
            else {
                context.dispatch('detailData/incrementViewCounter', viewData.type)
            }
            context.commit('incrementChartNumberCounter')
            context.commit("addView", viewData)
        },

        updateViewAndCounter(context, viewData) {
            var element = context.state.views.find(el => el.chartNumber == context.state.dialogChartNumber)
            if (element.cols == viewData.cols && element.view == viewData.view && element.view && element.type == viewData.type &&
                element.isSummary == viewData.isSummary) {
                return
            }
            else {
                if (viewData.isSummary != element.isSummary) {
                    if (viewData.isSummary) {
                        context.dispatch('summaryData/incrementViewCounter', viewData.type)
                        context.dispatch('detailData/decrementViewCounter', element.type)

                    }
                    else {
                        context.dispatch('summaryData/decrementViewCounter', element.type)
                        context.dispatch('detailData/incrementViewCounter', viewData.type)

                    }
                }
                else if (element.type != viewData.type) {
                    if (viewData.isSummary) {
                        context.dispatch('summaryData/incrementViewCounter', viewData.type)
                        context.dispatch('summaryData/decrementViewCounter', element.type)
                    }
                    else {
                        context.dispatch('detailData/incrementViewCounter', viewData.type)
                        context.dispatch('detailData/decrementViewCounter', element.type)
                    }
                }
                context.commit('updateView', viewData)

            }

        },


    },
    getters: {
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
