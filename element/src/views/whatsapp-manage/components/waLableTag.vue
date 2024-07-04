<template>
    <main v-if="getGroupChatInfo && (whatsAppAccountInfo.tag === 'biz')" class="mainwrap">
    <p style="font-size: 12px;
    color: rgba(0, 0, 0, 0.8);
    line-height: 18px;
   ">WA标签：</p>
    <div style="flex: 1;" id="parWrap" ref="parWrap" :style="isShowMoreTag">
        <ul class="visitor-detail-labels-ul_waba"  id="wrap_tab_waba" >
                            <li v-for="(item, index) in newLableList"
                                :key="index"
                                :style="`background: rgb(${labelColors[item.color]});`"
                                class="lablesItem">
                                <Tooltip placement="top" transfer :content="item.labelName" v-if="item.labelName && $dym.characterLength(item.labelName) > 34">
                                    <span>{{$dym.characterOmitStr(item.labelName, 34)}}</span>
                                </Tooltip>
                                <span v-else>{{item.labelName}}</span>
                                <Icon  type="ios-close"
                                      v-if="userId == whatsAppAccountInfo.userId"
                                      class="update_label_icon"
                                      size="12"
                                      style="margin-right: -4px;margin-left: 4px;"
                                      @click.stop="delDetailLabel(index, item)">
                                </Icon>
                            </li>
        </ul>
    </div>
        <aside class="modifyTag">
            <div @click="addlable">
                <i class="custom custom-dabiaoqian"></i>
            </div>
            <div @click="openMoreList" v-show="showMoreBtn">
              <i style="transition: all 0.2s ease 0s;" :style="labelsMoreFlag?'transform: rotate(180deg)':''" class="custom custom-zhankai2"></i></div>
        </aside>
    </main>
