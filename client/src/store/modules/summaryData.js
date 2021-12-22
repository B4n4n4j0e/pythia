import PortsOfInterestService from '../../services/PortsOfInterestService';
import IPByteSummaryService from '../../services/IPByteSummaryService';
import ConnectionSumService from '../../services/ConnectionSumService';
import RespHostTopKervice from '../../services/RespHostTopKService';
import RespPortTopKService from '../../services/RespPortTopKService';
import OriginHostTopKService from '../../services/OriginHostTopKService';
import DNSQueryTopKService from '../../services/DNSQueryTopKService';
import ProtocolSumService from '../../services/ProtocolSumService';
import ServiceSumService from '../../services/ServiceSumService';
import { dispatchSummaryViewByType, getSummaryElementByChartType } from '../../helperFunctions/storeHelperFunctions'



export default {
    namespaced: true,
    updateTracker: 0,
    state: {
        respHostsTopK: {
            name: 'respHostsTopK',
            payload: [],
            filterType: 'target',
            loading: false

        },
        respPortsTopK: {
            name: 'respPortsTopK',
            payload: [],
            filterType: 'resp_p',
            loading: false

        },
        originHostsTopK: {
            name: 'originHostsTopK',
            payload: [],
            filterType: 'source',
            loading: false,

        },

        dNSQueriesTopK: {
            name: 'dNSQueriesTopK',
            payload: [],
            filterType: 'query_text',
            loading: false,

        },
        portsOfInterest: {
            name: 'portsOfInterest',
            payload: [],
            filterType: 'resp_p',
            loading: false,
        },

        connectionSummary: {
            name: 'connectionSummary',
            payload: [],
            loading: false,

        },
        protocolSummary: {
            name: 'protocolSummary',
            payload: [],
            filterType: 'proto',
            loading: false,

        },

        serviceSummary: {
            name: 'serviceSummary',
            payload: [],
            filterType: 'service',
            loading: false,
        },

        ipByteSummary: {
            name: 'ipByteSummary',
            payload: [],
            filterType: 'service', //HAS TO BECHANGED
            loading: false,
        },

        ipByteSummaryByTime: {
            name: 'ipByteSummaryByTime',
            payload: [],
            loading: false,
        },
    },

    mutations: {

        deleteDataFromType(state,elem) {
            elem.payload = [];
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

        setOriginHostsTopKPayload(state, newOriginHostsTopK) {
            state.originHostsTopK.payload = newOriginHostsTopK;
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

        setServiceSummaryPayload(state, newSummary) {
            state.serviceSummary.payload = newSummary;
        },

        setServiceSummaryLoading(state, loading) {
            state.serviceSummary.loading = loading
        },

    },
    actions: {

        getDataIfActivated(context, type) {
            //gets data only if data is not already available
            if (context.rootGetters['viewCountByViewSummary'](type) == 1) {
                dispatchSummaryViewByType(context, type)
            }
        },

        deleteDataIfNotActivated(context, type) {
            //deletes payload if no other view is active with same payload
            if (context.rootGetters['viewCountByViewSummary'](type) == 0) {
                var elem = getSummaryElementByChartType(context.state, type)
                context.commit("deleteDataFromType", elem)        
            }
        },

        getRespHostsTopK(context) {
            context.commit('setRespHostsTopKLoading', true);
            RespHostTopKervice.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setRespHostsTopKPayload', response.data);
                context.commit('setRespHostsTopKLoading', false);

            }).catch(() => {
                context.commit('setRespHostsTopKPayload', []);
                context.commit('setRespHostsTopKLoading', false);

            })
        },

        getRespPortsTopK(context) {
            context.commit('setRespPortsTopKLoading', true);

            RespPortTopKService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setRespPortsTopKPayload', response.data);
                context.commit('setRespPortsTopKLoading', false);

            }).catch(() => {
                context.commit('setRespPortsTopKPayload', []);
                context.commit('setRespPortsTopKLoading', false);
            })
        },

        getOriginHostsTopK(context) {
            context.commit('setOriginHostsTopKLoading', true);
            OriginHostTopKService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setOriginHostsTopKLoading', false);
                context.commit('setOriginHostsTopKPayload', response.data);
            }).catch(() => {
                context.commit('setOriginHostsTopKLoading', false);
                context.commit('setOriginHostsTopKPayload', []);
            })
        },
        getDNSQueriesTopK(context) {
            context.commit('setDNSQueriesTopKLoading', true);
            DNSQueryTopKService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setDNSQueriesTopKPayload', response.data);
                context.commit('setDNSQueriesTopKLoading', false);

            }).catch(() => {
                context.commit('setDNSQueriesTopKPayload', []);
                context.commit('setDNSQueriesTopKLoading', false);
            })
        },

        getPortsOfInterest(context) {
            context.commit('setPortsOfInterestLoading', true);
            PortsOfInterestService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setPortsOfInterestPayload', response.data);
                context.commit('setPortsOfInterestLoading', false);

            }).catch(() => {
                context.commit('setPortsOfInterestPayload', []);
                context.commit('setPortsOfInterestLoading', false);
            })
        },

        getProtocolSummary(context) {
            context.commit('setProtocolSummaryLoading', true);
            ProtocolSumService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setProtocolSummaryPayload', response.data);
                context.commit('setProtocolSummaryLoading', false);

            }).catch(() => {
                context.commit('setProtocolSummaryPayload', []);
                context.commit('setProtocolSummaryLoading', false);
            })
        },

        getServiceSummary(context) {
            context.commit('setServiceSummaryLoading', true);
            ServiceSumService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setServiceSummaryPayload', response.data);
                context.commit('setServiceSummaryLoading', false);

            }).catch(() => {
                context.commit('setServiceSummaryPayload', []);
                context.commit('setServiceSummaryLoading', false);

            })
        },

        getIPByteSummary(context) {
            context.commit('setIPByteSummaryLoading', true);
            IPByteSummaryService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setIPByteSummaryPayload', response.data);
                context.commit('setIPByteSummaryLoading', false);

            }).catch(() => {
                context.commit('setIPByteSummaryPayload', []);
                context.commit('setIPByteSummaryLoading', false);
            })
        },

        getIPByteSummaryByTime(context) {
            context.commit('setIPByteSummaryByTimePayload', true);

            IPByteSummaryService.getByTime(context.rootState.startTime, context.rootState.endTime).then((response) => {
                response.data.forEach(element => {
                    element.ts = new Date(element.ts * 1000)
                })
                context.commit('setIPByteSummaryByTimePayload', response.data);
                context.commit('setIPByteSummaryByTimePayload', false);

            }).catch(() => {
                context.commit('setIPByteSummaryByTimePayload', []);
                context.commit('setIPByteSummaryByTimePayload', false);

            })
        },

        getConnectionSummary(context) {
            context.commit('setConnectionSummaryLoading', true);
            ConnectionSumService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                response.data.forEach(element => {
                    element.ts = new Date(element.ts * 1000)
                })
                context.commit('setConnectionSummaryPayload', response.data);
                context.commit('setConnectionSummaryLoading', false);
            }).catch(() => {
                context.commit('setConnectionSummaryPayload', []);
                context.commit('setConnectionSummaryLoading', false);

            })
        },

        getDataByTime(context) {
            if (context.rootGetters['viewCountByViewSummary'](context.state.connectionSummary.name) > 0) {
                context.dispatch('getConnectionSummary')
            }
            
            if (context.rootGetters['viewCountByViewSummary'](context.state.ipByteSummaryByTime.name) > 0)  {
                context.dispatch('getIPByteSummaryByTime')
            }
            context.dispatch('updateData')

        },

        updateData(context) {
            if (context.rootGetters['viewCountByViewSummary'](context.state.serviceSummary.name) > 0) {
                context.dispatch('getServiceSummary')
            }
            
            if (context.rootGetters['viewCountByViewSummary'](context.state.respHostsTopK.name) > 0) {
                context.dispatch('getRespHostsTopK')
            }
            
            if (context.rootGetters['viewCountByViewSummary'](context.state.respPortsTopK.name) > 0) {
                context.dispatch('getRespPortsTopK')
            }
            
            if (context.rootGetters['viewCountByViewSummary'](context.state.originHostsTopK.name) > 0) {
                context.dispatch('getOriginHostsTopK')
            }
            
            if (context.rootGetters['viewCountByViewSummary'](context.state.protocolSummary.name) > 0) {
                context.dispatch('getProtocolSummary')
            }
            
            if (context.rootGetters['viewCountByViewSummary'](context.state.dNSQueriesTopK.name) > 0) {
                context.dispatch('getDNSQueriesTopK')
            }
            
            if (context.rootGetters['viewCountByViewSummary'](context.state.portsOfInterest.name) > 0) {
                context.dispatch('getPortsOfInterest')
            }
            
            if (context.rootGetters['viewCountByViewSummary'](context.state.ipByteSummary.name) > 0) {
                context.dispatch('getIPByteSummary')
            }

        },

        removeFilterByFilterName(context, filterName) {
            context.commit('removeFilterByFilterName', filterName)
        },
        removeAllFilters(context) {
            context.commit('removeAllFilters')

        }

    },

    getters: {
        dataByType: (state) => (type) => {
            return getSummaryElementByChartType(state, type)
        },

    }
}
