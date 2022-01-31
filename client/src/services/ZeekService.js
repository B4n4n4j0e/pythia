import Api from './Api'
export default {
    get() {
        return Api().get('/api/zeek')
    },
    post(data) {
        return Api().post('/api/zeek', data)
    },

}