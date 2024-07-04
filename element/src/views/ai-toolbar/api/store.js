export const storage = {
  //存储
  set(key, value, expires) {
    const obj = {
      value: value,
      expires: expires, //有效时间
      startTime: new Date().getTime(), // 记录存储数据的时间，转换为毫秒值存下来
    }
    // 判断是否设置了有效时间
    if (obj.expires) {
      // 如果设置了时间，把obj转换数据类型转换为字符串对象存起来
      localStorage.setItem(key, JSON.stringify(obj))
    } else {
      // 如果没有设置有效时间，直接把value值存进去
      localStorage.setItem(key, JSON.stringify(obj.value))
    }
  },
  //取出数据
  get(key) {
    // 先定义一个变量临时存放提取的值
    const temp = JSON.parse(localStorage.getItem(key))
    // 判断有没有设置expires属性
    // 如果有，就需要判断是否到期了
    if (temp && temp != 'undefined' && temp != 'null' && temp.expires) {
      let data = new Date().getTime()
      if (data - temp.startTime > temp.expires) {
        // 此时说明数据已过期,清除掉
        localStorage.removeItem(key)
        // 直接return
        return
      } else {
        // 如果没有过期就输出
        return temp.value
      }
    } else {
      // 如果没有设置，直接输出
      return temp
    }
  },
  // delete
  remove(key) {
    localStorage.removeItem(key)
  },
}
