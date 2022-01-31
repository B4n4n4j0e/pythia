import Api from './Api'
export default {

    get() {
        return Api().get('/api/detail-data')
    },

    delete(start, end) {
        if (start && end) {
            return Api().delete("/api/detail-data", { params: { 'start-time': start, 'end-time': end } })
        }
        return Api().delete('/api/detail-data')
    }
}