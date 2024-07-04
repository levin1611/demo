<template>
    <div>
        <section v-drag="{changeDragStatus}" v-if="showMainCard" ref="move_squire_tools">
                <div class="card" v-if="inquiryInfo">
                    <Icon custom="custom-icon_close" @click="closDialog"
                                size="14"
                               ></Icon>
                    <div class="card_item">
                        <div class="card_item_label">{{$t('main.customerName')}}：</div>
                        <!-- <Tooltip transfer :content="'2123123123123123123123'"> -->
                            <div class="card_item_value blue" @click="jumpToCustomer">{{inquiryInfo.companyName}}</div>
                        <!-- </Tooltip> -->
                    </div>
                    <div class="card_item">
                        <div class="card_item_label">{{$t('main.Contacts')}}：</div>
                        <!-- <Tooltip transfer :content="2123123123123123123123"> -->
                            <div class="card_item_value blue" @click="viewContact(inquiryInfo.mainContactsId)">{{inquiryInfo.mainContactsName}}</div>
                        <!-- </Tooltip> -->
                    </div>
                    <div class="card_item">
                        <div class="card_item_label">{{$t('crm.Modal.manager')}}：</div>
                        <div class="card_item_value">{{inquiryInfo.userNamesShow}}</div>
                    </div>

                </div>
                <div class="card" v-else-if="clueInfo">
                    <Icon custom="custom-icon_close" @click="closDialog"
                                size="14"
                               ></Icon>
                    <div class="card_item">
                        <div class="card_item_label">{{$t('clue.newDetail.col_seqNumber')}}：</div>
                        <!-- <Tooltip transfer :content="'2123123123123123123123'"> -->
                            <div class="card_item_value blue" @click="viewClue(clueInfo.id)">{{clueInfo.seqNumber}}</div>
                        <!-- </Tooltip> -->
                    </div>
                    <div class="card_item">
                        <div class="card_item_label">{{$t('main.Contacts')}}：</div>
                        <!-- <Tooltip transfer :content="2123123123123123123123"> -->
                            <div class="card_item_value"  >{{clueInfo.a1009}}</div>
                        <!-- </Tooltip> -->
                    </div>
                    <div class="card_item">
                        <div class="card_item_label">{{$t('crm.Modal.manager')}}：</div>
                        <div class="card_item_value">{{clueInfo.saleName}}</div>
                    </div>
                </div>
                <div class="card" v-else>
                    <Icon custom="custom-icon_close" @click="closDialog"
                                size="14"
                               ></Icon>
                    陌生号码来电
                </div>
                <!-- <svg v-if="clueInfo || inquiryInfo" class="svg-icon custom menu-switch" @click.stop="setCInnoxRealate()" aria-hidden="true">
                                                        <use xlink:href="#custom-zhankai"></use>
                    </svg> -->
        </section>
        <div v-if="showSlideBar">
           <calllingLittleDraw
                :littleDrawerVisible="waRelatedCRMInfo.inquiryId || waRelatedCRMInfo.clueId"
                :waRelatedCRMInfo="waRelatedCRMInfo"
                :controVerbalIcon="0"
                @littleDrawerHidden="littleDrawerHidden"
                @updateInquiryStatusWaEmbedded="updateInquiryStatus"
                @chownSuccess="chownSuccess"
                content_height="100%"
                ></calllingLittleDraw>
        </div>
    </div>

</template>

