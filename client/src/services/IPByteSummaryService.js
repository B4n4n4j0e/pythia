import Api from './Api'

export default {
    get(start, end) {
        if (start && end) {
            return Api().get("/api/ip-byte-sum", { params: { 'start-time': start, 'end-time': end } })
        }
        return Api().get('/api/ip-byte-sum')
    },
    post(data) {
        return Api().post('/api/ip-byte-sum', data)
    },
    getByTime(start, end) {
        if (start && end) {
            return Api().get("/api/ip-byte-sum/by-time", { params: { 'start-time': start, 'end-time': end } })
        }
        return Api().get('/api/ip-byte-sum/by-time')
    },
    postByTime(data) {
        return Api().post('/api/ip-byte-sum/by-time', data)
    }


}