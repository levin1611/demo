import axios from 'axios'
import { storage } from './store'
import { Message } from 'element-ui'

const defaultCacheTime = 5 * 60 * 1000

axios.defaults.timeout = 30000

const instance = axios.create({
  headers: {
    'Content-Type': 'application/json; charset=UTF-8',
  },
})

instance.interceptors.response.use(
  (res) => {
    if (res.data && res.data.code === 1) {
      return Promise.resolve(res.data || res)
    } else {
      Message.error(res.data.msg)
    }
  },
  (err) => {
    Message.error('请求失败')
  }
)

const request = async (url, data, options = {}) => {
  const { isCache, cacheKey, cacheTime } = options
  if (isCache) {
    const cacheData = storage.get(cacheKey)
    if (cacheData) {
      // has cachaed data
      return new Promise((resolve) => {
        resolve(cacheData)
      })
    } else {
      // actual data
      const resData = await instance({
        url,
        method: 'post',
        data,
      })
      if (resData && resData.code === 1) {
        storage.set(cacheKey, resData, cacheTime || defaultCacheTime)
        return new Promise((resolve) => {
          resolve(resData)
        })
      }
    }
  } else {
    return instance({
      url,
      method: 'post',
      data,
    })
  }
}

export default request
