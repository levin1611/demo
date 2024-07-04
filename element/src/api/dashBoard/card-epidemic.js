import {
    Request
} from '@/api/baseUtilAjax';
export const getCountry = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
    // utilKey: 'localAjax',
    // url: 'http://192.168.74.209:7093/server/locations',
        utilKey: 'ajaxHkJson',
        url: '/server/locations',
        data
    }, 'get').init(success, error, cbs);
};
export const getEpidemicDetail = async (data = {}, success = null, error = null, cbs = []) => {
    return new Request({
        utilKey: 'ajaxHkJson',
        url: '/server/coronavirus',
        data
    }).init(success, error, cbs);
};
