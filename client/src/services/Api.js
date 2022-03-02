import axios from 'axios'

export default () => {
    return axios.create({
        baseURL: ProcessingInstruction.env.BASE_URL
    })
}