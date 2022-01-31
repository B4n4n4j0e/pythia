import Api from './Api'

export default {
    get(start, end) {
        if (start && end) {
            return Api().get("/api/connection-summary", { params: { 'start-time': start, 'end-time': end } })
        }
        return Api().get('/api/connection-summary')
    },
    post(data) {
        return Api().post('/api/connection-summary', data)
    }

}