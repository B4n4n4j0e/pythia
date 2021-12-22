import Api from './Api'

export default { 
    post(data){
        return Api().post('/view', data)
    },

    put(data){
        return Api().put('/view', data)
    },

    delete(id){
        return Api().delete('/view',{params: {'id':id}})
    },
}