import request from "./request";
import Qs from "qs";
const http = {
    get(url, params) {
        const config = {
            methods: 'get',
            url: url
        }
        if (params) config.params = params
        return request(config)
    },
    post(url, params) {
        const config = {
            methods: 'post',
            url: url
        }
        if (params) config.data = params
        return request(config)
    },
    put(url, params) {
        const config = {
            methods: 'put',
            url: url
        }
        if (params) config.params = params
        return request(config)
    },
    delete(url, params) {
        const config = {
            methods: 'delete',
            url: url
        }
        if (params) config.params = params
        return request(config)
    }
}
export default http