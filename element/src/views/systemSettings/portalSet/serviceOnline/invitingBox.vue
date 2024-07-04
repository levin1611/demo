<template>
    <div class="container">
        <div style="margin-top:18px;">
            <div class="item">
                <span class="item-tip">{{$t('portal_set.invite_func')}}</span>
                <el-switch v-model="invite"></el-switch>
            </div>
            <div class="item">
                <span class="item-tip">{{$t('portal_set.pattern_select')}}</span>
                <RadioGroup v-model="pattern">
                    <Radio size="large" label="1">
                        <span>{{$t('portal_set.pattern1')}}</span>
                    </Radio>
                    <Radio size="large" label="2">
                        <span>{{$t('portal_set.pattern2')}}</span>
                    </Radio>
                </RadioGroup>
            </div>
            <div class="item">
                <span class="item-tip">{{$t('portal_set.interval')}} </span>
                <Select v-model="timeInterval" style="width:100px">
                    <Option v-for="item in times" :value="item.value" :key="item.value">{{ item.label }}</Option>
                </Select>
            </div>
            <div class="item">
                <span class="item-tip">{{$t('portal_set.limit_frequency')}} </span>
                <InputNumber v-model="frequency" :disabled="freqDisabled" :min="0"></InputNumber>
                <span style="margin-right: 10px">{{$t('portal_set.per_visitor')}}</span>
                <Button type="success" @click="freqDisabled = !freqDisabled">
                    {{freqDisabled ? $t('portal_set.on') : $t('portal_set.off')}}
                </Button>
            </div>
            <!-- 背景颜色 -->
            <div class="item">
                <span class="item-tip">{{$t('portal_set.bgcolor')}} </span>
                <!-- 颜色选择 -->
                <div class="item-color-pick">
                    <span v-for="(color,index) in colors" :key="index" @click="bgColor=color"
                          class="color-circle-out middle "
                          :class="bgColor==color?'boxshadow': '' ">
                  <!-- <span class="color-circle-in" :class=" 'color'+(index+1) "></span> -->
                        <span class="color-circle-in" :style="'backgroundColor:'+color"></span>
                    </span>
                    <ColorPicker class="color-pick-plug-in" v-model="bgColor" :colors="colors"/>
                </div>
            </div>
            <!-- 接受按钮颜色 -->
            <!--<div class="item">-->
            <!--    <span class="item-tip">{{$t('portal_set.accept_color')}} </span>-->
            <!--    &lt;!&ndash; 颜色选择 &ndash;&gt;-->
            <!--    <div class="item-color-pick">-->
            <!--            <span v-for="(color,index) in colors" :key="index" @click="receiveColor=color"-->
            <!--                  class="color-circle-out middle " :class="receiveColor==color?'boxshadow': '' ">-->
            <!--  &lt;!&ndash; <span class="color-circle-in" :class=" 'color'+(index+1) "></span> &ndash;&gt;-->
            <!--            <span class="color-circle-in" :style="'backgroundColor:'+color"></span>-->
            <!--        </span>-->
            <!--        <ColorPicker class="color-pick-plug-in" v-model="receiveColor" :colors="colors"/>-->
            <!--    </div>-->
            <!--</div>-->
            <!-- 拒绝按钮颜色 -->
            <!--<div class="item">-->
            <!--    <span class="item-tip">{{$t('portal_set.reject_color')}} </span>-->
            <!--    &lt;!&ndash; 颜色选择 &ndash;&gt;-->
            <!--    <div class="item-color-pick">-->
            <!--            <span v-for="(color,index) in colors" :key="index" @click="rejectColor=color"-->
            <!--                  class="color-circle-out middle " :class="rejectColor==color?'boxshadow': '' ">-->
            <!--  &lt;!&ndash; <span class="color-circle-in" :class=" 'color'+(index+1) "></span> &ndash;&gt;-->
            <!--            <span class="color-circle-in" :style="'backgroundColor:'+color"></span>-->
            <!--        </span>-->
            <!--        <ColorPicker class="color-pick-plug-in" v-model="rejectColor" :colors="colors"/>-->
            <!--    </div>-->
            <!--</div>-->
            <div class="item">
                <span class="item-tip">{{$t('portal_set.words')}} </span>
                <Input v-model="description" :disabled="desEdit? false:true " style="max-width:420px;">
                    <Button slot="append" @click="desEdit = true" icon="custom custom-edit"></Button>
                </Input>
            </div>
            <div class="item">
                <span class="item-tip">{{$t('portal_set.accept_words')}} </span>
                <Input v-model="receiveWords" :disabled="recWordsEdit? false:true " style="max-width:420px;">
                    <Button slot="append" @click="recWordsEdit = true" icon="custom custom-edit"></Button>
                </Input>
            </div>
            <div class="item">
                <span class="item-tip">{{$t('portal_set.reject_words')}} </span>
                <Input v-model="rejectWords" :disabled="rejWordsEdit? false:true " style="max-width:420px;">
                    <Button slot="append" @click="rejWordsEdit = true" icon="custom custom-edit"></Button>
                </Input>
            </div>
            <Button type="primary" @click="updateData()">{{$t('save')}}</Button>
        </div>

        <!-- 预览区域 -->
        <div class="preview">
            <p style="text-align: center;">{{ $t('portal_set.preview') }}</p>
            <!-- 样式一 -->
            <div id="main">
                <div id="dialog" :style="'backgroundColor:'+bgColor">
                    <p class="dialog-close" style="margin:0">
                        <a class="xhl-dialog-close-button" href="javascript:;"></a>
                    </p>
                    <div style="padding: 10px">
                        <p style="margin-top:0;color: #fff;"
                           class="xhl-dialog-content">{{ description }}</p>
                    </div>
                    <div>
                        <div :style="`color: ${bgColor}`"
                             class="contactBtn ">{{ receiveWords }}</div>
                        <div class="cancelBtn ">{{ rejectWords }}</div>
                    </div>
                </div>
            </div>
            <p style="text-align: center;margin-bottom: 60px;">{{ $t('portal_set.pattern1') }}</p>
            <!-- 样式二 -->
            <div id="main2" :style="'backgroundColor:'+bgColor">
                <p class="dialog-close" style="margin:0">
                    <a class="xhl-dialog-close-button" href="javascript:;"></a>
                </p>
                <div id="dialog1">
                    <div>
                        <p style="margin:0 80px 20px 0;color: #fff;"
                           class="xhl-dialog-content">{{ description }} </p>
                        <div :style="`color: ${bgColor}`"
                             class="yesBtn xhl-dialog-contact-btn">{{ receiveWords }}</div>
                        <div class="noBtn xhl-dialog-cancel-btn">{{ rejectWords }}</div>
                        <div style="clear: both"></div>
                    </div>
                </div>
            </div>
            <p style="text-align: center;">{{ $t('portal_set.pattern2') }}</p>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        computed: {
            ...mapState([
                'enterpriseId'
            ])
        },
        props: [
            'currView',
            'toView',
            'onlineData',
            'service',
            'defaultStatus',
            'chatPosition',
            'currDomain'
        ],
        data() {
            return {
                inviteData: {},
                invite: true, /* 邀请框 */
                pattern: '1', /* 样式选择 */
                times: [/* 时间间隔选择框数据 */
                    { value: 10, label: '10s' },
                    { value: 20, label: '20s' },
                    { value: 30, label: '30s' },
                    { value: 40, label: '40s' },
                    { value: 50, label: '50s' },
                    { value: 60, label: '60s' }
                ],
                timeInterval: 30, /* 时间间隔 */
                frequency: 0, /* 频次限制 */
                freqDisabled: true, /* 频次限制是否禁用  true是禁用 */
                colors: ['#45619D', '#4285F4', '#15C5D4', '#00CC99', '#7B66EE', '#FA8241', '#FBBC04'],
                bgColor: '#45619D', /* 背景颜色 */
                receiveColor: '#45619D', /* 接受对话颜色 */
                rejectColor: '#45619D', /* 拒绝对话颜色 */
                description: 'Chat with us for getting more information about our products and service', /* 描述 */
                desEdit: false,
                receiveWords: 'Chat Now',
                recWordsEdit: false,
                rejectWords: 'Chat Later',
                rejWordsEdit: false
            };
        },
        methods: {
            /* 获取邀请框相关信息 */
            getInviteData() {
                util.ajaxInternational({
                    url: '/visitor-chat/invite/getByOrgId',
                    method: 'get',
                    params: {
                        orgId: this.enterpriseId,
                        operationType: 1,
                        website: this.currDomain
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        this.inviteData = res.data.data;
                        // this.receiveColor = res.data.data.acceptButtonColor;
                        this.receiveWords = res.data.data.acceptButtonText;
                        this.bgColor = res.data.data.bgColor;
                        this.pattern = `${res.data.data.displayStyle}`;
                        this.invite = res.data.data.enable === 1;
                        this.freqDisabled = res.data.data.hasFrequencyLimit !== 1;
                        this.frequency = res.data.data.frequencyLimit;
                        // this.rejectColor = res.data.data.refuseButtonColor;
                        this.rejectWords = res.data.data.refuseButtonText;
                        this.description = res.data.data.textDescription;
                        this.timeInterval = res.data.data.timeInterval;
                    }
                });
            },
            updateData() { /* 保存数据 */
                // 数据校验
                if (this.description.length > 96) {
                    this.$Message.error(`【${this.$t('portal_set.words')}】 ${this.$t('authority.userManagement.maxLengthLimit')}96`);
                    return;
                }
                const postData = {
                    orgId: this.enterpriseId,
                    displayStatus: this.defaultStatus,
                    windowPosition: this.chatPosition,
                    id: this.inviteData.id,
                    onlineId: this.onlineData.id,
                    enable: this.service ? 1 : 2,
                    enableInvite: this.invite ? 1 : 2,
                    displayStyle: Number(this.pattern), /* 字符串转数字 */
                    timeInterval: this.timeInterval,
                    frequencyLimit: this.frequency,
                    hasFrequencyLimit: this.freqDisabled ? 2 : 1,
                    bgColor: this.bgColor,
                    // acceptButtonColor: this.receiveColor,
                    // refuseButtonColor: this.rejectColor,
                    textDescription: this.description,
                    acceptButtonText: this.receiveWords,
                    refuseButtonText: this.rejectWords,
                    operationType: 1,
                    website: this.currDomain
                };
                if (postData.id) {
                    util.ajaxInternational({
                        url: '/visitor-chat/invite/update',
                        method: 'post',
                        data: postData
                    }).then(res => {
                        if (res.data.code === '1') {
                            // 更新外部 onlineData 数据
                            this.$emit('update:onlineData', Object.assign({}, this.onlineData, {
                                displayStatus: res.data.data.displayStatus,
                                windowPosition: res.data.data.windowPosition,
                                enable: res.data.data.enable
                            }));

                            // enable 和 enableInvite 避免混淆
                            this.inviteData = Object.assign(res.data.data, {
                                enable: res.data.data.enableInvite
                            });
                            this.saveTranslate();
                            this.$Message.success(this.$t('saveSuccess'));
                        } else {
                            this.$Message.error(this.$t('saveFail'));
                        }
                    });
                } else {
                    util.ajaxInternational({
                        url: '/visitor-chat/invite/save',
                        method: 'post',
                        data: postData
                    }).then(res => {
                        if (res.data.code === '1') {
                            /**
                             * @Description: 理论上这里应该更新 onlineData , 但后端告诉我, save 接口并没有保存和返回 onlineData 相关的设置信息
                             * 但是, 现在新建网站, inviteData 直接就有 id 了, 因此, save 接口不会被调用, 此处代码不用管了
                             * @author 汤一飞
                             * @date 2023/2/27
                             */
                            // // 更新外部 onlineData 数据
                            // this.$emit('update:onlineData', Object.assign({}, this.onlineData, {
                            //     displayStatus: res.data.data.displayStatus,
                            //     windowPosition: res.data.data.windowPosition,
                            //     enable: res.data.data.enable
                            // }));
                            //
                            // // enable 和 enableInvite 避免混淆
                            // this.inviteData = Object.assign(res.data.data, {
                            //     enable: res.data.data.enableInvite
                            // });

                            this.inviteData = res.data.data;
                            this.saveTranslate();
                            this.$Message.success(this.$t('saveSuccess'));
                        } else {
                            this.$Message.error(this.$t('saveFail'));
                        }
                    });
                }
            },
            saveTranslate() {
                util.ajaxJson({
                    url: '/cuss-login/translate/save',
                    method: 'post',
                    data: JSON.stringify({
                        orgId: this.enterpriseId,
                        textList: [this.description, this.receiveWords, this.rejectWords],
                        dest: 'zh_cn'
                    })
                }).then(res => {});
            },

            // 检查数据较原始数据是否变更
            checkIsChanged() {
                // 当前编辑信息
                const currObj = {
                    receiveWords: this.receiveWords,
                    bgColor: this.bgColor,
                    pattern: this.pattern,
                    invite: this.invite,
                    freqDisabled: this.freqDisabled,
                    frequency: this.frequency,
                    rejectWords: this.rejectWords,
                    description: this.description,
                    timeInterval: this.timeInterval
                };
                // 原始信息
                const oldObj = {
                    receiveWords: this.inviteData.acceptButtonText || 'Chat Now',
                    bgColor: this.inviteData.bgColor || '#45619D',
                    pattern: `${this.inviteData.displayStyle || '1'}`,
                    invite: this.inviteData.enable ? this.inviteData.enable === 1 : true,
                    freqDisabled: this.inviteData.hasFrequencyLimit ? this.inviteData.hasFrequencyLimit !== 1 : true,
                    frequency: this.inviteData.frequencyLimit || 0,
                    rejectWords: this.inviteData.refuseButtonText || 'Chat Later',
                    description: this.inviteData.textDescription || 'Chat with us for getting more information about our products and service',
                    timeInterval: this.inviteData.timeInterval || 30
                };

                // 如果当前比外部 Tab 切换还要高一级, 是"客服在线/离线"切换, 则需要把外部设置页纳入比较范围
                if (this.toView === 'ServiceOffline') {
                    currObj.defaultStatus = this.defaultStatus;
                    currObj.chatPosition = this.chatPosition;
                    currObj.service = this.service;

                    oldObj.defaultStatus = `${this.onlineData.displayStatus}`;
                    oldObj.chatPosition = `${this.onlineData.windowPosition}`;
                    oldObj.service = this.onlineData.enable === 1;
                }

                // 返回 Boolean
                return JSON.stringify(currObj) !== JSON.stringify(oldObj);
            },
            // 显示离开前确认框
            showLeaveConfirm(func_confirm, func_cancel) {
                // 打开离开确认框
                this.$confirm(this.$t('portal_set.tip_cancelEditSetting'), this.$t('portal_set.title_cancelEditSetting'), {
                    customClass: 'leaveConfirmMsgBox'
                }).then(func_confirm).catch(func_cancel);
            }
        },
        created() {
            this.getInviteData();
        },
        watch: {
            description: {
                handler(val) {
                    if (val && val.length > 96) {
                        this.description = val.slice(0, 96);
                        this.$Message.error(`【${this.$t('portal_set.words')}】 ${this.$t('authority.userManagement.maxLengthLimit')}96`);
                    }
                },
                immediate: true
            },
            // 监听外部传入的"要跳转到的其他组件"
            toView: {
                handler(val) {
                    // 定义当前 view name
                    const ownViewName = 'InvitingBox';
                    // 如果当前 view 就是自身, 且要跳转到的 view 不是, 说明切换了 tab
                    if (this.currView === ownViewName && val && val !== ownViewName) {
                        // 检查数据是否发生编辑过
                        const isChanged = this.checkIsChanged();

                        if (!isChanged) {
                            // 数据未变化

                            // 直接更新
                            this.$emit('update:currView', val);
                        } else {
                            // 数据有变化

                            // 弹出确认跳转提示框
                            this.showLeaveConfirm(() => {
                                // 确定

                                // 更新视图
                                this.$emit('update:currView', val);
                            }, () => {
                                // 取消

                                // 清空 toView -- 同时, 外部以 toView 为 Radio 按钮组的 Key, key 变化后样式会刷新, 避免点取消后按钮组样式不对问题
                                this.$emit('update:toView', '');
                            });
                        }
                    }
                }
            }
        }
    };
