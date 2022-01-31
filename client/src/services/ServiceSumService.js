import Api from './Api'

export default {
    get(start, end) {
        if (start && end) {
            return Api().get("/api/service-sum", { params: { 'start-time': start, 'end-time': end } })
        }
        return Api().get('/api/service-sum')
    },
    post(data) {
        return Api().post('/api/service-sum', data)
    }

}