</template>
<script>
    import { mapState } from 'vuex';
    import util from '@/libs/util';
    export default {
        props: {
        },
        computed: {
            // chatToIsGroup() {
            //     //  是群组
            //     return this.provide_isGroup();
            // },
            chatGroupCount() {
                return this.provide_groupChatCount();
            },
            // isEmptyAnd() {
            //     return (this.chatToIsGroup === true && this.newLableList.length <= 0);
            // },
            whatsAppAccountInfo() {
                return this.wabaCurrentAccountInfo_provide();
            },
            ...mapState({
                orgId: state => state.enterpriseId,
                noMoreHistoryMsgs: state => state.noMoreHistoryMsgs,
                enterpriseId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                websocketMsgWA: state => state.whatsapp.websocketMsgWA,
                viewingSubWA: state => state.whatsapp.viewingSubWA
            }),
            // 是否是多设备版
            WAIsMd() {
                return !(this.whatsAppAccountInfo && this.whatsAppAccountInfo.uuid && this.whatsAppAccountInfo.uuid.includes('java'));
            },
            currentUserChatInfo() {
                // 当前聊天对象
                return this.chatWaAccount_provide();
            },
            newLableList() {
                return this.currentWaDeatilLabelTagArr();
            }
        },
        data() {
            return {
                labelColors: {
                    0: '151,53,110',
                    1: '148,166,80',
                    2: '188,161,80',
                    3: '111,40,58',
                    4: '167,136,116',
                    5: '229,180,77',
                    6: '180,178,69',
                    7: '193,161,202',
                    8: '135,105,141',
                    9: '239,143,144',
                    10: '114,191,113',
                    11: '237,130,114',
                    12: '94,193,216',
                    13: '118,198,251',
                    14: '113,102,106',
                    15: '129,142,161',
                    16: '102,148,246',
                    17: '100,43,122',
                    18: '141,202,168',
                    19: '40,52,64'
                },
                isShowMoreTag: {
                },
                labelsMoreFlag: false,
                showMoreBtn: false,
                getGroupChatInfo: null
            };
        },
        mounted() {
            if (this.whatsAppAccountInfo.tag === 'biz') {
                window.addEventListener('resize', this.openTagList);
                this.getWaChatRelataConer().then(res => {
                    if (res.data.code === 1 && res.data.data.content && res.data.data.content[0]) {
                        //         // 获取当前联系人 是否是
                        this.getGroupChatInfo = res.data.data.content[0];
                        //         // this.newLableList = res.data.data.content[0].contactUserLabelList;
                        //         this.privide_setdeatildLabelTagSync(res.data.data.content[0].contactUserLabelList);
                        this.$nextTick(() => {
                            this.openTagList();
                        });
                    }
                });
            }
        },
        methods: {
            delDetailLabel(i, ele) {
                this.delDetailLabel_waba_provide(i, ele);
            },
            // 添加标签
            addlable() {
                // 查到当前联系人
                this.addLable_provide_walabletag(this.getGroupChatInfo, true);
            },
            // 展开标签
            openTagList() {
                let wrapHeight, height;
                try {
                    if (document.querySelector('#wrap_tab_waba')) {
                        wrapHeight = parseInt(getComputedStyle(document.querySelector('#wrap_tab_waba')).height);
                        height = parseInt(getComputedStyle(document.querySelector('.lablesItem'))['margin-bottom']) + parseInt(getComputedStyle(document.querySelector('.lablesItem')).height);
                    }
                } catch (error) {
                    console.log(error);
                }
                // 产品规定标签默认最多展示3行   取一个标签的高度 然后取 整个容器的高度 除以三 如果大于3就代表超过三行 直接隐藏
                // 控制更多按钮展示与隐藏
                // console.log(wrapHeight , height);
                if ((wrapHeight / height) > 3) {
                    this.showMoreBtn = true;
                    if (this.labelsMoreFlag) {
                        this.isShowMoreTag = {
                            height: 'auto',
                            overflow: 'hidden'
                            // eslint-disable-next-line prefer-template
                        };
                    } else {
                        this.isShowMoreTag = {
                            // eslint-disable-next-line prefer-template
                            height: (3 * height) + 'px',
                            overflow: 'hidden'
                        };
                    }
                } else {
                    this.isShowMoreTag = {
                        height: 'auto',
                        overflow: 'hidden'
                        // eslint-disable-next-line prefer-template
                    };
                    this.showMoreBtn = false;
                }
            },
            //  openMoreList 展开标签
            openMoreList() {
                this.labelsMoreFlag = !this.labelsMoreFlag;
                this.openTagList();
            },
            getWaChatRelataConer() {
                const vm = this;
                return util.ajaxWAJson({
                    url: '/whatsapp/searchList/search',
                    method: 'POST',
                    data: {
                        orgId: this.orgId,
                        page: 1,
                        size: 15,
                        userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                        userId: this.whatsAppAccountInfo.userId,
                        queryKeyWords: this.chatGroupCount,
                        searchType: 4, // 用户选择的查询类型 0：备注，1：标签，2：消息，3：群组，4：联系人
                        md: this.WAIsMd,
                        labelName: [], // 标签名称
                        leadscloudStatus: [], // 询盘状态
                        sendTimeStart: '', // 开始时间
                        sendTimeEnd: '', // 结束时间
                        // 会话状态
                        activeState: '',
                        tag: this.whatsAppAccountInfo.tag
                    },
                    cancelToken: new util.axios.CancelToken(function executor(c) {
                        vm.cancelFunc_getChatList = c;
                    })
                });
            },
            undateChatListCase() {
                return util.ajaxWAJson({
                    url: '/whatsapp/contactUserLabel/getLabel',
                    method: 'POST',
                    data: {
                        orgId: this.orgId,
                        userBindWaAccount: this.whatsAppAccountInfo.whatsappAccount,
                        userId: this.whatsAppAccountInfo.userId,
                        contactWaAccount: this.chatGroupCount
                    }
                });
            }
        },
        watch: {
            // isEmptyAnd: {
            //     async handler(v) {
            //     },
            //     // immediate: true,
            //     deep: true
            // },
            currentUserChatInfo: {
                async handler(nv, ov) {
                    // console.log(nv, ov,'dksks');
                    if (nv && nv.contactUserLabelList) {
                        // 聊天对象在联系人列表中 直接使用联系人列表中的数据展示标签
                        this.privide_setdeatildLabelTagSync(nv.contactUserLabelList);
                    } else {
                        console.log('当前聊天对象不在联系人列表中');
                    }
                },
                immediate: true,
                deep: true
            },
            newLableList: {
                async handler(nv, ov) {
                    this.$nextTick(() => {
                        this.openTagList();
                    });
                },
                immediate: true,
                deep: true
            },
            getGroupChatInfo: {
                async handler(nv, ov) {
                    if (nv && nv.contactUserLabelList) {
                        // console.log(this.newLableList, nv);
                        this.privide_setdeatildLabelTagSync(nv.contactUserLabelList);
                    }
                },
                immediate: true,
                deep: true
            }
        },
        beforeDestroy() {
            window.removeEventListener('resize', this.openTagList);
        },
        inject: ['wabaCurrentAccountInfo_provide', 'delDetailLabel_waba_provide', 'chatWaAccount_provide', 'addLable_provide_walabletag', 'provide_isGroup', 'provide_groupChatCount', 'currentWaDeatilLabelTagArr', 'privide_setdeatildLabelTagSync']
    };
</script>
<style lang="less" scoped>
.visitor-detail-labels-ul_waba{
    display: flex;
    flex-wrap: wrap;
    .lablesItem {
        height: 20px;
        line-height: 20px;
        padding: 0 8px;
        border-radius: 4px;
        font-size: 12px;
        color: #fff;
        white-space: nowrap;
        margin: 0 12px 8px 0;
    }
    .moredit{
        color: #4285F2;
        cursor: pointer;
    }
}
.mainwrap{
    padding-top: 10px;
    display: flex;
}

.modifyTag{
    display: flex;
    width: 40px;
    align-items: flex-start;
    div{
        cursor: pointer;
        display: flex;
        // width: 20px;
        // height: 20px;
        i{
            font-size: 20px;
            color:#7B98B6;
            &:hover{
             color:#4285F2;
            }
        }
        &:nth-child(1){
            margin-right: 12px;
        }
    }
}
</style>
