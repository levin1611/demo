<template>
    <div class="container">
        <div style="margin-top:18px;">
            <div class="item">
                <span class="item-tip">{{$t('portal_set.color_set')}} </span>
                <!-- 颜色选择 -->
                <div class="item-color-pick">
                    <span v-for="(color,index) in colors" :key="index" @click="colorSet=color"
                          class="color-circle-out middle " :class="colorSet==color?'boxshadow': '' ">
                    <!-- <span class="color-circle-in" :class=" 'color'+(index+1) "></span> -->
                    <span class="color-circle-in" :style="'backgroundColor:'+color"></span>
                    </span>
                    <ColorPicker class="color-pick-plug-in" v-model="colorSet" :colors="colors"/>
                </div>
            </div>
            <div class="item">
                <div>{{$t('portal_set.mini_words')}} </div>
                <Input v-model="miniWords" :disabled="miniWordsEdit? false:true " :maxlength="miniWordsLength"
                       @input="getMiniWordsLength" style="max-width:420px;">
                    <Button slot="append" @click="miniWordsEdit = true" icon="custom custom-edit"></Button>
                </Input>
            </div>
            <div style="padding-left: 350px;font-size: 12px;margin-top:-10px;">已输入&nbsp;<span style="color:#fa8241">{{inputMiniWordsLength}}/30</span>
            </div>
            <Button type="primary" @click="updateData()">{{$t('save')}}</Button>
        </div>
        <!-- 预览部分 -->
        <div class="preview">
            {{$t('portal_set.preview')}}
            <div class="mini-window" :style="'backgroundColor:'+colorSet">
                <Icon custom="custom custom-mini-chat" size="25"></Icon>
                <span class="mini-text" style="">{{miniWords}}</span>
            </div>
        </div>
    </div>
</template>

