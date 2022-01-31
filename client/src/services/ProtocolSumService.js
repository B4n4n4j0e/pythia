import Api from './Api'

export default {
    get(start, end) {
        if (start && end) {
            return Api().get("/api/protocol-sum", { params: { 'start-time': start, 'end-time': end } })
        }
        return Api().get('/api/protocol-sum')
    },
    post(data) {
        return Api().post('/api/protocol-sum', data)
    }

}