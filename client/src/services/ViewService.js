import Api from './Api'

export default {
    post(data) {
        return Api().post('/api/view', data)
    },

    put(data) {
        return Api().put('/api/view', data)
    },

    delete(id) {
        return Api().delete('/api/view', { params: { 'id': id } })
    },
}