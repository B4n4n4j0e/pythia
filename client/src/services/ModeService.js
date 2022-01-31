import Api from './Api'

export default {
    get() {
        return Api().get('/api/mode')
    },

    post(mode) {
        return Api().post('/api/mode', mode)
    }
}