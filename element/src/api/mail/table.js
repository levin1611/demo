import { Request } from '@/api/baseUtilAjax';


/** 【当前筛选字段所属】字段切换客户/询盘，保存最近操作type */
const mailCancel = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxMailJson',
        url: '/mail/group/mailCancel',
        data
    }).init(success, error, cbs);
};


export default {
    mailCancel
};
