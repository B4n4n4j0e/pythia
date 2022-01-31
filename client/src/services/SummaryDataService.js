import Api from './Api'
export default {
    get() {
        return Api().get('/api/summary-data')
    },

    delete(start, end) {
        if (start && end) {
            return Api().delete("/api/summary-data", { params: { 'start-time': start, 'end-time': end } })
        }
        return Api().delete('/api/summary-data')
    }
}