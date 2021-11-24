import Vue from 'vue'
import Vuex from 'vuex';
import summaryData from './modules/summaryData'
import detailData from './modules/detailData'

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

        filters: new Map([['originHost', new Set()], ['respHost', new Set()], ['service', new Set()], ['protocol', new Set()],
        ['query', new Set()], ['qAnswer', new Set()], ['qType', new Set()], ['qError', new Set()],
        ['uID', new Set()], ['respByte', new Set()], ['originByte', new Set()], ['duration', new Set()],
        ['respPort', new Set()], ['originPort', new Set()]]),

        negativeFilters: new Map([['originHost', new Set()], ['respHost', new Set()], ['service', new Set()], ['protocol', new Set()],
        ['query', new Set()], ['qAnswer', new Set()], ['qType', new Set()], ['qError', new Set()],
        ['uID', new Set()], ['respByte', new Set()], ['originByte', new Set()], ['duration', new Set()],
        ['respPort', new Set()], ['originPort', new Set()]]),
        nodes: [],
        views: [
            {
                view: 'BarChartHorizontal',
                type: 'topKOriginHosts',
                dataLabel: "Top k origin hosts",
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
            state.filters.get(filter.name).add(filter.value)
            console.log(state.filters.get(filter.name))

        },

        addNegativeFilter(state, filter) {
            state.negativeFilters.get(filter.name).add(filter.value)
            console.log(state.negativeFilters.get(filter.name))

        },

        removeAllFilters(state) {
            for (var [key,] of state.filters.entries()) {
                state.filters.set(key, new Set())
            }
            for ([key,] of state.negativeFilters.entries()) {
                state.negativeFilters.set(key, new Set())
            }
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
