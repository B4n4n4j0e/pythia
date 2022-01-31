import Api from './Api'

export default {
    getAllNames() {
        return Api().get('/api/dashboards')
    },
    get(name) {
        return Api().get('/api/dashboard', { params: { 'name': name } })
    },
    post(data) {
        return Api().post('/api/dashboard', data)
    },
    delete(name) {
        return Api().delete('/api/dashboard', { params: { 'name': name } })
    },




}