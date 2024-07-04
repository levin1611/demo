import Socket from './webSocket.js'
import url from './url.js'
import env from '../../../../build/env'

const wssUrl = url[env].wssUrl
// const wssUrl = url.newDevelopment.wssUrl

const nowSocket = {}

// 实例化创建socket
const init = (enterpriseId, userId) => {
  nowSocket.socket = new Socket({
    url: `${wssUrl}/${enterpriseId}/${userId}`,
    userId,
  })
}
// 消息回调函数
const onMessage = (callback) => {
  nowSocket.socket.message = callback
}

export default {
  instance: nowSocket,
  init,
  onMessage,
}
