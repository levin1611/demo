import i18n from '@/locale';
import { createFormRules } from '@/utils/form-rules.js';
// 设置默认的校验 字符串数组长度等等
export const ruleMessage = {
    email: {
        validator: createFormRules.init([{
            t: 'isEmpty',
            m: i18n.t('crm.Modal.error_emptyEmail')
        }, {
            t: 'isEmail',
            m: i18n.t('crm.Modal.error_emailFormat')
        }])
    },
    nickName: {
        validator: createFormRules.init([{
            t: 'isEmpty',
            m: i18n.t('crm.Modal.error_emptyNickName')
        }])
    }
};
