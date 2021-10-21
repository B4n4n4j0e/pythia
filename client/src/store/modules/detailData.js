import ConnectionsService from '../../services/ConnectionService';
import DNSConnectionService from '../../services/DNSConnectionService';
import NoticeService from '../../services/NoticeService';

function getElementByChartType(state, type) {
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
        case 'connectionSummaryPerHour':
            return state.connectionSummaryPerHour
        case 'connectionSummaryPerMinute':
            return state.connectionSummaryPerHour
        case 'protocolSummary':
            return state.protocolSummary
        case 'serviceSummary':
            return state.serviceSummary
        case 'ipByteSummary':
            return state.ipByteSummary
        case 'ipByteSummaryByTime':
            return state.ipByteSummaryByTime
        case 'notices':
            return state.notices
        case 'dNSTable':
            return state.dNSTable
        case 'connectionTable':
            return state.connectionTable
    }
}

export default {
    namespaced: true,
    state: {
        connectionTable: {
            type: 'connectionTable',
            payload: [],
            filter: new Set(),
            viewCounter: 0,
            tracker: false
        },

        dNSTable: {
            type: 'dNSTable',
            payload: [],
            filter: new Set(),
            viewCounter: 0,
            tracker: false
        },

        notices: {
            type: 'notices',
            payload: [],
            filter: new Set(),
            viewCounter: 0,
            tracker: false
        },

        topKRespHosts:
        {
            type: 'topKRespHosts',
            payload: [],
            filter: new Set(),
            viewCounter: 0,
            tracker: false

        },

        topKRespPorts:
        {
            type: 'topKRespPorts',
            payload: [],
            filter: new Set(),
            viewCounter: 0,
            tracker: false
        },
        topKOriginHosts:
        {
            type: 'topKOriginHosts',
            payload: [],
            filter: new Set(),
            viewCounter: 1,
            tracker: false
        },


        topKDNSQueries:
        {
            type: 'topKDNSQueries',
            payload: [],
            filter: new Set(),
            viewCounter: 0,
            tracker: false

        },

        portsOfInterest:
        {
            type: 'portsOfInterest',
            payload: [],
            filter: new Set(),
            viewCounter: 0,
            tracker: false

        },

        connectionSummaryPerHour:
        {
            type: 'connectionSummaryPerHour',
            payload: [],
            filter: new Set(),
            viewCounter: 0,
            tracker: false

        },
        connectionSummaryPerMinute:
        {
            type: 'connectionSummaryPerMinute',
            payload: [],
            filter: new Set(),
            viewCounter: 0,
            tracker: false

        },
        protocolSummary:
        {
            type: 'protocolSummary',
            payload: [],
            filter: new Set(),
            viewCounter: 0,
            tracker: false

        },

        serviceSummary:
        {
            type: 'serviceSummary',
            payload: [],
            filter: new Set(),
            viewCounter: 0,
            tracker: false

        },

        ipByteSummary:
        {
            type: 'ipByteSummary',
            payload: [],
            filter: new Set(),
            viewCounter: 0,
            tracker: false

        },

        ipByteSummaryByTime:
        {
            type: 'ipByteSummaryByTime',
            payload: [],
            filter: new Set(),
            viewCounter: 0,
            tracker: false
        }
    },

    mutations: {

        incrementViewCounter(state, type) {
            console.log(type)
            const view = getElementByChartType(state, type)
            view.viewCounter += 1;

        },

        decrementViewCounter(state, type) {
            const view = getElementByChartType(state, type)
            view.viewCounter -= 1;
        },


        setConnections(state, newConnections) {
            state.connectionTable.payload = newConnections;
        },
        setNodes(state, newNodes) {
            state.nodes = newNodes;
        },
        setDNSConnections(state, newConnections) {
            state.dNSTable.payload= newConnections;
        },

        setNotices(state, notices) {
            state.notices.payload = notices;
        },

        setTopKRespHostsPayload(state, newTopKRespHosts) {
            state.topKRespHosts.payload = newTopKRespHosts;
        },
        setPortsOfInterestPayload(state, newPortsOfInterest) {
            state.portsOfInterest.payload = newPortsOfInterest;
        },

        setTopKRespPortsPayload(state, newTopKRespPorts) {
            state.topKRespPorts.payload = newTopKRespPorts;
        },

        setTopKOriginHostsPayload(state, newTopKOriginHost) {
            state.topKOriginHosts.payload = newTopKOriginHost;
        },
        setTopKDNSQueriesPayload(state, newTopKDNSQueries) {
            state.topKDNSQueries.payload = newTopKDNSQueries;
        },


        setConnectionSummaryPerHourPayload(state, newSummary) {
            state.connectionSummaryPerHour.payload = newSummary
        },

        setConnectionSummaryPerMinutePayload(state, newSummary) {
            state.connectionSummaryPerMinute.payload = newSummary
        },

        setProtocolSummaryPayload(state, newSummary) {
            state.protocolSummary.payload = newSummary
        },

        setIPByteSummaryPayload(state, newSummary) {
            state.ipByteSummary.payload = newSummary
        },

        setIPByteSummaryByTimePayload(state, newSummary) {
            state.ipByteSummaryByTime.payload = newSummary
        },

        setServiceSummaryPayload(state, newSummary) {
            state.serviceSummary.payload = newSummary;
        },



    },
    actions: {
        getConnections(context) {
            //context.dispatch('getNotices')
            const nodesMap = new Map()
            const topKRespHostsMap = new Map()
            const topKOriginHostsMap = new Map()
            const serviceSummaryMap = new Map()
            const protocolSummaryMap = new Map()
            //      const ipByteSummaryMap = new Map()
            const connectionSummaryPerHourMap = new Map()
            const portsOfInterestMap = new Map()
            const topKRespPortsMap = new Map()

            ConnectionsService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                response.data.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                    addElementToMap(topKRespHostsMap, d['target'])
                    addElementToMap(topKOriginHostsMap, d['source'])
                    addElementToMap(nodesMap, d['target'])
                    addElementToMap(nodesMap, d['source'])
                    addElementToMap(serviceSummaryMap, d['service'])
                    addElementToMap(protocolSummaryMap, d['proto'])
                    addDateElementToMap(connectionSummaryPerHourMap, d['ts'], 1000 * 60 * 60)

                    //       calculateElement(ipByteSummaryMap)
                    var port = d['resp_port'].toString() + '/' + d['proto']
                    addElementToMap(topKRespPortsMap, port)
                    addPortsOfInterestToMap(portsOfInterestMap, port, context.rootState.connectionPortsOfInterest)
                })

                if (topKRespHostsMap.size > 0) {
                    context.commit('setTopKRespHostsPayload', Array.from(topKRespHostsMap, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10))
                }

                if (topKOriginHostsMap.size > 0) {
                    context.commit('setTopKOriginHostsPayload', Array.from(topKOriginHostsMap, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10))
                }
                if (serviceSummaryMap.size > 0) {
                    context.commit('setServiceSummaryPayload', Array.from(serviceSummaryMap, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value))
                }
                if (protocolSummaryMap.size > 0) {
                    context.commit('setProtocolSummaryPayload', Array.from(protocolSummaryMap, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value))
                }
                if (connectionSummaryPerHourMap.size > 0) {
                    context.commit('setConnectionSummaryPerHourPayload', Array.from(connectionSummaryPerHourMap, ([, { ts, value }]) => ({ ts, value })))
                }

                if (nodesMap.size > 0) {
                    context.commit('setNodes', Array.from(nodesMap, ([id, value]) => ({ id, value })))
                }

                if (topKRespPortsMap.size > 0) {
                    context.commit('setTopKRespPortsPayload', Array.from(topKRespPortsMap, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10))
                }

                if (portsOfInterestMap.size > 0) {
                    context.commit('setPortsOfInterestPayload', Array.from(portsOfInterestMap, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value))
                }

                context.commit('setConnections', response.data);
            }).catch(() => {
                context.commit('setConnections', []);
            })
        },

        getDNSConnections(context) {
            const topKDNSQueriesMap = new Map()

            DNSConnectionService.get(context.state.startTime, context.state.endTime).then((response) => {
                response.data.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                    addElementToMap(topKDNSQueriesMap, d['query_text'])

                });
                context.commit('setTopKDNSQueriesPayload', Array.from(topKDNSQueriesMap, ([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value).slice(0, 10))
                context.commit('setDNSConnections', response.data);
            }).catch(() => {
                context.commit('setDNSConnections', []);
            })
        },

        getNotices(context) {
            NoticeService.get(context.state.startTime, context.state.endTime).then((response) => {
                response.data.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                });
                context.commit('setNotices', response.data)
            }).catch(() => {
                context.commit('setNotices', []);

            })
        },

        getDataByTime(context) {
            if (context.getters.connectionViewCounter > 0) {
                context.dispatch('getConnections').then(() => {
                });

            }

            if (context.state.noticesStruct.viewCounter > 0) {
                context.dispatch('getNotices')
            }

            if (context.state.dNSTopKQueries.viewCounter > 0) {
                context.dispatch('getDNSConnections')
            }

            if (context.state.connectionSummaryPerHour.viewCounter > 0) {
                context.dispatch('getConnectionSummaryPerHour')
            }

            if (context.state.connectionSummaryPerMinute.viewCounter > 0) {
                context.dispatch('getConnectionSummaryPerMinute')
            }
            if (context.state.ipByteSummaryByTime.viewCounter > 0) {
                context.dispatch('getIPByteSummaryByTime')
            }
            context.dispatch('updateData')

        },

        updateData(context) {
            if (context.state.serviceSummary.viewCounter > 0) {
                context.dispatch('getServiceSummary')
            }

            if (context.state.topKRespHosts.viewCounter > 0) {
                context.dispatch('getTopKRespHosts')
            }
            if (context.state.topKRespPorts.viewCounter > 0) {
                context.dispatch('getTopKRespPorts')
            }
            if (context.state.topKOriginHosts.viewCounter > 0) {
                context.dispatch('getTopKOriginHosts')
            }

            if (context.state.protocolSummary.viewCounter > 0) {
                context.dispatch('getProtocolSummary')
            }
            if (context.state.topKDNSQueries.viewCounter > 0) {
                context.dispatch('getTopKDNSQueries')
            }
            if (context.state.portsOfInterest.viewCounter > 0) {
                context.dispatch('getPortsOfInterest')
            }

            if (context.state.ipByteSummary.viewCounter > 0) {
                context.dispatch('getIPByteSummary')
            }
        },

        incrementViewCounter(context, type) {
            context.commit('incrementViewCounter', type)
        },
        decrementViewCounter(context, type) {
            context.commit('decrementViewCounter', type)
        },

    },
    getters: {
        dataByType: (state) => (type) => {
            var data = getElementByChartType(state, type)
            return data

        },

        connectionViewCounter: state => {
            return state.ipByteSummaryByTime.viewCounter + state.ipByteSummary.viewCounter + state.serviceSummary.viewCounter +
                state.protocolSummary.viewCounter + state.connectionSummaryPerMinute.viewCounter + state.connectionSummaryPerHour.viewCounter
                + state.portsOfInterest.viewCounter + state.topKOriginHosts.viewCounter + state.topKRespHosts.viewCounter + state.topKRespPorts.viewCounter
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
    }
}


function addDateElementToMap(map, timestamp, coeff) {
    var date = {
        ts: new Date(Math.floor(timestamp.getTime() / coeff) * coeff),
        value: 0
    }
    if (map.has(date.ts.getTime())) {
        date.value = map.get(date.ts.getTime()).value + 1
        map.set(date.ts.getTime(), date)
    }
    else {
        map.set(date.ts.getTime(), date)
    }
}

function addElementToMap(map, element) {
    if (map.has(element)) {
        map.set(element, map.get(element) + 1)
    }
    else {
        map.set(element, 1);
    }
}

function addPortsOfInterestToMap(map, port, portsOfInterest) {
    if (portsOfInterest.includes(port)) {
        if (map.has(port)) {
            map.set(port, map.get(port) + 1);
        }
        else {
            map.set(port, 1)
        }
    }
}




