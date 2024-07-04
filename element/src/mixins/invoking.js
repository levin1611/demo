import util from '@/libs/util';
import store from '../store';

// 混入， 现在只做了线索相关的通知，感觉可以把其他地方的通知也提取出来 -- 之前myclue和clueDetail还有公海，全部都写了这个，感觉太冗余了
export default {
    methods: {
        /* 系统通知 */
        // relationObjType;关联对象类型：1线索，2询盘，3客户，4跟进状态
        // effectActionType;生效机制：1创建，2编辑，3转移，4分享
        invoking({ data, id, effectActionType }) {
            const ids = id.split(',');
            ids.forEach((id, index) => {
                const jsonData = {
                    orgId: this.enterpriseId,
                    fullname: this.fullName,
                    relationObjType: 1,
                    effectActionType,
                    fcolumnValue: { id }
                };
                util.ajaxJson({
                    url: '/rule/message/invoking',
                    method: 'post',
                    data: jsonData
                }).then(res => {
                    if (res.data.code === '1') {
                        const remindList = res.data.data;
                        remindList.map(async item => {
                            let userIds = [];
                            if (item.recipientType == 1) {
                                item.recipientList.forEach(element => {
                                    switch (element) {
                                        case '1':
                                            // 销售
                                            if (data.saleId) {
                                                userIds.push(String(data.saleId));
                                            }
                                            break;
                                        case '3':
                                            // 录入人员
                                            if (data.createUserId[index]) {
                                                userIds.push(String(data.createUserId[index]));
                                            }
                                            break;
                                    }
                                });
                                // 客服
                                if (item.recipientList.indexOf('2') !== -1) {
                                    if (Array.isArray(data.serviceId) && data.serviceId[index]) {
                                        const id = await this.getUserId(data.serviceId[index]);
                                        if (id.data.code) {
                                            userIds.push(`${id.data.data}`);
                                        }
                                    }
                                }
                            } else {
                                userIds = item.recipientList;
                            }
                            if (userIds.length > 0) {
                                this.saveRemind(userIds, item.remindContent, jsonData, item.isGongHai);
                            }
                        });
                    }
                });
            });
        },
        getUserId(accId) {
            return util.ajax({
                url: 'new-privilege/user/getUserIdByAccId',
                method: 'get',
                params: {
                    accId
                }
            });
        },
        sendMessage(userIds, text, jsonData) {
            const postData = Object.assign({
                userIds,
                text,
                messageType: 'systemNotice'
            }, jsonData);
            console.log(postData, text, jsonData);
            store.dispatch('sendWSMsg', postData);
        },
        saveRemind(userIdList, remindContent, jsonData, isGongHai) {
            console.log(userIdList);
            userIdList = [...new Set(userIdList)];
            userIdList = userIdList.filter(item => {
                return item != this.userId;
            });
            const postData = {
                userIdList,
                orgId: this.enterpriseId,
                remindContent,
                relationObjType: 1,
                seqId: jsonData.fcolumnValue.id,
                isGongHai
            };
            console.log(postData);
            util.ajaxJson({
                url: '/new-privilege/msgRemind/save',
                method: 'post',
                data: postData
            }).then(res => {
                if (res.data.code === '1') {
                    this.sendMessage(userIdList, remindContent, jsonData);
                }
            });
        }
    }
};
