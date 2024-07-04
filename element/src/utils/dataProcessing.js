/**
 * @Description: 邮件时间省略显示, 需搭配 timeFormat("DateTimeHm") 使用
 * a.当前日期显示时:分；
 * b.今年的日期仅显示月-日；
 * c.今年之前的日期显示年-月-日；
 * @author 汤一飞
 * @date 2021/3/23
*/
const mailTimeOmiFormat = (value) => {
    const nowDate = new Date();
    const valueDate = new Date(value);

    // 今年之前的日期显示年-月-日 时:分；
    if (valueDate.getFullYear() !== nowDate.getFullYear()) {
        return value.slice(0, value.indexOf(' '));
    }

    // 当前日期显示时:分；
    if (valueDate.getMonth() === nowDate.getMonth() && valueDate.getDate() === nowDate.getDate()) {
        return value.slice(value.indexOf(' ') + 1);
    }

    // 今年的日期仅显示月-日 时:分；
    return value.slice(value.indexOf('-') + 1, value.indexOf(' '));
}
/**
 * @Description: 时间省略显示, 需搭配 timeFormat("DateTimeHm") 使用
 * a.当前日期显示时:分；
 * b.今年的日期仅显示月-日 时:分；
 * c.今年之前的日期显示年-月-日 时:分；
 * @author 汤一飞
 * @date 2021/1/5
*/
const timeOmiFormat = (value) => {
    const nowDate = new Date();
    const valueDate = new Date(value);

    // 今年之前的日期显示年-月-日 时:分；
    if (valueDate.getFullYear() !== nowDate.getFullYear()) {
        return value;
    }

    // 当前日期显示时:分；
    if (valueDate.getMonth() === nowDate.getMonth() && valueDate.getDate() === nowDate.getDate()) {
        return value.slice(value.indexOf(' ') + 1);
    }

    // 今年的日期仅显示月-日 时:分；
    return value.slice(value.indexOf('-') + 1);
}

// 过滤文本长度，超出部分省略号显示
// str:文本，len:限制的长度（按字节就算）
const lengthFilter = (str, len) => {
    let L = 0;
    let temp = 0;
    if (!str) {
        str = '';
    }
    for (let i = 0; i < str.length; i++) {
        const c = str.charCodeAt(i);
        // 单字节加1
        if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
            L++;
        } else {
            L += 3;
        }
        if (L <= len) {
            temp++;
        }
    }
    if (L > len) {
        str = `${str.substring(0, temp)}...`;
    }
    return str;
}

// 对不确定是否是对象的变量返回对象或空
const parseObject = (val) => {
    let result = null;
    if (typeof val === 'string') {
        try {
            result = JSON.parse(val);
        } catch (e) {
        }
    } else if (typeof val === 'object') {
        result = val;
    }
    return result;
}

// 去掉前后空格
const trim = (value) => {
    return value.trim();
}

// 转换富文本到纯文本
const toText = (value) => {
    const div = document.createElement('div');
    div.innerHTML = value;
    return div.innerText;
}

// 转换 JSON 数组
export const parseArray = (value) => {
    let temp = value;
    try {
        temp = JSON.parse(value);
    } catch (e) {
    }
    temp = Array.isArray(temp) ? temp : [];
    return temp;
}

const timeFormat = (value, format) => {
    if (typeof Date.prototype.format !== 'function') {
        Date.prototype.format = function(fmt) {
            const o = {
                'M+': this.getMonth() + 1, // 月份
                'd+': this.getDate(), // 日
                'h+': this.getHours(), // 小时
                'm+': this.getMinutes(), // 分
                's+': this.getSeconds(), // 秒
                'q+': Math.floor((this.getMonth() + 3) / 3), // 季度
                S: this.getMilliseconds() // 毫秒
            };
            if (/(y+)/.test(fmt)) {
                fmt = fmt.replace(RegExp.$1, (`${this.getFullYear()
                }`).substr(4 -
                    RegExp.$1.length));
            }
            for (const k in o) {
                if (new RegExp(`(${k})`).test(fmt)) {
                    fmt = fmt.replace(RegExp.$1, (RegExp.$1.length == 1)
                        ? (o[k])
                        : ((`00${o[k]}`).substr((`${o[k]}`).length)));
                }
            }
            return fmt;
        };
    }
    let timeFormat = format || 'yyyy-MM-dd';
    switch (format) {
        case 'Time':
            timeFormat = 'hh:mm:ss';
            break;
        case 'DateTime':
            timeFormat = 'yyyy-MM-dd hh:mm:ss';
            break;
        case 'TimeHm':
            timeFormat = 'hh:mm';
            break;
        case 'DateTimeHm':
            timeFormat = 'yyyy-MM-dd hh:mm';
            break;
        case 'DateTimeMd':
            timeFormat = 'MM-dd';
            break;
        case 'YearMonth':
            timeFormat = 'yyyy-MM';
            break;
    }
    if (value instanceof Date) {
        return value.format(timeFormat);
    }
    let temp = '';
    if (/^\d+$/.test(`${value}`)) {
        temp = new Date(parseInt(value)).format(timeFormat);
    } else if (/^\d+$/.test(`${Date.parse(value)}`)) {
        temp = new Date(Date.parse(value)).format(timeFormat);
    }
    return temp;
}

