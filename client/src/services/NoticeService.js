import Api from './Api'

export default {
    getNotices(start, end) {
        if (start && end) {
            return Api().get("notices",{params: {'start-time': start/1000, 'end-time': end/1000}})

        }
        return Api().get('notices')
    },

}