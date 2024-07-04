import { Request } from '@/api/baseUtilAjax';

/**
 * 处理关键词高亮
 * @param {string} text 待处理字符串
 * @param {string} keyword 关键词
 * @param {boolean} handleSymbol 是否处理符号 " & <>
 * @returns {string} 返回处理后的字符串
 */
export function HANDLE_HIGHLIGHT(text, keyword, handleSymbol) {
    /* 先将text中的特殊符号转义 */
    if (handleSymbol) {
        text = text.replace(/&/g, '&amp;');
        text = text.replace(/\"/g, '&quot;');
        text = text.replace(/</g, '&lt;');
        text = text.replace(/>/g, '&gt;');
    }
    let replaceReg = new RegExp(keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    let replaceString = `<span class="keyword">${keyword}</span>`;
    text = text.replace(replaceReg, replaceString);
    return text;
}

/**
 * @Description: 高亮指定关键词
 * node: 遍历起始 node
 * keyword: 关键词
 * className: 高亮效果 className
*/
export function HTML_HIGHLIGHT(node, keyword, className) {
    const reg = new RegExp(keyword.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&'));
    const rootDoc = node.getRootNode();
    if (node.nodeType == 3) { // 只处理文本节点
        const match = node.data.match(new RegExp(reg));
        if (match) {
            const highlightEl = rootDoc.createElement('span');
            highlightEl.className = className;

            const wordNode = node.splitText(match.index);
            wordNode.splitText(match[0].length); // 切割成前 关键词 后三个Text 节点
            const wordNew = rootDoc.createTextNode(wordNode.data);
            highlightEl.appendChild(wordNew);// highlight 节点构建成功
            wordNode.parentNode.replaceChild(highlightEl, wordNode);// 替换该文本节点
        }
    } else if (node.nodeType == 1 && node.className != className) {
        for (let i = 0; i < node.childNodes.length; i++) { // 不是文本节点遍历子元素 递归处理
            HTML_HIGHLIGHT(node.childNodes[i], keyword, className);
        }
    }
}

/**
 * 根据mailboxtypeid获取邮箱类型
 * @param {number} boxId
 * @returns {string} 返回邮箱类型
 */
export function GET_MAILBOX_TYPE(boxId) {
    switch (boxId) {
        case 0:
            return 'inbox';
        case 3:
            return 'dustbin';
        case 4:
            return 'sentBox';
        case 5:
            return 'draftBox';
        case 7:
            return 'groupBox';
        default:
            return `${boxId}`;
    }
}
// 获取邮箱后缀
export function GET_EMAIL_SUFFIX(email) {
    const index = email.lastIndexOf('@');
    if (index === -1) {
        return '';
    } else {
        return email.slice(index);
    }
}

// 校验并保存别名邮箱
export const saveAliasMail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        url: '/mail/alias/validateAndSaveAccount',
        utilKey: 'ajaxMailJson',
        data
    }).init(success, error, cbs);
};

// 删除别名邮箱
export const delAliasMail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: `/mail/alias/delAccount/${data.id}`
    }, 'delete').init(success, error, cbs);
};

// 获取邮件日志
export const getLogList = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailOperateLog/logList',
        data
    }).init(success, error, cbs);
};

// 获取当前邮件是否有启用状态为手动触发的规则
export const getIsEnable = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: `/mail/manualExecuteMailRule/isEnable/${data.userId}`
    }, 'get').init(success, error, cbs);
};

// 执行手动触发规则
export const enforceRules = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/mailReceiveSendRule/invoking',
        data
    }, 'post').init(success, error, cbs);
};

// 标记为垃圾邮件
export const updateBoxType = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/markTrash/updateBoxType',
        data
    }, 'post').init(success, error, cbs);
};

