import PortsOfInterestService from '../../services/PortsOfInterestService';
import IPByteSummaryService from '../../services/IPByteSummaryService';
import ConnectionSumService from '../../services/ConnectionSumService';
import RespHostTopKervice from '../../services/RespHostTopKService';
import RespPortTopKService from '../../services/RespPortTopKService';
import OriginHostTopKService from '../../services/OriginHostTopKService';
import DNSQueryTopKService from '../../services/DNSQueryTopKService';
import ProtocolSumService from '../../services/ProtocolSumService';
import ServiceSumService from '../../services/ServiceSumService';
import {dispatchSummaryViewByType, getSummaryElementByChartType} from '../../helperFunctions/storeHelperFunctions'



export default {
    namespaced: true,
    state: {        
            respHostsTopK: {
                payload: [],
                viewCounter  : 1,
                filterType: 'target'
                
            },
            respPortsTopK:    {
                payload: [],
                viewCounter  : 0,
                filterType: 'resp_p'

            },
           originHostsTopK:   {
                payload: [],
                viewCounter  : 0,
                filterType: 'source'

            },
            
            dNSQueriesTopK: {
                payload: [],
                viewCounter  : 0,
                filterType: 'query_text'
            },
         portsOfInterest:{
                payload: [],
                viewCounter  : 0,
                filterType: 'resp_p'
            },

            connectionSummary: {
                payload: [],
                viewCounter  : 0,
                
            },
         protocolSummary:    {
                payload: [],
                viewCounter  : 0,
                filterType: 'proto'

            },

          serviceSummary:    {
                payload: [],
                viewCounter  : 0,
                filterType: 'service'
            },

          ipByteSummary:    {
                payload: [],
                viewCounter  : 0,
                filterType: 'service' //HAS TO BECHANGED
        },

          ipByteSummaryByTime:    {
                payload: [],
                viewCounter  : 0,
            },
    },

    mutations: {

        incrementViewCounter(state, view) {
            view.viewCounter +=1;
        },

        decrementViewCounter(state, type) {
            const view = getSummaryElementByChartType(state,type)
            view.viewCounter -=1;
        },
        
        setRespHostsTopK(state, newRespHostsTopK) {
            state.respHostsTopK.payload = newRespHostsTopK;
        },
        setPortsOfInterest(state, newPortsOfInterest) {
            state.portsOfInterest.payload = newPortsOfInterest;
        },

        setRespPortsTopK(state, newRespPortsTopK) {
            state.respPortsTopK.payload = newRespPortsTopK;
        },

        setOriginHostsTopK(state, newOriginHostsTopK) {
            state.originHostsTopK.payload = newOriginHostsTopK;

        },
        setDNSQueriesTopK(state, newDNSQueriesTopK) {
            state.dNSQueriesTopK.payload = newDNSQueriesTopK;
        },

        setConnectionSummary(state, newSummary) {
            state.connectionSummary.payload = newSummary
        },

        setProtocolSummary(state, newSummary) {
            state.protocolSummary.payload = newSummary
        },
        setIPByteSummary(state, newSummary) {
            state.ipByteSummary.payload = newSummary
        },

        setIPByteSummaryByTime(state, newSummary) {
            state.ipByteSummaryByTime.payload = newSummary
        },
        
        setServiceSummary(state, newSummary) {
            state.serviceSummary.payload = newSummary;
        },

        

    },
    actions: {
        getRespHostsTopK(context) {
            RespHostTopKervice.get(context.rootState.startTime, context.rootState.endTime).then((response) => {                
                context.commit('setRespHostsTopK', response.data);
            }).catch(() => {
                context.commit('setRespHostsTopK', []);
            })
        },

        incrementViewCounter(context, type) {
            const view = getSummaryElementByChartType(context.state,type)
        
            if (view.viewCounter == 0) {
                dispatchSummaryViewByType(context,type)
            }
            context.commit('incrementViewCounter', view)
        },
        decrementViewCounter(context, type) {
            context.commit('decrementViewCounter',type)
        },

        getRespPortsTopK(context) {
            RespPortTopKService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setRespPortsTopK', response.data);
            }).catch(() => { 
                context.commit('setRespPortsTopK', []);
            })
        },

        getOriginHostsTopK(context) {
            OriginHostTopKService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setOriginHostsTopK', response.data);

            }).catch(() => {
                context.commit('setOriginHostsTopK', []);
            })
        },
        getDNSQueriesTopK(context) {
            DNSQueryTopKService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setDNSQueriesTopK', response.data);
            }).catch(() => {
                context.commit('setDNSQueriesTopK', []);
            })
        },

        getPortsOfInterest(context) {
            PortsOfInterestService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setPortsOfInterest', response.data);
            }).catch(() => {
                context.commit('setPortsOfInterest', []);
            })
        },

        getProtocolSummary(context) {
            ProtocolSumService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setProtocolSummary', response.data);
            }).catch(() => {
                context.commit('setProtocolSummary', []);
            })
        },

        getServiceSummary(context) {
            ServiceSumService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setServiceSummary', response.data);
            }).catch(() => {
                context.commit('setServiceSummary', []);
            })
        },

        getIPByteSummary(context) {
            IPByteSummaryService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setIPByteSummary', response.data);
            }).catch(() => {
                context.commit('setIPByteSummary', []);
            })
        },

        getIPByteSummaryByTime(context) {
            IPByteSummaryService.getByTime(context.rootState.startTime, context.rootState.endTime).then((response) => {
                response.data.forEach(element => {
                    element.ts = new Date(element.ts * 1000)
                })
                context.commit('setIPByteSummaryByTime', response.data);
            }).catch(() => {
                context.commit('setIPByteSummaryByTime', []);
            })
        },

        getConnectionSummary(context) {
            ConnectionSumService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
            response.data.forEach(element => {
                element.ts = new Date(element.ts * 1000)
            })
            context.commit('setConnectionSummary', response.data);

            }).catch(() => {
                context.commit('setConnectionSummary', []);
            })
    },

        getDataByTime(context) {

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
            if (context.state.dNSQueriesTopK.viewCounter >0) {     
               context.dispatch('getDNSQueriesTopK')
            }
            if (context.state.portsOfInterest.viewCounter >0) {     
                context.dispatch('getPortsOfInterest')
             }
                             
            if (context.state.ipByteSummary.viewCounter > 0) {
                context.dispatch('getIPByteSummary')
            } 
                        
        },

        removeFilterByFilterName(context, filterName) {
            context.commit('removeFilterByFilterName',filterName)
        },
        removeAllFilters(context) {
            context.commit('removeAllFilters')

        }

    },

    getters: {
            dataByType: (state) => (type) => {          
            return getSummaryElementByChartType(state,type)
        },

    }
}
