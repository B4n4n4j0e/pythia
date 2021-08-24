import Api from './Api'

export default {
    get(start, end) {
        if (start && end) {
            return Api().get("/ip-kilobyte-sum",{params: {'start-time': start/1000, 'end-time': end/1000}})
        }
        return Api().get('/ip-kilobyte-sum')
    },
    getByTime(start, end) {
        if (start && end) {
            return Api().get("/ip-kilobyte-sum/by-time",{params: {'start-time': start/1000, 'end-time': end/1000}})
        }
        return Api().get('/ip-kilobyte-sum/by-time')
    },

}