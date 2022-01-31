import Api from './Api'

export default {
    post(formData) {
        return Api().post('/api/pcap-upload', formData, {
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        })
    }
}

