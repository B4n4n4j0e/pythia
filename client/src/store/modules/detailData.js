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
import { dispatchDetailViewByType, getDetailElementByChartType } from '../../helperFunctions/storeHelperFunctions'


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
        totalDNSConnectionsCount: 0,
        totalNoticesCount: 0,

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
        deleteDataFromType(state, elem) {
            elem.payload = [];
        },

        resetAllTablePages(state) {
            state.connectionsTableOptions.page = 1
            state.noticesTableOptions.page = 1
            state.dNSTableOptions.page = 1

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
            state.dNSTable.payload = newConnections;
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

        setNoticesTableOptions(context, options) {
            context.commit('setNoticesTableOptions', options)
        },

        setDNSTableOptions(context, options) {
            context.commit('setDNSTableOptions', options)
        },
        setConnectionsTableOptions(context, options) {
            context.commit('setConnectionsTableOptions', options)
        },

        getDataIfActive(context, type) {
            //gets data only if data is not already available
            if (context.rootGetters['viewCountByViewDetail'](type) == 1) {
                dispatchDetailViewByType(context, type)
            }
        },

        deleteDataIfNotActive(context, type) {
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
                    d.ts = new Date(d.ts * 1000)
                })
                context.commit('setConnectionsPayload', response.data.connections);
                context.commit('setTotalConnectionsCount', response.data.total);
            }).catch(() => {
                context.commit('setConnectionsPayload', []);
            }).finally(() => {
                context.commit('setConnectionsLoading', false);

            })
        },

        getDNSConnections(context) {
            const filters = context.rootGetters['filterRequestParams']
            filters['table_options'] = context.state.dNSTableOptions
            context.commit('setDNSConnectionsLoading', true);

            DNSConnectionService.post(filters).then((response) => {
                response.data.dNSConnections.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                });
                context.commit('setDNSConnectionsPayload', response.data.dNSConnections);
                context.commit('setTotalDNSCount', response.data.total);
            }).catch(() => {
                context.commit('setDNSConnectionsPayload', []);
            }).finally(() => {
                context.commit('setDNSConnectionsLoading', false);
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
                context.commit('setTotalNoticesCount', response.data.total);

            }).catch(() => {
                context.commit('setNoticesPayload', []);
                context.commit('setTotalNoticesCount', 0);
            }).finally(() => {
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
            }).catch(() => {
                context.commit('setServiceSummaryPayload', []);
            }).finally(() => {
                context.commit('setServiceSummaryLoading', false);
            })
        },

        getProtocolSummary(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setProtocolSummaryLoading', true);
            ProtocolSumService.post(filters).then((response) => {
                response.data.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                });
                context.commit('setProtocolSummaryPayload', response.data);

            }).catch(() => {
                context.commit('setProtocolSummaryPayload', []);

            }).finally(() => {
                context.commit('setProtocolSummaryLoading', false);

            })
        },

        getConnectionSummary(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setConnectionSummaryLoading', true);

            ConnectionSumService.post(filters).then((response) => {
                response.data.forEach(d => {
                    d.ts = new Date(d.ts * 1000)
                })
                context.commit('setConnectionSummaryPayload', response.data);

            }).catch(() => {
                context.commit('setConnectionSummaryPayload', []);
            }).finally(() => {
                context.commit('setConnectionSummaryLoading', false);
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

            }).catch(() => {
                context.commit('setIPByteSummaryByTimePayload', []);
            }).finally(() => {
                context.commit('setIPByteSummaryByTimeLoading', false);
            })
        },

        getIPByteSummary(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setIPByteSummaryLoading', true);

            IPByteSummaryService.post(filters).then((response) => {
                context.commit('setIPByteSummaryPayload', response.data);
            }).catch(() => {
                context.commit('setIPByteSummaryPayload', []);
            }).finally(() => {
                context.commit('setIPByteSummaryLoading', false);
            })
        },

        getDNSQueriesTopK(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setDNSQueriesTopKLoading', true);

            DNSQueryTopKService.post(filters).then((response) => {
                context.commit('setDNSQueriesTopKPayload', response.data);

            }).catch(() => {
                context.commit('setDNSQueriesTopKPayload', []);
            }).finally(() => {
                context.commit('setDNSQueriesTopKLoading', false);
            })
        },

        getOriginHostsTopK(context) {
            context.commit('setOriginHostsTopKLoading', true);
            const filters = context.rootGetters['filterRequestParams']
            OriginHostTopKService.post(filters).then((response) => {
                context.commit('setOriginHostsTopKPayload', response.data);

            }).catch(() => {
                context.commit('setOriginHostsTopKPayload', []);

            }).finally(() => {
                context.commit('setOriginHostsTopKLoading', false);
            })
        },

        getRespHostsTopK(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setRespHostsTopKLoading', true);
            TopKRespHostService.post(filters).then((response) => {
                context.commit('setRespHostsTopKPayload', response.data);

            }).catch(() => {
                context.commit('setRespHostsTopKPayload', []);
            }).finally(() => {
                context.commit('setRespHostsTopKLoading', false);
            })
        },
        getRespPortsTopK(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setRespPortsTopKLoading', true);

            RespPortTopKService.post(filters).then((response) => {
                context.commit('setRespPortsTopKPayload', response.data);
            }).catch(() => {
                context.commit('setRespPortsTopKPayload', []);
            }).finally(() => {
                context.commit('setRespPortsTopKLoading', false);
            })
        },

        getPortsOfInterest(context) {
            const filters = context.rootGetters['filterRequestParams']
            context.commit('setPortsOfInterestLoading', true);

            PortsOfInterestService.post(filters).then((response) => {
                context.commit('setPortsOfInterestPayload', response.data);

            }).catch(() => {
                context.commit('setPortsOfInterestPayload', []);

            }).finally(() => {
                context.commit('setPortsOfInterestLoading', false);
            })
        },

        getDataByTime(context) {
            context.commit('resetAllTablePages');

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

            context.commit('resetFilterChangeTracker', null, { root: true })
            context.commit('resetNegativeFilterChangeTracker', null, { root: true })

        },


    },
    getters: {
        dataByType: (state) => (type) => {
            var data = getDetailElementByChartType(state, type)
            return data
        },


    }
}



