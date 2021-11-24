import PortsOfInterestService from '../../services/PortsOfInterestService';
import IPByteSummaryService from '../../services/IPByteSummaryService';
import ConnectionSumService from '../../services/ConnectionSumService';
import TopKRespHostService from '../../services/TopKRespHostService';
import TopKRespPortService from '../../services/TopKRespPortService';
import TopKOriginHostService from '../../services/TopKOriginHostService';
import TopKDNSQueriesService from '../../services/TopKDNSQueriesService';
import ProtocolSumService from '../../services/ProtocolSumService';
import ServiceSumService from '../../services/ServiceSumService';



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
        case 'connectionSummary': 
            return state.connectionSummary
        case 'protocolSummary':
            return state.protocolSummary
        case 'serviceSummary':
            return state.serviceSummary
        case 'ipByteSummary':
            return state.ipByteSummary
        case 'ipByteSummaryByTime':
            return state.ipByteSummaryByTime
    }
}


function dispatchViewByType(context, type) {
    switch (type) {
        case 'topKRespHosts':
            context.dispatch('getTopKRespHosts')
            break;
        case 'topKRespPorts':
            context.dispatch('getTopKRespPorts')
            break;        
        case 'topKOriginHosts':
            context.dispatch('getTopKOriginHosts')
            break;               
        case 'topKDNSQueries':
            context.dispatch('getTopKDNSQueries')
            break;       
        case 'portsOfInterest':
            context.dispatch('getPortsOfInterest')
            break;               
        case 'connectionSummary':
            context.dispatch('getConnectionSummary')
            break;               
        case 'protocolSummary':
            context.dispatch('getProtocolSummary')
            break;               
        case 'serviceSummary':
            context.dispatch('getServiceSummary')
            break;       
        case 'ipByteSummary':
            context.dispatch('getIPByteSummary')
            break;       
        case 'ipByteSummaryByTime':
            context.dispatch('getIPByteSummary')
            break;               
}
}

