import Vue from 'vue'
import Vuex from 'vuex';
import ConnectionsService from '../services/ConnectionService';
import DNSConnectionService from '../services/DNSConnectionService';
import TopKRespHostService from '../services/TopKRespHostService';
import TopKRespPortService from '../services/TopKRespHostService';
import TopKOriginHostService from '../services/TopKOriginHostService';
import TopKDNSQueriesService from '../services/TopKDNSQueriesService';
import ProtocolSumService from '../services/ProtocolSumService';
import ServiceSumService from '../services/ServiceSumService';
import NoticeService from '../services/NoticeService';
import PortsOfInterestService from '../services/PortsOfInterestService';
import IPByteSummaryService from '../services/IPByteSummaryService';


import ConnectionSumService from '../services/ConnectionSumService';

class Dataset {
    constructor(name, type) {
        this.name = name
        this.type = type
        this.payload = []
        this.filter = new Set()
        this.tracker = 0
        this.summary = true

    }
}

function getArrayByChartType(state, type) {
    switch (type) {
        case 'topKRespHosts':
            return state.topKRespHosts
        case 'topKRespPorts':
            return state.topKRespPorts
        case 'topKOriginHosts':
            return state.topKOriginHosts
        case 'topKDNSQueries':
            return state.topKDNSQueries
        case 'portsOfInterest':
            return state.portsOfInterest
        case 'connectionSummaries':
            return state.connectionSummaries
        case 'protocolSummaries':
            return state.protocolSummaries
        case 'serviceSummaries':
            return state.serviceSummaries
        case 'ipByteSummaries':
            return state.ipByteSummaries
        case 'ipByteSummariesByTime':
            return state.ipByteSummariesByTime
    }
}


Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        //dialogData
        dialog: false,
        dialogName: "",
        dialogDataLabel: "",
        dialogViewLabel: "",
        dialogCols: "",
        dialogChartNumber: "",

        nodes: [],
        views: [
            {
                name: 'default',
                view: 'BarChartHorizontal',
                type: 'topKOriginHosts',
                dataLabel: "Top k origin hosts",
                viewLabel: 'Bar chart horizontal',
                chartNumber: 30,
                cols: 6,
            }
        ],
        chartNumberCounter: 0,
        connectionPortsOfInterest: ["10/tcp", "21/tcp", "22/tcp", "23/tcp", "25/tcp", "80/tcp", "110/tcp", "139/tcp", "443/tcp", "445/tcp", "3389/tcp", "10/udp", "53/udp",
            "67/udp", "123/udp", "135/udp", "137/udp", "138/udp", "161/udp", "445/udp", "631/udp", "1434/udp"],
        startTime: null,
        endTime: null,
        selectedDataset: 'default',
        /*
        connections: {
            name: 'connections',
            data: [],
            filter: new Set()
        },*/
        datasets: [
            {
                name: 'default',
                startTime: null,
                endTime: null
            }
        ],
        globalPacketCount: 0,
        notices: [],
        dNSConnections: [],
        connections: [],
        topKRespHosts: [
            {
                name: 'default',
                type: 'topKRespHosts',
                payload: [],
                filter: new Set(),
                tracker: 1,
                summary: true,
            },
        ],
        topKRespPorts: [
            {
                name: 'default',
                type: 'topKRespPorts',
                payload: [],
                filter: new Set(),
                tracker: 1,
                summary: true,
            },
        ],
        topKOriginHosts: [
            {
                name: 'default',
                type: 'topKOriginHosts',
                payload: [],
                filter: new Set(),
                tracker: 1,
                summary: true,
            },
        ],

        topKDNSQueries: [
            {
                name: 'default',
                type: 'topKDNSQueries',
                payload: [],
                filter: new Set(),
                tracker: 1,
                summary: true,
            },
        ],
        portsOfInterest: [
            {
                name: 'default',
                type: 'portsOfInterest',
                payload: [],
                filter: new Set(),
                tracker: 1,
                summary: true,
            },

        ],

        connectionSummaries: [
            {
                name: 'default',
                type: 'connectionSummaries',
                payload: [],
                filter: new Set(),
                tracker: 1,
                summary: true,
            },

        ]

        ,
        protocolSummaries: [
            {
                name: 'default',
                type: 'protocolSummaries',
                payload: [],
                filter: new Set(),
                tracker: 1,
                summary: true,
            },
        ],
        serviceSummaries: [
            {
                name: 'default',
                type: 'serviceSummaries',
                payload: [],
                filter: new Set(),
                tracker: 1,
                summary: true,
            },
        ],
        ipByteSummaries: [
            {
                name: 'default',
                type: 'ipByteSummaries',
                payload: [],
                filter: new Set(),
                tracker: 1,
                summary: true,
            },
        ],
        ipByteSummariesByTime: [
            {
                name: 'default',
                type: 'ipByteSummariesByTime',
                payload: [],
                filter: new Set(),
                tracker: 1,
                summary: true,
            },
        ],
    },


    mutations: {
        setFilter(state, data) {
            if (data.summary) {
                switch (data.type) {
                    case "topKDNSQueries":
                        state.topKDNSQueries.filter.add(data.filter)
                        state.topKDNSQueries.tracker += 1
                        break
                    case "topKOriginHosts":
                        var element = state.topKOriginHosts.find(el => el.name == data.name)
                        element.filter.add(data.filter)
                        element.tracker += 1
                        break
                    default:
                        break
                }

            }

        },

        removeFilter(state, data) {
            if (data.summary) {
                switch (data.type) {
                    case "topKDNSQueries":
                        state.topKDNSQueries.filter.delete(data.filter)
                        state.topKDNSQueries.tracker -= 1
                        break
                    case "topKOriginHosts":
                        var element = state.topKOriginHosts.find(el => el.name == data.name)
                        element.filter.delete(data.filter)
                        element.tracker -= 1
                        break
                    default:
                        break
                }
            }
        },
        removeView(state, id) {
            var element = state.views.find(el => el.chartNumber == id)
            // ersetzen, könnte Sicherheitsproblem darstellen???
            var arrayName = 'state.' + element.type
            var array = eval(arrayName)
            var updateElement = array.find(el => el.name == element.name)
            updateElement.tracker -= 1
            if (updateElement.tracker == 0) {
                updateElement.payload = []
                updateElement.filter = new Set()
            }
            state.views = state.views.filter(el => el.chartNumber != id)

        },


        addView(state, viewData) {
            // ViewCounter incl. Type erhöhen
            viewData.chartNumber = state.chartNumberCounter

            state.chartNumberCounter += 1
            var array = getArrayByChartType(state, viewData.type)
            var  element = array.find(el => el.name == viewData.name)
            element.tracker +=1
            state.views.push(viewData)
        },

        updateView(state, viewData) {
            var element = state.views.find(el => el.chartNumber == state.dialogChartNumber)
            if (element.cols == viewData.cols && element.dataLabel == viewData.dataLabel && element.name == viewData.name
                && element.viewLabel == viewData.viewLabel && element.view == viewData.view && element.type == viewData.type) {
                return
            }
            else {
                element.cols = viewData.cols
                element.dataLabel = viewData.dataLabel
                element.name = viewData.name
                element.viewLabel = viewData.viewLabel
                element.view = viewData.view
                element.type = viewData.type
            }

        },


        configureView(state, id) {
            var element = state.views.find(el => el.chartNumber == id)
            state.dialogChartNumber = id
            state.dialogCols = element.cols
            state.dialogName = element.name
            state.dialogDataLabel = element.dataLabel
            state.dialogViewLabel = element.viewLabel
            state.dialogView = element.view
            state.dialog = true
        },


        addDataset(state, name) {

            var dataset = new Dataset(name, "topKDNSQueries")
            state.topKDNSQueries.push(dataset)
            dataset = new Dataset(name, "topKOriginHosts")
            state.topKOriginHosts.push(dataset)
            dataset = new Dataset(name, "topKRespHosts")
            state.topKRespHosts.push(dataset)
            dataset = new Dataset(name, "topKRespPorts")
            state.topKRespPorts.push(dataset)
            dataset = new Dataset(name, "portsOfInterest")
            state.portsOfInterest.push(dataset)
            dataset = new Dataset(name, "connectionSummaries")
            state.connectionSummaries.push(dataset)
            dataset = new Dataset(name, "protocolSummaries")
            state.protocolSummaries.push(dataset)
            dataset = new Dataset(name, "serviceSummaries")
            state.serviceSummaries.push(dataset)
            dataset = new Dataset(name, "ipByteSummaries")
            state.ipByteSummaries.push(dataset)
            dataset = new Dataset(name, "ipByteSummariesByTime")
            state.ipByteSummariesByTime.push(dataset)

            var set = {
                name: name,
                startTime: state.startTime,
                endTime: state.endTime
            }
            state.datasets.push(set)
        },
        removeDataset(state, name) {
            state.topKDNSQueries = state.topKDNSQueries.filter(element => element.name !== name)
            state.topKOriginHosts = state.topKOriginHosts.filter(element => element.name !== name)
            state.topKRespHosts = state.topKRespHosts.filter(element => element.name !== name)
            state.topKRespPorts = state.topKRespPorts.filter(element => element.name !== name)
            state.portsOfInterest = state.portsOfInterest.filter(element => element.name !== name)
            state.connectionSummaries = state.connectionSummaries.filter(element => element.name !== name)
            state.protocolSummaries = state.protocolSummaries.filter(element => element.name !== name)
            state.serviceSummaries = state.serviceSummaries.filter(element => element.name !== name)
            state.ipByteSummaries = state.ipByteSummaries.filter(element => element.name !== name)
            state.ipByteSummariesByTime = state.ipByteSummariesByTime.filter(element => element.name !== name)
            state.topKDNSQueries = state.topKDNSQueries.filter(element => element.name !== name)
            state.datasets = state.datasets.filter(element => element.name !== name)
        },

        setConnections(state, newConnections) {
            state.connections = newConnections;
        },
        setNodes(state, newNodes) {
            state.nodes = newNodes;
        },
        setDNSConnections(state, newConnections) {
            state.dNSConnections = newConnections;
        },

        setTopKRespHost(state, newTopKRespHost) {
            state.topKRespHost = newTopKRespHost;
        },
        setPortsOfInterest(state, newPortsOfInterest) {
            state.portsOfInterest = newPortsOfInterest;
        },

        setTopKRespPort(state, newTopKRespPort) {
            state.topKRespPort = newTopKRespPort;
        },

        setTopKOriginHost(state, newTopKOriginHost) {
            var payload = newTopKOriginHost.payload
            var topKOriginHost = newTopKOriginHost.topKOriginHost

            if (newTopKOriginHost.length == 0) {
                topKOriginHost.filter = new Set()
                topKOriginHost.tracker = 0
            }

            topKOriginHost.payload = payload;

        },
        setTopKDNSQueries(state, newTopKDNSQueries) {
            state.topKDNSQueries.payload = newTopKDNSQueries;
        },


        setNotices(state, notices) {
            state.notices = notices;
        },

        setConnectionSummary(state, newSummary) {
            var payload = newSummary.payload
            var connectionSummary = newSummary.connectionSummary

            if (newSummary.length == 0) {
                connectionSummary.filter = new Set()
                connectionSummary.tracker = 0
            }
            connectionSummary.payload = payload;

        },

        setProtocolSummary(state, newSummary) {
            state.protocolSummary = newSummary
        },
        setIPByteSummary(state, newSummary) {
            state.ipByteSummary = newSummary
        },

        setIPByteSummaryByTime(state, newSummary) {
            state.ipByteSummaryByTime = newSummary
        },


        setServiceSummary(state, newSummary) {
            state.serviceSummary = newSummary;
        },


        setGlobalPacketCount(state, globalPacketCount) {
            state.globalPacketCount = globalPacketCount;
        },


        addConnections() {

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
        setSelectedDataset(state, selectedDataset) {
            var element = state.datasets.find(el => el.name == selectedDataset)
            if (typeof element.startTime == 'number' && typeof element.endTime == 'number') {
                state.startTime = element.startTime;
                state.endTime = element.endTime;
            }
            state.selectedDataset = selectedDataset;

        },
        setDataSetTime(state, timestamps) {
            var element = state.datasets.find(el => el.name == timestamps.name)
            console.log(element)
            element.startTime = timestamps.startTime
            element.endTime = timestamps.endTime

        }

    },

    actions: {
        getConnections(context) {
            const nodes = new Map()

            ConnectionsService.get(context.state.startTime, context.state.endTime).then((response) => {
                response.data.forEach(d => {
                    d.ts = new Date(d.ts * 1000)

                    if (nodes.has(d.source)) {
                        nodes.set(d.source, nodes.get(d.source) + 1)
                    }
                    else {
                        nodes.set(d.source, 1)
                    }
                    if (nodes.has(d.target)) {
                        nodes.set(d.target, nodes.get(d.target) + 1)
                    }
                    else {
                        nodes.set(d.target, 1)
                    }
                })
                if (nodes.size > 0) {
                    context.commit('setNodes', Array.from(nodes, ([id, value]) => ({ id, value })))
                }
                context.commit('setConnections', response.data);
            })
        },
        getDNSConnections(context) {
            DNSConnectionService.get(context.state.startTime, context.state.endTime).then((response) => {
                context.commit('setDNSConnections', response.data);
            })
        },

        getNotices(context) {
            NoticeService.get(context.state.startTime, context.state.endTime).then((response) => {
                context.commit('setNotices', response.data)
            })
        },

        getTopKRespHost(context) {
            TopKRespHostService.get(context.state.startTime, context.state.endTime).then((response) => {
                context.commit('setTopKRespHost', response.data);
            }).catch(() => {
                context.commit('setTopKRespHost', []);
            })
        },

        getTopKRespPort(context) {
            TopKRespPortService.get(context.state.startTime, context.state.endTime).then((response) => {
                context.commit('setTopKRespPort', response.data);
            })
        },

        getTopKOriginHost(context, topKOriginHost) {
            var startTime, endTime
            var datasetElement = context.state.datasets.find(el => el.name == topKOriginHost.name)
            console.log(datasetElement)
            if (typeof datasetElement.startTime == 'number' && typeof datasetElement.endTime == 'number') {
                startTime = datasetElement.startTime
                endTime = datasetElement.endTime
            }
            else {
                startTime = context.state.startTime
                endTime = context.state.endTime
            }

            TopKOriginHostService.get(startTime, endTime).then((response) => {
                var data = {
                    topKOriginHost: topKOriginHost,
                    payload: response.data
                }
                context.commit('setTopKOriginHost', data);
            }).catch(() => {
                var data = {
                    topKOriginHost: topKOriginHost,
                    payload: []
                }
                context.commit('setTopKOriginHost', data);
            })
        },
        getTopKDNSQueries(context) {
            TopKDNSQueriesService.get(context.state.startTime, context.state.endTime).then((response) => {
                context.commit('setTopKDNSQueries', response.data);
            })
        },

        getPortsOfinterest(context) {
            PortsOfInterestService.get(context.state.startTime, context.state.endTime).then((response) => {
                context.commit('setPortsOfInterest', response.data);
            })
        },

        getProtocolSummary(context) {
            ProtocolSumService.get(context.state.startTime, context.state.endTime).then((response) => {
                context.commit('setProtocolSummary', response.data);
            })
        },

        getServiceSummary(context) {
            ServiceSumService.get(context.state.startTime, context.state.endTime).then((response) => {
                context.commit('setServiceSummary', response.data);
            })
        },

        getIPByteSummary(context) {
            IPByteSummaryService.get(context.state.startTime, context.state.endTime).then((response) => {
                context.commit('setIPByteSummary', response.data);
            })
        },

        getIPByteSummaryByTime(context) {
            IPByteSummaryService.getByTime(context.state.startTime, context.state.endTime).then((response) => {
                response.data.forEach(element => {
                    element.ts = new Date(element.ts * 1000)
                })
                context.commit('setIPByteSummaryByTime', response.data);
            })
        },

        getConnectionSummary(context, connectionSummary) {
            
            var startTime, endTime
            var datasetElement = context.state.datasets.find(el => el.name == connectionSummary.name)

            if (typeof datasetElement.startTime == 'number' && typeof datasetElement.endTime == 'number') {
                startTime = datasetElement.startTime
                endTime = datasetElement.endTime
            }
            else {
                startTime = context.state.startTime
                endTime = context.state.endTime
            }

            ConnectionSumService.get(startTime, endTime).then((response) => {
            response.data.forEach(element => {
                element.ts = new Date(element.ts * 1000)
            })

                var data = {
                    connectionSummary: connectionSummary,
                    payload: response.data
                }
                context.commit('setConnectionSummary', data);
            }).catch(() => {
                var data = {
                    connectionSummary: connectionSummary,
                    payload: []
                }
                context.commit('setConnectionSummary', data);
            })
    
        },

        getSummaryDataByTime(context, name) {
            //ersetzen durch summary bool
            var element = "connections"
            if (!name) {
                element = context.state.datasets.find(el => el.name == name)
                element.startTime = context.state.startTime
                element.endTime = context.state.endTime
            }
            else {
                element = context.state.datasets.find(el => el.name == context.state.selectedDataset)
                element.startTime = context.state.startTime
                element.endTime = context.state.endTime
            }
            context.dispatch('getServiceSummary')
            //context.dispatch('getConnectionSummary')
           // context.dispatch('getDNSConnections')
            context.dispatch('getTopKRespHost')
            context.dispatch('getTopKRespPort')
            // context.dispatch('getTopKOriginHost')
            context.dispatch('updateSummaryData', name)
            context.dispatch('getProtocolSummary')
            context.dispatch('getTopKDNSQueries')
            context.dispatch('getTopKRespPort')
            context.dispatch('getPortsOfinterest')
            context.dispatch('getIPByteSummary')
            context.dispatch('getIPByteSummaryByTime')

            var connectionSummary = context.state.connectionSummaries.find(el => el.name == name)
            if (connectionSummary.tracker > 0) {
                context.dispatch('getConnectionSummary', connectionSummary)
            }
        },

        updateSummaryData(context, name) {
            var topKOriginHost = context.state.topKOriginHosts.find(el => el.name == name)
            if (topKOriginHost.tracker > 0) {
                console.log(topKOriginHost)
                context.dispatch('getTopKOriginHost', topKOriginHost)
            }
       


        }


    },
    getters: {

        dataById: (state) => (id) => {
            //write function to check for array and then find array...
            var element = state.views.find(el => el.chartNumber == id)
            var array = getArrayByChartType(state, element.type)
            return array.find(el => el.name == element.name)

        },
        viewById: (state) => (id) => {
            var element = state.views.find(el => el.chartNumber == id)
            return element
        },


        datasetsArrayWithNames: state => {
            return state.datasets.map(function (element) {
                return element['name']
            })

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
        },

        connectionsPerMinute: state => {
            var data = new Map()
            var coeff = 1000 * 60 * 60
            state.connections.forEach((element) => {
                var date = {
                    ts: new Date(Math.floor(element.ts.getTime() / coeff) * coeff),
                    value: 0
                }
                if (data.has(date.ts.getTime())) {
                    date.value = data.get(date.ts.getTime()).value + 1
                    data.set(date.ts.getTime(), date)
                }
                else {
                    date.value = 1
                    data.set(date.ts.getTime(), date)
                }
            })
            return Array.from(data, ([, { ts, value }]) => ({ ts, value }));

        },



        connectionsServiceData: state => {
            var data = new Map()
            state.connections.forEach((element) => {
                if (data.has(element["service"])) {
                    data.set(element["service"], data.get(element["service"]) + 1);
                } else {
                    data.set(element["service"], 1);
                }
            });
            return Array.from(data, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        },

        connectionsProtocolData: state => {
            const data = new Map()
            state.connections.forEach((element) => {
                if (data.has(element["proto"])) {
                    data.set(element["proto"], data.get(element["proto"]) + 1);
                } else {
                    data.set(element["proto"], 1);
                }
            });
            return Array.from(data, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
        },

        connectionsriginHostTopKData: state => {
            const data = new Map()
            state.connections.forEach((element) => {
                if (data.has(element["source"])) {
                    data.set(element["source"], data.get(element["source"]) + 1);
                } else {
                    data.set(element["source"], 1);
                }
            });
            return Array.from(data, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
        },

        connectionsRespHostTopKData: state => {
            const data = new Map()
            state.connections.forEach((element) => {
                if (data.has(element["target"])) {
                    data.set(element["target"], data.get(element["target"]) + 1);
                } else {
                    data.set(element["target"], 1);
                }
            });
            return Array.from(data, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
        },


        connectionsRespPortTopKData: state => {
            const data = new Map()
            state.connections.forEach((element) => {
                var port = element.resp_port.toString() + '/' + element.proto
                if (data.has(port)) {
                    data.set(port, data.get(port) + 1);
                } else {
                    data.set(port, 1);
                }
            });

            return Array.from(data, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
        },

        connectionsPortsOfInterest: state => {
            const data = new Map()
            state.connections.forEach((element) => {
                var port = element.resp_port.toString() + '/' + element.proto
                if (state.connectionPortsOfInterest.includes(port)) {
                    if (data.has(port)) {
                        data.set(port, data.get(port) + 1);
                    } else {
                        data.set(port, 1);
                    }
                }
            });

            return Array.from(data, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
        },

        dNSTopKQueries: state => {
            const data = new Map()
            state.dNSConnections.forEach((element) => {
                if (data.has(element.query_text)) {
                    data.set(element.query_text, data.get(element.query_text) + 1);
                } else {
                    data.set(element.query_text, 1);
                }
            });
            return Array.from(data, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10);
        },




        nodeData: state => {

            const nodes = new Map()

            state.connections.forEach(element => {
                var origin = element['source']
                var responder = element['target']

                if (nodes.has(origin) && nodes.has(responder)) {
                    nodes.set(origin, nodes.get(origin) + 1);
                    nodes.set(responder, nodes.get(responder) + 1);
                }
                else if (nodes.has(origin)) {
                    nodes.set(origin, nodes.get(origin) + 1);
                    nodes.set(responder, 1);

                }
                else if (nodes.has(responder)) {
                    nodes.set(origin, 1);
                    nodes.set(responder, nodes.get(responder) + 1);
                }
                else {
                    nodes.set(responder, 1);
                    nodes.set(origin, 1);
                }

            });
            if (nodes.size > 0) {
                return Array.from(nodes, ([id, value]) => ({ id, value }));
            }
            else {
                return []
            }

        }



    },
})