<script>
    import { mapState, mapGetters } from 'vuex';
    import calllingLittleDraw from './callingLittleDraw.vue';
    import { getContactsStatusByPhone } from '@/api/call&sms';
    import util from '@/libs/util';

    export default {
        components: {
            calllingLittleDraw
        },
        directives: {
            drag: {
                // 指令的定义
                bind: function(el, binding) {
                    // 阻止事件冒泡
                    // 不仅仅要stopPropagation，还要preventDefault
                    function pauseEvent(e) {
                        if (e.stopPropagation) e.stopPropagation();
                        if (e.preventDefault) e.preventDefault();
                        e.cancelBubble = true;
                        e.returnValue = false;
                        return false;
                    }

                    const oDiv = el; // 获取当前元素
                    oDiv.onmousedown = (e) => {
                        e = e || window.event;
                        pauseEvent(e);
                        const btnEle = oDiv;
                        // 帮助按钮鼠标按下时
                        const defaultX = e.clientX; // 默认位置的x轴坐标
                        const defaultY = e.clientY; // 默认位置的y轴坐标

                        const defaultLeft = btnEle.offsetLeft; // 默认左侧偏移位置
                        const defaultTop = btnEle.offsetTop; // 默认顶部偏移位置

                        // 帮助按钮鼠标移动时
                        document.onmousemove = (me) => {
                            btnEle.style.cursor = 'move'; // 修改鼠标样式

                            const nowX = me.clientX; // 当前位置的x轴坐标
                            const nowY = me.clientY; // 当前位置的y轴坐标

                            const moveX = defaultX - nowX; // 在x轴上的移动距离
                            const moveY = defaultY - nowY; // 在y轴上移动的距离

                            const nowLeft = defaultLeft - moveX; // 当前位置左侧偏移量
                            const nowTop = defaultTop - moveY; // 当前位置顶部偏移量

                            btnEle.style.left = `${nowLeft}px`; // 将当前位置赋值给帮助按钮
                            btnEle.style.top = `${nowTop}px`;
                        };

                        // 鼠标抬起时
                        document.onmouseup = () => {
                            btnEle.style.cursor = 'default'; // 重置鼠标样式
                            // 清除事件
                            document.onmousemove = null;
                            document.onmouseup = null;
                        };
                    };
                }
            }
        },
        computed: {
            ...mapState({
                orgId: state => state.enterpriseId,
                userId: state => state.userId,
                userName: state => state.userName,
                fullName: state => state.fullName
            }),
            ...mapGetters([
                'isContainsMenu',
                'isHaveAuthority'
            ])
        },
        data() {
            return {
                showSlideBar: false,
                waRelatedCRMInfo: {
                    // inquiryId: '1400581',
                    // companyId: '1387698',
                    // clueId: '4b2f38db2092420783bd8504bca6c19c'
                },
                clueInfo: null,
                inquiryInfo: null,
                showMainCard: false
                // selectedChatInfo: {
                //     id: 436813,
                //     leadscloudStatus: 1
                // }
            };
        },
        methods: {
            /* 全局  获取询盘简略信息 */
            get_inquiry_short_info() {
                util.ajax({
                    url: '/crm/inquiry/getInquiryAndCompany',
                    method: 'post',
                    data: {
                        id: this.waRelatedCRMInfo.inquiryId
                    }
                }).then(res => {
                    const data = res.data.data;
                    console.log(data, 'data');
                    this.inquiryInfo = data;
                    this.$nextTick(() => {
                        this.showMainCard = true;
                    });
                });
            },
            // 获取线索简略信息
            get_clue_short_info() {
                util.ajax({
                    url: '/form-cust/form/getSimpleColumnValue',
                    method: 'post',
                    data: {
                        id: this.waRelatedCRMInfo.clueId
                    }
                }).then(res => {
                    if (res.data.code === '1') {
                        const data = res.data.data;
                        console.log(data, 'data');
                        this.clueInfo = data;
                        this.$nextTick(() => {
                            this.showMainCard = true;
                        });
                    } else {
                        this.$Message.error('获取线索简略信息出错');
                    }
                });
            },
            async littleDrawerHidden(val) {
                if (val) {
                    // 如果是要打开侧边栏 则判断有没有功能权限
                    if (this.waRelatedCRMInfo.inquiryId) {
                        // 询盘详情
                        const id = this.waRelatedCRMInfo.companyId;
                        if (!this.isContainsMenu('myCustomer')) {
                            this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                            return false;
                        } else {
                            if (id) {
                            // this.$viewCustomer(id);
                            } else {
                                this.$Message.error(this.$t('crm.Modal.error_companyId'));
                                return false;
                            }
                        }
                    } else if (this.waRelatedCRMInfo.clueId) {
                        if (!this.isContainsMenu('my_clue')) {
                            this.$Message.warning(this.$t('crm.newDetail.error_noMenuAuthority'));
                            return;
                        }
                        // 关联来的 可能没有线索id
                        if (!this.clueInfo.id) {
                            this.$Message.warning(this.$t('crm.Modal.error_noneUserInfo'));
                            return;
                        }
                        // 校验是否有该条线索管理权限
                        const authorized = await this.isHaveAuthority({
                            type: 'Clue',
                            id: this.clueInfo.id
                        });
                        if (!authorized) return;
                        if (authorized === 'highseas') {
                            this.$Message.warning(this.$t('crm.Modal.error_JumpClueInHighseas'));
                            return;
                        }
                    }
                }

                // this.$emit('littleDrawerHidden', val);
                this.showSlideBar = val;
            },
            updateInquiryStatus(clueId, status) {
                this.$emit('updateInquiryStatus', clueId, status);
            },
            chownSuccess() {

            },
            // 是否有鼠标拖动
            changeDragStatus(val) {
                this.dragging = val;
            },
            // 获取 cinnox 账号关联的 CRM 数据
            async getCRMStatus(account) {
                // 如果传入数据中有 inquiryId , 则需要优先保证 CRM 详情页显示的内容和传入数据一致(现在列表/卡片的 inquiryId 有可能和详情页对不上)
                const result = await getContactsStatusByPhone({
                    orgId: this.orgId,
                    targetIds: [account]
                });


                if (result.code === '1' && result.data.contactStatus.length) {
                    const obj = result.data.contactStatus[0];
                    if (obj.status ==2 ) {
                        obj.inquiryId = obj.inquiryIdList[0];
                    }
                    return obj;
                // if (result.code === '1' && result.data && result.data[account]) {
                    // return result.data[account];
                } else {
                    // 获取数据失败
                    this.$Message.error(this.$t('crm.Modal.error_requestNoData'));
                    return {};
                }
            },
            async setCInnoxRealate(WAAccount) {
                this.littleDrawerHidden(true);
            },
            // 跳转客户
            jumpToCustomer() {
                const id = this.waRelatedCRMInfo.companyId;
                if (!this.isContainsMenu('myCustomer')) {
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyCustomer'));
                } else {
                    if (id) {
                        this.$viewCustomer(id);
                    } else {
                        this.$Message.error(this.$t('crm.Modal.error_companyId'));
                    }
                }
            },
            // 跳转联系人
            async viewContact(contactId) {
                // 判断是否有"我的联系人"页面权限
                if (!this.isContainsMenu('myContact')) {
                    // 没有"我的联系人"页面权限, 弹出提示并退出流程
                    this.$Message.error(this.$t('crm.Modal.error_haveNoPermissionMyContact'));
                    return;
                }

                // 查询该联系人 id 管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Contact',
                    id: contactId
                });

                // 无权限, 则不允许跳转
                if (!authorized) return;

                // 如果是公海联系人
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpContactInHighseas'));
                    return;
                }

                // 新窗口打开联系人详情页
                localStorage.setItem('leadsCloud-contactId', contactId);
                window.open(this.$router.resolve({
                    name: 'myContact'
                }).href, '_blank');
            },
            // 弹出线索详情
            async viewClue(clueId) {
                // 校验是否有线索目录权限
                if (!this.isContainsMenu('my_clue')) {
                    this.$Message.warning(this.$t('crm.newDetail.error_noMenuAuthority'));
                    return;
                }
                // 关联来的 可能没有线索id
                if (!clueId) {
                    this.$Message.warning(this.$t('crm.Modal.error_noneUserInfo'));
                    return;
                }
                // 校验是否有该条线索管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Clue',
                    id: clueId
                });
                if (!authorized) return;
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpClueInHighseas'));
                    return;
                }

                // 校验通过, 新标签页打开线索详情
                localStorage.setItem('leadsCloud-clueId', clueId);
                window.open(this.$rootRouter.resolve({
                    name: 'my_clue'
                }).href, '_blank');
            },
            // 通话结束关闭右侧通知组件
            closDialog() {
                if (this.showMainCard) {
                    this.showMainCard = false;
                }
                if (this.showSlideBar) {
                    this.littleDrawerHidden(false);
                }
            }
        },
        mounted() {
            this.$EVENTBUS.$on('toggleViewCallingSmsCallingdetail', async (data) => {
                // console.log(data);
                // 打开之前清理掉之前的附值
                this.waRelatedCRMInfo = {};
                this.inquiryInfo = null;
                this.clueInfo = null;
                if (data.messageStatus) {
                    this.waRelatedCRMInfo = await this.getCRMStatus(data.from);
                    console.log(this.waRelatedCRMInfo, '当前查询到的crm建档状态是');
                    if (this.waRelatedCRMInfo.inquiryId) {
                        // 询盘详情
                        this.get_inquiry_short_info();
                    } else if (this.waRelatedCRMInfo.clueId) {
                        // 线索详情
                        this.get_clue_short_info();
                    } else {
                        this.showMainCard = true;
                    }
                }
            });
            this.$EVENTBUS.$on('toggcloseDetail', this.closDialog);
        },
        beforeDestroy() {
            this.$EVENTBUS.$off('toggleViewCallingSmsCallingdetail');
            this.$EVENTBUS.$off('toggcloseDetail', this.closDialog);
        }
    };
</script>

<style lang="less" scoped>
section{
    width: 284px;
    position: fixed;
    right: 400px;
    top: 60px;
    z-index: 2;
    .menu-switch{
        font-size: 40px;
        transform:rotateZ(270deg) translateX(16px) translateY(-50%);
        position: absolute;
    left: 50%;
    cursor: pointer;
    }
}
.card{
    padding: 20px 30px;
    box-sizing: border-box;
    background: #fff;
    border-radius: 4px;
    box-shadow: 0 0 6px #C0C5D2;
    position: relative;
    .card_item{
        font-size: 14px;
        line-height: 22px;
        margin-bottom: 12px;
        display: flex;
        &:nth-last-child(1){
            margin-bottom: 0;
        }
        .blue{
            color:#3B78DE;
            cursor: pointer;
        }
        .card_item_label{
            max-width: 80px;
        }
        .card_item_value{
            flex: 1;
            white-space: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }
    }
    .custom-icon_close{
        position: absolute;
        right: 10px;
        top: 10px;
        cursor: pointer;
    }
}
</style>
