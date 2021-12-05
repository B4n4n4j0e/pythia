import ConnectionsService from '../../services/ConnectionService';
import DNSConnectionService from '../../services/DNSConnectionService';
import NoticeService from '../../services/NoticeService';
import ServiceSumService from '../../services/ServiceSumService';
import ConnectionSumService from '../../services/ConnectionSumService'
import IPByteSummaryService from '../../services/IPByteSummaryService';
import ProtocolSumService from '../../services/ProtocolSumService';
import DNSQueryTopKService from '../../services/DNSQueryTopKService';
import OriginHostTopKService from '../../services/OriginHostTopKService';
import RespPortTopKService from '../../services/RespPortTopKService';
import TopKRespHostService from '../../services/RespHostTopKService';
import PortsOfInterestService from '../../services/PortsOfInterestService';
import {dispatchDetailViewByType, getDetailElementByChartType} from '../../helperFunctions/storeHelperFunctions'

export default {
    namespaced: true,
    state: {
        connectionsTableOptions: {
            itemsPerPage: 10,
            page: 1,
            sortBy: [],
            sortDesc: [],
            groupBy: [],
            groupDesc: [],
            multiSort: false,
            mustSort: false
        },

        dNSTableOptions: {
            itemsPerPage: 10,
            page: 1,
            sortBy: [],
            sortDesc: [],
            groupBy: [],
            groupDesc: [],
            multiSort: false,
            mustSort: false
        },

        noticesTableOptions: {
            itemsPerPage: 10,
            page: 1,
            sortBy: [],
            sortDesc: [],
            groupBy: [],
            groupDesc: [],
            multiSort: false,
            mustSort: false
        },

        totalConnectionsCount: 0,
        totalDNSConnectionsCount:0,
        totalNoticesCount:0,

        connectionTable: {
            payload: [],
            viewCounter: 0,
        },

        dNSTable: {
            payload: [],
            viewCounter: 0,
        },

        noticeTable: {
            payload: [],
            viewCounter: 0,
        },

        respHostsTopK:
        {
            filterType: 'target',
            payload: [],
            viewCounter: 0,
        },

        respPortsTopK:
        {
            filterType: 'resp_p',
            payload: [],
            viewCounter: 0,
        },
        originHostsTopK:
        {
            filterType: 'source',
            payload: [],
            viewCounter: 0,
        },


        dNSQueriesTopK:
        {
            filterType: 'query_text',
            payload: [],
            viewCounter: 0,
        },

        portsOfInterest:
        {
            filterType: 'resp_p',
            payload: [],
            viewCounter: 0,

        },

        connectionSummary:
        {
            payload: [],
            viewCounter: 0,
        },

        protocolSummary:
        {
            filterType: 'proto',
            payload: [],
            viewCounter: 0,

        },

        serviceSummary:
        {
            filterType: 'service',
            payload: [],
            viewCounter: 0,

        },

        ipByteSummary:
        {
            filterType: 'service',
            payload: [],
            viewCounter: 0,

        },

        ipByteSummaryByTime:
        {
            payload: [],
            viewCounter: 0,
        }
    },

    mutations: {

        incrementViewCounter(state, view) {
            view.viewCounter += 1;

        },

        decrementViewCounter(state, type) {
            const view = getDetailElementByChartType(state, type)
            if (view.viewCounter == 0) {
                view.payload = []
            }
            view.viewCounter -= 1;
        },

        setConnections(state, newConnections) {
            state.connectionTable.payload = newConnections;
        },
        setTotalConnectionsCount(state, newConnectionsCount) {
            state.totalConnectionsCount = newConnectionsCount;
        },
        setTotalNoticesCount(state, newNoticesCount) {
            state.totalNoticesCount = newNoticesCount;
        },
        setTotalDNSCount(state, newDNSCount) {
            state.totalDNSConnectionsCount = newDNSCount;
        },
        setConnectionsTableOptions(state, options) {
            state.connectionsTableOptions = options
        },
        setNoticesTableOptions(state, options) {
            state.noticesTableOptions = options
        },
        setDNSTableOptions(state, options) {
            state.dNSTableOptions = options
        },
        setNodes(state, newNodes) {
            state.nodes = newNodes;
        },
        setDNSConnections(state, newConnections) {
            state.dNSTable.payload= newConnections;
        },

        setNotices(state, notices) {
            state.noticeTable.payload = notices;
        },

        setRespHostsTopKPayload(state, newRespHostsTopK) {
            state.respHostsTopK.payload = newRespHostsTopK;
        },
        setPortsOfInterestPayload(state, newPortsOfInterest) {
            state.portsOfInterest.payload = newPortsOfInterest;
        },

        setRespPortsTopKPayload(state, newRespPortsTopK) {
            state.respPortsTopK.payload = newRespPortsTopK;
        },

        setOriginHostsTopKPayload(state, newTopKOriginHost) {
            state.originHostsTopK.payload = newTopKOriginHost;
        },
        setDNSQueriesTopKPayload(state, newDNSQueriesTopK) {
            state.dNSQueriesTopK.payload = newDNSQueriesTopK;
        },


        setConnectionSummaryPayload(state, newSummary) {
            state.connectionSummary.payload = newSummary
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
            const filters = context.rootGetters['filterRequestParams']
            filters['table_options'] = context.state.connectionsTableOptions
            ConnectionsService.post(filters).then((response) => {
                response.data.connections.forEach(d => {
                d.ts = new Date(d.ts * 1000)})
                context.commit('setConnections', response.data.connections);
                context.commit('setTotalConnectionsCount',response.data.total);
            }).catch(() => {
                context.commit('setConnections', []);
            })
        },

        getDNSConnections(context) {
            const filters = context.rootGetters['filterRequestParams']
            filters['table_options'] = context.state.dNSTableOptions
            DNSConnectionService.post(filters).then((response) => {
                response.data.dNSConnections.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                });
                context.commit('setDNSConnections', response.data.dNSConnections);

                context.commit('setTotalDNSCount', response.data.total);
            }).catch(() => {
                context.commit('setDNSConnections', []);
            })
        },

        getNotices(context) {
            const filters = context.rootGetters['filterRequestParams']
            filters['table_options'] = context.state.noticesTableOptions
            NoticeService.post(filters).then((response) => {
                response.data.notices.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                });
                context.commit('setTotalNoticesCount',response.data.total);
                context.commit('setNotices', response.data.notices)
            }).catch(() => {
                context.commit('setNotices', []);
                context.commit('setTotalNoticesCount',0);


            })
        },

        getServiceSummary(context) {
            const filters = context.rootGetters['filterRequestParams']
            ServiceSumService.post(filters).then((response) => {
                response.data.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                });
                context.commit('setServiceSummaryPayload', response.data);
            }).catch(() => {
                context.commit('setServiceSummaryPayload', []);
            })
        },

        getProtocolSummary(context) {
            const filters = context.rootGetters['filterRequestParams']
            ProtocolSumService.post(filters).then((response) => {
                response.data.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                });
                context.commit('setProtocolSummaryPayload', response.data);
            }).catch(() => {
                context.commit('setProtocolSummaryPayload', []);
            })
        },

        getConnectionSummary(context) {
            const filters = context.rootGetters['filterRequestParams']
            ConnectionSumService.post(filters).then((response) => {
                response.data.forEach(d => {
                d.ts = new Date(d.ts * 1000)})
                context.commit('setConnectionSummaryPayload', response.data);
            }).catch(() => {
                context.commit('setConnectionSummaryPayload', []);
            })
        },

        getIPByteSummaryByTime(context) {
            const filters = context.rootGetters['filterRequestParams']
             IPByteSummaryService.postByTime(filters).then((response) => {
                response.data.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                });
                context.commit('setIPByteSummaryByTimePayload', response.data);
            }).catch(() => {
                context.commit('setIPByteSummaryByTimePayload', []);
            })
        },
        getIPByteSummary(context) {
            const filters = context.rootGetters['filterRequestParams']

             IPByteSummaryService.post(filters).then((response) => {
            
                context.commit('setIPByteSummaryPayload', response.data);
            }).catch(() => {
                context.commit('setIPByteSummaryPayload', []);
            })
        },

        getDNSQueriesTopK(context) {
            const filters = context.rootGetters['filterRequestParams']
            DNSQueryTopKService.post(filters).then((response) => {
                context.commit('setDNSQueriesTopKPayload', response.data);
            }).catch(() => {
                context.commit('setDNSQueriesTopKPayload', []);
            })
        },

        getOriginHostsTopK(context) {
            const filters = context.rootGetters['filterRequestParams']
            OriginHostTopKService.post(filters).then((response) => {
                context.commit('setOriginHostsTopKPayload', response.data);
            }).catch(() => {
                context.commit('setOriginHostsTopKPayload', []);
            })
        },

        getRespHostsTopK(context) {
            const filters = context.rootGetters['filterRequestParams']
            TopKRespHostService.post(filters).then((response) => {
                context.commit('setRespHostsTopKPayload', response.data);
            }).catch(() => {
                context.commit('setRespHostsTopKPayload', []);
            })
        },
        getRespPortsTopK(context) {
            const filters = context.rootGetters['filterRequestParams']
            RespPortTopKService.post(filters).then((response) => {
                context.commit('setRespPortsTopKPayload', response.data);
            }).catch(() => {
                context.commit('setRespPortsTopKPayload', []);
            })
        },

        getPortsOfInterest(context) {
            const filters = context.rootGetters['filterRequestParams']
            PortsOfInterestService.post(filters).then((response) => {
                context.commit('setPortsOfInterestPayload', response.data);
            }).catch(() => {
                context.commit('setPortsOfInterestPayload', []);
            })
        },

        getDataByTime(context) {

            if (context.state.ipByteSummary.viewCounter > 0) {
                context.dispatch('getIPByteSummary')
            }
            if (context.state.ipByteSummaryByTime.viewCounter > 0) {
                context.dispatch('getIPByteSummaryByTime')
            }
            if (context.state.serviceSummary.viewCounter > 0) {
                context.dispatch('getServiceSummary');
            }
            if (context.state.protocolSummary.viewCounter > 0) {
                context.dispatch('getProtocolSummary');
            }
            if (context.state.connectionSummary.viewCounter > 0) {
                context.dispatch('getConnectionSummary');
            }
            if (context.state.dNSQueriesTopK.viewCounter > 0) {
                context.dispatch('getDNSQueriesTopK');
            }
            if (context.state.originHostsTopK.viewCounter > 0) {
                context.dispatch('getOriginHostsTopK');
            }    
            if (context.state.respHostsTopK.viewCounter > 0) {
                context.dispatch('getRespHostsTopK');
            }
            if (context.state.respPortsTopK.viewCounter > 0) {
                context.dispatch('getRespPortsTopK');
            }
            if (context.state.portsOfInterest.viewCounter > 0) {
                context.dispatch('getPortsOfInterest');
            }       
            if (context.state.dNSTable.viewCounter > 0) {
                context.dispatch('getDNSConnections');
            }
            if (context.state.connectionTable.viewCounter > 0) {
               context.dispatch('getConnections'); 
            }          
            if (context.state.noticeTable.viewCounter > 0) {
                context.dispatch('getNotices');
            }                              
                             
            if (context.state.connectionViewCounter > 0) {
                context.dispatch('getConnections')
            }

    
            if (context.state.connectionSummary.viewCounter > 0) {
                context.dispatch('getConnectionSummary')
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

            if (context.state.respHostsTopK.viewCounter > 0) {
                context.dispatch('getRespHostsTopK')
            }
            if (context.state.respPortsTopK.viewCounter > 0) {
                context.dispatch('getRespPortsTopK')
            }
            if (context.state.originHostsTopK.viewCounter > 0) {
                context.dispatch('getOriginHostsTopK')
            }

            if (context.state.protocolSummary.viewCounter > 0) {
                context.dispatch('getProtocolSummary')
            }
            if (context.state.dNSQueriesTopK.viewCounter > 0) {
                context.dispatch('getDNSQueriesTopK')
            }
            if (context.state.portsOfInterest.viewCounter > 0) {
                context.dispatch('getPortsOfInterest')
            }

            if (context.state.ipByteSummary.viewCounter > 0) {
                context.dispatch('getIPByteSummary')
            }
            if (context.state.connectionTable.viewCounter > 0) {
                context.dispatch('getConnections');
            }          
            if (context.state.noticeTable.viewCounter > 0) {
                context.dispatch('getNotices');
            }                              
                       

        },

        incrementViewCounter(context, type) {
            const view = getDetailElementByChartType(context.state, type)
            if (view.viewCounter == 0) {
                dispatchDetailViewByType(context,type)
            }
            context.commit('incrementViewCounter', view)
        },
        decrementViewCounter(context, type) {
            context.commit('decrementViewCounter', type)
        },
    
    },
    getters: {
        dataByType: (state) => (type) => {
            var data = getDetailElementByChartType(state, type)
            return data

        },

        connectionViewCounter: state => {
            return state.ipByteSummaryByTime.viewCounter + state.ipByteSummary.viewCounter + state.serviceSummary.viewCounter +
                state.protocolSummary.viewCounter + state.connectionSummary.viewCounter
                + state.portsOfInterest.viewCounter + state.originHostsTopK.viewCounter + state.respHostsTopK.viewCounter + state.respPortsTopK.viewCounter
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

/*
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
*/