// 计算两个时间之间,相差几个小时 接收一个毫秒数的时间戳(例如：1649756604576)
const calculateHoursBetweenTwoDates = (value) => {
    let hours = null;
    // 现在的时间
    const nowTime = new Date().getTime();
    // 传入的比较时间
    const compareTime = new Date(Number(value)).getTime();
    // 计算两个时间之间,相差几个小时
    hours = (nowTime - compareTime) / (1000 * 60 * 60);

    return hours;
};

// 显示'***撤回了一条消息' 时 名字长度不能超过 limitLength 个
// 接收一个 名字:value 和 限制长度:length
const isNameLengthTooLong = (value, limitLength) => {
    let name = '';

    // eslint-disable-next-line no-unused-expressions
    value.length > limitLength ? name = `${value.slice(0, limitLength)}...` : name = value;

    return name;
};

// 处理已排好时间顺序的消息数组, 如果消息的时间间隔超过指定时限, 则消息之间需要显示时间间隔
const addMsgTimeTag = (msgList, timeKey = 'timeStamp', delay = 1000 * 60 * 5) => {
    // 获取时间戳方法
    function getTimeStamp(value) {
        if (value instanceof Date) {
            return value.getTime();
        }
        let temp = '';
        if (/^\d+$/.test(`${value}`)) {
            temp = new Date(parseInt(value)).getTime();
        } else if (/^\d+$/.test(`${Date.parse(value)}`)) {
            temp = new Date(Date.parse(value)).getTime();
        }
        return temp;
    }

    if (msgList.length) {
        // 首条消息必须显示时间
        msgList[0].showTimeTag = true;

        msgList.reduce((a, b) => {
            // 与前一条消息的时间间隔超过指定时限, 则需要显示时间
            if (Math.abs(getTimeStamp(b[timeKey]) - getTimeStamp(a[timeKey])) > delay) {
                b.showTimeTag = true;
            }

            return b;
        });
    }

    return msgList;
};

// 将数字格式化为带逗号的字符串
// 不传 lang 则不带单位, 按千分位加逗号; 传 lang 则根据中英文区分单位, 且中文使用万和亿, 英文使用 K, M, B, T
export const formatNumWithCommas = (val, lang) => {
    // 将纯数字字符串的小数点向左移动 n 位, 并保留 1 位小数 (有货币单位的是保留 2 位)
    function moveDotLeft(str, n) {
        let newStr;
        if (n) {
            const splitDotArr = str.split('.');
            splitDotArr[0] = `${splitDotArr[0].slice(0, -n)}.${splitDotArr[0].slice(-n)}`;
            newStr = splitDotArr.join('');
        } else {
            newStr = str;
        }
        newStr = Number(newStr).toFixed(currency ? 2 : 1).replace(/\.0+$/, '');

        return newStr;
    }
    // 给纯数字字符串添加 ,
    function addCommas(str) {
        const parts = str.split('.');
        parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ',');
        return parts.join('.');
    }

    // 去掉空数据
    let str = `${val}`;
    if (!str || ['null', 'undefined'].includes(str)) {
        return '-';
    }

    // 暂时去掉货币符号
    let currency = '';
    if (str.endsWith(' ¥')) {
        str = str.slice(0, -2);
        currency = ' ¥';
    }

    let result = '';
    if (/^\d+(\.\d+)?$/.test(str)) {
        if (!lang) {
            // 不指定语言, 直接按千分位加逗号, 且不指定小数位数
            result = `${addCommas(str)}`;
        } else if (lang === 'zh-CN') {
            // 中文换算
            // 亿
            const val = Number(str);
            if (val >= 100000000) {
                result = `${addCommas(moveDotLeft(str, 8))}亿`;
            } else if (val >= 10000) {
                result = `${addCommas(moveDotLeft(str, 4))}万`;
            } else {
                result = `${addCommas(moveDotLeft(str, 0))}`;
            }
        } else {
            // 英文换算
            const val = Number(str);
            if (val >= 1000000000000) {
                result = `${addCommas(moveDotLeft(str, 12))}T`;
            } else if (val >= 1000000000) {
                result = `${addCommas(moveDotLeft(str, 9))}B`;
            } else if (val >= 1000000) {
                result = `${addCommas(moveDotLeft(str, 6))}M`;
            } else if (val >= 1000) {
                result = `${addCommas(moveDotLeft(str, 3))}K`;
            } else {
                result = `${addCommas(moveDotLeft(str, 0))}`;
            }
        }
    } else {
        result = str;
    }
    result += currency;

    return result;
};

export default {
    mailTimeOmiFormat,
    timeOmiFormat,
    lengthFilter,
    parseObject,
    trim,
    toText,
    parseArray,
    calculateHoursBetweenTwoDates,
    isNameLengthTooLong,
    timeFormat,
    addMsgTimeTag,
    formatNumWithCommas
};