</script>

<style scoped>
    .container {
        position: relative;
    }

    /* 预览窗 */
    .preview {
        padding-top: 36px;
        position: absolute;
        top: 0;
        right: 0;
        width: 450px;
        color: #b1b1b1;
    }

    /* 预览聊天框 样式一 */
    #dialog {
        background-color: #20b2bb;
        width: 315px;
        margin: auto;
        border-radius: 8px;
        padding-bottom: 20px;
        text-align: center;
        line-height: normal;
    }

    .dialog-close {
        height: 24px;
        line-height: 24px;
        font-size: 12px;
        text-align: right;
        padding: 16px;
    }

    .dialog-close a {
        display: inline-block;
        width: 16px;
        height: 16px;
        background-size: 100%;
        background-image: url("./img/delete.png");
    }

    .xhl-dialog-content {
        line-height: 1.15;
        margin-bottom: 10px;
        font-size: 14px;
    }

    .contactBtn, .cancelBtn,
    .yesBtn, .noBtn {
        cursor: pointer;
        display: inline-block;
        font-size: 12px;
        height: 30px;
        line-height: 30px;
        text-align: center;
        border-radius: 15px;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    .contactBtn, .yesBtn {
        padding: 0 20px;
        background-color: #fff;
        color: #45619D;
        margin-right: 20px;
    }

    .cancelBtn, .noBtn {
        box-sizing: border-box;
        border: 1px solid #fff;
        padding: 0 19px;
        color: #fff;
    }

    .contactBtn, .cancelBtn {
        max-width: 131px;
    }

    .yesBtn, .noBtn {
        max-width: 119px;
    }

    #main {
        display: block !important
    }

    #dialog1 {
        width: 280px;
        padding: 10px 0 20px 20px;
        line-height: normal;
    }

    #main2 {
        background-color: #20b2bb;
        /*height: 200px;*/
        background-image: url("./img/bgImg2.png");
        /*background-size: 100% 100%;*/
        background-size: cover;
        background-position: top 0 right 0;
        width: 363px;
        margin: auto;
        border-radius: 8px;
    }
</style>
