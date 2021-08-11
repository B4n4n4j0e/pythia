import Api from './Api'

export default {
    getNotices(start, end) {
        if (start && end) {
            return Api().get("notices",{params: {start: start, end: end}})
        }
        return Api().get('notices')
    },

}