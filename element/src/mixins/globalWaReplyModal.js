/**
 * @Description: 打开全局(Main.vue)的 wa 回复框
 * @author 汤一飞
 */

import { waNumberValidCheck } from '@/api/whatsapp';

export default {
    methods: {
        // 打开 wa 回复框
        async openGlobalWaReplyModal(waAccount, e, userBindWaAccount, otherInfoObj = {}) {
            // 如果已经被去掉了可点击效果(class: header-source), 则不往下执行
            // if (!e.target.classList.contains('header-source')) {
            //     return;
            // }

            // 检查 wa 号码是否有效
            const realWaNumber = await this.validCheck(waAccount);
            if (!realWaNumber) {
                // 未通过有效性校验

                // 去掉可点击效果
                // e.target.classList.remove('header-source');

                // 停止向下执行
                return;
            }

            // 拿到真实号码后, 重新处理 localStorage 中要插入到回复框输入框的数据
            try {
                let insertData = localStorage.getItem('leadsCloud-WA-insertData');
                if (insertData) {
                    insertData = JSON.parse(insertData);
                    if (insertData[waAccount]) {
                        localStorage.setItem('leadsCloud-WA-insertData', JSON.stringify({ [realWaNumber]: insertData[waAccount] }));
                    }
                }
            } catch (e) {
            }

            // 打开全局回复框
            this.$store.commit('updateGlobalWaReplyModal', {
                talkObj: {
                    contactsName: '',
                    eventCustomVar: {
                        toWaAccount: realWaNumber,
                        userBindWaAccount
                    }
                },
                ...otherInfoObj
            });
        },
        // wa 号码有效性校验
        validCheck(waAccount) {
            return waNumberValidCheck({
                orgId: this.enterpriseId,
                userId: this.userId,
                chatWaAccount: waAccount
            }).then(res => {
                if (res.code === 1) {
                    if (res.data === 200) {
                        // data==200 时, message 字段的值为真实的 whatsapp 号码, 为空则返回之前的号码

                        // 如果接口返回了"真实 wa 号码", 且与"页面内 wa 号码"不一致, 则弹出提示, 提示用户修改(产品直说 CRM 里点击校验号码时给这个提示)
                        if (res.message && (res.message.replace(/[^\d]/g, '') !== waAccount.replace(/[^\d]/g, ''))) {
                            this.$Message.success(this.$t('waNumberSearch.tip_needCheckWaAccount').replace('$realWaNumber', res.message));
                        }

                        // 返回"真实 wa 号码"或"页面内 wa 号码"
                        return res.message || waAccount;
                    } else if ([400, 501].includes(res.data)) {
                        // 没有可用于校验号码有效性的 wa 账号

                        // 弹出提示
                        this.$Message.warning(this.$t('waNumberSearch.error_noValidWaAccountForCheck'));

                        // 返回原始账号, 继续打开回复框, 之后由回复框处理是跳转 wa 界面(仅有 waba 账号), 还是显示二维码(无有效账号)
                        return waAccount;
                    } else if (res.data === 502) {
                        // 不能频繁校验

                        // 弹出提示
                        this.$Message.warning(this.$t('waNumberSearch.tip_validCheckFrequently'));

                        // 返回 null
                        return null;
                    } else {
                        // 弹出无效提示
                        this.$Message.error(this.$t('waNumberSearch.error_waNumberInvalid'));

                        // 返回 null
                        return null;
                    }
                } else if (res.code === 0) {
                    // 提示用户需要重新登录
                    this.$Message.error(this.$t('waNumberSearch.tip_needReLoginToCheck'));
                    return null;
                } else {
                    this.$Message.error(this.$t('waNumberSearch.error_waNumberInvalid'));
                    return null;
                }
            });
        }
    }
};
