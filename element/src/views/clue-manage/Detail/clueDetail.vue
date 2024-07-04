<template>
    <div class="crm-detail-page" :style="['mail', 'mail_detail', 'whatsApp','Sms', 'microenterprise','global_sms_calling'].includes(from) && 'min-width: 0;'">
        <Spin v-if="loading" size="large" fix></Spin>
        <template>
            <div class="companyWrap" style="padding:20px 20px 16px;">
                <div class="company">
                    <div class="com_top">
                        <div class="com_name">
                            <Icon custom="custom custom-clue" size="36" style="float: left;margin-right: 10px"></Icon>
                            <Tooltip placement="bottom-start" :content="clue_short_info.a1009">
                                <span class="com_name_short" :style="['mail', 'mail_detail'].includes(from) && 'max-width: 156px;margin-right:0;overflow: hidden;text-overflow:ellipsis;white-space: nowrap;'">{{ clue_short_info.a1009 || '' }}</span>
                            </Tooltip>
                        </div>
                        <div class="com_operate" v-if="!disabled && show_operate">
                            <!-- 编辑按钮 -->
                            <Button
                                v-if="authorized_button['edit'] && !['mail', 'mail_detail'].includes(from)"
                                type="text"
                                v-show="!inquiryId"
                                icon="custom custom-field-edit"
                                @click="visible_edit_clue = true">
                                    {{$t('clue.edit')}}
                            </Button>
                            <!-- 线索状态 -->
                            <!-- 如果没有改变状态的权限，也只显示状态 -->
                            <span
                                v-show="inquiryId || !authorized_button['change_status']"
                                style="font-size:12px;"
                                :class="status_type.class">
                                    {{status_type.status}}
                            </span>
                            <Button
                                v-show="inquiryId"
                                type="text"
                                @click="visibleClueLog = true">
                                    {{$t('clue.clueLog')}}
                            </Button>
                            <Dropdown
                                v-show="!inquiryId"
                                v-if="authorized_button['change_status']"
                                trigger="click"
                                @command="change_status"
                                style="padding-right: 10px;height: initial;line-height: initial;">
                                    <a href="javascript:void(0)"
                                        :class="status_type.class"
                                        style="font-size:12px;"
                                    >
                                        {{status_type.status}}
                                        <Icon v-if="!inquiryId" type="arrow-down-b"></Icon>
                                    </a>
                                    <DropdownMenu
                                        slot="dropdown">
                                            <DropdownItem
                                                v-if="index !== 2"
                                                v-for="(item,index) in status_list"
                                                :command="index+1"
                                                :key="index">
                                                    {{item}}
                                            </DropdownItem>
                                            <DropdownItem></DropdownItem>
                                    </DropdownMenu>
                            </Dropdown>
                            <!-- 发送邮箱 -->
                            <template v-if="!is_marketing_station">
                                <Button
                                    type="text"
                                    v-if="!inquiryId && clue_short_info.a10010 && !['mail', 'mail_detail'].includes(from)"
                                    icon="custom custom-crm-send-mail"
                                    @click="sendMail">
                                        {{ $t('crm.Detail.sendMail') }}
                                </Button>
                            </template>
                            <!-- 录入按钮 -->
                            <template v-if="!is_marketing_station">
                                <Button
                                    v-if="!inquiryId && authorized_button['enter_inquiry']"
                                    type="text"
                                    icon="custom custom-import"
                                    @click="visible_new_company = true">
                                        {{$t('clue.add_inquiry')}}
                                </Button>
                            </template>
                            <template v-else>
                                <Poptip width="390" placement="bottom-end" trigger="hover">
                                    <Button
                                        v-if="!inquiryId && authorized_button['enter_inquiry']"
                                        type="text"
                                        slot="reference"
                                        icon="custom custom-import">
                                            {{$t('clue.add_inquiry')}}
                                    </Button>
                                    <div>{{$t('administerAMP.wordPress.errorTips')}}</div>
                                </Poptip>
                            </template>
                            <Dropdown
                                v-if="!inquiryId"
                                trigger="hover"
                                @command='clue_operate' >
                                    <span style="cursor: pointer;">
                                        <Icon custom="custom custom-more" size='14'></Icon>
                                    </span>
                                    <DropdownMenu
                                        slot="dropdown"
                                        v-show="!inquiryId">
                                            <template v-if="!is_marketing_station">
                                                <DropdownItem
                                                    v-if="clue_short_info.a10010 && ['mail', 'mail_detail'].includes(from)"
                                                    command='sendMail'>
                                                    {{ $t('crm.Detail.sendMail') }}
                                                </DropdownItem>
                                                <DropdownItem
                                                    v-if="authorized_button['edit'] && ['mail', 'mail_detail'].includes(from)"
                                                    command='edit'>
                                                        {{$t('clue.edit')}}
                                                </DropdownItem>
                                                <DropdownItem
                                                    v-if="authorized_button['shift_clue']"
                                                    command='transfer_clue'>
                                                        {{$t('clue.transfer_clue_title')}}
                                                </DropdownItem>
                                                <DropdownItem
                                                    v-if="authorized_button['go_sea']"
                                                    command='throw_clue'>
                                                        {{$t('clue.go_sea')}}
                                                </DropdownItem>
                                            </template>
                                            <DropdownItem
                                                v-if="authorized_button['qrcode']"
                                                command='qrcode'>
                                                    {{$t('clue.qrcode')}}
                                            </DropdownItem>
                                            <!-- v-if="authorized_button['clueLog']" -->
                                            <DropdownItem
                                                command='clueLog'>
                                                    {{$t('clue.clueLog')}}
                                            </DropdownItem>
                                    </DropdownMenu>
                            </Dropdown>
                        </div>
                        <div class="com_operate">
                            <a v-show="showClueStatus" href="javascript:void(0)" :class="status_type.class" style="font-size:12px;color:#ee7c3e">
                                {{status_type.status}}
                            </a>
                        </div>
                    </div>
                </div>
                <!-- 邮件模块 侧滑页数据布局 -->
                <Row class="com_main" style="margin-top: 12px;" v-if="['mail', 'mail_detail','whatsApp', 'microenterprise','global_sms_calling','Sms'].includes(from)">
                    <Col v-for="(value, key) in clue_short_info_items" :key="key" :span="12">
                        <span class="col_name" :class="value">{{ $t(`clue.${value}`) }}：</span>
                        <span class="col_value">
                            <template v-if="key === 'source'">
                                {{ source_type }}
                            </template>
                            <template v-else-if="$route.path.indexOf('/my_clue') < 0  && key === 'seqNumber'">
                                <a style="color:#4285f4" @click.stop="jumpToTheClueDetail(clue_short_info[key])">{{
                                    clue_short_info[key] }}</a>
                            </template>
                            <template v-else>
                                {{ clue_short_info[key] }}
                            </template>
                        </span>
                    </Col>
                </Row>

                <!-- crm模块 侧滑页数据布局 -->
                <Row type="flex" justify="space-between" v-else>
                    <Col v-for="(value, key) in clue_short_info_items" :key="key" :span="4">
                        <p class="col_name">{{ $t(`clue.${value}`) }}</p>
                        <p class="col_value">
                            <template v-if="key === 'source'">{{ source_type }}</template>
                            <template v-else-if="$route.path.indexOf('/my_clue') < 0  && key === 'seqNumber'">
                                <a style="color:#4285f4" @click.stop="jumpToTheClueDetail(clue_short_info[key])">{{clue_short_info[key] }}</a>
                            </template>
                            <template v-else>{{ clue_short_info[key] }}</template>
                        </p>
                    </Col>
                </Row>

                 <!-- whatsApp聊天主页面增加标签详情 组件通信使用provide 来源是WhatsApp主页面index.vue-->
                <main class="tagWrap" v-if="['whatsApp'].includes(from)">
                    <waLableTagVue></waLableTagVue>
                </main>
            </div>
            <div class="hr-block"></div>
            <div class="component-wrap">
                <Tabs v-model="current_compo">
                    <!-- TabPane的label不是固定值的时候，key不能省略，否则会造成选中错位 -->
                    <TabPane
                        v-for="item in compo_list"
                        :label="(item === 'FollowUp' && inquiryId) ? $t(`clue.module_RelatedFollowUp`) : $t(`clue.module_${item}`)"
                        :key="(item === 'FollowUp' && inquiryId) ? $t(`clue.module_RelatedFollowUp`) : $t(`clue.module_${item}`)"
                        :name="item">
                    </TabPane>
                </Tabs>
                <keep-alive v-if="!loading">
                    <!-- 组件传递参数说明: -->
                    <component
                        :is="current_compo"
                        :id="clueId"
                        :inquiryId="inquiryId"
                        :type="'clue'"
                        :from="from"
                        :fromType="fromType"
                        :originalType="originalType"
                        :disabled="disabled"
                        :inquirySeqNumber="inquirySeqNumber"
                        :source="clue_short_info.source"
                        :visitorId="clue_short_info.proj"
                        :sourceId="clue_short_info.sourceId"
                        :source_type="source_type"
                        :flag_inquiry_id_requested="flag_inquiry_id_requested"
                        :flag_update_detail="flag_update_detail"
                        :currAccountInfo="currAccountInfo"
                        :listType="listType"
                        v-on="$listeners"
                        @updateClueStatusByFollowupOrEmail="updateClueStatusByFollowupOrEmail">
                    </component>
                </keep-alive>
            </div>

            <!-- 编辑线索 -->
            <EditClue
                :visible.sync="visible_edit_clue"
                :clueId="clueId"
                :saleId="clue_short_info.saleId"
                :createUserId="[clue_short_info.createUserId]"
                :serviceId="[clue_short_info.serviceId]"
                :flag_update_detail.sync="flag_update_detail"
                @invoking="invoking">
            </EditClue>
            <!-- 录入询盘 -->
            <NewCompany
                :visible.sync="visible_new_company"
                :clueId="clueId"
                :saleList="saleList"
                @returnUpdateStatus="returnUpdateStatus"
                @saveSuccess="saveSuccess"
                @changeStatusSuccess="changeStatusSuccess">
            </NewCompany>
            <!-- 转移线索 -->
            <TransferClue
                :visible.sync="visible_transfer_clue"
                :clueIds="[clueId]"
                :createUserId="[clue_short_info.createUserId]"
                :serviceId="[clue_short_info.serviceId]"
                @updateClueData="getClueShortInfo"
                @invoking="invoking"
                @chownSuccess="chownSuccess">
            </TransferClue>
            <!-- 二维码名片 -->
            <QRCode
                :visible.sync="visible_qrCode"
                :id="clueId">
            </QRCode>
            <!-- 扔入公海 -->
            <ThrowClue
                :visible.sync="visible_throw_clue"
                :clueId="clueId"
                @chownSuccess="chownSuccess">
            </ThrowClue>
            <ClueLog
                :visible.sync="visibleClueLog"
                :clueId="clueId">
            </ClueLog>
        </template>

        <!--打开发送邮件页面-->
        <replyMailModal
                :visible.sync="replyMailVisible"
                ref="replyMailModal"
        ></replyMailModal>
    </div>
