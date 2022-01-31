import Api from './Api'

export default {
    get(start, end) {
        if (start && end) {
            return Api().get("/api/responder-port-top-k", { params: { 'start-time': start, 'end-time': end } })
        }
        return Api().get('/api/responder-port-top-k')
    },
    post(data) {
        return Api().post('/api/responder-port-top-k', data)
    }
}