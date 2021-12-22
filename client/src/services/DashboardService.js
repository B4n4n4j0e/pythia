import Api from './Api'

export default {
    getAllNames() {
        return Api().get('dashboards')
    },
    get(name) {
        return Api().get('/dashboard',{params: {'name':name}})
    },
    post(data){
        return Api().post('/dashboard', data)
    },
    delete(name){
        return Api().delete('/dashboard',{params: {'name':name}})
    },


    

}