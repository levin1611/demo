import util from '@/libs/util';
import i18n from '@/locale';

/** 请求crm输入上限 */
export function getCRMFieldAPI({ state, commit }) {
    util.ajax({
        url: '/new-privilege/formFieldConfig/getListForClient',
        method: 'get',
        params: {
            serviceFlag: 'save_inquiry',
            orgId: state.enterpriseId
        }
    }).then(response => {
        if (response.data.code === '1') {
            commit('setFieldLimit', {
                crmCompany: response.data.data.crm_company || {},
                crmContacts: response.data.data.crm_contacts || {},
                crmInquiry: Object.assign({
                    transactionMoney: {
                        fieldKey: 'transactionMoney',
                        usableLength: 200
                    },
                    transactionInfo: {
                        fieldKey: 'transactionInfo',
                        usableLength: 4000
                    }
                }, response.data.data.crm_inquiry || {})
            });
        } else {
            commit('setFieldLimit', {
                crmCompany: {},
                crmContacts: {},
                crmInquiry: {
                    transactionMoney: {
                        fieldKey: 'transactionMoney',
                        usableLength: 200
                    },
                    transactionInfo: {
                        fieldKey: 'transactionInfo',
                        usableLength: 4000
                    }
                }
            });
            console.error('获取字段长度上限失败');
        }
    }).catch(e => {
        console.error('获取字段长度上限失败');
        console.error(e);
        commit('setFieldLimit', {
            crmCompany: {},
            crmContacts: {},
            crmInquiry: {
                transactionMoney: {
                    fieldKey: 'transactionMoney',
                    usableLength: 200
                },
                transactionInfo: {
                    fieldKey: 'transactionInfo',
                    usableLength: 4000
                }
            }
        });
    });
};
// 获取全部销售人员
export function getSalesList({ state, commit }) {
    const data = {
        orgId: state.enterpriseId
    };
    this._vm.$commonApi.getSaleUserList(data).then(response => {
        if (response.code === 10000) {
            commit('setSalesList', response.data);
        }
    });
};
// 获取全部用户
export function getAllUsers({ state, commit }) {
    const data = {
        orgId: state.enterpriseId
    };
    this._vm.$commonApi.getUserInfoList(data).then(response => {
        if (response.code === 10000) {
            commit('setAllUsers', response.data);
        }
    });
};
// 获取跟进方式
export function getFollowUpType({ state, commit }) {
    const data = {
        orgId: state.enterpriseId,
        typeId: 14
    };
    this._vm.$commonApi.getFollowUpList(data).then(response => {
        if (response.code === '1') {
            const disableList = response.data.filter((item) => item.isAvailable !== 1);
            const arr = response.data.filter((item) => item.isAvailable === 1);
            const list = arr.concat(disableList).map((item) => {
                item.label = item.attrName;
                item.value = item.attrTypeValue < 10 ? `0${item.attrTypeValue}` : String(item.attrTypeValue);
                item.disabled = item.isAvailable !== 1;
                return item;
            });
            commit('setFollowUpType', list);
        }
    });
};
// 获取下拉框数据
export async function getSelectOptions({ state, commit }) {
    const data = {
        orgId: state.enterpriseId
    };
    try {
        const response = await this._vm.$commonApi.getField(data);
        if (response.code === '1') {
            // 存放原始下拉选项
            const selectOptions = response.data;
            if (selectOptions.followUp) {
                selectOptions.followUp.unshift({
                    isAvailable: 1,
                    attrId: 0,
                    sort: 0,
                    typeId: 7,
                    attrName: i18n.t('crm.UniSet.defaultFollowUpStatus_inquiry')
                });
            }
            commit('setSelectOptions', selectOptions);
        }
    } catch (error) {
        // Handle error
    }
};