<script>
    import util from '@/libs/util';
    import { mapState } from 'vuex';

    export default {
        props: [
            'currView',
            'toView',
            'offlineData',
            'service',
            'defaultStatus',
            'chatPosition',
            'currDomain'
        ],
        created() {
            this.refreshData();
            this.getMiniWordsLength();
        },
        data() {
            return {
                inputMiniWordsLength: 0,
                miniWordsLength: 100,
                colorSet: '#45619D', /* 选中的颜色 */
                colors: ['#45619D', '#4285F4', '#15C5D4', '#00CC99', '#7B66EE', '#FA8241', '#FBBC04'], /* 显示的颜色列表 */
                miniWords: 'Chat with us',
                miniWordsEdit: false
            };
        },
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId'
            })
        },
        methods: {
            getMiniWordsLength() {
                let len = 0;
                let temp = 0;
                for (let i = 0; i < this.miniWords.length; i++) {
                    const c = this.miniWords.charCodeAt(i);
                    // 单字节加1
                    if ((c >= 0x0001 && c <= 0x007e) || (c >= 0xff60 && c <= 0xff9f)) {
                        len++;
                    } else {
                        len += 2;
                    }
                    if (len <= 30) {
                        temp++;
                    }
                }
                console.log('len= ', len);
                console.log('temp= ', temp);
                this.inputMiniWordsLength = len;
                if (len >= 30) {
                    // 如果miniWords的字符长度大于30时，此时限制input框的长度限制 = miniWords的字符串长度
                    // 注意：一个汉字 == 两个字符
                    this.miniWords = this.miniWords.substring(0, temp);
                    this.miniWordsLength = this.miniWords.length - 1;
                    this.inputMiniWordsLength = 30;
                } else {
                    // 否则，去掉长度限制
                    this.miniWordsLength = 100;
                }
            },
            refreshData() {
                if (this.offlineData.miniText) {
                    this.colorSet = this.offlineData.miniColor.toUpperCase();
                    this.miniWords = this.offlineData.miniText;
                }
            },
            updateData() { /* 保存更改的数据 */
                const updateData = {
                    orgId: this.enterpriseId,
                    id: this.offlineData.id,
                    enable: this.offlineData.enable,
                    displayStatus: this.defaultStatus,
                    windowPosition: this.chatPosition,
                    miniColor: this.colorSet,
                    miniText: this.miniWords,
                    index: 2,
                    operationType: 1,
                    website: this.currDomain
                };
                if (updateData.id) {
                    util.ajaxInternational({
                        url: '/visitor-chat/offline/update',
                        method: 'post',
                        data: updateData
                    }).then(res => {
                        if (res.data.code === '1') {
                            this.$emit('update:offlineData', Object.assign({}, this.offlineData, res.data.data));
                            this.$Message.success(this.$t('saveSuccess'));
                        } else {
                            this.$Message.error(this.$t('saveFail'));
                        }
                    });
                } else {
                    updateData.enable = 1;
                    util.ajaxInternational({
                        url: '/visitor-chat/offline/save',
                        method: 'post',
                        data: updateData
                    }).then(res => {
                        if (res.data.code === '1') {
                            this.$emit('update:offlineData', res.data.data);
                            this.$Message.success(this.$t('saveSuccess'));
                        } else {
                            this.$Message.error(this.$t('saveFail'));
                        }
                    });
                }
                this.saveTranslate();
            },
            saveTranslate() { /* 保存到翻译字段 */
                const postData = {
                    orgId: this.enterpriseId,
                    textList: [this.miniWords],
                    dest: 'zh_cn'
                };
                util.ajaxJson({
                    url: '/cuss-login/translate/save',
                    method: 'post',
                    data: JSON.stringify(postData)
                }).then(res => {

                });
            },

            // 检查数据较原始数据是否变更
            checkIsChanged() {
                // 当前编辑信息
                const currObj = {
                    colorSet: this.colorSet,
                    miniWords: this.miniWords
                };
                // 原始信息
                const oldObj = {
                    colorSet: this.offlineData.miniColor.toUpperCase() || '#45619D',
                    miniWords: this.offlineData.miniText || 'Chat with us'
                };

                // 如果当前比外部 Tab 切换还要高一级, 是"客服在线/离线"切换, 则需要把外部设置页纳入比较范围
                if (this.toView === 'ServiceOnline') {
                    currObj.defaultStatus = this.defaultStatus;
                    currObj.chatPosition = this.chatPosition;
                    currObj.service = this.service;

                    oldObj.defaultStatus = `${this.offlineData.displayStatus}`;
                    oldObj.chatPosition = `${this.offlineData.windowPosition}`;
                    oldObj.service = this.offlineData.enable === 1;
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
        watch: {
            offlineData: {
                handler() {
                    this.refreshData();
                },
                deep: true
            },
            // 监听外部传入的"要跳转到的其他组件"
            toView: {
                handler(val) {
                    // 定义当前 view name
                    const ownViewName = 'MiniBox';
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
        height: 200px;
        text-align: center;
        color: #b1b1b1;
        display: flex;
        justify-content: space-around;
    }

    /* 迷你对话框 */
    .mini-window {
        padding: 0 20px;
        width: auto !important;
        height: 46px;
        border-radius: 23px;
        position: absolute;
        color: #fff;
        font-weight: 700;
        font-size: 16px;
        line-height: 46px;
        top: 116px;
        text-align: center;
        box-shadow: 0 3px 15px 0 rgba(0, 0, 0, 0.25);
        transition: all .4s, bottom .8s ease-in-out;
    }

    .mini-window:hover {
        box-shadow: 0 3px 20px 0 rgba(0, 0, 0, 0.5);
    }

    .mini-window svg {
        position: absolute;
        left: 20px;
        top: 0px;
        width: 28px;
        height: 46px;
        display: inline-block;
        margin-right: 3px;
    }

    .mini-text {
        margin-left: 12px;
        display: inline-block;
        left: 0;
        transform: 0;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        vertical-align: top !important;
        white-space: nowrap !important;
        padding: 0 !important;
        transition: .6s ease-in-out !important
    }
</style>


