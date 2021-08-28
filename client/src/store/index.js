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
        portsOfInterest:[],
        connectionPortsOfInterest: ["10/tcp", "21/tcp", "22/tcp", "23/tcp", "25/tcp", "80/tcp", "110/tcp", "139/tcp", "443/tcp", "445/tcp", "3389/tcp", "10/udp", "53/udp", 
        "67/udp", "123/udp", "135/udp", "137/udp", "138/udp", "161/udp", "445/udp", "631/udp", "1434/udp"],
        startTime: null,
        endTime: null,
        globalPacketCount: 0,
        notices: [],
        connectionSummary: [],
        protocolSummary: [],
        serviceSummary: [],
        ipByteSummary: [],
        ipByteSummaryByTime: [],
        dNSTopKfilterTracker: 0,
        filter: [new Map(),new Map(),new Map(),new Map()]

    },


    mutations: {

        setFilter(state, data) {
            if (data.summary){
                switch(data.dataName){
                    case "dNSTopKQueries":
                            state.filter[1].set(data.filter,1)
                            state.dNSTopKfilterTracker +=1
                            break
                    default:
                        break
                }
            }
                            
        },

        removeFilter() {
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
            const nodes = new Map()

            ConnectionsService.get(context.state.startTime, context.state.endTime).then((response) => {
                response.data.forEach(d => {
                    d.ts = new Date(d.ts * 1000)

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

        connectionsPerMinute: state => {
            var data = new Map()
            var coeff = 1000*60*60
            state.connections.forEach((element) => {
                var date =   {
                    ts: new Date(Math.floor(element.ts.getTime() / coeff) * coeff),
                    value: 0
                }
                if (data.has(date.ts.getTime())) {
                    date.value = data.get(date.ts.getTime()).value+1
                    data.set(date.ts.getTime(),date)
                }
                else {
                    date.value = 1
                    data.set(date.ts.getTime(),date)
                }
            })
            return Array.from(data, ([, {ts,value}]) => ({ ts, value }));

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
            return  Array.from(data, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
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
            return  Array.from(data, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0,10);
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
            return  Array.from(data, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0,10);
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

            return  Array.from(data, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0,10);
        },

        connectionsPortsOfInterest: state => {
            const data = new Map()
            state.connections.forEach((element) => {
               var port = element.resp_port.toString() + '/' + element.proto
               if (state.connectionPortsOfInterest.includes(port)){
                if (data.has(port)) {
                    data.set(port, data.get(port) + 1);
                } else {
                    data.set(port, 1);
                }
            }
            });

            return  Array.from(data, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0,10);
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
            return  Array.from(data, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0,10);
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