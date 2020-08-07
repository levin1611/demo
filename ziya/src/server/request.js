import axios from "axios";
import { Loading, Message } from "element-ui";
import { config } from "shelljs";
const Service = axios.create({
    baseURL: process.env.BASE_API,
    timeout: 10 * 1000
});
let Load;
Service.interceptors.request.use(config => {
    config.data = JSON.stringify(config.data);
    config.headers = {
        'Content-type': 'application/x-www-form-urlencoded'
    }
    Load = Loading.service({ fullscreen: true })
    return config
}, error => {
    Load.close();
    Promise.reject(error);
    Message.error({
        message: "Load timeout"
    });
})
Service.interceptors.response.use(response => {
    Load.close();
    if (response.data.status == "success") {
        return Promise.resolve(response.data);
    } else if (response.data.status == "error") {
        Message.error({
            message: response.data.message
        });
    } else {
        Message.error({
            message: response.data.message
        });
    }
}, error => {
    // 对响应错误做点什么
    loadinginstace.close();
    if (error.response) {
        if (error.response.status == "401") {
            Message.error({
                message: "No authority"
            });
        } else if (error.response.status == "400") {
            Message.error({
                message: "Invalid request"
            });
        } else if (error.response.status == "406") {
            Message.error({
                message: error.response.data.errors[0].errmsg
            });
        } else if (error.response.status == "504") {
            Message.error({
                message: "Load timeout504"
            });
            let config = error.config;
            // If config does not exist or the retry option is not set, reject
            if (!config || !config.retry) return Promise.reject(error);
            // Set the variable for keeping track of the retry count
            config.__retryCount = config.__retryCount || 0;

            // Check if we've maxed out the total number of retries
            if (config.__retryCount >= config.retry) {
                // Reject with the error
                return Promise.reject(error);
            }

            // Increase the retry count
            config.__retryCount += 1;

            // Create new promise to handle exponential backoff
            let backoff = new Promise(function(resolve) {
                setTimeout(function() {
                    resolve();
                }, config.retryDelay || 1);
            });

            // Return the promise in which recalls axios to retry the request
            return backoff.then(function() {
                return axios(config);
            });
        } else {
            Message.error({
                message: "Load timeout"
            });
        }
    } else {
        Message.error({
            message: "Load timeout",
            onClose: function() {
                router.replace({
                    path: "/"
                });
            }
        });
    }
});
export default Service