export default {
    namespaced: true,
    state: {        

        topKRespHosts: 
        {
            type: 'topKRespHosts',
            payload: [],
            filter: new Set(),
            viewCounter  : 0,
            tracker: false
            
        },

    topKRespPorts: 
        {
            type: 'topKRespPorts',
            payload: [],
            filter: new Set(),
            viewCounter  : 0,
            tracker: false
        },

    topKOriginHosts: 
        {
            type: 'topKOriginHosts',
            payload: [],
            filter: new Set(),
            viewCounter  : 1,
            tracker: false
        },
    

    topKDNSQueries: 
        {
            type: 'topKDNSQueries',
            payload: [],
            filter: new Set(),
            viewCounter  : 0,
            tracker: false

        },
    
    portsOfInterest: 
        {
            type: 'portsOfInterest',
            payload: [],
            filter: new Set(),
            viewCounter  : 0,
            tracker: false

        },

    connectionSummary: 
        {
            type: 'connectionSummary',
            payload: [],
            filter: new Set(),
            viewCounter  : 0,
            tracker: false

        },
    protocolSummary: 
        {
            type: 'protocolSummary',
            payload: [],
            filter: new Set(),
            viewCounter  : 0,
            tracker: false
        },
    
    serviceSummary: 
        {
            type: 'serviceSummary',
            payload: [],
            filter: new Set(),
            viewCounter  : 0,
            tracker: false
        },

    ipByteSummary: 
        {
            type: 'ipByteSummary',
            payload: [],
            filter: new Set(),
            viewCounter  : 0,
            tracker: false

        },
    
    ipByteSummaryByTime: 
        {
            type: 'ipByteSummaryByTime',
            payload: [],
            filter: new Set(),
            viewCounter  : 0,
            tracker: false
        }

    },

    mutations: {

        incrementViewCounter(state, view) {
            view.viewCounter +=1;

        },

        decrementViewCounter(state, type) {
            const view = getElementByChartType(state, type)
            view.viewCounter -=1;
        },


        setFilter(state, data) {
                var element = getElementByChartType(state,data.type)
                element.filter.add(data.filter)
                element.tracker = !element.tracker            

        },

        removeFilter(state, data) {
                var element = getElementByChartType(state,data.type)
                element.filter.delete(data.filter)
                element.tracker = !element.tracker            
        },
        removeAllFilters(state) {
                state.topKRespHosts.filter = new Set()
                state.topKRespPorts.filter = new Set()
                state.topKOriginHosts.filter = new Set()
                state.topKDNSQueries.filter = new Set()
                state.portsOfInterest.filter = new Set()
                state.connectionSummary.filter = new Set()
                state.protocolSummary.filter = new Set()
                state.serviceSummary.filter = new Set()
                state.ipByteSummary.filter = new Set()
                state.ipByteSummaryByTime.filter = new Set()
        },

        removeFilterByFilterName(state, filter) {
            switch (filter.category) {
                case 'id_resp_h':
                    state.topKRespHosts.filter.delete(filter.filter)
                    state.topKRespHosts.tracker = !state.topKRespHosts.tracker
                    break;
                case 'id_orig_h':
                    state.topKOriginHosts.filter.delete(filter.filter)
                    state.topKOriginHosts.tracker = !state.topKOriginHosts.tracker

                    break;
                case 'ports':
                    state.topKRespPorts.filter.delete(filter.filter)
                    state.topKRespPorts.tracker = !state.topKRespPorts.tracker
                    state.portsOfInterest.filter.delete(filter.filter)
                    state.portsOfInterest.tracker = !state.portsOfInterest.tracker
                    break;
                case 'proto':
                    state.protocolSummary.filter.delete(filter.filter)
                    state.protocolSummary.tracker = !state.protocolSummary.tracker
                    break;
                case 'service':
                    state.serviceSummary.filter.delete(filter.filter)
                    state.serviceSummary.tracker = !state.serviceSummary.tracker
                    break;
                case 'query_text':
                    state.topKDNSQueries.filter.delete(filter.filter)
                    state.topKDNSQueries.tracker = !state.topKDNSQueries.tracker
                    break;
                default:
                    break;
            }
    
        },


        setTopKRespHosts(state, newTopKRespHosts) {
            state.topKRespHosts.payload = newTopKRespHosts;
        },
        setPortsOfInterest(state, newPortsOfInterest) {
            state.portsOfInterest.payload = newPortsOfInterest;
        },

        setTopKRespPorts(state, newTopKRespPorts) {
            state.topKRespPorts.payload = newTopKRespPorts;
        },

        setTopKOriginHosts(state, newTopKOriginHost) {
            state.topKOriginHosts.payload = newTopKOriginHost;
        },
        setTopKDNSQueries(state, newTopKDNSQueries) {
            state.topKDNSQueries.payload = newTopKDNSQueries;
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
        getTopKRespHosts(context) {
            TopKRespHostService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {                context.commit('setTopKRespHosts', response.data);
            }).catch(() => {
                context.commit('setTopKRespHosts', []);
            })
        },

        incrementViewCounter(context, type) {
            const view = getElementByChartType(context.state, type)
            if (view.viewCounter == 0) {
                dispatchViewByType(context,type)
            }
            context.commit('incrementViewCounter', view)
        },
        decrementViewCounter(context, type) {
            context.commit('decrementViewCounter',type)
        },

        getTopKRespPorts(context) {
            TopKRespPortService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setTopKRespPorts', response.data);
            }).catch(() => { 
                context.commit('setTopKRespPorts', []);
            })
        },

        getTopKOriginHosts(context) {
            TopKOriginHostService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setTopKOriginHosts', response.data);

            }).catch(() => {
                context.commit('setTopKOriginHosts', []);
            })
        },
        getTopKDNSQueries(context) {
            TopKDNSQueriesService.get(context.rootState.startTime, context.rootState.endTime).then((response) => {
                context.commit('setTopKDNSQueries', response.data);
            }).catch(() => {
                context.commit('setTopKDNSQueries', []);
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
            if (context.state.topKDNSQueries.viewCounter >0) {     
               context.dispatch('getTopKDNSQueries')
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
            var data = getElementByChartType(state,type)
            return data

        },
            
            connectionFilters: (state) => {
            //workaround to get changes therefore advantages of getter can be used
            state.portsOfInterest.tracker
            state.topKRespPorts.tracker
            state.topKRespHosts.tracker
            state.topKOriginHosts.tracker
            state.protocolSummary.tracker
            state.serviceSummary.tracker
            state.topKDNSQueries.tracker
            const id_resp_h = Array.from(state.topKRespHosts.filter)
            const query_text = Array.from(state.topKDNSQueries.filter)
            const id_origin_h = Array.from(state.topKOriginHosts.filter)
            var ports = new Set()
            const proto = Array.from(state.protocolSummary.filter)
            const service = Array.from(state.serviceSummary.filter)
            var result = {}
            
            state.portsOfInterest.filter.forEach(element => {
                ports.add(element)
            });
            state.topKRespPorts.filter.forEach(element => {
                ports.add(element)
            }); 
            ports = Array.from(ports)
            
            if (id_resp_h.length > 0) {
                result['id_resp_h'] = id_resp_h
            }
            if (id_origin_h.length > 0) {
                result['id_orig_h'] = id_origin_h
            }
            if (ports.length > 0) {
                result['ports'] = ports
            }
            if (proto.length > 0) {
                result['proto'] = proto
            }
            if (service.length > 0) {
                result['service'] = service
            }
            if (query_text.length > 0) {
                result['query_text'] = query_text
            }
            return result

        }
    }
}
