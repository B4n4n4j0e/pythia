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
        case 'connectionSummaryPerHour': 
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
            type: 'connectionSummaryPerHour',
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

        incrementViewCounter(state, type) {
            const view = getElementByChartType(state, type)
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
            context.commit('incrementViewCounter',type)
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
                context.commit('setConnectionSummary', response.data);
            }).catch(() => {
                context.commit('setConnectionSummary', []);
            })
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
        }

    },

    getters: {
            dataByType: (state) => (type) => {          
            var data = getElementByChartType(state,type)
            return data

        },
    }
}