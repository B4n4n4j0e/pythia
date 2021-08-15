import Api from './Api'

export default {
    getConnectionSummary(start, end) {
        if (start && end) {
            return Api().get("connection-summary",{params: {'start-time': start/1000, 'end-time': end/1000}})
        }
        return Api().get('connection-summary')
    },

}