import Api from './Api'

export default {
    getConnections(start, end) {
        if (start && end) {
            return Api().get("connections",{params: {'start-time': start/1000, 'end-time': end/1000}})
        }
        return Api().get('connections')
    },

}