</template>
<script>
    import Invoking from '@/mixins/invoking.js';
    import { env } from '../../../../build/config';
    import { HANDLE_BUTTON, BUTTON_IDS } from '@/api/config';
    import NewCompany from '@/views/clue-manage/Detail/Components/Modal/newCompany';
    import QRCode from '@/views/clue-manage/Detail/Components/Modal/qrCode';
    import ThrowClue from '@/views/clue-manage/Detail/Components/Modal/throwClue';
    import TransferClue from '@/views/clue-manage/Detail/Components/Modal/transferClue';
    import EditClue from '@/views/clue-manage/Detail/Components/Modal/editClue';
    import FollowUp from '@/views/clue-manage/Detail/Components/Html/followUp';
    import DetailInfo from '@/views/clue-manage/Detail/Components/Html/detailInfo';
    import ClueLog from '@/views/clue-manage/Detail/Components/Modal/clueLog';
    import replyMailModal from '@/views/main-components/timeline/Components/replyMailModal';
    import inOutGoingMail from '@/views/main-components/little-drawer/components/inOutGoingMail.vue';
    import { crmClue } from '@/api/crm';
    import { mapState, mapGetters } from 'vuex';
    import waLableTagVue from '@/views/whatsapp-manage/components/waLableTag.vue';
    export default {
        name: 'clueDetail',
        mixins: [Invoking],
        components: {
            ClueLog,
            NewCompany,
            QRCode,
            ThrowClue,
            TransferClue,
            EditClue,
            // sendMail,
            replyMailModal,
            FollowUp,
            DetailInfo,
            inOutGoingMail,
            waLableTagVue
        },
        props: [
            'clueId',
            'listType',
            'originalType',
            'disabled',
            'showClueStatus',
            'from',
            'currAccountInfo'
        ],
        computed: {
            ...mapState({
                enterpriseId: 'enterpriseId',
                userId: 'userId',
                userName: 'userName',
                fullName: 'fullName',
                fieldIndex: state => state.clue.fieldIndex,
                button_list: state => state.app.button_list,
                is_marketing_station: state => state.app.is_marketing_station,
                createdUserNotMe: state => state.callingSms.createdUserNotMe,
                salesList: state => state.crm.salesList
            }),
            ...mapGetters([
                'isHaveAuthority',
                'isContainsMenu'
            ]),

            // 按钮权限集合
            authorized_button() {
                // if (this.listType) {
                // const type = this.listType > 3 ? 2 : this.listType;
                return {
                    edit: !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.edit, this.button_list),
                    change_status: !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.change_status, this.button_list),
                    go_sea: !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.go_sea, this.button_list),
                    enter_inquiry: !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.enter_inquiry, this.button_list),
                    shift_clue: !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.shift_clue, this.button_list),
                    add_remark: !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.add_remark, this.button_list),
                    qrcode: !HANDLE_BUTTON(BUTTON_IDS.CRM.clue.qrcode, this.button_list)
                };
                // }
                // return {};
            },

            // 返回创建方式 label
            source_type() {
                switch (this.clue_short_info.source) {
                    case 1:
                        return this.$t('clue.history');
                    case 2:
                        return this.$t('clue.web_msg');
                    case 3:
                        return this.$t('clue.direct_create');
                    case 4:
                        return this.$t('clue.web_conversation');
                    case 5:
                        return 'Facebook Leads';
                    case 6:
                        return this.$t('clue.fb_msg');
                    case 7:
                        return this.$t('clue.fb_comment');
                    case 9:
                        return this.$t('clue.data_import');
                    case 10:
                        return this.$t('clue.website_order');
                    default:
                        return '';
                }
            },
            fromType() {
                return (this.originalType === 'Fb-comment' || this.originalType === 'Fb-chat') ? 'FB_inbox' : 'clue';
            },
            // 返回线索状态 label
            status_type() {
                switch (this.clue_short_info.status) {
                    case 2:
                        return {
                            class: 'clue-trash',
                            status: this.$t('clue.trash')
                        };
                    case 3:
                        return {
                            class: 'clue-inquiry',
                            status: this.$t('clue.inquiry')
                        };
                    case 4:
                        return {
                            class: 'clue-following',
                            status: this.$t('clue.following')
                        };
                    case 5:
                        return {
                            class: 'clue-done',
                            status: this.$t('clue.done')
                        };
                    default:
                        return {
                            class: 'clue-unfollowed',
                            status: this.$t('clue.unfollowed')
                        };
                }
            }
        },
        data() {
            return {
                env,
                visibleClueLog: false,
                loading: true,
                sendMailModalVisible: false,
                /* 全局 */
                clue_short_info: {}, // 线索详情
                clue_short_info_items: {
                    // a1001（公司名称）、a1003（国家地区）,a10055
                    // a1001: 'crm.InqSet.corp_companyName',
                    // a1003: 'crm.InqSet.corp_countryArea',
                    // a10055: 'crm.InqSet.corp_clientType',
                    seqNumber: 'clue_id',
                    source: 'create_way',
                    createUser: 'inputer',
                    serviceName: 'service',
                    saleName: 'sales'
                }, // 格式 -> 数据的 key: 多语言的 key
                saleList: [],

                /* 右上角显示询盘或操作 */
                show_operate: false,
                inquiryId: undefined,
                inquirySeqNumber: undefined,

                // 更改线索状态
                status_list: [
                    this.$t('clue.unfollowed'),
                    this.$t('clue.trash'),
                    this.$t('clue.inquiry'),
                    this.$t('clue.following'),
                    this.$t('clue.done')
                ],

                /* 动态组件部分 */
                compo_list: [
                    'FollowUp',
                    'DetailInfo'
                ],
                current_compo: 'FollowUp',
                flag_update_detail: false, // 更新详细信息
                flag_inquiry_id_requested: false, // 询盘 ID 请求完成

                /* 模态框部分 */
                visible_edit_clue: false,
                visible_new_company: false,
                visible_throw_clue: false,
                visible_qrCode: false,
                visible_transfer_clue: false,
                replyMailVisible: false
            };
        },
        methods: {
            /* 获取信息 */
            // 获取线索简略信息
            getClueShortInfo() {
                this.loading = true;
                this.inquiryId = undefined;
                this.inquirySeqNumber = undefined;
                this.flag_inquiry_id_requested = false;
                crmClue.getSimpleColumnValue({
                    id: this.clueId
                }).then(response => {
                    if (response.code === '1') {
                        this.clue_short_info = response.data;
                        this.show_operate = true;
                        if (response.data.id) {
                            this.inquirySeqNumber = response.data.seqNumber;
                            this.inquiryId = response.data.inquiryId;
                        }
                        if (this.inquiryId && String(this.clue_short_info.status) !== '3') {
                            this.change_status(3);
                        }
                        this.flag_inquiry_id_requested = true;
                        this.$store.commit('set_clue_short_info', this.clue_short_info);
                        // 更新cinnox昵称
                        if (['Sms'].includes(this.from) && !this.createdUserNotMe) {
                            this.$store.commit('setSmsNickName', { nickName: response.data.a1009 });
                        }
                    } else {
                        this.$Message.error('获取线索简略信息出错');
                        this.clue_short_info = '';
                    }
                    this.loading = false;
                }).catch(error => {
                    console.error(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error('获取线索简略信息出错');
                    }
                    this.clue_short_info = '';
                });
            },
            // 获取与线索对应的询盘 Id 和 seqNumber
            getCorInquiry() {
                this.inquiryId = undefined;
                this.inquirySeqNumber = undefined;
                this.flag_inquiry_id_requested = false;
                crmClue.getInquirySeqList({
                    clueIdList: [this.clueId]
                }).then((res) => {
                    if (res.code === '1') {
                        this.show_operate = true;
                        if (res.data[this.clueId]) {
                            this.inquirySeqNumber = res.data[this.clueId].seqNumber;
                            this.inquiryId = res.data[this.clueId].inquiryId;
                        }
                        if (this.inquiryId && String(this.clue_short_info.status) !== '3') {
                            this.change_status(3);
                        }
                    } else {
                        this.$Message.error(this.$t('clue.error_getClueStatus'));
                    }
                    this.flag_inquiry_id_requested = true;
                }).catch(error => {
                    console.error(error);
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('clue.error_getClueStatus'));
                    }
                });
            },
            // 获取销售列表 -- 这个接口调用的地方是真的多
            setSaleList() {
                this.saleList = this.$deepClone(this.salesList);
                this.saleList.push({
                    id: -1,
                    fullname: this.$t('clue.public_sea')
                });
            },
            updateClueStatusByFollowupOrEmail() {
                this.$emit('refreshData');
                this.getClueShortInfo();
            },
            returnUpdateStatus() {
                /** 录入询盘之后的数据操作：更新对应数据状态 */
                // leads相关
                if (this.clue_short_info.source === 5) {
                    crmClue.updateLeadsStatusByLeadsId({
                        leadsId: this.clue_short_info.leadsId,
                        orgId: this.enterpriseId
                    }).then(response => {});
                }
                // facebook私信
                if (this.clue_short_info.source === 6) {
                    crmClue.updateConversationStatusByClueId({
                        clueId: this.clue_short_info.id,
                        status: 102
                    }).then(response => {});
                }
                // facebook评论
                if (this.clue_short_info.source === 7) {
                    crmClue.updateCommentStatusByClueId({
                        clueId: this.clue_short_info.id,
                        status: 102
                    }).then(response => {});
                }
                // 访客id 不为空时更新访客状态
                if (this.clue_short_info.proj) {
                    crmClue.updateVisitorStatus({
                        orgId: this.enterpriseId,
                        originalVisitorStatus: 2,
                        visitorStatus: 102,
                        visitorClueId: this.clueId,
                        updateUserId: this.userId,
                        visitorId: this.clue_short_info.proj
                    }).then(res => res.data);
                }
            },

            /* 判断按钮权限 */
            HANDLE_BUTTON,


            /* 各类 button 操作 */
            // 点击发送邮箱按钮
            sendMail() {
                let emails = [];
                const contactList = [];
                contactList.push(this.clue_short_info);
                emails = contactList.map(item => {
                    return {
                        receiverName: item.a1009 || '',
                        receiveMailAddress: item.a10010,
                        fromClue: 1,
                        followUpId: String(item.id)
                    };
                });
                window.setTimeout(() => {
                    localStorage.setItem('leadsCloud-sendMail-contacts', JSON.stringify(emails));
                    // 打开写信弹窗之前先判断有没有已经打开的写信弹窗
                    const doc = document.getElementById('mail_detail_modal');
                    if (!doc) {
                        this.replyMailVisible = true;
                    }
                }, 1500);
            },
            // 跳转到相对应的线索
            async jumpToTheClueDetail() {
                // 校验是否有该条线索管理权限
                const authorized = await this.isHaveAuthority({
                    type: 'Clue',
                    id: this.clueId
                });
                if (!authorized) return;
                if (authorized === 'highseas') {
                    this.$Message.warning(this.$t('crm.Modal.error_JumpClueInHighseas'));
                    return;
                }
                if (this.isContainsMenu('my_clue')) {
                    // 校验通过, 新标签页打开线索详情
                    localStorage.setItem('leadsCloud-clueId', this.clueId);
                    window.open(this.$rootRouter.resolve({
                        name: 'my_clue'
                    }).href, '_blank');
                } else {
                    this.$Message.warning('您没有我的线索页面的查看权限，请联系您的管理员开通');
                }
            },
            clue_operate(name) {
                switch (name) {
                    case 'sendMail':
                        this.sendMail();
                        break;
                    case 'edit':
                        this.visible_edit_clue = true;
                        break;
                    case 'throw_clue':
                        this.visible_throw_clue = true;
                        break;
                    case 'transfer_clue':
                        this.visible_transfer_clue = true;
                        break;
                    case 'qrcode':
                        this.visible_qrCode = true;
                        break;
                    case 'clueLog':
                        this.visibleClueLog = true;
                        break;
                    default:
                        break;
                }
            },
            // 修改线索状态
            change_status(name) {
                const temp = this.clue_short_info.status;
                this.clue_short_info.status = name;
                const data = {
                    orgId: this.enterpriseId,
                    clueId: this.clueId,
                    status: name,
                    userId: this.userId,
                    userName: this.fullName
                };
                crmClue.setInquiringForWeb(name, data).then(res => {
                    if (res.code === '1') {
                        this.$emit('refreshData');
                    } else {
                        this.clue_short_info.status = temp;
                        this.$Message.error(this.$t('clue.status_failed'));
                    }
                }).catch(error => {
                    console.error(error);
                    this.clue_short_info.status = temp;
                    if (!(/timeout of (\d+)ms exceeded/.test(error.toString()))) {
                        this.$Message.error(this.$t('clue.status_failed'));
                    }
                });
            },
            // 录入询盘成功
            saveSuccess(data) {
                if (localStorage.getItem('isShowWhatsAppEmbedded') === 'true') {
                    this.$emit('updateInquiryStatusWaEmbedded', 1);
                }
                this.$emit('refreshData');
                this.inquiryId = data.inquiryId;
                this.show_operate = true;
            },
            // 录入询盘成功后更改线索跟进状态成功
            changeStatusSuccess() {
                this.clue_short_info.status = 3;
            },
            chownSuccess(email) {
                this.$emit('chownSuccess');
                this.$emit('closeDetail');
                this.updateCrmFlag();
            },
            updateCrmFlag() {
                if (this.clue_short_info.a10010) {
                    crmClue.updateCrmFlagNew({
                        address: this.clue_short_info.a10010,
                        createUserId: this.userId,
                        orgId: this.enterpriseId
                    });
                }
            }
        },
        created() {},
        watch: {
            clueId: {
                handler(val) {
                    if (val) {
                        this.show_operate = false;
                        if (['mail', 'mail_detail'].includes(this.from)) {
                            this.compo_list.unshift('inOutGoingMail');
                        }
                        this.getClueShortInfo();
                        this.current_compo = this.compo_list[0];
                    }
                },
                immediate: true
            },
            inquiryId: {
                handler(val) {
                    if (val && !this.inquirySeqNumber) {
                        this.getCorInquiry();
                    }
                }
            },
            flag_update_detail: {
                handler() {
                    this.getClueShortInfo();
                    this.$emit('refreshData');
                }
            },
            salesList: {
                handler(val) {
                    this.setSaleList();
                },
                immediate: true,
                deep: true
            }
        }
    };
</script>
<style scoped lang="less">
    // 邮件模块侧滑页详情显示布局
    .com_main{

        /deep/ .el-col-12{
            line-height: 18px;
            display: flex;
            margin-top: 8px;
        }

        span.col_name{
            display: inline-block;
            margin-bottom: 0;
            margin-top: 0;
            line-height: 18px;
            vertical-align: middle;
        }

        span.col_value{
            display: inline-block;
            margin-bottom: 0;
            margin-top: 0;
            line-height: 18px;
            max-width: 100px;
            overflow: hidden;
            text-overflow:ellipsis;
            white-space: nowrap;
            vertical-align: middle;
            &.create_way{
                max-width: 89px;
            }
        }
    }

    .com_operate{
        /deep/ .el-button--text{
            margin-left: 0;
            span{
                margin-left: 2px;
            }
        }
    }
</style>
