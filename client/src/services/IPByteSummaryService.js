import Api from './Api'

export default {
    get(start, end) {
        if (start && end) {
            return Api().get("/ip-byte-sum",{params: {'start-time': start/1000, 'end-time': end/1000}})
        }
        return Api().get('/ip-byte-sum')
    },
    post(data){
        return Api().post('/ip-byte-sum', data)
    },
    getByTime(start, end) {
        if (start && end) {
            return Api().get("/ip-byte-sum/by-time",{params: {'start-time': start/1000, 'end-time': end/1000}})
        }
        return Api().get('/ip-byte-sum/by-time')
    },
    postByTime(data){
        return Api().post('/ip-byte-sum/by-time', data)
    }
    
    
}