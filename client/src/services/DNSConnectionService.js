import Api from './Api'

export default {
    get(start, end) {
        if (start && end) {
            return Api().get("/api/dns-entries", { params: { 'start-time': start, 'end-time': end } })
        }
        return Api().get('/api/dns-entries')
    },
    post(data) {
        return Api().post('/api/dns-entries', data)
    }

}