import Api from './Api'
export default {

    getConfiguration() {
        return Api().get('/api/configuration')
    },
    post(data) {
        return Api().post('/api/configuration', data)
    },
    delete(start, end) {
        if (start && end) {
            return Api().delete("/api/configuration", { params: { 'start-time': start, 'end-time': end } })
        }
        return Api().delete('/api/configuration')
    }
}