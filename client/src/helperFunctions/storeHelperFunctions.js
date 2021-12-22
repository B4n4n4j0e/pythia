export function changeFilterTypeToLowerCaseOrUpperCase (filter){
    if (filter.type  == 'service' || filter.type  =='proto') {
        filter.filter= filter.filter.toLowerCase()
     }
     else if (filter.type == 'q_type' || filter.type  == 'q_rcode'){
        filter.filter= filter.filter.toUpperCase()
     }
    return filter
}

export function convertViewData(view) {
    view.isFrozen = view.isFrozen === "True"
    view.isSummary = view.isSummary === "True"
    view.chartNumber =  parseInt(view.chartNumber)
    view.cols =  parseInt(view.cols)
}


export function getDetailElementByChartType(state, type) {
    switch (type) {
        case 'respHostsTopK':
            return state.respHostsTopK
        case 'respPortsTopK':
            return state.respPortsTopK
        case 'originHostsTopK':
            return state.originHostsTopK
        case 'dNSQueriesTopK':
            return state.dNSQueriesTopK
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
        case 'noticeTable':
            return state.noticeTable
        case 'dNSTable':
            return state.dNSTable
        case 'connectionTable':
            return state.connectionTable
    }
}



export function dispatchDetailViewByType(context, type) {
    switch (type) {
        case 'respHostsTopK':
            context.dispatch('getRespHostsTopK')
            break;
        case 'respPortsTopK':
            context.dispatch('getRespPortsTopK')
            break;        
        case 'originHostsTopK':
            context.dispatch('getOriginHostsTopK')
            break;               
        case 'dNSQueriesTopK':
            context.dispatch('getDNSQueriesTopK')
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
        case 'noticeTable':
            context.dispatch('getNotices')
            break;               
        case 'dNSTable':
            context.dispatch('getDNSConnections')
            break;               
        case 'connectionTable':
            context.dispatch('getConnections')
            break;              
        }
}


export function getSummaryElementByChartType(state, type) {
    switch (type) {
        case 'respHostsTopK':
            return state.respHostsTopK
        case 'respPortsTopK':
            return state.respPortsTopK
        case 'originHostsTopK':
            return state.originHostsTopK
        case 'dNSQueriesTopK':
            return state.dNSQueriesTopK
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


export function dispatchSummaryViewByType(context, type) {
    switch (type) {
        case 'respHostsTopK':
            context.dispatch('getRespHostsTopK')
            break;
        case 'respPortsTopK':
            context.dispatch('getRespPortsTopK')
            break;        
        case 'originHostsTopK':
            context.dispatch('getOriginHostsTopK')
            break;               
        case 'dNSQueriesTopK':
            context.dispatch('getDNSQueriesTopK')
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