import Api from './Api'

export default {
    get(start, end) {
        if (start && end) {
            return Api().get("/api/origin-host-top-k", { params: { 'start-time': start, 'end-time': end } })
        }
        return Api().get('/api/origin-host-top-k')
    },
    post(data) {
        return Api().post('/api/origin-host-top-k', data)
    }
}