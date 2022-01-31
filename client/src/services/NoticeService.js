import Api from './Api'

export default {
    post(data) {
        return Api().post('/api/notices', data)
    }
}