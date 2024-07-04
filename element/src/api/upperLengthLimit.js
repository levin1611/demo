/*
 * @Description:
 * @Author: niumkiki
 * @Date: 2020-07-23 11:36:24
 * @LastEditTime: 2020-07-29 16:16:10
 * @LastEditors: niumkiki
 */
import util from '@/libs/util';

// 获取表头所有字段（显示和隐藏）长度上限
export const getUpperLengthLimit = ({ serviceFlag, orgId }) => util.ajaxJson({
    url: '/new-privilege/formFieldConfig/getListForClient',
    method: 'GET',
    params: {
        serviceFlag,
        orgId
    }
}).then(res => res.data);
