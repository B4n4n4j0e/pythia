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
            name: 'connectionTable',
            payload: [],
            loading: false,
        },

        dNSTable: {
            name: 'dNSTable',
            payload: [],
            loading: false,

        },

        noticeTable: {
            payload: [],
            name: 'noticeTable',
            loading: false,

        },

        respHostsTopK:
        {
            name: 'respHostsTopK',
            filterType: 'target',
            payload: [],
            loading: false,

        },

        respPortsTopK:
        {
            name: 'respPortsTopK',
            filterType: 'resp_p',
            payload: [],
            loading: false,

        },
        originHostsTopK:
        {
            name: 'originHostsTopK',
            filterType: 'source',
            payload: [],
            loading: false,

        },


        dNSQueriesTopK:
        {
            name: 'dNSQueriesTopK',
            filterType: 'query_text',
            payload: [],
            loading: false,

        },

        portsOfInterest:
        {
            name: 'portsOfInterest',
            filterType: 'resp_p',
            payload: [],
            loading: false,
        },

        connectionSummary:
        {
            name: 'connectionSummary',
            payload: [],
            loading: false,
        },

        protocolSummary:
        {
            name: 'protocolSummary',
            payload: [],
            filterType: 'proto',
            loading: false,


        },

        serviceSummary:
        {
            name: 'serviceSummary',
            filterType: 'service',
            payload: [],
            loading: false,
        },

        ipByteSummary:
        {
            name: 'ipByteSummary',
            filterType: 'service', // needs to be changed
            payload: [],
            loading: false,
        },


        ipByteSummaryByTime:
        {
            name: 'ipByteSummaryByTime',
            payload: [],
            loading: false,

        }
    },

    mutations: {
        deleteDataFromType(state,elem) {
            elem.payload = [];
        },

        setConnectionsPayload(state, newConnections) {
            state.connectionTable.payload = newConnections;
        },
        setConnectionsLoading(state, loading) {
            state.connectionTable.loading = loading
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

        setDNSConnectionsPayload(state, newConnections) {
            state.dNSTable.payload= newConnections;
        },

        setDNSConnectionsLoading(state, loading) {
            state.dNSTable.loading = loading
        },


        setNoticesPayload(state, notices) {
            state.noticeTable.payload = notices;
        },

        setNoticesLoading(state, loading) {
            state.noticeTable.loading = loading;
        },

        setRespHostsTopKPayload(state, newRespHostsTopK) {
            state.respHostsTopK.payload = newRespHostsTopK;
        },
        setRespHostsTopKLoading(state, loading) {
            state.respHostsTopK.loading = loading
        },

        setPortsOfInterestPayload(state, newPortsOfInterest) {
            state.portsOfInterest.payload = newPortsOfInterest;
        },

        setPortsOfInterestLoading(state, loading) {
            state.portsOfInterest.loading = loading
        },

        setRespPortsTopKPayload(state, newRespPortsTopK) {
            state.respPortsTopK.payload = newRespPortsTopK;
        },

        setRespPortsTopKLoading(state, loading) {
            state.respPortsTopK.loading = loading
        },

        setOriginHostsTopKPayload(state, newTopKOriginHost) {
            state.originHostsTopK.payload = newTopKOriginHost;
        },

        setOriginHostsTopKLoading(state, loading) {
            state.originHostsTopK.loading = loading
        },

        setDNSQueriesTopKPayload(state, newDNSQueriesTopK) {
            state.dNSQueriesTopK.payload = newDNSQueriesTopK;
        },
        
        setDNSQueriesTopKLoading(state, loading) {
            state.dNSQueriesTopK.loading = loading
        },

        setConnectionSummaryPayload(state, newSummary) {
            state.connectionSummary.payload = newSummary
        },

        setConnectionSummaryLoading(state, loading) {
            state.connectionSummary.loading = loading
        },


        setProtocolSummaryPayload(state, newSummary) {
            state.protocolSummary.payload = newSummary
        },
        setProtocolSummaryLoading(state, loading) {
            state.protocolSummary.loading = loading
        },

        setIPByteSummaryPayload(state, newSummary) {
            state.ipByteSummary.payload = newSummary
        },

        setIPByteSummaryLoading(state, loading) {
            state.ipByteSummary.loading = loading
        },

        setIPByteSummaryByTimePayload(state, newSummary) {
            state.ipByteSummaryByTime.payload = newSummary
        },
        setIPByteSummaryByTimeLoading(state, loading) {
            state.ipByteSummaryByTime.loading = loading
        },

        setServiceSummaryLoading(state, loading) {
            state.serviceSummary.loading = loading;
        },        
        setServiceSummaryPayload(state, newSummary) {
            state.serviceSummary.payload = newSummary;
        },        
    },

    actions: {
        getDataIfActivated(context, type) {
            //gets data only if data is not already available
            console.log(context.rootGetters['viewCountByViewDetail'](type))
            if (context.rootGetters['viewCountByViewDetail'](type) == 1) {
                dispatchDetailViewByType(context, type)
            }
        },

        deleteDataIfNotActivated(context, type) {
            //deletes payload if no other view is active with same payload
            if (context.rootGetters['viewCountByViewDetail'](type) == 0) {
                var elem = getDetailElementByChartType(context.state, type)
                context.commit('deleteDataFromType', elem) 
            }
        },

        getConnections(context) {
            const filters = context.rootGetters['filterRequestParams']
            filters['table_options'] = context.state.connectionsTableOptions
            context.commit('setConnectionsLoading', true);
            ConnectionsService.post(filters).then((response) => {
                response.data.connections.forEach(d => {
                d.ts = new Date(d.ts * 1000)})
                context.commit('setConnectionsPayload', response.data.connections);
                context.commit('setTotalConnectionsCount',response.data.total);
                context.commit('setConnectionsLoading', false);
            }).catch(() => {
                context.commit('setConnectionsPayload', []);
                context.commit('setConnectionsLoading', false);
            })
        },

        getDNSConnections(context) {
            const filters = context.rootGetters['filterRequestParams']
            filters['table_options'] = context.state.dNSTableOptions
            context.commit('setDNSConnectionsLoading',true);

            DNSConnectionService.post(filters).then((response) => {
                response.data.dNSConnections.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                });
                context.commit('setDNSConnectionsPayload', response.data.dNSConnections);
                context.commit('setDNSConnectionsLoading',false);
                context.commit('setTotalDNSCount', response.data.total);
            }).catch(() => {
                context.commit('setDNSConnectionsPayload', []);
                context.commit('setDNSConnectionsLoading',false);
            })
        },

        getNotices(context) {
            const filters = context.rootGetters['filterRequestParams']
            filters['table_options'] = context.state.noticesTableOptions
            context.commit('setNoticesLoading', true);
            NoticeService.post(filters).then((response) => {
                response.data.notices.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                });
                context.commit('setNoticesPayload', response.data.notices)
                context.commit('setTotalNoticesCount',response.data.total);
                context.commit('setNoticesLoading', false);

            }).catch(() => {
                context.commit('setNoticesPayload', []);
                context.commit('setTotalNoticesCount',0);
                context.commit('setNoticesLoading', false);
            })
        },
      

        getServiceSummary(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setServiceSummaryLoading', true);
            ServiceSumService.post(filters).then((response) => {
                response.data.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                });
                context.commit('setServiceSummaryPayload', response.data);
                context.commit('setServiceSummaryLoading', false);
            }).catch(() => {
                context.commit('setServiceSummaryPayload', []);
                context.commit('setServiceSummaryLoading', false);

            })
        },

        getProtocolSummary(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setProtocolSummaryLoading',true);
            ProtocolSumService.post(filters).then((response) => {
                response.data.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                });
                context.commit('setProtocolSummaryPayload', response.data);
                context.commit('setProtocolSummaryLoading',false);

            }).catch(() => {
                context.commit('setProtocolSummaryPayload', []);
                context.commit('setProtocolSummaryLoading',false);

            })
        },

        getConnectionSummary(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setConnectionSummaryLoading',true);

            ConnectionSumService.post(filters).then((response) => {
                response.data.forEach(d => {
                d.ts = new Date(d.ts * 1000)})
                context.commit('setConnectionSummaryPayload', response.data);
                context.commit('setConnectionSummaryLoading',false);

            }).catch(() => {
                context.commit('setConnectionSummaryPayload', []);
                context.commit('setConnectionSummaryLoading',false);
            })
        },

        getIPByteSummaryByTime(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setIPByteSummaryByTimeLoading', true);

             IPByteSummaryService.postByTime(filters).then((response) => {
                response.data.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                });
                context.commit('setIPByteSummaryByTimePayload', response.data);
                context.commit('setIPByteSummaryByTimeLoading', false);

            }).catch(() => {
                context.commit('setIPByteSummaryByTimePayload', []);
                context.commit('setIPByteSummaryByTimeLoading', false);
            })
        },
        getIPByteSummary(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setIPByteSummaryLoading', true);

             IPByteSummaryService.post(filters).then((response) => {
                context.commit('setIPByteSummaryLoading', false);
                context.commit('setIPByteSummaryPayload', response.data);
            }).catch(() => {
                context.commit('setIPByteSummaryLoading', false);
                context.commit('setIPByteSummaryPayload', []);
            })
        },

        getDNSQueriesTopK(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setDNSQueriesTopKLoading', true);

            DNSQueryTopKService.post(filters).then((response) => {
                context.commit('setDNSQueriesTopKPayload', response.data);
                context.commit('setDNSQueriesTopKLoading', false);

            }).catch(() => {
                context.commit('setDNSQueriesTopKPayload', []);
                context.commit('setDNSQueriesTopKLoading', false);
            })
        },

        getOriginHostsTopK(context) {
            context.commit('setOriginHostsTopKLoading', true);
            const filters = context.rootGetters['filterRequestParams']
            OriginHostTopKService.post(filters).then((response) => {
                context.commit('setOriginHostsTopKPayload', response.data);
                context.commit('setOriginHostsTopKLoading', false);

            }).catch(() => {
                context.commit('setOriginHostsTopKPayload', []);
                context.commit('setOriginHostsTopKLoading', false);

            })
        },

        getRespHostsTopK(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setRespHostsTopKLoading', true);
            TopKRespHostService.post(filters).then((response) => {
                context.commit('setRespHostsTopKPayload', response.data);
                context.commit('setRespHostsTopKLoading', false);

            }).catch(() => {
                context.commit('setRespHostsTopKPayload', []);
                context.commit('setRespHostsTopKLoading', false);
            })
        },
        getRespPortsTopK(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setRespPortsTopKLoading', true);

            RespPortTopKService.post(filters).then((response) => {
                context.commit('setRespPortsTopKPayload', response.data);
                context.commit('setRespPortsTopKLoading', false);
            }).catch(() => {
                context.commit('setRespPortsTopKPayload', []);
                context.commit('setRespPortsTopKLoading', false);
            })
        },

        getPortsOfInterest(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setPortsOfInterestLoading', true);

            PortsOfInterestService.post(filters).then((response) => {
                context.commit('setPortsOfInterestPayload', response.data);
                context.commit('setPortsOfInterestLoading', false);

            }).catch(() => {
                context.commit('setPortsOfInterestPayload', []);
                context.commit('setPortsOfInterestLoading', false);

            })
        },

        getDataByTime(context) {
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.ipByteSummary.name) > 0) {
                context.dispatch('getIPByteSummary')
            }
            if (context.rootGetters['viewCountByViewDetail'](context.state.ipByteSummaryByTime.name) > 0) {
                context.dispatch('getIPByteSummaryByTime')
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.serviceSummary.name) > 0) {
                context.dispatch('getServiceSummary');
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.protocolSummary.name) > 0) {
                context.dispatch('getProtocolSummary');
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.connectionSummary.name) > 0) {
                context.dispatch('getConnectionSummary');
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.dNSQueriesTopK.name) > 0) {
                context.dispatch('getDNSQueriesTopK');
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.originHostsTopK.name) > 0) {
                context.dispatch('getOriginHostsTopK');
            }    
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.respHostsTopK.name) > 0) {
                context.dispatch('getRespHostsTopK');
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.respPortsTopK.name) > 0) {
                context.dispatch('getRespPortsTopK');
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.portsOfInterest.name) > 0) {
                context.dispatch('getPortsOfInterest');
            }       
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.dNSTable.name) > 0) {
                context.dispatch('getDNSConnections');
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.connectionTable.name) > 0) {
                context.dispatch('getConnections'); 
            }          
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.noticeTable.name) > 0) {
                context.dispatch('getNotices');
            }                              
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.connectionSummary.name) > 0) {
                context.dispatch('getConnectionSummary')
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.ipByteSummaryByTime.name) > 0) {
                context.dispatch('getIPByteSummaryByTime')
            }
            context.dispatch('updateData')
        },

        updateData(context) {
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.serviceSummary.name) > 0) {
                context.dispatch('getServiceSummary')
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.respHostsTopK.name) > 0) {
                context.dispatch('getRespHostsTopK')
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.respPortsTopK.name) > 0) {
                context.dispatch('getRespPortsTopK')
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.originHostsTopK.name) > 0) {
                context.dispatch('getOriginHostsTopK')
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.protocolSummary.name) > 0) {
                context.dispatch('getProtocolSummary')
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.dNSQueriesTopK.name) > 0) {
                context.dispatch('getDNSQueriesTopK')
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.portsOfInterest.name) > 0) {
                context.dispatch('getPortsOfInterest')
            }

            if (context.rootGetters['viewCountByViewDetail'](context.state.ipByteSummary.name) > 0) {
                context.dispatch('getIPByteSummary')
            }
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.connectionTable.name) > 0) {
                context.dispatch('getConnections');
            }          
            
            if (context.rootGetters['viewCountByViewDetail'](context.state.noticeTable.name) > 0) {
                context.dispatch('getNotices');
            }                              
                       
        },
    },
    getters: {
        dataByType: (state) => (type) => {
            var data = getDetailElementByChartType(state, type)
            return data

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



