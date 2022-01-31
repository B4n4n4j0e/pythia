import Api from './Api'

export default {
    get(start, end) {
        if (start && end) {
            return Api().get("/api/ports-of-interest", { params: { 'start-time': start, 'end-time': end } })
        }
        return Api().get('/api/ports-of-interest')
    },
    post(data) {
        return Api().post('/api/ports-of-interest', data)
    }

}