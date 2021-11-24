import Api from './Api'

export default {
    get(start, end) {
        if (start && end) {
            return Api().get("responder-host-top-k",{params: {'start-time': start/1000, 'end-time': end/1000}})
        }
        return Api().get('/responder-host-top-k')
    },
    post(data){
        return Api().post('/responder-host-top-k', data)
    }
}