import { Request } from '@/api/baseUtilAjax';

/** 获取客户查重数据 */
const searchCompanyListForCrm = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajax',
        url: '/es2/api/esData/searchCompanyListForCrm',
        data
    }, 'post').init(success, error, cbs);
};

export default {
    searchCompanyListForCrm
};
