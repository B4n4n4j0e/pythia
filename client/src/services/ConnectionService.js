import Api from './Api'

export default {
    getConnections(start, end) {
        if (start && end) {
            return Api().get("connections",{params: {start: start, end: end}})
        }
        return Api().get('connections')
    },

}