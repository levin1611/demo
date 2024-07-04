import { Request } from '@/api/baseUtilAjax';

// 根据消息id 查询 对话列表中的最后一条消息对应的字典
export const getChatGdpMessage = async (data = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAiJson',
        url: '/crm/chatGdp/getChatGdpMessage',
        data: data,
        cancelToken
    }).init(success, error, cbs);
};


export const getResidueLimit = async (params = {}, cancelToken = null, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxAiJson',
        url: '/crm/chatGdp/getResidueLimit',
        params,
        cancelToken
    }, 'get').init(success, error, cbs);
};

