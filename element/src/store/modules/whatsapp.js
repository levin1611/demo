import util from '@/libs/util';
import i18n from '@/locale';
import { router } from '@/router/index';
import { Notification, Message } from 'element-ui';
import Vue from 'vue';
export default {
    state: {
        // wa 是否可以发送消息的全局阈值
        waSendMsgFlag: false,
        // 将智能物料内容插入到输入框中
        smartFileObj: null,
        // 消息发送失败的值
        msgSendErr: false,
        // whatsapp管理,当前选中的tab
        currentTab: 'chatManagement',
        // 当前登陆并选中的whatsapp号码
        currentWhatsappAccount: null,
        // 选中当前会话chatAccount(会话列表联系人的号码)
        selectChatAccount: null,
        // 未发送的wa消息
        unSendChatMessage: {},
        // 当前 userId 所有 wa 账号的未读数, 分 account 存储
        waUnreadObj: {},
        // 分发给 whatsapp 系统处理的最新一条 websocket message
        websocketMsgWA: null,
        // 是否开启"查看下属"功能
        ableViewSub: false,
        // 当前正在查看的下属的 wa 账号信息, 没有查看下属则置为 null
        viewingSubWA: null,
        isFirstSendMessage: false, // 第一次接收消息、发送消息的状态
        WAIsMd: false,
        // 跳转到 wa 页面带的筛选条件, 包括 userBindWaAccount, whatsappAccount 等
        jumpWaConObj: null,
        // wa 二维码版本, 0 多设备测试版、1 精简版、2 混合版
        waQrCodeType: 0,
        // 询盘云 window 是否发生点击事件 -> whatsapp 网页版在 iframe 失焦时会自动重新获取焦点, 影响询盘云元素聚焦/输入
        winMouseDownFlag: false,
        // wa同屏查看下属管理的未读数量
        managaSuborUnreadStatus: 0
    },
    mutations: {
        setWaSendMsgFlag(state, data) {
            state.waSendMsgFlag = data;
        },
        setSmartFile(state, data) {
            state.smartFileObj = data;
        },
        // 设置消息发送失败
        setMsgSendErr(state, data) {
            state.msgSendErr = data;
        },
        // whatsapp管理设置当前选中的tab
        setCurrentTab(state, data) {
            state.currentTab = data;
        },
        // 设置当前选中的whatsapp号码
        setCurrentWhatsappAccount(state, data) {
            state.currentWhatsappAccount = data;
            if (!state.unSendChatMessage.hasOwnProperty(state.currentWhatsappAccount)) {
                state.unSendChatMessage[state.currentWhatsappAccount] = {};
            }
        },
        // 设置当前选中的会话联系人号码
        setSelectChatAccount(state, data) {
            state.selectChatAccount = data;
        },
        // 设置当前选中的会话
        setUnsendMessages(state, data) {
            try {
                if (data === 'clear') {
                    state.unSendChatMessage = {};
                } else if (state.currentWhatsappAccount) {
                    state.unSendChatMessage[state.currentWhatsappAccount][state.selectChatAccount] = data;
                }
            } catch (error) {
                console.error('设置当前选中的会话error', error);
            }
        },
        // 更新未读数对象
        setWAUnreadCount(state, data) {
            // 传入空值, 清除数据, 退出流程
            if (!data) {
                state.waUnreadObj = {};
                return;
            }

            // 传入对象, 进行数据处理更新未读数对象
            if (data instanceof Object) {
                // 暂存结果
                const result = Object.assign({}, state.waUnreadObj);
                // 数据处理
                Object.entries(data).forEach(([account, value]) => {
                    // 传入整数, 直接赋值
                    if (Number.isInteger(value)) {
                        result[account] = value;
                        return;
                    }

                    // 如果无值, 从未读数对象中删除该账号
                    // 注意, 不包括 0, 要求整个未读数对象是对应账号列表的, 某个账号未读数为 0 也不应从未读数数据中去掉
                    if (!value) {
                        delete result[account];
                        return;
                    }

                    // 如果是传的是数字型整数字符串, 则进行累加
                    if (/^[+-]?\d+$/.test(value)) {
                        const addCount = Number(value);

                        // 传入整数, 进行累加
                        if (result.hasOwnProperty(account)) {
                            result[account] += addCount;
                        } else {
                            result[account] = 0 + addCount;
                        }

                        // 不允许出现负数
                        if (result[account] < 0) {
                            result[account] = 0;
                        }
                    }
                });
                // 重新赋值
                state.waUnreadObj = result;
            }
        },
        // 设置分发给 whatsapp 处理的最新一条 websocket message
        setWebsocketMsgWA(state, data) {
            state.websocketMsgWA = data;
        },
        // 设置是否开启"查看下属"功能
        setAbleViewSub(state, data) {
            state.ableViewSub = data;
        },
        // 当前正在查看的下属的 wa 账号信息
        setViewingSubWA(state, data) {
            state.viewingSubWA = data;
        },
        setWAIsMd(state, data) {
            state.WAIsMd = data;
        },
        // 设置"跳转到 wa 界面相关条件"
        setJumpWaConObj(state, data) {
            state.jumpWaConObj = data;
        },
        // 设置 wa 二维码斑斑
        setWaQrCodeType(state, data) {
            state.waQrCodeType = data;
        },
        // 变更"询盘云 window 是否发生点击事件"标识
        toggleWinMouseDownFlag(state) {
            state.winMouseDownFlag = !state.winMouseDownFlag;
        },
        // 修改 同屏查看下属的消息未读数量
        setManagaSuborUnreadStatus(state, data) {
            state.managaSuborUnreadStatus = state.managaSuborUnreadStatus + data;
        },
        // 修改 同屏查看下属的消息未读数量 改为0
        setManagaSuborUnreadZero(state, data) {
            state.managaSuborUnreadStatus = data;
        }
    },
    getters: {
        // 是否已打开侧滑页
        WAUnreadCount: state => {
            let result = 0;
            Object.values(state.waUnreadObj).forEach(item => {
                result += item;
            });
            return result > 0 ? result : 0;
        }
    },
    actions: {
        // 获取wa账号头像
        getWaAvatar({ commit }, data) {
            // 只是发送一个向后端请求头像的请求,后端会从websocket中一一返回头像数据
            util.ajaxWAJson({
                url: '/whatsapp/contact/getAvatar',
                method: 'POST',
                data
            });
        },
        // 处理 websocket 推送过来的关于 WhatsApp 的消息
        receiveWSMsg_whatsApp({ state, commit, dispatch, rootState }, msgData) {
            if (msgData.whatsappAccountWebsocketCondition && !msgData.whatsappAccountWebsocketCondition.fromMe && msgData.WaWebsocketMessageType === 3) {
                /**
                 * @Description: WA上线，右下角弹窗通知恢复，去掉条件false
                 * @author 杨娣
                 * @date 2020/4/22
                 */
                const fromAccountInfo = msgData.whatsappAccountWebsocketCondition;
                /* 收到WA的消息推送 */
                if (!fromAccountInfo) {
                    // 非收到WA新消息的推送，无需执行下方的右下角通知逻辑和右上角未读加1逻辑
                    return false;
                }

                // 消息对应的 wa 账号
                const msgAccount = fromAccountInfo.userBindWaAccount;
                if (msgAccount) {
                    const updateObj = {};
                    updateObj[msgAccount] = '+1';
                    commit('setWAUnreadCount', updateObj);
                }
                let aiteTootips = fromAccountInfo.lastChatContent;
                // 处理 @消息 将@+号码回显为@+群成员昵称
                if (fromAccountInfo.extendedJson || fromAccountInfo.extendedJsonLableMentions) {
                    try {
                        let extendData;
                        if (fromAccountInfo.extendedJson) {
                            extendData = typeof fromAccountInfo.extendedJson === 'object' ? fromAccountInfo.extendedJson : JSON.parse(fromAccountInfo.extendedJson);
                        } else if (fromAccountInfo.extendedJsonLableMentions) {
                            extendData = JSON.parse(fromAccountInfo.extendedJsonLableMentions);
                        }
                        // 处理@群成员消息 将群成员号码格式化为群成员昵称
                        // 历史消息字段

                        if (extendData.mentions) {
                            this.mentions = extendData.mentions;
                            Object.keys(extendData.mentions).forEach(key => {
                                const reg = new RegExp(`@${key}`, 'g');
                                aiteTootips = aiteTootips.replace(reg, `@${extendData.mentions[key]}`);
                            });
                        };
                    } catch (e) {
                        console.log(e);
                        console.error('处理@群成员消息 将群成员号码格式化为群成员昵称aiteTootips');
                    }
                }
                switch (Number(fromAccountInfo.type)) {
                    case 1:
                        console.log(aiteTootips, 'aiteTootips');
                        dispatch('otherNotice', {
                            originalObj: msgData,
                            fromNick: (fromAccountInfo.nickName || '') + fromAccountInfo.fromWaAccount,
                            text: aiteTootips || fromAccountInfo.lastChatContent,
                            tip: i18n.t('main.noticeWANick'),
                            type: 13,
                            currentPath: router.currentRoute.name
                        });
                        break;
                    case 2:
                        dispatch('otherNotice', {
                            originalObj: msgData,
                            fromNick: (fromAccountInfo.nickName || '') + fromAccountInfo.fromWaAccount,
                            text: '您收到了一张图片',
                            tip: i18n.t('main.noticeWANick'),
                            type: 13,
                            currentPath: router.currentRoute.name
                        });
                        break;
                    case 3:
                    case 5:
                        dispatch('otherNotice', {
                            originalObj: msgData,
                            fromNick: (fromAccountInfo.nickName || '') + fromAccountInfo.fromWaAccount,
                            text: '您收到了一个文件',
                            tip: i18n.t('main.noticeWANick'),
                            type: 13,
                            currentPath: router.currentRoute.name
                        });
                        break;
                    case 4:
                        dispatch('otherNotice', {
                            originalObj: msgData,
                            fromNick: (fromAccountInfo.nickName || '') + fromAccountInfo.fromWaAccount,
                            text: '您收到了一个视频',
                            tip: i18n.t('main.noticeWANick'),
                            type: 13,
                            currentPath: router.currentRoute.name
                        });
                        break;
                    default:
                        dispatch('otherNotice', {
                            originalObj: msgData,
                            fromNick: (fromAccountInfo.nickName || '') + fromAccountInfo.fromWaAccount,
                            text: '您收到了一条消息，请到手机版WhatsApp查看',
                            tip: i18n.t('main.noticeWANick'),
                            type: 13,
                            currentPath: router.currentRoute.name
                        });
                }
            }

            // 收到 wa 联系人导出文件生成完毕消息
            if (msgData.WaWebsocketMessageType === 12) {
                // 触发系统通知更新
                commit('changeSystemNoticeFlag');

                // 拼接弹出提示 HTML 内容
                // 提示内容
                let message = i18n.t('whatsapp_manage.exportContactEndTip').replace('$fileName', msgData.fileName);
                // 下载按钮
                message += `\n<div style="text-align: right">
    <a href="${msgData.url}" download="${msgData.fileName}" class="piwik_whatsapp_downloadContactDoc">${i18n.t('whatsapp_manage.downloadNow')}</a>
</div>`;

                // 弹出提示
                setTimeout(() => {
                    Notification({
                        title: i18n.t('whatsapp_manage.exportContactEnd'),
                        message: message,
                        iconClass: 'el-icon-success',
                        customClass: 'wa-export-contact-notify',
                        dangerouslyUseHTMLString: true,
                        duration: 0
                    });
                }, 1500);
            }


            // 删除、撤回消息时的websocket通知
            if (msgData.WaWebsocketMessageType === 19) {
                console.error('删除、撤回消息时的websocket通知', msgData);
                dispatch('otherNotice', {
                    originalObj: msgData,
                    fromNick: msgData.whatsappAccountWebsocketCondition.lastChatContent,
                    text: '',
                    tip: i18n.t('main.noticeWANick'),
                    type: 13,
                    currentPath: router.currentRoute.name
                });
            }
            // 收到wa同步联系人昵称的通知  23 代表扫码完成 隐藏弹窗 24 代表 昵称同步完成  uuid以md结尾的才会执行这个逻辑
            if (msgData.WaWebsocketMessageType === 23) {
                console.log('ytpeis23', msgData);
                Vue.prototype.$EVENTBUS.$emit('closeWaSyncDialog', true);
                Message.success(i18n.t('main.syncIngPlzWait'));
            }
            if (msgData.WaWebsocketMessageType === 24 && msgData.syncCompletionNotice) {
                console.log('ytpeis24', msgData);
                const uuid = msgData.syncCompletionNotice.uuid;
                console.log(uuid.endsWith('md'),'uuidendwith');
                if (uuid && uuid.endsWith('md')) {
                    // let message = i18n.t('whatsapp_manage.exportContactEndTip');
                    const message = i18n.t('main.noticeWAsyncNick');
                    // 弹出提示
                    Notification({
                        title: i18n.t('main.Scancodesynchronize'),
                        message: message,
                        // iconClass: 'el-icon-success',
                        // customClass: 'wa-export-contact-notify',
                        dangerouslyUseHTMLString: true,
                        duration: 0
                    });
                }
            }

            // 非查看下属模式, 则传递最新 ws 消息给各个组件
            if (!state.viewingSubWA) {
                commit('setWebsocketMsgWA', msgData);
            }
        }
    }
};
