import Api from './Api'
export default {
    get(start, end) {
        if (start && end) {
            return Api().get("/api/connections", { params: { 'start-time': start, 'end-time': end } })
        }
        return Api().get('/api/connections')
    },
    post(data) {
        return Api().post('/api/connections', data)
    }

}