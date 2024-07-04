/** 业务处理代码注册于原型上 */
const dealImgName = (url, name) => {
    if (typeof url === 'string' && typeof name === 'string') {
        return `${url}${url.indexOf('?') === -1 ? '?' : '&'}download=${encodeURIComponent(name)}`;
    } else {
        console.error('url is not string');
        return url;
    }
};
const openWindow = (url = '', type = '_blank', data = '') => {
    if (!url) return false;
    window.open(url, type, data);
};

const openNewWindow = (url) => {
    if (!url) return false;
    let aTag = document.createElement('a');
    aTag.rel = 'noopener';
    aTag.target = '_blank';
    aTag.href = url;
    aTag.click();
    aTag = null;
};

// 动态插入 js 到页面
export const insertScript = (url, defer, async, priority = 'high') => {
    const scriptTag = document.createElement('script');
    // 动态插入的 script, 默认 async 为 true
    if (async) {
        scriptTag.async = async;
    }
    // 考虑兼容性问题, 设置 async 为 true 时也要设置 defer
    if (scriptTag.async) {
        scriptTag.defer = true;
    } else if (defer) {
        scriptTag.defer = defer;
    }
    scriptTag.importance = priority;
    scriptTag.fetchPriority = priority;
    scriptTag.src = url;
    document.head.prepend(scriptTag);
};

export default {
    dealImgName,
    openWindow,
    insertScript,
    openNewWindow
};
