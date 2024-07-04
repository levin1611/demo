import { Request } from '@/api/baseUtilAjax';
export const findBookDetailListByPageRequest = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxEmailMarketingJson',
        url: '/business/address/book/detail/findBookDetailListByPage',
        data,
        type: 'POST'
    }).init(success, error, cbs);
};
// 地址簿详情单个邮箱删除
export const deleteAddressBook = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxEmailMarketingJson',
        url: '/business/address/book/detail/delete',
        data,
        type: 'POST'
    }).init(success, error, cbs);
};
// 地址簿邮箱验证
export const reValid = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxEmailMarketingJsonLongTime',
        url: `/business/address/book/detail/reValid?id=${data.id}&orgId=${data.orgId}&userId=${data.userId}`,
        // params
    }).init(success, error, cbs);
};

