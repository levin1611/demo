const getProductionUrl = () => {
  let AREA = 'cnend'
  const origin = window.location.origin
  if (origin.indexOf('adminus') != -1) {
    // 美国
    AREA = 'usend'
  } else if (origin.indexOf('adminhk') != -1) {
    // 香港
    AREA = 'hkserv01'
  } else if (origin.indexOf('adminsg') != -1) {
    // 新加坡
    AREA = 'sgend'
  }

  return `https://${AREA}.leadscloud.com`
}

export default {
  // 联调
  debug: {
    url: 'https://dev.leadscloud.com',
  },
  // 测试
  development: {
    url: 'https://test.leadscloud.com',
  },
  // 新版测试
  newDevelopment: {
    url: 'https://testcn.leadscloud.com',
    aiUrl: 'https://aicnendtest.leadscloud.com',
    wssUrl: 'wss://wsaicnendtest.leadscloud.com/websocket/chatsocket',
    wssSendUrl: 'https://wsaicnendtest.leadscloud.com/websocket/testMsgSend',
  },
  // 线上
  production: {
    url: getProductionUrl(),
    aiUrl: 'https://aicnend.leadscloud.com',
    wssUrl: 'wss://wsaicnend.leadscloud.com/websocket/chatsocket',
    wssSendUrl: 'https://wsaicnendtest.leadscloud.com/websocket/testMsgSend',
  },
  // 灰度
  gray: {
    url: 'https://hdcnend.leadscloud.com',
  },
  // 海外
  overseas: {
    url: 'https://overseas.leadscloud.com',
  },
}
