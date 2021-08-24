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

Vue.use(Vuex);

export default new Vuex.Store({
    state: {
        nodes: [],
        connections: [],
        topKRespHost: [],
        topKRespPort: [],
        topKOriginHost: [],
        topKDNSQueries:[],
        dNSConnections: [],
        portsOfInterest: [],
        startTime: null,
        endTime: null,
        globalPacketCount: 0,
        notices: [],
        connectionSummary: [],
        protocolSummary: [],
        serviceSummary: [],
        ipByteSummary: [],
        ipByteSummaryByTime: [],

    },


    mutations: {
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
            state.topKOriginHost = newTopKOriginHost;
        },
        setTopKDNSQueries(state, newTopKDNSQueries) {
            state.topKDNSQueries = newTopKDNSQueries;
        },

        setNotices(state, notices) {
            state.notices = notices;
        },

        setConnectionSummary(state, newSummary) {
            state.connectionSummary = newSummary;
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

        setStartTime(state, startTime) {
            state.startTime = startTime;
        },

        setEndTime(state, endTime) {
            state.endTime = endTime;
        },


    },

    actions: {
        getConnections(context) {
            console.log(context.state.startTime)
            console.log(context.state.endTime)

            const nodes = new Map()

            ConnectionsService.get(context.state.startTime, context.state.endTime).then((response) => {
                response.data.forEach(d => {
                    if (nodes.has(d.source)) {
                        nodes.set(d.source, nodes.get(d.source)+1)
                    }
                    else {
                        nodes.set(d.source, 1)
                    }
                    if (nodes.has(d.target)) {
                        nodes.set(d.target, nodes.get(d.target)+1)
                    }
                    else {
                        nodes.set(d.target, 1)
                    }
                })
                if (nodes.size>0){
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
            })
        },

        getTopKRespPort(context) {
            TopKRespPortService.get(context.state.startTime, context.state.endTime).then((response) => {
                context.commit('setTopKRespPort', response.data);
            })
        },
        getTopKOriginHost(context) {
            TopKOriginHostService.get(context.state.startTime, context.state.endTime).then((response) => {
                context.commit('setTopKOriginHost', response.data);
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

        getIPByteSummary(context){
            IPByteSummaryService.get(context.state.startTime, context.state.endTime).then((response) => {
                context.commit('setIPByteSummary', response.data);
            })
        },

        getIPByteSummaryByTime(context){
            IPByteSummaryService.getByTime(context.state.startTime, context.state.endTime).then((response) => {
                response.data.forEach(element => {
                    element.ts = new Date(element.ts * 1000)
                })
                context.commit('setIPByteSummaryByTime', response.data);
            })
        },

        getConnectionSummary(context) {
            ConnectionSumService.get(context.state.startTime, context.state.endTime).then((response) => {
                response.data.forEach(element => {
                    element.ts = new Date(element.ts * 1000)
                })
                context.commit('setConnectionSummary', response.data);
            })
        },

        getDashboardDataByTime(context) {
            context.dispatch('getServiceSummary')
            context.dispatch('getNotices')
            context.dispatch('getConnectionSummary')
            context.dispatch('getDNSConnections')
            context.dispatch('getTopKRespHost')
            context.dispatch('getTopKRespPort')
            context.dispatch('getTopKOriginHost')
            context.dispatch('getProtocolSummary')
            context.dispatch('getConnections')
            context.dispatch('getTopKDNSQueries')
            context.dispatch('getTopKRespPort')
            context.dispatch('getPortsOfinterest')
            context.dispatch('getIPByteSummary')
            context.dispatch('getIPByteSummaryByTime')



        }
    },
    getters: {

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


        pieData: state => {
            var data = new Map()
            state.connections.forEach((element) => {
                if (data.has(element["service"])) {
                    data.set(element["service"], data.get(element["service"]) + 1);
                } else {
                    data.set(element["service"], 1);
                }
            }); return data;
        },

        barChartData: state => {
            const tmpData = new Map()
            state.connections.forEach((element) => {
                if (tmpData.has(element["proto"])) {
                    tmpData.set(element["proto"], tmpData.get(element["proto"]) + 1);
                } else {
                    tmpData.set(element["proto"], 1);
                }
            });
            return new Map([...tmpData].sort((a, b) => b[1] - a[1]));
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