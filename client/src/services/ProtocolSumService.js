import Api from './Api'

export default {
    get(start, end) {
        if (start && end) {
            return Api().get("/protocol-sum",{params: {'start-time': start/1000, 'end-time': end/1000}})
        }
        return Api().get('/protocol-sum')
    },
    post(data){
        return Api().post('/protocol-sum', data)
    }

}